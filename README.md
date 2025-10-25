# PES Carpool - Full Stack Carpool Application

## Overview
PES Carpool is a complete web application for carpooling within PES University campus. Students can register as drivers or passengers, post rides, search for available carpools, and book seats - all while tracking their environmental impact.

## Tech Stack

### Backend
- **Framework:** FastAPI (Python 3.11+)
- **Database:** MongoDB
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcrypt via passlib
- **Async ORM:** Motor (async MongoDB driver)

### Frontend
- **Framework:** React 19
- **Routing:** React Router v7
- **Styling:** Tailwind CSS + shadcn/ui components
- **HTTP Client:** Axios
- **UI Components:** Radix UI primitives
- **Build Tool:** Craco (Create React App)

### Infrastructure
- **Process Manager:** Supervisor
- **Database:** MongoDB (local)

## Features

### User Management
- User registration with email, password, name, and phone
- Login with JWT authentication
- Two user roles: Driver and Passenger
- Admin role for platform metrics

### Ride Management (Driver)
- Post new rides with full details (route, time, price, vehicle)
- Set available seats and pricing
- View all posted rides
- Track bookings for each ride

### Booking System (Passenger)
- Search rides by location, date, and available seats
- View detailed ride information
- Book multiple seats per ride
- Cancel bookings (seats returned automatically)
- View booking history

### Environmental Impact
- CO₂ savings calculator (120g per km shared)
- Real-time CO₂ metrics on ride cards
- Platform-wide environmental impact dashboard

### Admin Dashboard
- Total users, drivers, and passengers
- Total rides and active rides
- Booking statistics
- Seat utilization metrics
- Total CO₂ emissions saved

## Project Structure

```
/app/
├── backend/
│   ├── server.py              # Main FastAPI application
│   ├── seed.py                # Database seeding script
│   ├── .env                   # Environment variables
│   └── requirements.txt       # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── api.js         # Axios instance with auth interceptor
│   │   ├── components/
│   │   │   ├── Navbar.jsx     # Navigation component
│   │   │   ├── RideCard.jsx   # Ride display card
│   │   │   └── ProtectedRoute.jsx  # Route guard
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # Auth state management
│   │   ├── pages/
│   │   │   ├── Login.jsx           # Login page
│   │   │   ├── Register.jsx        # Registration page
│   │   │   ├── Home.jsx            # Search & browse rides
│   │   │   ├── RideDetails.jsx     # Individual ride details
│   │   │   ├── PostRide.jsx        # Create new ride (driver)
│   │   │   ├── MyRides.jsx         # Driver's posted rides
│   │   │   ├── Bookings.jsx        # Passenger bookings
│   │   │   └── AdminDashboard.jsx  # Admin metrics
│   │   ├── App.js             # Main app with routing
│   │   └── App.css            # Global styles
│   ├── package.json           # Node dependencies
│   └── .env                   # Frontend environment variables
│
└── README.md                  # This file
```

## Installation & Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- MongoDB (running locally)
- Yarn package manager

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd /app/backend
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Environment variables** (already configured in `.env`):
   ```env
   MONGO_URL=mongodb://localhost:27017
   DB_NAME=pes_carpool
   JWT_SECRET=pes-carpool-secret-key-change-in-production
   CORS_ORIGINS=*
   CO2_EMISSION_GRAMS_PER_KM=120
   ```

4. **Seed the database:**
   ```bash
   python seed.py
   ```

5. **Start backend server:**
   ```bash
   # Using supervisor (recommended)
   sudo supervisorctl restart backend
   
   # Or manually
   uvicorn server:app --host 0.0.0.0 --port 8001 --reload
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd /app/frontend
   ```

2. **Install dependencies:**
   ```bash
   yarn install
   ```

3. **Environment variables** (already configured in `.env`):
   ```env
   REACT_APP_BACKEND_URL=https://commute-buddy-32.preview.emergentagent.com
   ```

4. **Start frontend:**
   ```bash
   # Using supervisor (recommended)
   sudo supervisorctl restart frontend
   
   # Or manually
   yarn start
   ```

## Database Seed Data

The seed script creates:

**Users:**
- Admin: `admin@pes.edu` / `admin123` (Driver + Admin)
- Driver 1: `driver1@pes.edu` / `driver123`
- Driver 2: `driver2@pes.edu` / `driver123`
- Passenger 1: `passenger1@pes.edu` / `pass123`
- Passenger 2: `passenger2@pes.edu` / `pass123`

**Rides:**
- 3 sample rides with different routes and timings
- Routes include Electronic City, Banashankari, and Whitefield to PES University

**Bookings:**
- 1 sample confirmed booking

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user | Yes |

### Rides

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/rides` | Create new ride | Yes (Driver) |
| GET | `/api/rides` | Search rides (with filters) | No |
| GET | `/api/rides/{id}` | Get ride details | No |
| GET | `/api/rides/driver/my-rides` | Get driver's rides | Yes (Driver) |
| GET | `/api/rides/{id}/bookings` | Get ride bookings | Yes (Driver owns ride) |

### Bookings

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/rides/{id}/book` | Book a ride | Yes |
| GET | `/api/bookings` | Get user's bookings | Yes |
| POST | `/api/bookings/{id}/cancel` | Cancel booking | Yes |

