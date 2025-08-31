# 🚀 FullStack ExpressJS Backend

## 📝 Mô tả
Backend API hoàn chỉnh được xây dựng với Express.js, cung cấp hệ thống authentication đầy đủ, quản lý người dùng và các API bảo mật.

## ⚡ Quick Start
```bash
# Cài đặt dependencies
npm install

# Tạo file .env từ template
cp .env.example .env

# Cấu hình database trong .env
# Chạy server
npm run dev
```

Truy cập: `http://localhost:3000`

## 📚 Chi tiết Setup
Xem file [SETUP.md](./SETUP.md) để có hướng dẫn chi tiết về cài đặt và cấu hình.

## 📋 API Documentation

### 📊 Response Format
Tất cả API response đều follow format:
```json
{
  "EM": "Error Message hoặc Success Message",
  "EC": 0,  // Error Code: 0 = success, -1 = error
  "DT": {}  // Data returned
}
```

### 🔐 Authentication Required
Để truy cập protected routes, thêm header:
```
Authorization: Bearer <access_token>
```

### 🗃️ Database Models

#### User Model
```javascript
{
  id: INTEGER (PK),
  email: STRING (UNIQUE),
  password: STRING (HASHED),
  fullName: STRING,
  phone: STRING,
  isEmailVerified: BOOLEAN,
  status: ENUM('active', 'inactive', 'pending'),
  role: ENUM('user', 'admin'),
  createdAt: DATE,
  updatedAt: DATE
}
```

#### OTP Model
```javascript
{
  id: INTEGER (PK),
  email: STRING,
  otpCode: STRING(6),
  otpType: ENUM('email_verification', 'forgot_password'),
  expiresAt: DATE,
  isUsed: BOOLEAN,
  createdAt: DATE,
  updatedAt: DATE
}
```

#### RefreshToken Model
```javascript
{
  id: INTEGER (PK),
  userId: INTEGER (FK),
  token: STRING,
  expiresAt: DATE,
  createdAt: DATE,
  updatedAt: DATE
}
```

## 🔧 Tech Stack
- **Framework**: Express.js
- **Database**: MySQL + Sequelize ORM
- **Authentication**: JWT (Access + Refresh Token)
- **Email**: Nodemailer
- **Validation**: Joi
- **Security**: bcrypt, CORS, Rate Limiting
- **Template Engine**: EJS

## 📁 Project Structure
```
ExpressJS01/
├── src/
│   ├── config/         # Database, CORS configs
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Auth, validation, rate limiting
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   └── views/          # EJS templates
├── .env.example        # Environment template
├── package.json        # Dependencies
├── README.md          # This file
└── SETUP.md           # Setup instructions
```

## 🛡️ Security Features
- Password hashing với bcrypt
- JWT tokens với expiration
- Refresh token rotation
- Rate limiting
- Input validation
- CORS protection
- SQL injection prevention
- XSS protection

## 🎯 Key Features
- ✅ Complete Authentication Flow
- ✅ Email Verification với OTP
- ✅ Password Reset với OTP
- ✅ Role-based Access Control
- ✅ User Management (CRUD)
- ✅ Rate Limiting
- ✅ Request Validation
- ✅ Error Handling
- ✅ Logging
- ✅ Health Check

## 🔄 API Flow Examples

### Registration Flow
1. `POST /api/auth/register` - Đăng ký user
2. User nhận OTP qua email
3. `POST /api/auth/verify-email` - Xác thực OTP
4. User status chuyển từ 'pending' → 'active'

### Login Flow
1. `POST /api/auth/login` - Đăng nhập
2. Response: Access Token (header) + Refresh Token (cookie)
3. Sử dụng Access Token để truy cập protected routes
4. Khi Access Token hết hạn, dùng `POST /api/auth/refresh-token`

### Password Reset Flow
1. `POST /api/auth/forgot-password` - Quên mật khẩu
2. User nhận OTP qua email
3. `POST /api/auth/verify-forgot-otp` - Xác thực OTP
4. Response: Reset Token
5. `POST /api/auth/reset-password` - Đặt mật khẩu mới

## 🧪 Testing
```bash
# Test health check
curl http://localhost:3000/api/health

# Test registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@gmail.com","password":"123456","fullName":"Test User"}'
```

## 🤝 Contributing
1. Fork project
2. Create feature branch
3. Commit changes
4. Push branch
5. Create Pull Request

## 📄 License
ISC License

## 👨‍💻 Author
Nguyen Ngoc Huy

---
**Happy Coding! 🎉**
