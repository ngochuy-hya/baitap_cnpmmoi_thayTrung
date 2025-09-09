const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Middleware xác thực JWT token
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token is required'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Lấy thông tin user
        const user = await User.findById(decoded.id);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token - user not found'
            });
        }

        if (!user.is_active) {
            return res.status(401).json({
                success: false,
                message: 'Account has been deactivated'
            });
        }

        // Gán user vào request
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token has expired'
            });
        }

        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Middleware xác thực tùy chọn (không bắt buộc phải có token)
const authenticateOptional = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            req.user = null;
            return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        
        if (user && user.is_active) {
            req.user = user;
        } else {
            req.user = null;
        }
        
        next();
    } catch (error) {
        req.user = null;
        next();
    }
};

// Middleware phân quyền theo role
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!roles.includes(req.user.role_name)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }

        next();
    };
};

// Middleware chỉ cho phép admin
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    if (!req.user.isAdmin()) {
        return res.status(403).json({
            success: false,
            message: 'Admin access required'
        });
    }

    next();
};

// Middleware chỉ cho phép admin hoặc staff
const requireStaff = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    if (!req.user.isAdmin() && !req.user.isStaff()) {
        return res.status(403).json({
            success: false,
            message: 'Staff access required'
        });
    }

    next();
};

// Middleware kiểm tra owner (chỉ user đó hoặc admin mới được truy cập)
const requireOwnerOrAdmin = (userIdParam = 'id') => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const targetUserId = req.params[userIdParam] || req.body.user_id;
        
        if (req.user.isAdmin() || req.user.id == targetUserId) {
            return next();
        }

        return res.status(403).json({
            success: false,
            message: 'You can only access your own resources'
        });
    };
};

// Middleware kiểm tra email đã được verify
const requireEmailVerified = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    if (!req.user.email_verified) {
        return res.status(403).json({
            success: false,
            message: 'Email verification required'
        });
    }

    next();
};

// Utility function để tạo JWT token
const generateAccessToken = (user) => {
    const payload = {
        id: user.id,
        email: user.email,
        role_id: user.role_id,
        role_name: user.role_name
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
};

// Utility function để tạo refresh token
const generateRefreshToken = (user) => {
    const payload = {
        id: user.id,
        type: 'refresh'
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

module.exports = {
    authenticateToken,
    authenticateOptional,
    authorize,
    requireAdmin,
    requireStaff,
    requireOwnerOrAdmin,
    requireEmailVerified,
    generateAccessToken,
    generateRefreshToken
};
