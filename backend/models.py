# backend/models.py
from sqlalchemy import Column, Integer, String, DECIMAL, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

# --- User Model (Updated) ---
class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255))
    email = Column(String(255), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    phone = Column(String(20))
    srn = Column(String(100), unique=True)
    role = Column(String(50)) # 'driver' or 'passenger'
    user_type = Column(String(50)) # NEW: 'student' or 'professor'

    # Relationships
    vehicles = relationship("Vehicle", back_populates="owner")
    rides_driven = relationship("Ride", back_populates="driver")
    bookings_made = relationship("Booking", back_populates="passenger")

# --- Vehicle Model (No Change) ---
class Vehicle(Base):
    __tablename__ = "vehicles"

    vehicle_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    model = Column(String(255))
    seat_capacity = Column(Integer)
    license_plate = Column(String(100), unique=True)

    # Relationships
    owner = relationship("User", back_populates="vehicles")
    rides = relationship("Ride", back_populates="vehicle")

# --- Ride Model (Fixed Relationships) ---
class Ride(Base):
    __tablename__ = "rides"

    ride_id = Column(Integer, primary_key=True, index=True)
    driver_id = Column(Integer, ForeignKey("users.user_id"))
    vehicle_id = Column(Integer, ForeignKey("vehicles.vehicle_id"))
    origin = Column(String(255))
    destination = Column(String(255))
    date_time = Column(DateTime)
    seats_available = Column(Integer)
    price = Column(DECIMAL(10, 2))

    # Relationships
    driver = relationship("User", back_populates="rides_driven")
    vehicle = relationship("Vehicle", back_populates="rides")
    bookings = relationship("Booking", back_populates="ride")

# --- Booking Model (Fixed Relationships) ---
class Booking(Base):
    __tablename__ = "bookings"

    booking_id = Column(Integer, primary_key=True, index=True)
    ride_id = Column(Integer, ForeignKey("rides.ride_id"))
    passenger_id = Column(Integer, ForeignKey("users.user_id"))
    seats_booked = Column(Integer)
    status = Column(String(50))

    # Relationships
    ride = relationship("Ride", back_populates="bookings")
    passenger = relationship("User", back_populates="bookings_made")