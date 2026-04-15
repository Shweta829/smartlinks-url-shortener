from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import json
import os

stats_bp = Blueprint("stats", __name__)

# File paths for JSON storage
PROJECT_ROOT = os.path.dirname(os.path.dirname(__file__))
URLs_FILE = os.path.join(PROJECT_ROOT, "urls.json")
CLICKS_FILE = os.path.join(PROJECT_ROOT, "clicks.json")

def load_urls():
    """Load URLs from JSON file"""
    if os.path.exists(URLs_FILE):
        with open(URLs_FILE, 'r') as f:
            return json.load(f)
    return []

def load_clicks():
    """Load clicks from JSON file (legacy, not used in current implementation)"""
    if os.path.exists(CLICKS_FILE):
        with open(CLICKS_FILE, 'r') as f:
            return json.load(f)
    return []

@stats_bp.route("/api/stats/<code>")
@jwt_required()
def stats(code):
    """Get stats for a specific shortened URL"""
    try:
        user_id = str(get_jwt_identity())
        urls = load_urls()
        
        # Find the URL by short code
        url_entry = next((u for u in urls if u['short_code'] == code), None)
        
        if not url_entry:
            return jsonify({"message": "URL not found"}), 404
        
        # Verify ownership
        if url_entry['user_id'] != user_id:
            return jsonify({"message": "Unauthorized"}), 403
        
        total_clicks = url_entry.get('clicks', 0)
        
        # For now, we don't have detailed browser/OS stats stored
        # Return basic stats structure
        return jsonify({
            "total_clicks": total_clicks,
            "browser_stats": [["Direct", total_clicks]],
            "os_stats": [["System", total_clicks]]
        }), 200
        
    except Exception as e:
        return jsonify({"message": "Error fetching stats", "error": str(e)}), 500
