const UserService = require('../services/userService');

class UserController {
    // Đăng ký user mới
    static async register(req, res) {
        try {
            const result = await UserService.register(req.body);
            
            res.status(201).json({
                success: true,
                data: result,
                message: result.message
            });
        } catch (error) {
            console.error('Register error:', error);
            
            res.status(400).json({
                success: false,
                message: error.message || 'Registration failed'
            });
        }
    }

    // Đăng nhập
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            const result = await UserService.login(email, password);
            
            res.status(200).json({
                success: true,
                data: result,
                message: result.message
            });
        } catch (error) {
            console.error('Login error:', error);
            
            res.status(401).json({
                success: false,
                message: error.message || 'Login failed'
            });
        }
    }

    // Quên mật khẩu
    static async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            const result = await UserService.forgotPassword(email);
            
            res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (error) {
            console.error('Forgot password error:', error);
            
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to process password reset request'
            });
        }
    }

    // Reset mật khẩu
    static async resetPassword(req, res) {
        try {
            const { token, password } = req.body;
            const result = await UserService.resetPassword(token, password);
            
            res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (error) {
            console.error('Reset password error:', error);
            
            res.status(400).json({
                success: false,
                message: error.message || 'Password reset failed'
            });
        }
    }

    // Xác thực email
    static async verifyEmail(req, res) {
        try {
            const { token } = req.params;
            const result = await UserService.verifyEmail(token);
            
            res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (error) {
            console.error('Email verification error:', error);
            
            res.status(400).json({
                success: false,
                message: error.message || 'Email verification failed'
            });
        }
    }

    // Gửi lại email xác thực
    static async resendVerificationEmail(req, res) {
        try {
            const { email } = req.body;
            const result = await UserService.resendVerificationEmail(email);
            
            res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (error) {
            console.error('Resend verification error:', error);
            
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to resend verification email'
            });
        }
    }

    // Lấy thông tin profile của user hiện tại
    static async getProfile(req, res) {
        try {
            const result = await UserService.getProfile(req.user.id);
            
            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error('Get profile error:', error);
            
            res.status(404).json({
                success: false,
                message: error.message || 'Failed to get profile'
            });
        }
    }

    // Cập nhật profile của user hiện tại
    static async updateProfile(req, res) {
        try {
            const result = await UserService.updateProfile(req.user.id, req.body);
            
            res.status(200).json({
                success: true,
                data: result,
                message: result.message
            });
        } catch (error) {
            console.error('Update profile error:', error);
            
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to update profile'
            });
        }
    }

    // Đổi mật khẩu
    static async changePassword(req, res) {
        try {
            const { current_password, new_password } = req.body;
            const result = await UserService.changePassword(req.user.id, current_password, new_password);
            
            res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (error) {
            console.error('Change password error:', error);
            
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to change password'
            });
        }
    }

    // Lấy danh sách users (admin only)
    static async getUsers(req, res) {
        try {
            const options = {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 10,
                search: req.query.search || '',
                role_id: req.query.role_id ? parseInt(req.query.role_id) : null,
                is_active: req.query.is_active !== undefined ? parseInt(req.query.is_active) : 1
            };

            const result = await UserService.getUsers(options);
            
            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error('Get users error:', error);
            
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get users'
            });
        }
    }

    // Lấy thông tin user theo ID (admin only)
    static async getUserById(req, res) {
        try {
            const { id } = req.params;
            const result = await UserService.getProfile(id);
            
            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error('Get user by ID error:', error);
            
            res.status(404).json({
                success: false,
                message: error.message || 'User not found'
            });
        }
    }

    // Cập nhật user (admin only)
    static async updateUser(req, res) {
        try {
            const { id } = req.params;
            const result = await UserService.updateUser(id, req.body);
            
            res.status(200).json({
                success: true,
                data: result,
                message: result.message
            });
        } catch (error) {
            console.error('Update user error:', error);
            
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to update user'
            });
        }
    }

    // Xóa user (admin only)
    static async deleteUser(req, res) {
        try {
            const { id } = req.params;
            
            // Không cho phép admin xóa chính mình
            if (req.user.id == id) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete your own account'
                });
            }

            const result = await UserService.deleteUser(id);
            
            res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (error) {
            console.error('Delete user error:', error);
            
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to delete user'
            });
        }
    }

    // Lấy thống kê user (admin only)
    static async getUserStats(req, res) {
        try {
            const result = await UserService.getUserStats();
            
            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error('Get user stats error:', error);
            
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get user statistics'
            });
        }
    }

    // Logout (client-side sẽ xóa token)
    static async logout(req, res) {
        try {
            res.status(200).json({
                success: true,
                message: 'Logged out successfully'
            });
        } catch (error) {
            console.error('Logout error:', error);
            
            res.status(500).json({
                success: false,
                message: 'Logout failed'
            });
        }
    }

    // Refresh token (optional - implement nếu cần)
    static async refreshToken(req, res) {
        try {
            // TODO: Implement refresh token logic
            res.status(501).json({
                success: false,
                message: 'Refresh token not implemented yet'
            });
        } catch (error) {
            console.error('Refresh token error:', error);
            
            res.status(500).json({
                success: false,
                message: 'Failed to refresh token'
            });
        }
    }
}

module.exports = UserController;