### Admin

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/metrics` | Get platform metrics | Yes (Admin) |

## Usage Examples

### Register a New User (Driver)

```bash
curl -X POST http://localhost:8001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newdriver@pes.edu",
    "password": "securepass123",
    "name": "John Doe",
    "phone": "+91 9876543215",
    "is_driver": true
  }'
```

### Login

```bash
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "driver1@pes.edu",
    "password": "driver123"
  }'
```

### Create a Ride

```bash
curl -X POST http://localhost:8001/api/rides \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "start_location": "Koramangala",
    "end_location": "PES University",
    "date": "2025-01-30",
    "time": "08:00",
    "seats_total": 3,
    "price_per_seat": 45.0,
    "distance_km": 10.5,
    "vehicle": "Toyota Innova (KA-03-XY-9876)",
    "notes": "Pickup from Koramangala 5th Block"
  }'
```

### Search Rides

```bash
# Search all rides
curl http://localhost:8001/api/rides

# Search with filters
curl "http://localhost:8001/api/rides?from_loc=Electronic&to_loc=PES&min_seats=2"
```

### Book a Ride

```bash
curl -X POST http://localhost:8001/api/rides/RIDE_ID/book \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"seats_booked": 2}'
```

### Cancel a Booking

```bash
curl -X POST http://localhost:8001/api/bookings/BOOKING_ID/cancel \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Testing

### Manual Testing Flow

1. **Register users:**
   - Register as a driver
   - Register as a passenger

2. **Driver flow:**
   - Login as driver
   - Post a new ride
   - View posted rides in "My Rides"

3. **Passenger flow:**
   - Login as passenger
   - Search for rides
   - View ride details
   - Book seats
   - View bookings
   - Cancel a booking

4. **Admin flow:**
   - Login as admin (`admin@pes.edu`)
   - View admin dashboard metrics

### Quick Test Commands

```bash
# Test backend health
curl http://localhost:8001/api/

# Test login
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"passenger1@pes.edu","password":"pass123"}'

# Test ride search
curl http://localhost:8001/api/rides
```

## Key Features Implementation

### Transaction Safety
- Booking operations use atomic MongoDB updates
- Seat availability checks happen within the same query
- Race conditions prevented through conditional updates

### Authentication Flow
1. User registers/logs in
2. Server returns JWT token
3. Frontend stores token in localStorage
4. Token sent in Authorization header for protected routes
5. Backend validates token and extracts user info

### CO₂ Calculation
- Formula: `(passengers - 1) × distance_km × 120g / 1000`
- Assumes 120g CO₂ per km per car
- Calculates savings from shared rides vs. individual cars

### Role-Based Access
- `@require_driver`: Endpoints requiring driver role
- `@require_admin`: Admin-only endpoints
- `@get_current_user`: General authenticated endpoints

## Environment Variables

### Backend (`.env`)
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=pes_carpool
JWT_SECRET=your-secret-key-here
CORS_ORIGINS=*
CO2_EMISSION_GRAMS_PER_KM=120
```

### Frontend (`.env`)
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

## Production Deployment Notes

### Security Checklist
- [ ] Change JWT_SECRET to a strong random value
- [ ] Update CORS_ORIGINS to specific domains
- [ ] Use HTTPS for all communications
- [ ] Implement rate limiting
- [ ] Add input validation on all endpoints
- [ ] Enable MongoDB authentication
- [ ] Use environment-specific .env files

### Performance Optimization
- [ ] Add database indexes on frequently queried fields
- [ ] Implement caching for ride searches
- [ ] Use pagination for large result sets
- [ ] Optimize bundle size with code splitting
- [ ] Enable gzip compression

### MongoDB Indexes (Recommended)
```javascript
db.users.createIndex({ email: 1 }, { unique: true })
db.rides.createIndex({ start_location: 1, end_location: 1, date: 1 })
db.rides.createIndex({ driver_id: 1 })
db.bookings.createIndex({ passenger_id: 1 })
db.bookings.createIndex({ ride_id: 1 })
```

## Troubleshooting

### Backend won't start
- Check MongoDB is running: `sudo supervisorctl status mongodb`
- Check backend logs: `tail -f /var/log/supervisor/backend.err.log`
- Verify Python dependencies: `pip list`

### Frontend won't start
- Clear node_modules: `rm -rf node_modules && yarn install`
- Check frontend logs: `tail -f /var/log/supervisor/frontend.err.log`
- Verify REACT_APP_BACKEND_URL is set

### Database connection errors
- Ensure MongoDB is running: `sudo supervisorctl status mongodb`
- Check MONGO_URL in backend/.env
- Test connection: `mongosh mongodb://localhost:27017`

### Authentication issues
- Clear browser localStorage
- Check JWT_SECRET matches between requests
- Verify token expiration (default: 7 days)

## Future Enhancements

- [ ] Real-time chat between driver and passengers
- [ ] Push notifications for ride updates
- [ ] Payment gateway integration
- [ ] Rating and review system
- [ ] Route optimization with Google Maps API
- [ ] Recurring rides feature
- [ ] Mobile app (React Native)
- [ ] Email notifications
- [ ] Advanced search filters (price range, vehicle type)
- [ ] Driver verification system

## Support

For issues or questions:
- Create an issue in the project repository
- Contact: admin@pes.edu

## License

MIT License - See LICENSE file for details

---

**Built with ❤️ for PES University students**