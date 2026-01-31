import os
from dotenv import load_dotenv

load_dotenv()

# Build DATABASE_URL from individual components (Render/Railway style) or use provided DATABASE_URL
DATABASE_URL = os.getenv("DATABASE_URL")

print(f"[CONFIG] DATABASE_URL from env: {DATABASE_URL[:50] if DATABASE_URL else 'NOT SET'}")
print(f"[CONFIG] ENVIRONMENT: {os.getenv('ENVIRONMENT', 'development')}")

# If DATABASE_URL looks like just a hostname (Render/Railway's issue), build it from components
if DATABASE_URL and not DATABASE_URL.startswith("postgresql://") and not DATABASE_URL.startswith("postgres://"):
    # Build from individual Render variables
    pguser = os.getenv("PGUSER", "postgres")
    pgpassword = os.getenv("PGPASSWORD", "")
    pghost = os.getenv("PGHOST", DATABASE_URL)  # Use DATABASE_URL as hostname if only hostname provided
    pgport = os.getenv("PGPORT", "5432")
    pgdatabase = os.getenv("PGDATABASE", "railway")
    
    if pgpassword:
        DATABASE_URL = f"postgresql://{pguser}:{pgpassword}@{pghost}:{pgport}/{pgdatabase}"
    else:
        DATABASE_URL = f"postgresql://{pguser}@{pghost}:{pgport}/{pgdatabase}"
    print(f"[CONFIG] Built DATABASE_URL from Render/Railway variables")
elif not DATABASE_URL:
    # If no DATABASE_URL and in production, log error but don't crash yet
    environment = os.getenv("ENVIRONMENT", "development")
    if environment == "production":
        print("[CONFIG] WARNING: DATABASE_URL not set in production! Waiting for runtime injection...")
    # Use default for development only
    DATABASE_URL = "postgresql://caliber@localhost:5432/falnote"
    print(f"[CONFIG] Using default DATABASE_URL: {DATABASE_URL}")

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
DEBUG = os.getenv("DEBUG", "True") == "True"

# WebSocket settings
WS_HEARTBEAT_INTERVAL = 30  # seconds
WS_HEARTBEAT_TIMEOUT = 60  # seconds
