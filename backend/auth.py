# backend/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from jose import JWTError, jwt
from passlib.context import CryptContext
import os

from . import models, schemas
from .database import get_db_session
from .models import Vehicle

# --- Configuration (Keep existing) ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")

JWT_SECRET = os.getenv("JWT_SECRET")
ALGORITHM = "HS256"

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)

# --- Utility Functions (Keep existing) ---
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=ALGORITHM)
    return encoded_jwt

# --- Dependency to get the current user (Keep existing) ---
async def get_current_user(
    token: str = Depends(oauth2_scheme), 
    db: AsyncSession = Depends(get_db_session)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = schemas.TokenData(email=email)
    except JWTError:
        raise credentials_exception
    
    query = select(models.User).where(models.User.email == token_data.email)
    result = await db.execute(query)
    user = result.scalars().first()
    
    if user is None:
        raise credentials_exception
    return user


# --- Registration Endpoint (FINAL FIXED VERSION) ---
@router.post("/register", response_model=schemas.UserOut)
async def register_user(
    user_in: schemas.UserCreate, 
    db: AsyncSession = Depends(get_db_session)
):
    # 1. Check for existing user
    query = select(models.User).where(
        (models.User.email == user_in.email) | (models.User.srn == user_in.srn)
    )
    result = await db.execute(query)
    db_user = result.scalars().first()
    
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email or SRN already registered"
        )
        
    hashed_password = get_password_hash(user_in.password)
    
    # 2. Create the new User
    new_user = models.User(
        name=user_in.name,
        email=user_in.email,
        password=hashed_password,
        phone=user_in.phone,
        srn=user_in.srn,
        role=user_in.role.lower(),
        user_type=user_in.user_type.value 
    )
    db.add(new_user)
    
    # Flush to execute the User insert and get the user_id
    await db.flush() 
    
    # 3. Create Vehicle if role is 'driver'
    if user_in.role.lower() == 'driver':
        if not user_in.license_plate or not user_in.vehicle_model:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Driver registration requires vehicle model and license plate."
            )
        
        # Check if license plate exists
        plate_query = select(models.Vehicle).where(models.Vehicle.license_plate == user_in.license_plate)
        plate_check = await db.execute(plate_query)
        if plate_check.scalars().first():
             raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="License plate already registered.")

        new_vehicle = models.Vehicle(
            user_id=new_user.user_id,
            model=user_in.vehicle_model,
            seat_capacity=4,
            license_plate=user_in.license_plate
        )
        db.add(new_vehicle)
    
    # Commit happens when the function exits successfully (in database.py)
    await db.refresh(new_user)
    
    return new_user

# --- Login Endpoint (Keep existing) ---
@router.post("/token", response_model=schemas.Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: AsyncSession = Depends(get_db_session)
):
    query = select(models.User).where(models.User.email == form_data.username)
    result = await db.execute(query)
    user = result.scalars().first()
    
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role}
    )
    return {"access_token": access_token, "token_type": "bearer"}


# --- "Get Me" Endpoint (Keep existing) ---
@router.get("/me", response_model=schemas.UserOut)
async def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user