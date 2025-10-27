# backend/models.py

from sqlalchemy import Column, Integer, String, DECIMAL, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base  # Import Base from our new database.py

# --- User Model ---
# Maps to your 'users' table
class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255))
    email = Column(String(255), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False) # This is the HASHED password
    phone = Column(String(20))
    srn = Column(String(100), unique=True)
    role = Column(String(50)) # e.g., 'driver', 'passenger'

    # --- Relationships ---
    vehicles = relationship("Vehicle", back_populates="owner")
    rides_driven = relationship("Ride", back_populates="driver")
    bookings_made = relationship("Booking", back_populates="passenger")


# --- Vehicle Model ---
# Maps to your 'vehicles' table
class Vehicle(Base):
    __tablename__ = "vehicles"

    vehicle_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id")) # Foreign Key
    model = Column(String(255)) # Matches 'model' column in DB
    seat_capacity = Column(Integer)
    license_plate = Column(String(100), unique=True)

    # --- Relationships ---
    owner = relationship("User", back_populates="vehicles")
    rides = relationship("Ride", back_populates="vehicle")


# --- Ride Model ---
# Maps to your 'rides' table
class Ride(Base):
    __tablename__ = "rides"

    ride_id = Column(Integer, primary_key=True, index=True)
    driver_id = Column(Integer, ForeignKey("users.user_id")) # Foreign Key
    vehicle_id = Column(Integer, ForeignKey("vehicles.vehicle_id")) # Foreign Key
    origin = Column(String(255))
    destination = Column(String(255))
    date_time = Column(DateTime)
    seats_available = Column(Integer)
    price = Column(DECIMAL(10, 2)) 

    # --- Relationships ---
    driver = relationship("User", back_populates="rides_driven")
    vehicle = relationship("Vehicle", back_populates="rides")
    bookings = relationship("Booking", back_populates="ride")


# --- Booking Model ---
# Maps to your 'bookings' table
class Booking(Base):
    __tablename__ = "bookings"

    booking_id = Column(Integer, primary_key=True, index=True)
    ride_id = Column(Integer, ForeignKey("rides.ride_id")) # Foreign Key
    passenger_id = Column(Integer, ForeignKey("users.user_id")) # Foreign Key
    seats_booked = Column(Integer)
    status = Column(String(50)) # e.g., 'confirmed', 'cancelled'

    # --- Relationships ---
    ride = relationship("Ride", back_populates="bookings")
    passenger = relationship("User", back_populates="bookings_made")