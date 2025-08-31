const express = require('express');
const router = express.Router();

// Import middleware
const { delay } = require('../middleware/delay');
const { verifyToken, checkRole, checkStatus } = require('../middleware/auth');
const { validateRequest, schemas } = require('../middleware/validation');
const { generalLimiter, otpLimiter, authLimiter } = require('../middleware/rateLimiter');

// Import controllers
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const {
  getHealthCheck,
  getHome,
  getDashboard,
  getApi,
  postApi,
  putApi,
  deleteApi
} = require('../controllers/homeController');

// Global middleware
router.use(delay(100)); // Thêm delay 100ms cho tất cả requests
router.use(generalLimiter); // Apply general rate limiting

// Health check - no auth required
router.get('/health', getHealthCheck);

// 🔐 Authentication APIs
router.post('/auth/register', 
  otpLimiter, 
  validateRequest(schemas.register), 
  authController.register
);

router.post('/auth/verify-email', 
  validateRequest(schemas.verifyOTP), 
  authController.verifyEmail
);

router.post('/auth/login', 
  authLimiter, 
  validateRequest(schemas.login), 
  authController.login
);

router.post('/auth/logout', authController.logout);

router.post('/auth/refresh-token', authController.refreshToken);

// 🔑 Password Management APIs
router.post('/auth/forgot-password', 
  otpLimiter, 
  validateRequest(schemas.forgotPassword), 
  authController.forgotPassword
);

router.post('/auth/verify-forgot-otp', 
  validateRequest(schemas.verifyOTP), 
  authController.verifyForgotOTP
);

router.post('/auth/reset-password', 
  validateRequest(schemas.resetPassword), 
  authController.resetPassword
);

router.post('/auth/change-password', 
  verifyToken, 
  checkStatus, 
  validateRequest(schemas.changePassword), 
  authController.changePassword
);

// 📧 OTP Management APIs
router.post('/auth/resend-otp', 
  otpLimiter, 
  authController.resendOTP
);

// 👤 User Management APIs - Protected Routes
router.get('/users/profile', 
  verifyToken, 
  checkStatus, 
  userController.getProfile
);

router.put('/users/profile', 
  verifyToken, 
  checkStatus, 
  userController.updateProfile
);

router.get('/users/email-status', userController.getEmailStatus);

// Admin only user management routes
router.get('/users', 
  verifyToken, 
  checkStatus, 
  checkRole(['admin']), 
  userController.getAllUsers
);

router.get('/users/:id', 
  verifyToken, 
  checkStatus, 
  checkRole(['admin']), 
  userController.getUserById
);

router.put('/users/:id', 
  verifyToken, 
  checkStatus, 
  checkRole(['admin']), 
  userController.updateUser
);

router.delete('/users/:id', 
  verifyToken, 
  checkStatus, 
  checkRole(['admin']), 
  userController.deleteUser
);

// 🏠 Protected Routes
router.get('/home', verifyToken, checkStatus, getHome);

router.get('/home/dashboard', verifyToken, checkStatus, getDashboard);

// Test routes for different roles
router.get('/test-api', verifyToken, checkStatus, getApi);
router.post('/test-api', verifyToken, checkStatus, postApi);

// Admin only routes
router.put('/test-api', verifyToken, checkStatus, checkRole(['admin']), putApi);
router.delete('/test-api', verifyToken, checkStatus, checkRole(['admin']), deleteApi);

// Admin and moderator routes
router.get('/admin-test', verifyToken, checkStatus, checkRole(['admin', 'moderator']), (req, res) => {
  res.json({
    EM: 'Admin/Moderator access granted',
    EC: 0,
    DT: { 
      user: req.user,
      message: 'Welcome to admin panel' 
    }
  });
});

module.exports = router;