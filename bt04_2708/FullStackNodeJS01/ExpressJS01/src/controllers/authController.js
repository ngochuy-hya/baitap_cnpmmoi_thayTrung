const authService = require('../services/authService');

class AuthController {
    // POST /api/auth/register
    async register(req, res) {
        try {
            const result = await authService.register(req.body);
            res.status(201).json({
                EM: result.message,
                EC: 0,
                DT: result.user
            });
        } catch (error) {
            res.status(400).json({
                EM: error.message,
                EC: -1,
                DT: ''
            });
        }
    }

    // POST /api/auth/verify-email
    async verifyEmail(req, res) {
        try {
            const { email, otpCode } = req.body;
            const result = await authService.verifyEmail(email, otpCode);
            res.status(200).json({
                EM: result.message,
                EC: 0,
                DT: ''
            });
        } catch (error) {
            res.status(400).json({
                EM: error.message,
                EC: -1,
                DT: ''
            });
        }
    }

    // POST /api/auth/login
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const result = await authService.login(email, password);
            
            // Set refresh token in httpOnly cookie
            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            res.status(200).json({
                EM: result.message,
                EC: 0,
                DT: {
                    user: result.user,
                    accessToken: result.accessToken
                }
            });
        } catch (error) {
            res.status(400).json({
                EM: error.message,
                EC: -1,
                DT: ''
            });
        }
    }

    // POST /api/auth/logout
    async logout(req, res) {
        try {
            const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
            await authService.logout(refreshToken);
            
            // Clear refresh token cookie
            res.clearCookie('refreshToken');
            
            res.status(200).json({
                EM: 'Đăng xuất thành công!',
                EC: 0,
                DT: ''
            });
        } catch (error) {
            res.status(400).json({
                EM: error.message,
                EC: -1,
                DT: ''
            });
        }
    }

    // POST /api/auth/refresh-token
    async refreshToken(req, res) {
        try {
            const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
            if (!refreshToken) {
                return res.status(401).json({
                    EM: 'Refresh token không được cung cấp',
                    EC: -1,
                    DT: ''
                });
            }

            const result = await authService.refreshAccessToken(refreshToken);
            res.status(200).json({
                EM: 'Làm mới token thành công!',
                EC: 0,
                DT: result
            });
        } catch (error) {
            res.status(401).json({
                EM: error.message,
                EC: -1,
                DT: ''
            });
        }
    }

    // POST /api/auth/forgot-password
    async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            const result = await authService.forgotPassword(email);
            res.status(200).json({
                EM: result.message,
                EC: 0,
                DT: ''
            });
        } catch (error) {
            res.status(400).json({
                EM: error.message,
                EC: -1,
                DT: ''
            });
        }
    }

    // POST /api/auth/verify-forgot-otp
    async verifyForgotOTP(req, res) {
        try {
            const { email, otpCode } = req.body;
            const result = await authService.verifyForgotOTP(email, otpCode);
            res.status(200).json({
                EM: result.message,
                EC: 0,
                DT: { resetToken: result.resetToken }
            });
        } catch (error) {
            res.status(400).json({
                EM: error.message,
                EC: -1,
                DT: ''
            });
        }
    }

    // POST /api/auth/reset-password
    async resetPassword(req, res) {
        try {
            const { resetToken, newPassword } = req.body;
            const result = await authService.resetPassword(resetToken, newPassword);
            res.status(200).json({
                EM: result.message,
                EC: 0,
                DT: ''
            });
        } catch (error) {
            res.status(400).json({
                EM: error.message,
                EC: -1,
                DT: ''
            });
        }
    }

    // POST /api/auth/change-password
    async changePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;
            const userId = req.user.userId;
            const result = await authService.changePassword(userId, currentPassword, newPassword);
            res.status(200).json({
                EM: result.message,
                EC: 0,
                DT: ''
            });
        } catch (error) {
            res.status(400).json({
                EM: error.message,
                EC: -1,
                DT: ''
            });
        }
    }

    // POST /api/auth/resend-otp
    async resendOTP(req, res) {
        try {
            const { email, type } = req.body;
            const result = await authService.resendOTP(email, type);
            res.status(200).json({
                EM: result.message,
                EC: 0,
                DT: ''
            });
        } catch (error) {
            res.status(400).json({
                EM: error.message,
                EC: -1,
                DT: ''
            });
        }
    }
}

module.exports = new AuthController();