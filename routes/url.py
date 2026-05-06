import random
import string
from datetime import datetime

from flask import Blueprint, request, jsonify, redirect
from flask_jwt_extended import jwt_required, get_jwt_identity

from utils.data_manager import data_manager

url_bp = Blueprint("url", __name__)

def generate_code():
    used_codes = data_manager.get_all_short_codes()

    while True:
        code = "".join(random.choices(string.ascii_letters + string.digits, k=6))
        if code not in used_codes:
            return code


def normalize_user_id(user_id):
    if isinstance(user_id, str) and user_id.isdigit():
        return int(user_id)
    return user_id


def parse_browser(user_agent):
    ua = (user_agent or "").lower()
    if "edg" in ua or "edge" in ua:
        return "Edge"
    if "opr" in ua or "opera" in ua:
        return "Opera"
    if "chrome" in ua and "chromium" not in ua and "edg" not in ua and "opr" not in ua:
        return "Chrome"
    if "firefox" in ua:
        return "Firefox"
    if "safari" in ua and "chrome" not in ua and "chromium" not in ua:
        return "Safari"
    if "trident" in ua or "msie" in ua:
        return "Internet Explorer"
    return "Other"


def parse_os(user_agent):
    ua = (user_agent or "").lower()
    if "windows" in ua:
        return "Windows"
    if "iphone" in ua or "ipad" in ua or "ipod" in ua:
        return "iOS"
    if "mac os x" in ua or "macintosh" in ua:
        return "macOS"
    if "android" in ua:
        return "Android"
    if "linux" in ua:
        return "Linux"
    return "Other"


def serialize_urls(rows):
    # rows is already list of dicts with isoformat dates
    return rows

@url_bp.route("/api/shorten", methods=["POST"])
@jwt_required()
def shorten():
    try:
        data = request.get_json()
        original_url = data.get("url")

        if not original_url:
            return jsonify({"message": "URL is required"}), 400

        user_id = normalize_user_id(get_jwt_identity())
        short_code = generate_code()

        url_entry = data_manager.create_url(user_id, original_url, short_code)

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
        url_entry = data_manager.get_url_by_code(code)

        if not url_entry:
            return jsonify({"message": "URL not found"}), 404

        user_agent = request.headers.get("User-Agent", "")
        browser = parse_browser(user_agent)
        os_name = parse_os(user_agent)

        data_manager.increment_clicks(code, browser=browser, os=os_name)

        return redirect(url_entry["original_url"])

    except Exception as e:
        return jsonify({"message": "Error redirecting", "error": str(e)}), 500

@url_bp.route("/api/history")
@jwt_required()
def history():
    """Get user's shortened URLs history"""
    try:
        user_id = normalize_user_id(get_jwt_identity())

        user_urls = data_manager.get_user_urls(user_id)

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
        user_id = normalize_user_id(get_jwt_identity())

        user_urls = data_manager.get_user_urls(user_id)
        
        return jsonify({"links": user_urls}), 200
        
    except Exception as e:
        return jsonify({"message": "Error fetching links", "error": str(e)}), 500