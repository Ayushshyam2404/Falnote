import os
from dotenv import load_dotenv

load_dotenv()

# Build DATABASE_URL from individual components (Railway style) or use provided DATABASE_URL
DATABASE_URL = os.getenv("DATABASE_URL")

# If DATABASE_URL looks like just a hostname (Railway's issue), build it from components
if DATABASE_URL and not DATABASE_URL.startswith("postgresql://") and not DATABASE_URL.startswith("postgres://"):
    # Build from individual Railway variables
    pguser = os.getenv("PGUSER", "postgres")
    pgpassword = os.getenv("PGPASSWORD", "")
    pghost = os.getenv("PGHOST", DATABASE_URL)  # Use DATABASE_URL as hostname if only hostname provided
    pgport = os.getenv("PGPORT", "5432")
    pgdatabase = os.getenv("PGDATABASE", "railway")
    
    if pgpassword:
        DATABASE_URL = f"postgresql://{pguser}:{pgpassword}@{pghost}:{pgport}/{pgdatabase}"
    else:
        DATABASE_URL = f"postgresql://{pguser}@{pghost}:{pgport}/{pgdatabase}"
    print(f"Built DATABASE_URL from Railway variables")
else:
    # Use default if not provided
    DATABASE_URL = DATABASE_URL or "postgresql://caliber@localhost:5432/falnote"

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
DEBUG = os.getenv("DEBUG", "True") == "True"

# WebSocket settings
WS_HEARTBEAT_INTERVAL = 30  # seconds
WS_HEARTBEAT_TIMEOUT = 60  # seconds
