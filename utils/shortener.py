import random
import string
from typing import Optional

def generate_short_code(length: int = 6) -> str:
    """Generate a random short code for URL shortening"""
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

def generate_unique_code(cursor, length: int = 6, max_attempts: int = 10) -> Optional[str]:
    """Generate a unique short code that doesn't already exist in database"""
    for _ in range(max_attempts):
        code = generate_short_code(length)
        cursor.execute("SELECT id FROM urls WHERE short_code=%s", (code,))
        if not cursor.fetchone():
            return code
    return None

def shorten_url(original_url: str, cursor, user_id: int) -> dict:
    """
    Shorten a URL and store it in the database
    Returns: dict with short_url and code
    """
    code = generate_unique_code(cursor)
    if not code:
        raise Exception("Failed to generate unique short code")
    
    cursor.execute(
        "INSERT INTO urls(original_url, short_code, user_id) VALUES(%s,%s,%s)",
        (original_url, code, user_id)
    )
    
    short_url = f"http://127.0.0.1:5000/{code}"
    
    return {
        "short_url": short_url,
        "code": code
    }

def get_full_url(cursor, short_code: str) -> Optional[tuple]:
    """Get the original URL from short code"""
    cursor.execute("SELECT id, original_url FROM urls WHERE short_code=%s", (short_code,))
    return cursor.fetchone()
