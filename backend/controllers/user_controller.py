from flask import Blueprint, request, jsonify
from services.user_service import UserService
from common.exceptions import ValidationError, AuthError

user_bp = Blueprint("users", __name__, url_prefix="/auth")
service = UserService()

@user_bp.route("/register", methods=["POST"])
def register_alias():
    data = request.get_json() or {}
    try:
        user = service.signup(
            data.get("username"),
            data.get("email"),
            data.get("password"),
        )
        return jsonify(user), 201
    except ValidationError as e:
        return jsonify({"error": str(e)}), 400

@user_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    try:
        result = service.login(data.get("email"), data.get("password"))
        return jsonify(result), 200
    except (ValidationError, AuthError) as e:
        return jsonify({"error": str(e)}), 400

@user_bp.route("/refresh", methods=["POST"])
def refresh():
    data = request.get_json() or {}
    token = data.get("refreshToken")
    if not token:
        return jsonify({"error": "refreshToken required"}), 400
    try:
        result = service.refresh_access_token(token)
        return jsonify(result), 200
    except AuthError as e:
        return jsonify({"error": str(e)}), 401
