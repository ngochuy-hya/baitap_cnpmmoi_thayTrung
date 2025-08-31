const jwtService = require('../services/jwtService');
const User = require('../models/user');

const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                EM: 'Token không được cung cấp',
                EC: -1,
                DT: ''
            });
        }

        const token = authHeader.substring(7);
        const decoded = jwtService.verifyAccessToken(token);

        const user = await User.findByPk(decoded.userId);
        if (!user) {
            return res.status(401).json({
                EM: 'Người dùng không tồn tại',
                EC: -1,
                DT: ''
            });
        }

        req.user = {
            userId: user.id,
            email: user.email,
            role: user.role,
            status: user.status,
            isEmailVerified: user.isEmailVerified
        };
        
        next();
    } catch (error) {
        return res.status(401).json({
            EM: 'Token không hợp lệ',
            EC: -1,
            DT: ''
        });
    }
};

const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                EM: 'Bạn không có quyền truy cập',
                EC: -1,
                DT: ''
            });
        }
        next();
    };
};

const checkStatus = (req, res, next) => {
    if (req.user.status !== 'active') {
        return res.status(403).json({
            EM: 'Tài khoản của bạn đang bị khóa hoặc chưa kích hoạt',
            EC: -1,
            DT: ''
        });
    }
    next();
};

const checkEmailVerified = (req, res, next) => {
    if (!req.user.isEmailVerified) {
        return res.status(403).json({
            EM: 'Vui lòng xác thực email trước khi thực hiện hành động này',
            EC: -1,
            DT: ''
        });
    }
    next();
};

// Backward compatibility
const authMiddleware = verifyToken;
const adminMiddleware = checkRole(['admin']);

module.exports = { 
    verifyToken, 
    checkRole, 
    checkStatus, 
    checkEmailVerified,
    authMiddleware, 
    adminMiddleware 
};