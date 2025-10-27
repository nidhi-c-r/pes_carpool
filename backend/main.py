# backend/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # <-- 1. IMPORT THIS

from .database import engine, Base
from . import auth
from . import rides
from . import bookings

app = FastAPI(
    title="PES Carpool API",
    description="API for the PES Carpool application, now with MySQL!",
    version="1.0.0"
)

# --- 2. ADD THIS MIDDLEWARE BLOCK ---
# Define the origins (URLs) that are allowed to make requests
origins = [
    "http://localhost:3000", # The default React frontend URL
    "http://localhost:3001", # Just in case
    # Add your frontend's deployed URL here when you have one
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       # Which origins are allowed
    allow_credentials=True,    # Allow cookies/authorization headers
    allow_methods=["*"],       # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],       # Allow all headers
)
# ------------------------------------

@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# --- Include your Routers ---
app.include_router(auth.router)
app.include_router(rides.router)
app.include_router(bookings.router)

# --- Root Endpoint ---
@app.get("/api")
def read_root():
    return {"message": "Welcome to the PES Carpool API"}