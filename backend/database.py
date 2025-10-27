# backend/database.py

import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from pathlib import Path

# Path finding logic
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("No DATABASE_URL set in environment variables. Check your .env file.")

engine = create_async_engine(DATABASE_URL, echo=True)

# Important: Use autocommit=False and autoflush=False
AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

Base = declarative_base()

# FINAL, CORRECT Dependency for Transaction Management
async def get_db_session():
    # Create a fresh session instance
    session = AsyncSessionLocal()
    try:
        # Provide the session to the route handler
        yield session
        
        # Explicitly commit the transaction for POST/PUT/DELETE requests
        await session.commit()
    except Exception:
        # Rollback all changes if any error occurs
        await session.rollback()
        raise # Re-raise the exception to be handled by FastAPI
    finally:
        # Always close the session
        await session.close()