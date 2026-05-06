from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils.data_manager import data_manager

stats_bp = Blueprint("stats", __name__)

def normalize_user_id(user_id):
    if isinstance(user_id, str) and user_id.isdigit():
        return int(user_id)
    return user_id


@stats_bp.route("/api/stats/<code>")
@jwt_required()
def stats(code):
    """Get stats for a specific shortened URL"""
    try:
        user_id = normalize_user_id(get_jwt_identity())

        url_entry = data_manager.get_url_by_code(code)

        if not url_entry:
            return jsonify({"message": "URL not found"}), 404

        if url_entry["user_id"] != user_id:
            return jsonify({"message": "Unauthorized"}), 403

        total_clicks = url_entry.get("clicks", 0)

        browser_stats = url_entry.get("browser_stats") or {}
        os_stats = url_entry.get("os_stats") or {}

        if not browser_stats:
            browser_stats = {"Direct": total_clicks}
        if not os_stats:
            os_stats = {"System": total_clicks}

        return jsonify({
            "total_clicks": total_clicks,
            "browser_stats": [[k, v] for k, v in browser_stats.items()],
            "os_stats": [[k, v] for k, v in os_stats.items()]
        }), 200

    except Exception as e:
        return jsonify({"message": "Error fetching stats", "error": str(e)}), 500
