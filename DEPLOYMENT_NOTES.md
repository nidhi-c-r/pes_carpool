# Deployment Notes - PES Carpool

## Current Environment

The application is currently running on Emergent platform with:
- **Backend:** FastAPI on port 8001 (via Supervisor)
- **Frontend:** React on port 3000 (via Supervisor)
- **Database:** MongoDB on port 27017 (local)
- **Process Manager:** Supervisor

## MongoDB vs MySQL Note

**Important:** This project was built with **MongoDB** (FastAPI + Python + MongoDB stack) instead of the originally requested Node.js + Express + MySQL stack, as agreed with the user. This was done to align with the platform's native support.

### Why MongoDB?

1. Native platform support on Emergent
2. Faster development and deployment
3. Built-in async support with Motor
4. Schema flexibility for rapid iteration

### Migration to MySQL (If Needed)

If you need to migrate to MySQL for your college requirements, follow these steps:

#### 1. Install MySQL Dependencies

```bash
pip install pymysql sqlalchemy alembic
```

#### 2. Update Database Connection

Replace Motor (MongoDB) with SQLAlchemy:

```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "mysql+pymysql://user:password@localhost/pes_carpool"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
```

#### 3. Create SQLAlchemy Models

```python
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True)
    email = Column(String(255), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_driver = Column(Boolean, default=False)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime)

class Ride(Base):
    __tablename__ = "rides"
    
    id = Column(String(36), primary_key=True)
    driver_id = Column(String(36), ForeignKey('users.id'))
    start_location = Column(String(255))
    end_location = Column(String(255))
    date = Column(String(10))
    time = Column(String(5))
    seats_total = Column(Integer)
    seats_available = Column(Integer)
    price_per_seat = Column(Float)
    distance_km = Column(Float)
    vehicle = Column(String(255))
    notes = Column(String(500))
    status = Column(String(20), default='active')
    created_at = Column(DateTime)
    
    driver = relationship("User")

class Booking(Base):
    __tablename__ = "bookings"
    
    id = Column(String(36), primary_key=True)
    ride_id = Column(String(36), ForeignKey('rides.id'))
    passenger_id = Column(String(36), ForeignKey('users.id'))
    seats_booked = Column(Integer)
    status = Column(String(20), default='confirmed')
    booked_at = Column(DateTime)
    
    ride = relationship("Ride")
    passenger = relationship("User")
```

#### 4. Update API Endpoints

Replace async MongoDB operations with SQLAlchemy:

```python
# Before (MongoDB)
user = await db.users.find_one({"email": email})

# After (MySQL)
user = db.query(User).filter(User.email == email).first()
```

#### 5. Create Migration Script

```bash
# Initialize Alembic
alembic init alembic

# Create migration
alembic revision --autogenerate -m "Initial schema"

# Apply migration
alembic upgrade head
```

#### 6. Data Migration

Export MongoDB data and import to MySQL:

```python
import json
from pymongo import MongoClient
from sqlalchemy.orm import Session

# Export from MongoDB
mongo_client = MongoClient('mongodb://localhost:27017')
mongo_db = mongo_client['pes_carpool']

users = list(mongo_db.users.find({}))
with open('users.json', 'w') as f:
    json.dump(users, f, default=str)

# Import to MySQL
from models import User, Ride, Booking, SessionLocal, engine

Base.metadata.create_all(bind=engine)
db = SessionLocal()

with open('users.json', 'r') as f:
    users = json.load(f)
    for user_data in users:
        user = User(**user_data)
        db.add(user)
db.commit()
```

## Production Deployment Checklist

### Security

- [ ] Change JWT_SECRET to strong random value
- [ ] Update CORS_ORIGINS to specific domains
- [ ] Enable HTTPS/SSL certificates
- [ ] Add rate limiting middleware
- [ ] Implement input validation on all endpoints
- [ ] Enable MongoDB/MySQL authentication
- [ ] Use environment-specific .env files
- [ ] Remove test credentials from seed script
- [ ] Add security headers (CORS, CSP, etc.)
- [ ] Implement request timeout limits

### Database

- [ ] Create database indexes for performance
- [ ] Set up regular backups
- [ ] Configure connection pooling
- [ ] Enable query logging
- [ ] Set up replication (if needed)
- [ ] Add database constraints
- [ ] Implement soft deletes

### Performance

- [ ] Enable caching (Redis)
- [ ] Implement pagination for list endpoints
- [ ] Optimize database queries
- [ ] Add CDN for static assets
- [ ] Enable gzip compression
- [ ] Minify and bundle frontend assets
- [ ] Implement lazy loading
- [ ] Add image optimization

### Monitoring

- [ ] Set up logging (ELK/CloudWatch)
- [ ] Add application monitoring (New Relic/DataDog)
- [ ] Configure error tracking (Sentry)
- [ ] Set up uptime monitoring
- [ ] Add performance metrics
- [ ] Create alerting rules

### Infrastructure

- [ ] Set up CI/CD pipeline
- [ ] Configure auto-scaling
- [ ] Set up load balancer
- [ ] Configure firewall rules
- [ ] Set up backup and disaster recovery
- [ ] Document infrastructure as code
- [ ] Set up staging environment

