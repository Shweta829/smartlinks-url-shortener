import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "smartlinks_secret_key")
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "jwt_super_secret_key")
    MYSQL_HOST = os.environ.get("MYSQL_HOST", "localhost")
    MYSQL_USER = os.environ.get("MYSQL_USER", "root")
    MYSQL_PASSWORD = os.environ.get("MYSQL_PASSWORD", "Sony@0110")
    MYSQL_DB = os.environ.get("MYSQL_DB", "smartlinks_db")
    MYSQL_CURSORCLASS = "DictCursor"