import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
import os
from datetime import datetime, timezone, timedelta
import uuid
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

async def seed_data():
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    print("🌱 Seeding database...")
    
    # Clear existing data
    await db.users.delete_many({})
    await db.rides.delete_many({})
    await db.bookings.delete_many({})
    print("✓ Cleared existing data")
    
    # Create users
    users = [
        {
            "id": str(uuid.uuid4()),
            "email": "admin@pes.edu",
            "name": "Admin User",
            "phone": "+91 9876543210",
            "hashed_password": hash_password("admin123"),
            "is_driver": True,
            "is_admin": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "email": "driver1@pes.edu",
            "name": "Rahul Kumar",
            "phone": "+91 9876543211",
            "hashed_password": hash_password("driver123"),
            "is_driver": True,
            "is_admin": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "email": "driver2@pes.edu",
            "name": "Priya Sharma",
            "phone": "+91 9876543212",
            "hashed_password": hash_password("driver123"),
            "is_driver": True,
            "is_admin": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "email": "passenger1@pes.edu",
            "name": "Amit Patel",
            "phone": "+91 9876543213",
            "hashed_password": hash_password("pass123"),
            "is_driver": False,
            "is_admin": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "email": "passenger2@pes.edu",
            "name": "Sneha Reddy",
            "phone": "+91 9876543214",
            "hashed_password": hash_password("pass123"),
            "is_driver": False,
            "is_admin": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.users.insert_many(users)
    print(f"✓ Created {len(users)} users")
    
    # Create rides
    tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
    day_after = (datetime.now() + timedelta(days=2)).strftime("%Y-%m-%d")
    
    rides = [
        {
            "id": str(uuid.uuid4()),
            "driver_id": users[1]["id"],
            "driver_name": users[1]["name"],
            "driver_phone": users[1]["phone"],
            "start_location": "Electronic City",
            "end_location": "PES University",
            "date": tomorrow,
            "time": "08:00",
            "seats_total": 3,
            "seats_available": 3,
            "price_per_seat": 50.0,
            "distance_km": 15.0,
            "vehicle": "Honda City (KA-01-AB-1234)",
            "notes": "Pickup from Electronic City Phase 1",
            "status": "active",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "driver_id": users[2]["id"],
            "driver_name": users[2]["name"],
            "driver_phone": users[2]["phone"],
            "start_location": "Banashankari",
            "end_location": "PES University",
            "date": tomorrow,
            "time": "08:30",
            "seats_total": 2,
            "seats_available": 1,
            "price_per_seat": 40.0,
            "distance_km": 12.0,
            "vehicle": "Maruti Swift (KA-05-CD-5678)",
            "notes": "AC car, on time pickup",
            "status": "active",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "driver_id": users[1]["id"],
            "driver_name": users[1]["name"],
            "driver_phone": users[1]["phone"],
            "start_location": "Whitefield",
            "end_location": "PES University",
            "date": day_after,
            "time": "07:45",
            "seats_total": 4,
            "seats_available": 4,
            "price_per_seat": 60.0,
            "distance_km": 20.0,
            "vehicle": "Honda City (KA-01-AB-1234)",
            "notes": "Early morning ride",
            "status": "active",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.rides.insert_many(rides)
    print(f"✓ Created {len(rides)} rides")
    
    # Create sample booking
    bookings = [
        {
            "id": str(uuid.uuid4()),
            "ride_id": rides[1]["id"],
            "passenger_id": users[3]["id"],
            "passenger_name": users[3]["name"],
            "passenger_phone": users[3]["phone"],
            "seats_booked": 1,
            "status": "confirmed",
            "booked_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.bookings.insert_many(bookings)
    print(f"✓ Created {len(bookings)} bookings")
    
    print("\n✅ Seeding complete!")
    print("\n📝 Test Credentials:")
    print("   Admin: admin@pes.edu / admin123")
    print("   Driver: driver1@pes.edu / driver123")
    print("   Passenger: passenger1@pes.edu / pass123")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_data())