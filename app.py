from flask import Flask, request, jsonify, redirect, render_template
import mysql.connector
import random, string
from user_agents import parse

app = Flask(__name__)

db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="Sony@0110",
    database="smartlinks_db"
)
cursor = db.cursor(dictionary=True)

def generate_code(length=6):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/shorten", methods=["POST"])
def shorten():
    data = request.get_json()
    long_url = data.get("url")
    if not long_url:
        return jsonify({"error": "URL required"}), 400

    code = generate_code()
    cursor.execute(
        "INSERT INTO urls (original_url, short_code) VALUES (%s, %s)",
        (long_url, code)
    )
    db.commit()
    return jsonify({"short_url": f"http://localhost:5000/{code}", "code": code})

@app.route("/<short_code>")
def redirect_url(short_code):
    cursor.execute("SELECT * FROM urls WHERE short_code=%s", (short_code,))
    url = cursor.fetchone()
    if not url:
        return "Invalid Link", 404

    ua = parse(request.headers.get("User-Agent"))
    cursor.execute(
        "INSERT INTO clicks (url_id, browser, os) VALUES (%s, %s, %s)",
        (url["id"], ua.browser.family, ua.os.family)
    )
    db.commit()
    return redirect(url["original_url"])

@app.route("/stats/<short_code>")
def stats(short_code):
    cursor.execute("SELECT id FROM urls WHERE short_code=%s", (short_code,))
    url = cursor.fetchone()
    if not url:
        return jsonify({"error": "Not found"}), 404

    url_id = url["id"]
    cursor.execute("SELECT COUNT(*) total FROM clicks WHERE url_id=%s", (url_id,))
    total = cursor.fetchone()["total"]

    cursor.execute("SELECT browser, COUNT(*) count FROM clicks WHERE url_id=%s GROUP BY browser", (url_id,))
    browsers = cursor.fetchall()

    cursor.execute("SELECT os, COUNT(*) count FROM clicks WHERE url_id=%s GROUP BY os", (url_id,))
    os_data = cursor.fetchall()

    return jsonify({"total": total, "browsers": browsers, "os": os_data})

@app.route("/dashboard/<code>")
def dashboard(code):
    return render_template("stats.html", code=code)

if __name__ == "__main__":
    app.run(debug=True)
