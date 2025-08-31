const rateLimit = require('express-rate-limit');

// Rate limiter chung cho API
const generalLimiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000, // 15 minutes default
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100, // Giới hạn 100 requests mỗi windowMs
  message: {
    EM: 'Quá nhiều requests, vui lòng thử lại sau',
    EC: -1,
    DT: ''
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter đặc biệt cho OTP
const otpLimiter = rateLimit({
  windowMs: (process.env.OTP_RATE_LIMIT_WINDOW || 1) * 60 * 1000, // 1 minute default
  max: process.env.OTP_RATE_LIMIT_MAX_REQUESTS || 3, // Giới hạn 3 requests OTP mỗi phút
  message: {
    EM: 'Quá nhiều requests OTP, vui lòng thử lại sau 1 phút',
    EC: -1,
    DT: ''
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter cho authentication
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Giới hạn 10 attempts login trong 15 phút
  message: {
    EM: 'Quá nhiều attempts đăng nhập, vui lòng thử lại sau 15 phút',
    EC: -1,
    DT: ''
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  generalLimiter,
  otpLimiter,
  authLimiter
};
