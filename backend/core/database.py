"""
Database connection and session management for Cloud SQL PostgreSQL
"""

from sqlalchemy import create_engine, event, text
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import NullPool
from contextlib import contextmanager
from .config import settings
import logging

logger = logging.getLogger(__name__)

# Create SQLAlchemy Base for models
Base = declarative_base()

# Global engine and session maker
engine = None
SessionLocal = None


def init_database():
    """
    Initialize database connection.
    Should be called on application startup.
    """
    global engine, SessionLocal
    
    if not settings.DATABASE_URL:
        logger.warning("DATABASE_URL not configured. Database features will be unavailable.")
        return False
    
    try:
        # Create engine with appropriate settings for Cloud SQL
        engine_kwargs = {
            "echo": settings.SQL_ECHO,
            "pool_pre_ping": True,  # Verify connections before using
            "pool_recycle": 3600,   # Recycle connections after 1 hour
        }
        
        # For Cloud SQL Unix socket connections, use NullPool to avoid connection issues
        if "/cloudsql/" in settings.DATABASE_URL:
            engine_kwargs["poolclass"] = NullPool
            logger.info("Using NullPool for Cloud SQL Unix socket connection")
        else:
            engine_kwargs["pool_size"] = 5
            engine_kwargs["max_overflow"] = 10
        
        engine = create_engine(settings.DATABASE_URL, **engine_kwargs)
        
        # Test connection
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        
        logger.info("Database connection established successfully")
        
        # Create session factory
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        
        return True
        
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        engine = None
        SessionLocal = None
        return False


def create_tables():
    """
    Create all database tables.
    Should be called after init_database() on first deployment.
    """
    if not engine:
        raise RuntimeError("Database not initialized. Call init_database() first.")
    
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Failed to create tables: {e}")
        raise


def drop_tables():
    """
    Drop all database tables.
    USE WITH CAUTION - Only for development/testing.
    """
    if not engine:
        raise RuntimeError("Database not initialized. Call init_database() first.")
    
    if settings.ENVIRONMENT == "production":
        raise RuntimeError("Cannot drop tables in production environment")
    
    try:
        Base.metadata.drop_all(bind=engine)
        logger.info("Database tables dropped successfully")
    except Exception as e:
        logger.error(f"Failed to drop tables: {e}")
        raise


@contextmanager
def get_db_session():
    """
    Context manager for database sessions.
    
    Usage:
        with get_db_session() as session:
            session.query(Model).filter_by(id=1).first()
    """
    if not SessionLocal:
        raise RuntimeError("Database not initialized. Call init_database() first.")
    
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def get_db():
    """
    Dependency for FastAPI endpoints.
    
    Usage:
        @app.get("/endpoint")
        def endpoint(db: Session = Depends(get_db)):
            return db.query(Model).all()
    """
    if not SessionLocal:
        raise RuntimeError("Database not initialized. Call init_database() first.")
    
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def is_database_available() -> bool:
    """Check if database is configured and available"""
    return engine is not None and SessionLocal is not None
