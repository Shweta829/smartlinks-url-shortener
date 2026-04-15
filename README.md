# 🔗 SmartLinks

A modern, feature-rich URL shortener web application built with Flask. Create short, shareable links with advanced analytics, user authentication, and interactive dashboards.

## ✨ Features

### 🔐 Authentication System
- **User Registration** - Create accounts with email validation and password strength checking
- **Secure Login** - JWT-based authentication with token management
- **Password Recovery** - Forgot password functionality with email verification
- **Real-time Validation** - Interactive form validation with instant feedback

### 🔗 URL Management
- **URL Shortening** - Convert long URLs into short, memorable links
- **Custom Short URLs** - Create custom short codes for your links
- **Link Management** - View, edit, and delete your shortened URLs
- **QR Codes** - Generate QR codes for easy sharing

### 📊 Analytics & Statistics
- **Click Tracking** - Monitor how many times each link is clicked
- **Visitor Analytics** - Track visitor information (location, device, browser)
- **Detailed Reports** - Comprehensive analytics dashboard for each URL
- **Performance Metrics** - View trends and statistics over time

### 🎨 User Interface
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Interactive Dashboard** - Manage and monitor all your links in one place
- **Real-time Updates** - Live analytics and statistics
- **Dark/Light Mode** - Switchable theme for comfortable viewing

## 🚀 Getting Started

### Prerequisites
- Python 3.8 or higher
- pip package manager
- MySQL database (optional - defaults to JSON file storage)

### Installation

1. **Clone or Download the Project**
```bash
cd SmartLinks_Project
```

2. **Create a Virtual Environment** (Recommended)
```bash
python -m venv venv
.\venv\Scripts\activate  # On Windows
# or
source venv/bin/activate  # On macOS/Linux
```

3. **Install Dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure Database** (Optional)
   - Edit `config.py` to set up your MySQL database connection
   - Or use the default JSON file storage (no setup needed)

5. **Run the Application**
```bash
python app.py
```

6. **Access the Application**
   - Open your browser and navigate to `http://127.0.0.1:5000`
   - Register a new account to get started

## 📁 Project Structure

```
SmartLinks_Project/
├── app.py                          # Main Flask application entry point
├── config.py                       # Configuration settings
├── extensions.py                   # Flask extensions initialization
├── requirements.txt                # Python dependencies
├── users.json                      # User database (auto-created)
├── urls.json                       # Shortened URLs database
├── README.md                       # This file
│
├── routes/
│   ├── __init__.py
│   ├── auth.py                     # Authentication endpoints (login, register, forgot password)
│   ├── url.py                      # URL shortening and management endpoints
│   └── stats.py                    # Analytics and statistics endpoints
│
├── templates/
│   ├── index.html                  # Home page
│   ├── register.html               # User registration form
│   ├── login.html                  # User login form
│   ├── forgot_password.html        # Password recovery form
│   ├── dashboard.html              # User dashboard with URL management
│   └── analytics.html              # Analytics and statistics view
│
├── static/
│   ├── css/
│   │   └── style.css               # Global styling and responsive design
│   │
│   └── js/
│       ├── auth-login.js           # Login form logic
│       ├── auth-register.js        # Registration form logic
│       ├── forgot_password.js      # Password recovery logic
│       ├── dashboard.js            # Dashboard functionality
│       └── analytics.js            # Analytics page logic
│
└── utils/
    ├── __init__.py
    ├── shortener.py                # URL shortening logic
    └── validators.py               # Input validation utilities
```

## 🔧 API Endpoints

### Authentication Routes
- `POST /api/register` - Register a new user
- `POST /api/login` - User login
- `POST /api/forgot-password` - Request password reset
- `POST /api/reset-password` - Reset password with token

### URL Routes
- `POST /api/shorten` - Create a short URL (requires authentication)
- `GET /api/urls` - Get all user's shortened URLs
- `GET /api/url/<short_code>` - Retrieve original URL (public)
- `PUT /api/url/<short_code>` - Update a short URL
- `DELETE /api/url/<short_code>` - Delete a short URL

### Statistics Routes
- `GET /api/stats/<short_code>` - Get analytics for a specific URL
- `GET /api/stats` - Get aggregate statistics
- `GET /api/analytics/<short_code>` - Detailed analytics data

## 🛠️ Technology Stack

- **Backend:** Flask 2.3.2
- **Database:** MySQL with Flask-MySQLdb (or JSON file storage)
- **Authentication:** JWT (Flask-JWT-Extended)
- **Security:** Bcrypt for password hashing
- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **CORS:** Enabled for API access

## 📦 Dependencies

```
Flask==2.3.2
Flask-MySQLdb==2.0.0
Flask-Bcrypt==1.0.1
Flask-JWT-Extended==4.4.4
Flask-CORS==4.0.0
python-dotenv==1.0.0
user-agents==2.2.0
Werkzeug==2.3.6
PyMySQL==1.1.0
cryptography==41.0.1
```

## 🔒 Security Features

- **Password Hashing** - Bcrypt encryption for all passwords
- **JWT Authentication** - Secure token-based authentication
- **CORS Protection** - Controlled cross-origin resource sharing
- **Input Validation** - Server-side and client-side validation
- **SQL Injection Prevention** - Parameterized queries
- **Secure Session Management** - Token expiration and refresh

## 📝 Usage Examples

### Creating an Account
1. Navigate to the registration page
2. Enter your full name, email, and password
3. Password must be at least 8 characters with mixed case and numbers
4. Click "Register" to create your account

### Shortening a URL
1. Log in to your account
2. Go to the dashboard
3. Enter the long URL you want to shorten
4. Optionally set a custom short code
5. Click "Shorten" to generate your short link
6. Copy and share your new short URL

### Viewing Analytics
1. From the dashboard, click on any shortened URL
2. View click statistics and visitor information
3. Track performance over time with interactive charts
4. Export reports if needed

## 🐛 Troubleshooting

### Registration Issues
- Ensure email format is valid (example@domain.com)
- Password must be 8+ characters with uppercase, lowercase, and numbers
- Check that the users.json file has write permissions

### Login Problems
- Verify your email and password are correct
- Clear browser cache and cookies if having persistent issues
- Check that the JWT token is being stored properly in localStorage

### Database Connection Errors
- Verify MySQL server is running (if using MySQL)
- Check database credentials in `config.py`
- Ensure the database user has proper permissions

## 📚 Configuration

Edit `config.py` to customize:
- Database connection settings
- JWT token expiration time
- Session configuration
- Flask app settings
- CORS origins

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/improvement`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/improvement`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

SmartLinks Project - URL Shortener with Analytics

## 🐞 Report Issues

Found a bug? Have a feature request? Please open an issue on the project repository.

## 🎯 Future Enhancements

- [ ] Social media integration for sharing
- [ ] Advanced filtering and search
- [ ] Bulk URL shortening
- [ ] Custom analytics dashboard
- [ ] API rate limiting
- [ ] Mobile app
- [ ] Browser extensions
- [ ] Integration with popular services

---

**Happy Link Shortening! 🚀**
