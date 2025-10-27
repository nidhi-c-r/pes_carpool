# backend/schemas.py

from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, date, time

# --- User Schemas ---

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: str
    srn: str
    role: str # 'driver' or 'passenger'

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    user_id: int
    name: str
    email: EmailStr
    phone: str
    srn: str
    role: str

    class Config:
        from_attributes = True 

# --- Token Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# --- Vehicle Schemas ---
class VehicleCreate(BaseModel):
    model: str  # Matches 'model' column
    seat_capacity: int
    license_plate: str

class VehicleOut(BaseModel):
    vehicle_id: int
    model: str # Matches 'model' column
    seat_capacity: int
    license_plate: str
    
    class Config:
        from_attributes = True

# --- Ride Schemas ---
class RideCreate(BaseModel):
    vehicle_id: int
    origin: str
    destination: str
    date_time: datetime
    seats_available: int
    price: float

class RideOut(BaseModel):
    ride_id: int
    origin: str
    destination: str
    date_time: datetime
    seats_available: int
    price: float
    
    driver: UserOut
    vehicle: VehicleOut

    class Config:
        from_attributes = True

# --- Booking Schemas ---
class BookingCreate(BaseModel):
    ride_id: int
    seats_booked: int

class BookingOut(BaseModel):
    booking_id: int
    ride_id: int
    passenger_id: int
    seats_booked: int
    status: str
    
    ride: RideOut # Nested ride details

    class Config:
        from_attributes = True