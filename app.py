from flask import Flask,render_template
from flask_cors import CORS

from config import Config
from extensions import mysql,bcrypt,jwt

from routes.auth import auth_bp
from routes.url import url_bp
from routes.stats import stats_bp

app=Flask(__name__)

app.config.from_object(Config)

# CORS configuration
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Initialize extensions
mysql.init_app(app)
bcrypt.init_app(app)
jwt.init_app(app)

# JWT error handlers
@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return {"message": "Token has expired"}, 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    return {"message": "Invalid token"}, 401

@jwt.unauthorized_loader
def missing_token_callback(error):
    return {"message": "Authorization required"}, 401

# Register blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(url_bp)
app.register_blueprint(stats_bp)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/login")
def login_page():
    return render_template("login.html")

@app.route("/register")
def register_page():
    return render_template("register.html")

@app.route("/forgot")
def forgot_page():
    return render_template("forgot_password.html")

@app.route("/dashboard")
def dashboard_page():
    return render_template("dashboard.html")

@app.route("/analytics")
def analytics_page():
    return render_template("analytics.html")

if __name__=="__main__":
    app.run(debug=True)