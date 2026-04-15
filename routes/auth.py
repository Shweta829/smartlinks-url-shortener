from flask import Blueprint, request, jsonify, render_template
from extensions import bcrypt
from flask_jwt_extended import create_access_token
import json
import os
from datetime import datetime

auth_bp = Blueprint("auth", __name__)

# Mock user database (in-memory storage for now)
USERS_FILE = os.path.join(os.path.dirname(__file__), '../users.json')

def load_users():
    """Load users from JSON file"""
    if os.path.exists(USERS_FILE):
        with open(USERS_FILE, 'r') as f:
            return json.load(f)
    return {}

def save_users(users):
    """Save users to JSON file"""
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f, indent=2)

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

        users = load_users()

        # Check if user already exists
        for user_id, user_data in users.items():
            if user_data.get('email') == email:
                return jsonify({"message": "Email already registered"}), 409

        # Hash password
        hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")

        # Create new user
        user_id = str(len(users) + 1)
        users[user_id] = {
            "id": user_id,
            "username": username,
            "email": email,
            "password": hashed_password,
            "created_at": datetime.now().isoformat(),
            "reset_token": None
        }

        save_users(users)

        # Create JWT token
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

        users = load_users()

        # Find user by email
        user_data = None
        user_id = None
        for uid, user in users.items():
            if user.get('email') == email:
                user_data = user
                user_id = uid
                break

        if not user_data:
            return jsonify({"message": "Invalid email or password"}), 401

        # Check password
        stored_password = user_data.get('password', '')
        
        if not bcrypt.check_password_hash(stored_password, password):
            return jsonify({"message": "Invalid email or password"}), 401

        # Create JWT token
        token = create_access_token(identity=user_id)

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

        users = load_users()

        # Find user
        user_data = None
        user_id = None
        for uid, user in users.items():
            if user.get('email') == email:
                user_data = user
                user_id = uid
                break

        # Always return success for security (don't reveal if email exists)
        if user_data:
            reset_token = create_access_token(identity=user_id)
            users[user_id]['reset_token'] = reset_token
            save_users(users)
            print(f"Password reset token for {email}: {reset_token}")
            # In production, send email here
            return jsonify({
                "message": "If email exists, a reset link has been sent",
                "reset_token": reset_token  # For testing only - remove in production
            }), 200
        
        return jsonify({
            "message": "If email exists, a reset link has been sent"
        }), 200

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

        users = load_users()

        # Find user
        user_data = None
        user_id = None
        for uid, user in users.items():
            if user.get('email') == email:
                user_data = user
                user_id = uid
                break

        if not user_data:
            return jsonify({"message": "User not found"}), 404

        # Hash new password
        hashed_password = bcrypt.generate_password_hash(new_password).decode("utf-8")

        # Update password
        users[user_id]['password'] = hashed_password
        users[user_id]['reset_token'] = None
        save_users(users)

        return jsonify({
            "message": "Password reset successfully"
        }), 200

    except Exception as e:
        print(f"Reset password error: {str(e)}")
        return jsonify({"message": "Failed to reset password", "error": str(e)}), 500

@auth_bp.route("/forgot-password")
def forgot_password_page():
    return render_template("forgot_password.html")