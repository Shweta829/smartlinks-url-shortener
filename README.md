# 🔗 SmartLinks

A Flask-based URL shortener with user authentication, link history, and click tracking. The application stores data locally in JSON and supports frontend pages plus API endpoints.

## ✨ Features

- **User registration** with email validation and secure password hashing
- **Login** with JWT-based authentication
- **URL shortening** with automatic short-code generation
- **Personal link history** for authenticated users
- **Redirect tracking** for short URLs
- **Interactive dashboard and analytics pages**

## 🚀 Getting Started

### Prerequisites
- Python 3.8 or higher
- pip

### Installation

1. Open a terminal and go to the project folder:
```bash
cd SmartLinks_Project
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
.\venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the application:
```bash
python app.py
```

5. Open your browser:
```text
http://127.0.0.1:5000
```

## 📁 Project Structure

```
SmartLinks_Project/
├── app.py
├── config.py
├── extensions.py
├── requirements.txt
├── README.md
├── data.json
├── routes/
│   ├── auth.py
│   ├── url.py
│   └── stats.py
├── templates/
│   ├── analytics.html
│   ├── dashboard.html
│   ├── index.html
│   ├── login.html
│   └── register.html
├── static/
│   ├── css/style.css
│   └── js/
│       ├── analytics.js
│       ├── auth-login.js
│       ├── auth-register.js
│       └── dashboard.js
└── utils/
    ├── data_manager.py
    ├── shortener.py
    └── validators.py
```

## 🔧 Application Routes

### Frontend Pages
- `/` - Landing page
- `/login` - Login page
- `/register` - Register page
- `/dashboard` - Dashboard page
- `/analytics` - Analytics page

### API Endpoints
- `POST /api/register` - Register a new user
- `POST /api/login` - Log in and receive a JWT token
- `POST /api/shorten` - Create a short URL (requires JWT)
- `GET /api/history` - Retrieve the authenticated user's URL history
- `GET /api/my-links` - Retrieve all authenticated user links
- `GET /api/stats/<code>` - Get click stats for a short URL
- `GET /<short_code>` - Redirect to the original URL

## 🛠️ Technology Stack

- Flask
- Flask-Bcrypt
- Flask-CORS
- Flask-JWT-Extended
- JSON file storage
- HTML, CSS, JavaScript frontend

## 📦 Dependencies

```
Flask
Flask-Bcrypt
Flask-Cors
Flask-JWT-Extended
gunicorn
python-dotenv
```

## 🔒 Notes

- Passwords are stored hashed using bcrypt
- JWT is used for authenticated API access
- `data.json` stores users and URL records locally
- No external database is required for this version

## 💡 Usage

1. Register an account
2. Log in and open the dashboard
3. Shorten URLs and copy the generated short link
4. Share the short URL
5. View history and stats for your links

## 🐛 Troubleshooting

- Make sure `data.json` is writable
- Confirm the email and password used for login
- Restart the app if the JSON file becomes corrupted
- Check the terminal output when running `python app.py`
