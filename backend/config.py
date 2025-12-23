import os
from datetime import timedelta

# DB (you can also read from environment variables)
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_NAME = os.getenv("DB_NAME", "tracker_db")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASS = os.getenv("DB_PASS", "Mani2605#")
DB_PORT = int(os.getenv("DB_PORT", "5432"))

# JWT
JWT_SECRET = os.getenv("JWT_SECRET", "super_secret_key_123")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXP = timedelta(minutes=10)
REFRESH_TOKEN_EXP = timedelta(days=7)
