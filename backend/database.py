from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import DATABASE_URL
import os

# Add SSL support for Railway PostgreSQL (only in production)
db_url = DATABASE_URL
is_production = os.getenv("ENVIRONMENT", "development") == "production"

print(f"Database connection: {db_url[:50] if db_url else 'None'}...")
print(f"Is production: {is_production}")

if is_production and db_url and "postgresql" in db_url and "sslmode" not in db_url:
    db_url += "?sslmode=require"
    print("Added SSL requirement for production")

try:
    engine = create_engine(db_url, pool_pre_ping=True, echo=False)
    print("Database engine created successfully")
except Exception as e:
    print(f"Error creating database engine: {e}")
    raise

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
