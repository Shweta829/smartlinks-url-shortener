import json
import os
import threading
from datetime import datetime
from config import Config

class DataManager:
    def __init__(self):
        self.data_file = Config.DATA_FILE
        self.lock = threading.Lock()
        self._ensure_data_file()

    def _ensure_data_file(self):
        if not os.path.exists(self.data_file):
            initial_data = {"users": [], "urls": []}
            with open(self.data_file, 'w') as f:
                json.dump(initial_data, f, indent=2)

    def _load_data(self):
        with self.lock:
            with open(self.data_file, 'r') as f:
                return json.load(f)

    def _save_data(self, data):
        with self.lock:
            with open(self.data_file, 'w') as f:
                json.dump(data, f, indent=2)

    def get_user_by_email(self, email):
        data = self._load_data()
        email_lower = email.lower() if email else ""
        for user in data["users"]:
            if user["email"].lower() == email_lower:
                return user
        return None

    def get_user_by_id(self, user_id):
        data = self._load_data()
        for user in data["users"]:
            if user["id"] == user_id:
                return user
        return None

    def create_user(self, username, email, password):
        data = self._load_data()
        user_id = max([u["id"] for u in data["users"]] + [0]) + 1
        user = {
            "id": user_id,
            "username": username,
            "email": email,
            "password": password,
            "created_at": datetime.now().isoformat(),
            "reset_token": None
        }
        data["users"].append(user)
        self._save_data(data)
        return user_id

    def update_user_reset_token(self, user_id, reset_token):
        data = self._load_data()
        for user in data["users"]:
            if user["id"] == user_id:
                user["reset_token"] = reset_token
                self._save_data(data)
                return True
        return False

    def update_user_password(self, user_id, hashed_password):
        data = self._load_data()
        for user in data["users"]:
            if user["id"] == user_id:
                user["password"] = hashed_password
                user["reset_token"] = None
                self._save_data(data)
                return True
        return False

    def get_all_short_codes(self):
        data = self._load_data()
        return {url["short_code"] for url in data["urls"]}

    def create_url(self, user_id, original_url, short_code):
        data = self._load_data()
        url_id = max([u["id"] for u in data["urls"]] + [0]) + 1
        url = {
            "id": url_id,
            "user_id": user_id,
            "original_url": original_url,
            "short_code": short_code,
            "created_at": datetime.now().isoformat(),
            "clicks": 0,
            "browser_stats": {},
            "os_stats": {}
        }
        data["urls"].append(url)
        self._save_data(data)
        return url

    def get_url_by_code(self, short_code):
        data = self._load_data()
        for url in data["urls"]:
            if url["short_code"] == short_code:
                return url
        return None

    def increment_clicks(self, short_code, browser=None, os=None):
        data = self._load_data()
        for url in data["urls"]:
            if url["short_code"] == short_code:
                url["clicks"] += 1
                if browser:
                    url.setdefault("browser_stats", {})
                    url["browser_stats"][browser] = url["browser_stats"].get(browser, 0) + 1
                if os:
                    url.setdefault("os_stats", {})
                    url["os_stats"][os] = url["os_stats"].get(os, 0) + 1
                self._save_data(data)
                return True
        return False

    def get_user_urls(self, user_id):
        data = self._load_data()
        user_urls = [url for url in data["urls"] if url["user_id"] == user_id]
        return sorted(user_urls, key=lambda x: x["created_at"], reverse=True)

# Global instance
data_manager = DataManager()