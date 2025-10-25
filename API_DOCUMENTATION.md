# PES Carpool API Documentation

## Base URL
```
http://localhost:8001/api
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## Auth Endpoints

### Register User

**POST** `/api/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "email": "student@pes.edu",
  "password": "securepass123",
  "name": "John Doe",
  "phone": "+91 9876543210",
  "is_driver": false
}
```

**Response:** `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": "uuid-here",
    "email": "student@pes.edu",
    "name": "John Doe",
    "phone": "+91 9876543210",
    "is_driver": false,
    "is_admin": false,
    "created_at": "2025-01-25T10:30:00Z"
  }
}
```

**Errors:**
- `400`: Email already registered

---

### Login

**POST** `/api/auth/login`

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "student@pes.edu",
  "password": "securepass123"
}
```

**Response:** `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": "uuid-here",
    "email": "student@pes.edu",
    "name": "John Doe",
    "phone": "+91 9876543210",
    "is_driver": false,
    "is_admin": false,
    "created_at": "2025-01-25T10:30:00Z"
  }
}
```

**Errors:**
- `401`: Invalid email or password

---

### Get Current User

**GET** `/api/auth/me`

Get currently authenticated user's information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "id": "uuid-here",
  "email": "student@pes.edu",
  "name": "John Doe",
  "phone": "+91 9876543210",
  "is_driver": false,
  "is_admin": false,
  "created_at": "2025-01-25T10:30:00Z"
}
```

**Errors:**
- `401`: Invalid or expired token

---

## Ride Endpoints

### Create Ride

**POST** `/api/rides`

*Requires: Driver role*

Create a new ride offering.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "start_location": "Electronic City",
  "end_location": "PES University",
  "date": "2025-01-30",
  "time": "08:00",
  "seats_total": 3,
  "price_per_seat": 50.0,
  "distance_km": 15.0,
  "vehicle": "Honda City (KA-01-AB-1234)",
  "notes": "Pickup from Electronic City Phase 1"
}
```

**Response:** `200 OK`
```json
{
  "id": "ride-uuid",
  "driver_id": "driver-uuid",
  "driver_name": "Rahul Kumar",
  "driver_phone": "+91 9876543211",
  "start_location": "Electronic City",
  "end_location": "PES University",
  "date": "2025-01-30",
  "time": "08:00",
  "seats_total": 3,
  "seats_available": 3,
  "price_per_seat": 50.0,
  "distance_km": 15.0,
  "vehicle": "Honda City (KA-01-AB-1234)",
  "notes": "Pickup from Electronic City Phase 1",
  "status": "active",
  "created_at": "2025-01-25T10:30:00Z"
}
```

**Errors:**
- `403`: Not a driver
- `401`: Not authenticated

---

### Search Rides

**GET** `/api/rides`

Search for available rides with optional filters.

**Query Parameters:**
- `from_loc` (optional): Starting location (partial match)
- `to_loc` (optional): Destination (partial match)
- `date` (optional): Date in YYYY-MM-DD format
- `min_seats` (optional, default: 1): Minimum available seats

**Example:**
```
GET /api/rides?from_loc=Electronic&to_loc=PES&date=2025-01-30&min_seats=2
```

**Response:** `200 OK`
```json
[
  {
    "id": "ride-uuid",
    "driver_id": "driver-uuid",
    "driver_name": "Rahul Kumar",
    "driver_phone": "+91 9876543211",
    "start_location": "Electronic City",
    "end_location": "PES University",
    "date": "2025-01-30",
    "time": "08:00",
    "seats_total": 3,
    "seats_available": 3,
    "price_per_seat": 50.0,
    "distance_km": 15.0,
    "vehicle": "Honda City (KA-01-AB-1234)",
    "notes": "Pickup from Electronic City Phase 1",
    "status": "active",
    "created_at": "2025-01-25T10:30:00Z"
  }
]
```

---

### Get Ride Details

**GET** `/api/rides/{ride_id}`

Get detailed information about a specific ride.

**Response:** `200 OK`
```json
{
  "id": "ride-uuid",
  "driver_id": "driver-uuid",
  "driver_name": "Rahul Kumar",
  "driver_phone": "+91 9876543211",
  "start_location": "Electronic City",
  "end_location": "PES University",
  "date": "2025-01-30",
  "time": "08:00",
  "seats_total": 3,
  "seats_available": 2,
  "price_per_seat": 50.0,
  "distance_km": 15.0,
  "vehicle": "Honda City (KA-01-AB-1234)",
  "notes": "Pickup from Electronic City Phase 1",
  "status": "active",
  "created_at": "2025-01-25T10:30:00Z"
}
```

