from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from db import get_connection

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not username or not email or not password:
        return jsonify({"error": "username, email and password are required"}), 400

    conn = get_connection()
    cur = conn.cursor()

    # email unique check
    cur.execute("SELECT id FROM users WHERE email = %s;", (email,))
    if cur.fetchone():
        cur.close()
        conn.close()
        return jsonify({"error": "Email already registered"}), 400

    password_hash = generate_password_hash(password)

    cur.execute(
        "INSERT INTO users (username, email, password_hash) VALUES (%s, %s, %s) RETURNING id;",
        (username, email, password_hash),
    )
    user_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"id": user_id, "username": username, "email": email}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "email and password are required"}), 400

    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "SELECT id, username, password_hash FROM users WHERE email = %s;",
        (email,),
    )
    row = cur.fetchone()
    cur.close()
    conn.close()

    if row is None:
        return jsonify({"error": "Invalid email or password"}), 401

    user_id, username, password_hash = row

    if not check_password_hash(password_hash, password):
        return jsonify({"error": "Invalid email or password"}), 401

    return jsonify({"id": user_id, "username": username, "email": email}), 200
