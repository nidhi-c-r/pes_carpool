# Quick Start Guide - PES Carpool

## 🚀 5-Minute Setup

### Using Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pes-carpool
   ```

2. **Start all services**
   ```bash
   docker-compose up -d
   ```

3. **Seed the database**
   ```bash
   docker-compose exec backend python seed.py
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8001/api
   - API Docs: http://localhost:8001/docs

### Using Supervisor (Development)

1. **Start services**
   ```bash
   sudo supervisorctl start backend frontend mongodb
   ```

2. **Seed database**
   ```bash
   cd /app/backend && python seed.py
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8001/api

---

## 👤 Test Accounts

### Admin Account
- **Email:** admin@pes.edu
- **Password:** admin123
- **Access:** All features + Admin Dashboard

### Driver Accounts
- **Email:** driver1@pes.edu
- **Password:** driver123
- **Features:** Post rides, view bookings

### Passenger Accounts
- **Email:** passenger1@pes.edu
- **Password:** pass123
- **Features:** Search rides, book seats

---

## 🧪 Testing Flow

### 1. Register & Login
```bash
# Visit http://localhost:3000
# Click "Sign Up"
# Create account (check "I want to register as a driver" if needed)
# Login with credentials
```

### 2. Driver: Post a Ride
```bash
# Login as driver
# Click "Post Ride" in navbar
# Fill in ride details:
  - From: "Koramangala"
  - To: "PES University"
  - Date: Tomorrow's date
  - Time: "08:00"
  - Seats: 3
  - Price: 45
  - Distance: 10.5 km
  - Vehicle: "Honda City (KA-03-XY-1234)"
# Click "Post Ride"
```

### 3. Passenger: Search & Book
```bash
# Login as passenger (or use different browser/incognito)
# Use search form on home page:
  - From: "Koramangala"
  - To: "PES"
  - Click "Search Rides"
# Click on a ride card to view details
# Select number of seats
# Click "Confirm Booking"
# View booking in "My Bookings"
```

### 4. Cancel Booking
```bash
# Go to "My Bookings"
# Click "Cancel Booking" on any confirmed booking
# Confirm cancellation
# Seats automatically returned to ride
```

### 5. View Metrics (Admin)
```bash
# Login as admin@pes.edu
# Click "Admin" in navbar
# View platform statistics:
  - Total users, drivers, passengers
  - Ride and booking stats
  - Seat utilization
  - CO₂ emissions saved
```

---

## 📡 API Testing

### Using cURL

**1. Login**
```bash
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"driver1@pes.edu","password":"driver123"}'
```

**2. Get Rides**
```bash
curl http://localhost:8001/api/rides
```

**3. Book a Ride** (requires token from login)
```bash
curl -X POST http://localhost:8001/api/rides/RIDE_ID/book \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"seats_booked": 2}'
```

### Using Python

```python
import requests

BASE_URL = "http://localhost:8001/api"

# Login
response = requests.post(f"{BASE_URL}/auth/login", json={
    "email": "passenger1@pes.edu",
    "password": "pass123"
})
token = response.json()["access_token"]

# Get rides
rides = requests.get(f"{BASE_URL}/rides").json()
print(f"Found {len(rides)} rides")

# Book first ride
if rides:
    ride_id = rides[0]["id"]
    headers = {"Authorization": f"Bearer {token}"}
    booking = requests.post(
        f"{BASE_URL}/rides/{ride_id}/book",
        json={"seats_booked": 1},
        headers=headers
    ).json()
    print(f"Booked ride: {booking['id']}")
```

---

## 🔧 Common Commands

### Backend
```bash
# Restart backend
sudo supervisorctl restart backend

# View backend logs
tail -f /var/log/supervisor/backend.err.log

# Run seed script
cd /app/backend && python seed.py

# Start backend manually
cd /app/backend && uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

### Frontend
```bash
# Restart frontend
sudo supervisorctl restart frontend

# View frontend logs
tail -f /var/log/supervisor/frontend.err.log

# Install new package
cd /app/frontend && yarn add package-name

# Start frontend manually
cd /app/frontend && yarn start
```

### Database
```bash
# Check MongoDB status
sudo supervisorctl status mongodb

# Access MongoDB shell
mongosh mongodb://localhost:27017/pes_carpool

# View collections
use pes_carpool
show collections
db.users.find().pretty()
db.rides.find().pretty()
db.bookings.find().pretty()

# Clear database
db.users.deleteMany({})
db.rides.deleteMany({})
db.bookings.deleteMany({})
```

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if MongoDB is running
sudo supervisorctl status mongodb

# Check backend logs
tail -n 50 /var/log/supervisor/backend.err.log

# Verify dependencies
cd /app/backend && pip list | grep fastapi

# Reinstall dependencies
cd /app/backend && pip install -r requirements.txt
```

### Frontend won't start
```bash
# Check frontend logs
tail -n 50 /var/log/supervisor/frontend.err.log

# Clear cache and reinstall
cd /app/frontend
rm -rf node_modules yarn.lock
yarn install

# Verify React is installed
cd /app/frontend && yarn list react
```

### Can't login / Token errors
```bash
# Clear browser localStorage
# Open DevTools > Application > Local Storage > Clear All

# Or in browser console:
localStorage.clear();
location.reload();

# Verify JWT_SECRET is set
cat /app/backend/.env | grep JWT_SECRET
```

### Database connection errors
```bash
# Restart MongoDB
sudo supervisorctl restart mongodb

# Check MongoDB is accessible
mongosh mongodb://localhost:27017 --eval "db.version()"

# Verify MONGO_URL in .env
cat /app/backend/.env | grep MONGO_URL
```

---

## 📊 Monitoring

### Check Service Status
```bash
sudo supervisorctl status
```

### View All Logs
```bash
# Backend
tail -f /var/log/supervisor/backend.*.log

# Frontend
tail -f /var/log/supervisor/frontend.*.log

# MongoDB
tail -f /var/log/supervisor/mongodb.*.log
```

### Performance Monitoring
```bash
# CPU and Memory
top

# Disk usage
df -h

# MongoDB stats
mongosh mongodb://localhost:27017/pes_carpool --eval "db.stats()"
```

---

## ✅ Verification Checklist

- [ ] Backend is running on port 8001
- [ ] Frontend is running on port 3000
- [ ] MongoDB is running on port 27017
- [ ] Can access homepage
- [ ] Can register new user
- [ ] Can login
- [ ] Driver can post ride
- [ ] Passenger can search rides
- [ ] Passenger can book ride
- [ ] Booking appears in "My Bookings"
- [ ] Can cancel booking
- [ ] Admin can view metrics
- [ ] API endpoints respond correctly

---

## 📞 Support

For issues:
1. Check logs first
2. Review error messages
3. Consult API_DOCUMENTATION.md
4. Check README.md for detailed setup

**Quick Help:**
```bash
# Reset everything
sudo supervisorctl restart all
cd /app/backend && python seed.py

# Fresh start
docker-compose down -v
docker-compose up -d
docker-compose exec backend python seed.py
```