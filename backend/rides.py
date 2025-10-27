# backend/rides.py

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import func
from typing import List, Optional # <-- Added Optional
from datetime import datetime, date

from . import models, schemas
from .database import get_db_session
from .auth import get_current_user

router = APIRouter(
    prefix="/api/rides",
    tags=["Rides"],
    dependencies=[Depends(get_current_user)] # Protects all ride endpoints
)

# --- Endpoint to create a new Vehicle ---
@router.post("/vehicles", response_model=schemas.VehicleOut, status_code=status.HTTP_201_CREATED)
async def create_vehicle(
    vehicle_in: schemas.VehicleCreate,
    db: AsyncSession = Depends(get_db_session),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role.lower() != 'driver':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only drivers can register vehicles"
        )

    # Check if license plate already exists
    query = select(models.Vehicle).where(models.Vehicle.license_plate == vehicle_in.license_plate)
    result = await db.execute(query)
    existing_vehicle = result.scalars().first()
    if existing_vehicle:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="License plate already registered"
        )

    new_vehicle = models.Vehicle(
        **vehicle_in.dict(),
        user_id=current_user.user_id
    )
    db.add(new_vehicle)
    await db.commit()
    await db.refresh(new_vehicle)

    return new_vehicle

# --- Endpoint to create a new Ride ---
@router.post("/", response_model=schemas.RideOut, status_code=status.HTTP_201_CREATED)
async def create_ride(
    ride_in: schemas.RideCreate,
    db: AsyncSession = Depends(get_db_session),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role.lower() != 'driver':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only drivers can post rides"
        )

    # Check if vehicle exists and belongs to the driver
    query = select(models.Vehicle).where(models.Vehicle.vehicle_id == ride_in.vehicle_id)
    result = await db.execute(query)
    vehicle = result.scalars().first()

    if not vehicle or vehicle.user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found or does not belong to this driver"
        )

    # Validate seats available against vehicle capacity
    if ride_in.seats_available > vehicle.seat_capacity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Seats available ({ride_in.seats_available}) cannot exceed vehicle capacity ({vehicle.seat_capacity})"
        )
    if ride_in.seats_available <= 0:
         raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Seats available must be at least 1"
        )

    new_ride = models.Ride(
        **ride_in.dict(),
        driver_id=current_user.user_id
        # seats_available is set directly from ride_in
    )

    db.add(new_ride)
    await db.commit()
    await db.refresh(new_ride) # Get the ride_id

    # Query back the ride to load relationships for the response model
    query = select(models.Ride).where(models.Ride.ride_id == new_ride.ride_id).options(
        selectinload(models.Ride.driver),
        selectinload(models.Ride.vehicle)
    )
    result = await db.execute(query)
    final_ride = result.scalars().first()

    if not final_ride: # Should not happen, but good practice
        raise HTTPException(status_code=500, detail="Could not retrieve ride after creation.")

    return final_ride


# --- Endpoint to Search for Rides ---
@router.get("/", response_model=List[schemas.RideOut])
async def search_rides(
    # These parameters come from the frontend query string
    origin: str,
    destination: str,
    ride_date: date,
    min_seats: Optional[int] = Query(default=1, ge=1), # Use Query for validation, default 1
    db: AsyncSession = Depends(get_db_session)
):
    # Build the query
    query = select(models.Ride).where(
        models.Ride.origin.ilike(f"%{origin}%"),
        models.Ride.destination.ilike(f"%{destination}%"),
        func.date(models.Ride.date_time) == ride_date,
        models.Ride.seats_available >= min_seats # Filter by minimum seats
    ).options(
        # Eagerly load related data for efficiency
        selectinload(models.Ride.driver),
        selectinload(models.Ride.vehicle)
    ).order_by(models.Ride.date_time) # Order by departure time

    result = await db.execute(query)
    rides = result.scalars().all()

    return rides

# --- Endpoint to Get a Single Ride by ID ---
@router.get("/{ride_id}", response_model=schemas.RideOut)
async def get_ride_details(
    ride_id: int,
    db: AsyncSession = Depends(get_db_session),
    # current_user: models.User = Depends(get_current_user) # Needed because router has dependency
):
    query = select(models.Ride).where(
        models.Ride.ride_id == ride_id
    ).options(
        # Eagerly load the driver and vehicle data
        selectinload(models.Ride.driver),
        selectinload(models.Ride.vehicle)
    )

    result = await db.execute(query)
    ride = result.scalars().first()

    if not ride:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ride with ID {ride_id} not found"
        )

    return ride