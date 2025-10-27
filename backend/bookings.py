# backend/bookings.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload, joinedload
from typing import List

from . import models, schemas
from .database import get_db_session
from .auth import get_current_user # Import our dependency

router = APIRouter(
    prefix="/api/bookings",
    tags=["Bookings"],
    dependencies=[Depends(get_current_user)] # All booking routes are protected
)

# --- Endpoint to Create a Booking (Adjusted for new transaction pattern) ---
@router.post("/", response_model=schemas.BookingOut, status_code=status.HTTP_201_CREATED)
async def create_booking(
    booking_in: schemas.BookingCreate,
    db: AsyncSession = Depends(get_db_session),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role.lower() != 'passenger':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only passengers can book rides"
        )

    # 1. Get the ride and lock it (without explicit begin/commit)
    query_ride = select(models.Ride).where(
        models.Ride.ride_id == booking_in.ride_id
    ).with_for_update() 

    result_ride = await db.execute(query_ride)
    ride = result_ride.scalars().first()

    # 2. Validation
    if not ride:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ride not found")
    if ride.driver_id == current_user.user_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot book your own ride")
    if ride.seats_available < booking_in.seats_booked:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Not enough seats. Only {ride.seats_available} available.")
    if booking_in.seats_booked <= 0:
         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Must book at least 1 seat.")

    # 3. Update ride seats
    ride.seats_available -= booking_in.seats_booked

    # 4. Create the new booking
    new_booking = models.Booking(
        ride_id=booking_in.ride_id,
        passenger_id=current_user.user_id,
        seats_booked=booking_in.seats_booked,
        status="confirmed"
    )
    db.add(new_booking)

    # 5. Flush and Refresh (Commit happens when get_db_session exits)
    await db.flush() 
    await db.refresh(new_booking)

    # 6. Query final data for response
    final_booking_query = select(models.Booking).where(
        models.Booking.booking_id == new_booking.booking_id
    ).options(
        joinedload(models.Booking.ride).joinedload(models.Ride.driver),
        joinedload(models.Booking.ride).joinedload(models.Ride.vehicle)
    )
    result = await db.execute(final_booking_query)
    final_booking = result.scalars().first()

    if not final_booking: raise HTTPException(status_code=500, detail="Could not retrieve booking after creation.")

    return final_booking


# --- Endpoint to get "My Bookings" (Kept for completeness) ---
@router.get("/my-bookings", response_model=List[schemas.BookingOut])
async def get_my_bookings(
    db: AsyncSession = Depends(get_db_session),
    current_user: models.User = Depends(get_current_user)
):
    query = select(models.Booking).where(
        models.Booking.passenger_id == current_user.user_id
    ).options(
        joinedload(models.Booking.ride).joinedload(models.Ride.driver),
        joinedload(models.Booking.ride).joinedload(models.Ride.vehicle)
    ).order_by(models.Booking.booking_id.desc())

    result = await db.execute(query)
    bookings = result.scalars().all()

    return bookings

# --- Endpoint to Cancel a Booking (FINAL FIXED VERSION) ---
@router.post("/{booking_id}/cancel", status_code=status.HTTP_200_OK)
async def cancel_booking(
    booking_id: int,
    db: AsyncSession = Depends(get_db_session),
    current_user: models.User = Depends(get_current_user)
):
    try:
        # 1. Find the booking and eagerly load the associated ride
        query = select(models.Booking).where(
            models.Booking.booking_id == booking_id
        ).options(
            selectinload(models.Booking.ride) # Load the ride object
        ).with_for_update() # Lock the booking row

        result = await db.execute(query)
        booking = result.scalars().first()

        # 2. Validation
        if not booking:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
        if booking.passenger_id != current_user.user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only cancel your own bookings")
        if booking.status != "confirmed":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Booking is not confirmed or already cancelled")
        if not booking.ride:
             raise HTTPException(status_code=500, detail="Associated ride data is missing.")

        # 3. Update data
        booking.ride.seats_available += booking.seats_booked # Return seats
        booking.status = "cancelled" # Change status

        # Commit will happen automatically when the function exits successfully via get_db_session().

    except HTTPException as e:
        # Re-raise explicit HTTP errors
        raise e
    except Exception as e:
        # Catch any remaining internal DB errors
        print(f"DATABASE CANCELLATION FAILED: {e}")
        raise HTTPException(status_code=500, detail="Cancellation failed due to a database error.")

    return {"detail": "Booking cancelled successfully"}