**Errors:**
- `404`: Ride not found

---

### Get Driver's Rides

**GET** `/api/rides/driver/my-rides`

*Requires: Driver role*

Get all rides posted by the authenticated driver.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
[
  {
    "id": "ride-uuid",
    "driver_id": "driver-uuid",
    "driver_name": "Rahul Kumar",
    "driver_phone": "+91 9876543211",
    "start_location": "Electronic City",
    "end_location": "PES University",
    "date": "2025-01-30",
    "time": "08:00",
    "seats_total": 3,
    "seats_available": 2,
    "price_per_seat": 50.0,
    "distance_km": 15.0,
    "vehicle": "Honda City (KA-01-AB-1234)",
    "notes": "Pickup from Electronic City Phase 1",
    "status": "active",
    "created_at": "2025-01-25T10:30:00Z"
  }
]
```

**Errors:**
- `403`: Not a driver

---

### Get Ride Bookings

**GET** `/api/rides/{ride_id}/bookings`

*Requires: Driver owns the ride*

Get all bookings for a specific ride.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
[
  {
    "id": "booking-uuid",
    "ride_id": "ride-uuid",
    "passenger_id": "passenger-uuid",
    "passenger_name": "Amit Patel",
    "passenger_phone": "+91 9876543213",
    "seats_booked": 2,
    "status": "confirmed",
    "booked_at": "2025-01-25T10:30:00Z"
  }
]
```

**Errors:**
- `404`: Ride not found or not yours
- `403`: Not a driver

---

## Booking Endpoints

### Book Ride

**POST** `/api/rides/{ride_id}/book`

*Requires: Authentication*

Book seats on a ride.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "seats_booked": 2
}
```

**Response:** `200 OK`
```json
{
  "id": "booking-uuid",
  "ride_id": "ride-uuid",
  "passenger_id": "passenger-uuid",
  "passenger_name": "Amit Patel",
  "passenger_phone": "+91 9876543213",
  "seats_booked": 2,
  "status": "confirmed",
  "booked_at": "2025-01-25T10:30:00Z"
}
```

**Errors:**
- `404`: Ride not found
- `400`: Not enough seats / Ride not active / Cannot book own ride / Already have booking

---

### Get My Bookings

**GET** `/api/bookings`

*Requires: Authentication*

Get all bookings made by the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
[
  {
    "id": "booking-uuid",
    "ride_id": "ride-uuid",
    "passenger_id": "passenger-uuid",
    "passenger_name": "Amit Patel",
    "passenger_phone": "+91 9876543213",
    "seats_booked": 2,
    "status": "confirmed",
    "booked_at": "2025-01-25T10:30:00Z",
    "ride": {
      "id": "ride-uuid",
      "driver_name": "Rahul Kumar",
      "driver_phone": "+91 9876543211",
      "start_location": "Electronic City",
      "end_location": "PES University",
      "date": "2025-01-30",
      "time": "08:00",
      "price_per_seat": 50.0,
      "vehicle": "Honda City (KA-01-AB-1234)"
    }
  }
]
```

---

### Cancel Booking

**POST** `/api/bookings/{booking_id}/cancel`

*Requires: Authentication & booking ownership*

Cancel a confirmed booking. Seats are automatically returned to the ride.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "message": "Booking cancelled successfully"
}
```

**Errors:**
- `404`: Booking not found
- `403`: Not your booking
- `400`: Booking already cancelled

---

## Admin Endpoints

### Get Metrics

**GET** `/api/admin/metrics`

*Requires: Admin role*

Get platform-wide statistics and metrics.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "total_users": 50,
  "total_drivers": 20,
  "total_passengers": 30,
  "total_rides": 85,
  "active_rides": 45,
  "total_bookings": 120,
  "confirmed_bookings": 100,
  "total_seats_offered": 340,
  "total_seats_booked": 200,
  "total_co2_saved_kg": 456.8
}
```

**Errors:**
- `403`: Not an admin

---

## Error Responses

All errors follow this format:

```json
{
  "detail": "Error message here"
}
```

### Common HTTP Status Codes

- `200 OK`: Success
- `400 Bad Request`: Invalid input or business logic error
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource doesn't exist
- `500 Internal Server Error`: Server error

---

## Rate Limiting

*Not currently implemented - recommended for production*

---

## Pagination

*Not currently implemented - all endpoints return full results*

Recommended limits:
- Rides: 100 per request
- Bookings: 100 per request
- Consider implementing cursor-based pagination for production

---

## Webhooks

*Not currently implemented*

Future webhook events:
- `ride.created`
- `booking.created`
- `booking.cancelled`
- `ride.completed`