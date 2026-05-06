from flask import Blueprint, request, jsonify
from extensions import bcrypt
from flask_jwt_extended import create_access_token
from utils.data_manager import data_manager
from utils.validators import validate_username, validate_email, validate_password

auth_bp = Blueprint("auth", __name__)


def get_user_by_email(email):
    return data_manager.get_user_by_email(email)


def create_user(username, email, password):
    return data_manager.create_user(username, email, password)


@auth_bp.route("/api/register", methods=["POST"])
def register():
    try:
        data = request.get_json()

        username = data.get("username", "").strip()
        email = data.get("email", "").strip()
        password = data.get("password", "").strip()

        # Validation
        if not username or not email or not password:
            return jsonify({"message": "Missing required fields"}), 400
        
        # Validate username
        is_valid_username, username_msg = validate_username(username)
        if not is_valid_username:
            return jsonify({"message": username_msg}), 400
        
        # Validate email format
        is_valid_email, email_msg = validate_email(email)
        if not is_valid_email:
            return jsonify({"message": email_msg}), 400
        
        # Check if email already exists (case-insensitive)
        existing_user = get_user_by_email(email.lower())
        if existing_user:
            return jsonify({"message": "Email already registered"}), 409

        # Validate password
        is_valid_password, password_msg = validate_password(password)
        if not is_valid_password:
            return jsonify({"message": password_msg}), 400

        hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")
        user_id = create_user(username, email.lower(), hashed_password)

        token = create_access_token(identity=str(user_id))

        return jsonify({
            "message": "User registered successfully",
            "token": token,
            "user": {
                "id": user_id,
                "username": username,
                "email": email.lower()
            }
        }), 201

    except Exception as e:
        print(f"Register error: {str(e)}")
        return jsonify({"message": "Registration failed", "error": str(e)}), 500

@auth_bp.route("/api/login", methods=["POST"])
def login():
    try:
        data = request.get_json()

        email = data.get("email", "").strip()
        password = data.get("password", "").strip()

        # Validation
        if not email or not password:
            return jsonify({"message": "Email and password required"}), 400

        user_data = get_user_by_email(email)
        if not user_data:
            return jsonify({"message": "Invalid email or password"}), 401

        if not bcrypt.check_password_hash(user_data.get('password', ''), password):
            return jsonify({"message": "Invalid email or password"}), 401

        token = create_access_token(identity=str(user_data.get('id')))

        return jsonify({
            "message": "Login successful",
            "token": token,
            "user": {
                "id": user_data.get('id'),
                "username": user_data.get('username'),
                "email": user_data.get('email')
            }
        }), 200

    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({"message": "Login failed", "error": str(e)}), 500