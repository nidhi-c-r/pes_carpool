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

AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

Base = declarative_base()

# FINAL, CORRECT Dependency for Transaction Management
async def get_db_session():
    # 1. Create a fresh session instance
    session = AsyncSessionLocal()
    try:
        # 2. Provide the session to the route handler
        yield session
        
        # 3. Explicitly commit the transaction for POST/PUT/DELETE routes.
        await session.commit()
        
    except Exception:
        # 4. Rollback all changes if any error occurs
        await session.rollback()
        raise # Re-raise the exception to be handled by FastAPI
        
    finally:
        # 5. Always close the session
        await session.close()