from flask import Flask,render_template
from flask_cors import CORS
from datetime import timedelta

from config import Config
from extensions import bcrypt,jwt
from utils.data_manager import data_manager

from routes.auth import auth_bp
from routes.url import url_bp
from routes.stats import stats_bp

app=Flask(__name__)

app.config.from_object(Config)

# Ensure JWT secret keys are set with proper fallback
if not app.config.get('SECRET_KEY'):
    app.config['SECRET_KEY'] = 'default_secret_key_change_in_production'
    
if not app.config.get('JWT_SECRET_KEY'):
    app.config['JWT_SECRET_KEY'] = app.config.get('SECRET_KEY')

# JWT Configuration
app.config['JWT_TOKEN_LOCATION'] = ['headers']
app.config['JWT_HEADER_NAME'] = 'Authorization'
app.config['JWT_HEADER_TYPE'] = 'Bearer'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)

# CORS configuration
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Initialize extensions
bcrypt.init_app(app)
jwt.init_app(app)

# Initialize data file if it does not exist
def init_db():
    # The data_manager ensures the file exists
    pass

init_db()

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

@app.route("/dashboard")
def dashboard_page():
    return render_template("dashboard.html")

@app.route("/analytics")
def analytics_page():
    return render_template("analytics.html")

if __name__=="__main__":
    app.run(debug=True)