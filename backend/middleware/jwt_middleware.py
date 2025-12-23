from functools import wraps
from flask import request, jsonify
from common.exceptions import AuthError, ForbiddenError
from common.utils import decode_token

def jwt_required(required_role: str | None = None):
    """
    Usage:
    @jwt_required()
    def some_route(...):
    """
    
    
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            auth_header = request.headers.get("Authorization")
            if not auth_header or not auth_header.startswith("Bearer "):
                return jsonify({"error": "Missing or invalid Authorization header"}), 401
            token = auth_header.split(" ")[1]
            try:
                decoded = decode_token(token)
            except Exception:
                return jsonify({"error": "Invalid or expired token"}), 401

            if decoded.get("type") != "access":                 #to access and refresh token
                return jsonify({"error": "Invalid token type"}), 401

            #Get user info from token
            user_id = decoded.get("user_id")    
            role = decoded.get("role", "user")

           
            # Attach to request for controllers
            request.user_id = user_id
            request.user_role = role
            return func(*args, **kwargs)
        return wrapper
    return decorator
