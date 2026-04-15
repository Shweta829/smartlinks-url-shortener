import random
import string
import json
import os
from datetime import datetime

from flask import Blueprint, request, jsonify, redirect
from flask_jwt_extended import jwt_required, get_jwt_identity

url_bp = Blueprint("url", __name__)

# File paths for JSON storage (in project root, not working directory)
PROJECT_ROOT = os.path.dirname(os.path.dirname(__file__))
URLS_FILE = os.path.join(PROJECT_ROOT, "urls.json")
CLICKS_FILE = os.path.join(PROJECT_ROOT, "clicks.json")

def load_urls():
    """Load URLs from JSON file"""
    if os.path.exists(URLS_FILE):
        with open(URLS_FILE, 'r') as f:
            return json.load(f)
    return []

def save_urls(urls):
    """Save URLs to JSON file"""
    with open(URLS_FILE, 'w') as f:
        json.dump(urls, f, indent=2)

def load_clicks():
    """Load clicks from JSON file"""
    if os.path.exists(CLICKS_FILE):
        with open(CLICKS_FILE, 'r') as f:
            return json.load(f)
    return []

def save_clicks(clicks):
    """Save clicks to JSON file"""
    with open(CLICKS_FILE, 'w') as f:
        json.dump(clicks, f, indent=2)

def generate_code():
    """Generate unique short code"""
    urls = load_urls()
    used_codes = {url['short_code'] for url in urls}
    
    while True:
        code = "".join(random.choices(string.ascii_letters + string.digits, k=6))
        if code not in used_codes:
            return code

@url_bp.route("/api/shorten", methods=["POST"])
@jwt_required()
def shorten():
    try:
        data = request.get_json()
        
        original_url = data.get("url")
        
        if not original_url:
            return jsonify({"message": "URL is required"}), 400
        
        user_id = str(get_jwt_identity())
        
        # Generate a unique short code
        short_code = generate_code()
        
        urls = load_urls()
        
        # Create new URL entry
        url_entry = {
            "id": len(urls) + 1,
            "user_id": user_id,
            "original_url": original_url,
            "short_code": short_code,
            "created_at": datetime.now().isoformat(),
            "clicks": 0
        }
        
        urls.append(url_entry)
        save_urls(urls)
        
        short_url = f"http://127.0.0.1:5000/{short_code}"
        
        return jsonify({
            "short_url": short_url,
            "original_url": original_url,
            "code": short_code,
            "clicks": 0,
            "created_at": url_entry["created_at"]
        }), 201
        
    except Exception as e:
        return jsonify({"message": "Error shortening URL", "error": str(e)}), 500

@url_bp.route("/<code>")
def redirect_url(code):
    try:
        urls = load_urls()
        
        # Find URL by short code
        url_entry = next((u for u in urls if u['short_code'] == code), None)
        
        if not url_entry:
            return jsonify({"message": "URL not found"}), 404
        
        # Increment click count
        url_entry['clicks'] = url_entry.get('clicks', 0) + 1
        save_urls(urls)
        
        return redirect(url_entry['original_url'])
        
    except Exception as e:
        return jsonify({"message": "Error redirecting", "error": str(e)}), 500

@url_bp.route("/api/history")
@jwt_required()
def history():
    """Get user's shortened URLs history"""
    try:
        user_id = str(get_jwt_identity())
        urls = load_urls()
        
        # Filter URLs for current user
        user_urls = [u for u in urls if u['user_id'] == user_id]
        
        # Sort by creation date (newest first)
        user_urls.sort(key=lambda x: x['created_at'], reverse=True)
        
        return jsonify({
            "urls": user_urls,
            "count": len(user_urls)
        }), 200
        
    except Exception as e:
        return jsonify({"message": "Error fetching history", "error": str(e)}), 500

@url_bp.route("/api/my-links")
@jwt_required()
def mylinks():
    """Get all links for current user"""
    try:
        user_id = str(get_jwt_identity())
        urls = load_urls()
        
        # Filter URLs for current user
        user_urls = [u for u in urls if u['user_id'] == user_id]
        
        # Sort by creation date (newest first)
        user_urls.sort(key=lambda x: x['created_at'], reverse=True)
        
        return jsonify({"links": user_urls}), 200
        
    except Exception as e:
        return jsonify({"message": "Error fetching links", "error": str(e)}), 500