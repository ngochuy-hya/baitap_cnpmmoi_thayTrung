# 🚀 Setup Backend ExpressJS01

## 📋 Prerequisites
- Node.js (v16+)
- MySQL Server
- Git

## 🔧 Installation Steps

### 1. Clone và cài đặt dependencies
```bash
# Cài đặt dependencies
npm install
```

### 2. Cấu hình Database MySQL
```sql
-- Tạo database
CREATE DATABASE fullstack_db;

-- Tạo user (tuỳ chọn)
CREATE USER 'fullstack_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON fullstack_db.* TO 'fullstack_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Cấu hình Environment Variables
Tạo file `.env` trong thư mục root và cấu hình như sau:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=fullstack_db
DB_USER=root
DB_PASSWORD=your_mysql_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key-here-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:5173

# OTP Configuration
OTP_EXPIRES_IN=10
OTP_MAX_ATTEMPTS=5

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
OTP_RATE_LIMIT_WINDOW=1
OTP_RATE_LIMIT_MAX_REQUESTS=3
```

### 4. Cấu hình Email (Gmail)
1. Bật 2-Factor Authentication cho tài khoản Gmail
2. Tạo App Password:
   - Vào Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Tạo password cho "Mail"
   - Sử dụng password này cho `EMAIL_PASSWORD` trong .env

### 5. Chạy Server
```bash
# Development mode
npm run dev

# hoặc
npm start
```

## 🔗 API Endpoints

### 🔐 Authentication APIs
- `POST /api/auth/register` - Đăng ký + gửi OTP email
- `POST /api/auth/verify-email` - Xác thực email bằng OTP
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất
- `POST /api/auth/refresh-token` - Làm mới token

### 🔑 Password Management APIs
- `POST /api/auth/forgot-password` - Quên mật khẩu + gửi OTP
- `POST /api/auth/verify-forgot-otp` - Xác thực OTP reset password
- `POST /api/auth/reset-password` - Đặt lại mật khẩu mới
- `POST /api/auth/change-password` - Đổi mật khẩu (đã login)

### 📧 OTP Management APIs
- `POST /api/auth/resend-otp` - Gửi lại OTP

### 👤 User Management APIs
- `GET /api/users/profile` - Lấy profile user đang login
- `PUT /api/users/profile` - Cập nhật profile
- `GET /api/users` - Lấy danh sách users (Admin, phân trang)
- `GET /api/users/:id` - Lấy user theo ID (Admin)
- `PUT /api/users/:id` - Cập nhật user (Admin)
- `DELETE /api/users/:id` - Xóa user (Admin)
- `GET /api/users/email-status` - Kiểm tra trạng thái email

### 🏠 Protected Routes
- `GET /api/home` - Trang chủ (cần token)
- `GET /api/home/dashboard` - Dashboard
- `GET /api/health` - Health check

## 🧪 Testing API

### Health Check
```bash
curl http://localhost:3000/api/health
```

### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "123456",
    "fullName": "Test User",
    "phone": "0123456789"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "123456"
  }'
```

## ✨ Features

✅ JWT Authentication với Access + Refresh Token  
✅ OTP Email Verification cho đăng ký và quên mật khẩu  
✅ Rate Limiting chống spam OTP  
✅ Input Validation với Joi  
✅ Error Handling toàn diện  
✅ MySQL với Sequelize ORM  
✅ Email Templates đẹp mắt  
✅ Admin Role Management  
✅ Password Hashing với bcrypt  
✅ CORS Configuration cho Frontend  
✅ Cookie-based Refresh Token  
✅ Request Logging  

## 🐛 Troubleshooting

### Database Connection Error
- Kiểm tra MySQL server đã chạy
- Kiểm tra thông tin kết nối trong .env
- Đảm bảo database đã được tạo

### Email Sending Error
- Kiểm tra thông tin Gmail trong .env
- Đảm bảo đã tạo App Password
- Kiểm tra firewall/antivirus

### Port Already in Use
```bash
# Tìm process sử dụng port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

## 📁 Project Structure
```
src/
├── config/
│   ├── database.js       # Database configuration
│   └── cors.js          # CORS configuration
├── controllers/
│   ├── authController.js # Authentication controller
│   ├── userController.js # User management controller
│   └── homeController.js # Home/test controller
├── middleware/
│   ├── auth.js          # Authentication middleware
│   ├── validation.js    # Input validation
│   ├── rateLimiter.js   # Rate limiting
│   └── delay.js         # Request delay
├── models/
│   ├── index.js         # Models index
│   ├── user.js          # User model
│   ├── OTP.js           # OTP model
│   └── RefreshToken.js  # Refresh token model
├── routes/
│   └── api.js           # API routes
├── services/
│   ├── authService.js   # Authentication business logic
│   ├── userService.js   # User business logic
│   ├── emailService.js  # Email service
│   └── jwtService.js    # JWT service
├── views/
│   └── index.ejs        # Home page template
└── server.js            # Application entry point
```
