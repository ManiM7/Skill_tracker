from repositories.user_repo import UserRepo
from common.utils import hash_password, check_password, create_access_token, create_refresh_token, decode_token
from common.exceptions import ValidationError, AuthError

class UserService:
    def __init__(self):
        self.repo = UserRepo()

    def signup(self, username: str, email: str, password: str):
        if not username or not email or not password:
            raise ValidationError("username, email and password are required")

        existing = self.repo.get_by_email(email)
        if existing:
            raise ValidationError("Email already registered")

        password_hash = hash_password(password)
        user_id = self.repo.create(username, email, password_hash, role="user")

        return {"id": user_id, "username": username, "email": email}

    def login(self, email: str, password: str):
        if not email or not password:
            raise ValidationError("email and password are required")

        row = self.repo.get_by_email(email)
        if not row:
            raise AuthError("Invalid email or password")

        user_id, username, email, password_hash, role = row
        if not check_password(password, password_hash):
            raise AuthError("Invalid email or password")

        access_token = create_access_token(user_id, role)
        refresh_token = create_refresh_token(user_id, role)

        return {
            "user": {"id": user_id, "username": username, "email": email, "role": role},
            "accessToken": access_token,
            "refreshToken": refresh_token,
        }

    def refresh_access_token(self, refresh_token: str):
        try:
            decoded = decode_token(refresh_token)
        except Exception:
            raise AuthError("Invalid or expired refresh token")

        if decoded.get("type") != "refresh":
            raise AuthError("Invalid refresh token type")

        user_id = decoded.get("user_id")
        role = decoded.get("role", "user")

        new_access = create_access_token(user_id, role)
        return {"accessToken": new_access}
