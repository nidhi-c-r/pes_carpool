from fastapi import FastAPI, APIRouter, Depends, HTTPException, status, Body
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
import jwt
from bson import ObjectId

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 168  # 7 days

# Create the main app
app = FastAPI(title="PES Carpool API")
api_router = APIRouter(prefix="/api")

# ============= MODELS =============

class UserBase(BaseModel):
    email: EmailStr
    name: str
    phone: str

class UserRegister(UserBase):
    password: str
    is_driver: bool = False

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    is_driver: bool = False
    is_admin: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: User

class RideBase(BaseModel):
    start_location: str
    end_location: str
    date: str  # YYYY-MM-DD
    time: str  # HH:MM
    seats_total: int
    price_per_seat: float
    distance_km: float
    vehicle: str
    notes: Optional[str] = None

class RideCreate(RideBase):
    pass

class Ride(RideBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    driver_id: str
    driver_name: str
    driver_phone: str
    seats_available: int
    status: str = "active"  # active, completed, cancelled
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BookingCreate(BaseModel):
    seats_booked: int

class Booking(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    ride_id: str
    passenger_id: str
    passenger_name: str
    passenger_phone: str
    seats_booked: int
    status: str = "confirmed"  # confirmed, cancelled
    booked_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
class BookingWithRide(Booking):
    ride: Ride

class AdminMetrics(BaseModel):
    total_users: int
    total_drivers: int
    total_passengers: int
    total_rides: int
    active_rides: int
    total_bookings: int
    confirmed_bookings: int
    total_seats_offered: int
    total_seats_booked: int
    total_co2_saved_kg: float

# ============= UTILITIES =============

def calculate_co2_savings(distance_km: float, passengers: int) -> float:
    """Calculate CO2 savings in kg. Assumes 120g CO2 per km per car, shared among passengers."""
    CO2_PER_KM_GRAMS = 120
    if passengers <= 1:
        return 0.0
    # CO2 saved = (passengers - 1) * distance * co2_per_km / 1000
    co2_saved_kg = (passengers - 1) * distance_km * CO2_PER_KM_GRAMS / 1000
    return round(co2_saved_kg, 2)

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_access_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    payload = {
        "sub": user_id,
        "exp": expire
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def require_driver(user: dict = Depends(get_current_user)) -> dict:
    if not user.get("is_driver"):
        raise HTTPException(status_code=403, detail="Driver access required")
    return user

async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# ============= AUTH ROUTES =============

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserRegister):
    # Check if user exists
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user_dict = user_data.model_dump()
    hashed_pwd = hash_password(user_dict.pop("password"))
    user_dict["hashed_password"] = hashed_pwd
    
    user = User(**user_dict)
    doc = user.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.users.insert_one(doc)
    
    # Generate token
    token = create_access_token(user.id)
    
    return TokenResponse(access_token=token, user=user)

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    # Find user
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Verify password
    if not verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Generate token
    token = create_access_token(user["id"])
    
    # Remove sensitive data
    user.pop("hashed_password", None)
    if isinstance(user.get('created_at'), str):
        user['created_at'] = datetime.fromisoformat(user['created_at'])
    
    return TokenResponse(access_token=token, user=User(**user))

@api_router.get("/auth/me", response_model=User)
async def get_me(user: dict = Depends(get_current_user)):
    user.pop("hashed_password", None)
    if isinstance(user.get('created_at'), str):
        user['created_at'] = datetime.fromisoformat(user['created_at'])
    return User(**user)

# ============= RIDE ROUTES =============

@api_router.post("/rides", response_model=Ride)
async def create_ride(ride_data: RideCreate, user: dict = Depends(require_driver)):
    ride_dict = ride_data.model_dump()
    ride_dict["driver_id"] = user["id"]
    ride_dict["driver_name"] = user["name"]
    ride_dict["driver_phone"] = user["phone"]
    ride_dict["seats_available"] = ride_data.seats_total
    
    ride = Ride(**ride_dict)
    doc = ride.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.rides.insert_one(doc)
    return ride

@api_router.get("/rides", response_model=List[Ride])
async def search_rides(
    from_loc: Optional[str] = None,
    to_loc: Optional[str] = None,
    date: Optional[str] = None,
    min_seats: int = 1
):
    query = {"status": "active", "seats_available": {"$gte": min_seats}}
    
    if from_loc:
        query["start_location"] = {"$regex": from_loc, "$options": "i"}
    if to_loc:
        query["end_location"] = {"$regex": to_loc, "$options": "i"}
    if date:
        query["date"] = date
    
    rides = await db.rides.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    for ride in rides:
        if isinstance(ride.get('created_at'), str):
            ride['created_at'] = datetime.fromisoformat(ride['created_at'])
    
    return rides

@api_router.get("/rides/{ride_id}", response_model=Ride)
async def get_ride(ride_id: str):
    ride = await db.rides.find_one({"id": ride_id}, {"_id": 0})
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")
    
    if isinstance(ride.get('created_at'), str):
        ride['created_at'] = datetime.fromisoformat(ride['created_at'])
    
    return Ride(**ride)

@api_router.get("/rides/driver/my-rides", response_model=List[Ride])
async def get_my_rides(user: dict = Depends(require_driver)):
    rides = await db.rides.find({"driver_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    for ride in rides:
        if isinstance(ride.get('created_at'), str):
            ride['created_at'] = datetime.fromisoformat(ride['created_at'])
    
    return rides

# ============= BOOKING ROUTES =============

@api_router.post("/rides/{ride_id}/book", response_model=Booking)
async def book_ride(ride_id: str, booking_data: BookingCreate, user: dict = Depends(get_current_user)):
    # Check if ride exists and has enough seats
    ride = await db.rides.find_one({"id": ride_id}, {"_id": 0})
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")
    
    if ride["status"] != "active":
        raise HTTPException(status_code=400, detail="Ride is not active")
    
    if ride["driver_id"] == user["id"]:
        raise HTTPException(status_code=400, detail="Cannot book your own ride")
    
    if ride["seats_available"] < booking_data.seats_booked:
        raise HTTPException(status_code=400, detail="Not enough seats available")
    
    # Check if user already has a booking for this ride
    existing = await db.bookings.find_one({
        "ride_id": ride_id,
        "passenger_id": user["id"],
        "status": "confirmed"
    })
    if existing:
        raise HTTPException(status_code=400, detail="You already have a booking for this ride")
    
    # Create booking and update seats (transactional approach)
    booking_dict = booking_data.model_dump()
    booking_dict["ride_id"] = ride_id
    booking_dict["passenger_id"] = user["id"]
    booking_dict["passenger_name"] = user["name"]
    booking_dict["passenger_phone"] = user["phone"]
    
    booking = Booking(**booking_dict)
    doc = booking.model_dump()
    doc['booked_at'] = doc['booked_at'].isoformat()
    
    # Update seats
    result = await db.rides.update_one(
        {"id": ride_id, "seats_available": {"$gte": booking_data.seats_booked}},
        {"$inc": {"seats_available": -booking_data.seats_booked}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Failed to book: seats may have been taken")
    
    await db.bookings.insert_one(doc)
    return booking

@api_router.get("/bookings", response_model=List[BookingWithRide])
async def get_my_bookings(user: dict = Depends(get_current_user)):
    bookings = await db.bookings.find({"passenger_id": user["id"]}, {"_id": 0}).sort("booked_at", -1).to_list(100)
    
    result = []
    for booking in bookings:
        if isinstance(booking.get('booked_at'), str):
            booking['booked_at'] = datetime.fromisoformat(booking['booked_at'])
        
        # Get ride details
        ride = await db.rides.find_one({"id": booking["ride_id"]}, {"_id": 0})
        if ride:
            if isinstance(ride.get('created_at'), str):
                ride['created_at'] = datetime.fromisoformat(ride['created_at'])
            booking['ride'] = Ride(**ride)
            result.append(BookingWithRide(**booking))
    
    return result

@api_router.post("/bookings/{booking_id}/cancel")
async def cancel_booking(booking_id: str, user: dict = Depends(get_current_user)):
    # Find booking
    booking = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if booking["passenger_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Not your booking")
    
    if booking["status"] != "confirmed":
        raise HTTPException(status_code=400, detail="Booking already cancelled")
    
    # Cancel booking and return seats
    await db.bookings.update_one(
        {"id": booking_id},
        {"$set": {"status": "cancelled"}}
    )
    
    await db.rides.update_one(
        {"id": booking["ride_id"]},
        {"$inc": {"seats_available": booking["seats_booked"]}}
    )
    
    return {"message": "Booking cancelled successfully"}

@api_router.get("/rides/{ride_id}/bookings", response_model=List[Booking])
async def get_ride_bookings(ride_id: str, user: dict = Depends(require_driver)):
    # Check if ride belongs to driver
    ride = await db.rides.find_one({"id": ride_id, "driver_id": user["id"]}, {"_id": 0})
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found or not yours")
    
    bookings = await db.bookings.find({"ride_id": ride_id}, {"_id": 0}).to_list(100)
    
    for booking in bookings:
        if isinstance(booking.get('booked_at'), str):
            booking['booked_at'] = datetime.fromisoformat(booking['booked_at'])
    
    return bookings

# ============= ADMIN ROUTES =============

@api_router.get("/admin/metrics", response_model=AdminMetrics)
async def get_metrics(user: dict = Depends(require_admin)):
    # Count users
    total_users = await db.users.count_documents({})
    total_drivers = await db.users.count_documents({"is_driver": True})
    total_passengers = total_users - total_drivers
    
    # Count rides
    total_rides = await db.rides.count_documents({})
    active_rides = await db.rides.count_documents({"status": "active"})
    
    # Count bookings
    total_bookings = await db.bookings.count_documents({})
    confirmed_bookings = await db.bookings.count_documents({"status": "confirmed"})
    
    # Calculate seats
    rides = await db.rides.find({}, {"_id": 0, "seats_total": 1, "seats_available": 1, "distance_km": 1}).to_list(10000)
    total_seats_offered = sum(r.get("seats_total", 0) for r in rides)
    total_seats_available = sum(r.get("seats_available", 0) for r in rides)
    total_seats_booked = total_seats_offered - total_seats_available
    
    # Calculate CO2 savings
    bookings = await db.bookings.find({"status": "confirmed"}, {"_id": 0, "ride_id": 1, "seats_booked": 1}).to_list(10000)
    total_co2 = 0.0
    for booking in bookings:
        ride = next((r for r in rides if r.get("id") == booking["ride_id"]), None)
        if ride:
            co2 = calculate_co2_savings(ride.get("distance_km", 0), booking["seats_booked"])
            total_co2 += co2
    
    return AdminMetrics(
        total_users=total_users,
        total_drivers=total_drivers,
        total_passengers=total_passengers,
        total_rides=total_rides,
        active_rides=active_rides,
        total_bookings=total_bookings,
        confirmed_bookings=confirmed_bookings,
        total_seats_offered=total_seats_offered,
        total_seats_booked=total_seats_booked,
        total_co2_saved_kg=round(total_co2, 2)
    )

# Root route
@api_router.get("/")
async def root():
    return {"message": "PES Carpool API", "version": "1.0.0"}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()