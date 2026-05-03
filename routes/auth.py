from flask import Blueprint, request, jsonify, render_template
from extensions import bcrypt
from flask_jwt_extended import create_access_token
from utils.data_manager import data_manager

auth_bp = Blueprint("auth", __name__)


def get_user_by_email(email):
    return data_manager.get_user_by_email(email)


def create_user(username, email, password):
    return data_manager.create_user(username, email, password)


def update_user_reset_token(user_id, reset_token):
    return data_manager.update_user_reset_token(user_id, reset_token)


def update_user_password(user_id, hashed_password):
    return data_manager.update_user_password(user_id, hashed_password)


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
        
        if len(password) < 8:
            return jsonify({"message": "Password must be at least 8 characters"}), 400
        
        if "@" not in email or "." not in email:
            return jsonify({"message": "Invalid email format"}), 400

        existing_user = get_user_by_email(email)
        if existing_user:
            return jsonify({"message": "Email already registered"}), 409

        hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")
        user_id = create_user(username, email, hashed_password)

        token = create_access_token(identity=user_id)

        return jsonify({
            "message": "User registered successfully",
            "token": token,
            "user": {
                "id": user_id,
                "username": username,
                "email": email
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

        token = create_access_token(identity=user_data.get('id'))

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

@auth_bp.route("/api/forgot-password", methods=["POST"])
def forgot_password():
    try:
        data = request.get_json()
        email = data.get("email", "").strip()

        if not email:
            return jsonify({"message": "Email is required"}), 400

        user_data = get_user_by_email(email)

        if user_data:
            reset_token = create_access_token(identity=user_data.get('id'))
            update_user_reset_token(user_data.get('id'), reset_token)
            print(f"Password reset token for {email}: {reset_token}")
            return jsonify({
                "message": "If email exists, a reset link has been sent",
                "reset_token": reset_token
            }), 200

        return jsonify({"message": "If email exists, a reset link has been sent"}), 200

    except Exception as e:
        print(f"Forgot password error: {str(e)}")
        return jsonify({"message": "Failed to process request", "error": str(e)}), 500

@auth_bp.route("/api/reset-password", methods=["POST"])
def reset_password():
    try:
        data = request.get_json()
        
        reset_token = data.get("reset_token", "").strip()
        new_password = data.get("new_password", "").strip()
        email = data.get("email", "").strip()

        if not new_password or not email:
            return jsonify({"message": "New password and email required"}), 400

        if len(new_password) < 8:
            return jsonify({"message": "Password must be at least 8 characters"}), 400

        user_data = get_user_by_email(email)
        if not user_data:
            return jsonify({"message": "User not found"}), 404

        if not user_data.get('reset_token') or user_data.get('reset_token') != reset_token:
            return jsonify({"message": "Invalid reset token"}), 401

        hashed_password = bcrypt.generate_password_hash(new_password).decode("utf-8")
        update_user_password(user_data.get('id'), hashed_password)

        return jsonify({
            "message": "Password reset successfully"
        }), 200

    except Exception as e:
        print(f"Reset password error: {str(e)}")
        return jsonify({"message": "Failed to reset password", "error": str(e)}), 500

@auth_bp.route("/forgot-password")
def forgot_password_page():
    return render_template("forgot_password.html")