"""
PlantCare AI - Database Connection and Session Management
Configured for SQLite by default, seamlessly switchable to PostgreSQL via DATABASE_URL.
"""

import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from .models import Base

logger = logging.getLogger("plantcare.database")

# Environment variable or local SQLite file
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./plantcare.db")

# For SQLite, enable check_same_thread=False
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    """Initializes database tables."""
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables initialized successfully.")


def get_db():
    """FastAPI Dependency for database session injection."""
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()