## Recommended Database Indexes

```javascript
// MongoDB
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ is_driver: 1 })
db.rides.createIndex({ start_location: 1, end_location: 1, date: 1 })
db.rides.createIndex({ driver_id: 1 })
db.rides.createIndex({ status: 1, date: 1 })
db.bookings.createIndex({ passenger_id: 1 })
db.bookings.createIndex({ ride_id: 1 })
db.bookings.createIndex({ status: 1 })
```

```sql
-- MySQL
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_driver ON users(is_driver);
CREATE INDEX idx_rides_locations ON rides(start_location, end_location, date);
CREATE INDEX idx_rides_driver ON rides(driver_id);
CREATE INDEX idx_rides_status_date ON rides(status, date);
CREATE INDEX idx_bookings_passenger ON bookings(passenger_id);
CREATE INDEX idx_bookings_ride ON bookings(ride_id);
CREATE INDEX idx_bookings_status ON bookings(status);
```

## Environment Variables

### Production Backend (.env)

```env
# Database
MONGO_URL=mongodb://username:password@prod-db-host:27017/pes_carpool?authSource=admin
DB_NAME=pes_carpool

# Security
JWT_SECRET=your-very-long-random-secret-key-here-use-openssl-rand-base64-32
JWT_EXPIRATION_HOURS=168

# CORS
CORS_ORIGINS=https://yourapp.com,https://www.yourapp.com

# App Config
CO2_EMISSION_GRAMS_PER_KM=120
LOG_LEVEL=INFO
```

### Production Frontend (.env)

```env
REACT_APP_BACKEND_URL=https://api.yourapp.com
REACT_APP_ENV=production
```

## Docker Deployment

### Build Images

```bash
# Build backend
docker build -t pes-carpool-backend:latest ./backend

# Build frontend
docker build -t pes-carpool-frontend:latest ./frontend
```

### Run with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up -d --build
```

### Kubernetes Deployment (Optional)

Create Kubernetes manifests for production deployment:

```yaml
# backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pes-carpool-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: pes-carpool-backend:latest
        ports:
        - containerPort: 8001
        env:
        - name: MONGO_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: mongo-url
```

## Cloud Platform Deployment

### AWS

1. **EC2 Instance**
   - Launch Ubuntu 22.04 instance
   - Install Docker and Docker Compose
   - Clone repository
   - Run docker-compose up

2. **RDS/DocumentDB**
   - Create managed database instance
   - Update MONGO_URL in .env

3. **S3 + CloudFront**
   - Build frontend: `yarn build`
   - Upload to S3
   - Configure CloudFront distribution

4. **ECS/EKS**
   - Push images to ECR
   - Create ECS task definitions
   - Deploy services

### Google Cloud Platform

1. **Compute Engine**
   - Create VM instance
   - Install dependencies
   - Deploy application

2. **Cloud SQL / MongoDB Atlas**
   - Create managed database
   - Configure connection

3. **Cloud Storage + CDN**
   - Upload frontend build
   - Configure CDN

### Heroku

```bash
# Install Heroku CLI
heroku login

# Create apps
heroku create pes-carpool-api
heroku create pes-carpool-web

# Add MongoDB addon
heroku addons:create mongodb:sandbox -a pes-carpool-api

# Deploy
git push heroku main
```

## Monitoring Commands

```bash
# Check service status
sudo supervisorctl status

# View logs
tail -f /var/log/supervisor/backend.err.log
tail -f /var/log/supervisor/frontend.err.log

# Monitor resource usage
htop
docker stats

# Check database size
du -sh /var/lib/mongodb

# Monitor API endpoints
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:8001/api/
```

## Backup Strategy

### MongoDB Backup

```bash
# Backup
mongodump --uri="mongodb://localhost:27017/pes_carpool" --out=/backup/$(date +%Y%m%d)

# Restore
mongorestore --uri="mongodb://localhost:27017/pes_carpool" /backup/20250125

# Automated daily backup
0 2 * * * /usr/bin/mongodump --uri="mongodb://localhost:27017/pes_carpool" --out=/backup/$(date +\%Y\%m\%d)
```

### Application Code Backup

```bash
# Git backup
git push origin main
git push backup main

# File backup
tar -czf pes-carpool-$(date +%Y%m%d).tar.gz /app
```

## Troubleshooting Production Issues

### High CPU Usage

```bash
# Check processes
top -p $(pgrep -f uvicorn)

# Optimize queries
# Add database indexes
# Enable caching
```

### Memory Leaks

```bash
# Monitor memory
watch -n 1 'ps aux | grep uvicorn'

# Restart service periodically (workaround)
# Fix: Review code for unclosed connections
```

### Database Connection Issues

```bash
# Check connection
mongosh mongodb://localhost:27017/pes_carpool

# Check connection pool
# Increase pool size in Motor configuration
```

## Support Contacts

- **Development:** dev@pes.edu
- **Operations:** ops@pes.edu
- **Emergency:** +91 XXXXXXXXXX

---

**Last Updated:** January 25, 2025
**Version:** 1.0.0
