import bcrypt
import jwt
import datetime
from config import JWT_SECRET, JWT_ALGORITHM, ACCESS_TOKEN_EXP, REFRESH_TOKEN_EXP

#bcrytp
def hash_password(raw: str) -> str:
    return bcrypt.hashpw(raw.encode(), bcrypt.gensalt()).decode() #signup

def check_password(raw: str, hashed: str) -> bool:
    return bcrypt.checkpw(raw.encode(), hashed.encode())    #login

def create_access_token(user_id: int, role: str = "user") -> str:
    payload = {
        "user_id": user_id,
        "role": role,
        "type": "access",
        "exp": datetime.datetime.utcnow() + ACCESS_TOKEN_EXP,
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: int, role: str = "user") -> str:
    payload = {
        "user_id": user_id,
        "role": role,
        "type": "refresh",
        "exp": datetime.datetime.utcnow() + REFRESH_TOKEN_EXP,
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str):
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
