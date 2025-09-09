const User = require('../models/user');
const Role = require('../models/role');
const { generateAccessToken, generateRefreshToken } = require('../middleware/auth');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

class UserService {
    // Cấu hình email transporter
    static getEmailTransporter() {
        return nodemailer.createTransporter({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    // Đăng ký user mới
    static async register(userData) {
        try {
            // Kiểm tra email đã tồn tại chưa
            const existingUser = await User.findByEmail(userData.email);
            if (existingUser) {
                throw new Error('Email already exists');
            }

            // Tạo user mới
            const newUser = await User.create(userData);
            
            if (!newUser) {
                throw new Error('Failed to create user');
            }

            // Gửi email xác thực
            await this.sendVerificationEmail(newUser);

            return {
                user: newUser.toSafeObject(),
                message: 'Registration successful. Please check your email to verify your account.'
            };
        } catch (error) {
            throw error;
        }
    }

    // Đăng nhập
    static async login(email, password) {
        try {
            // Tìm user theo email
            const user = await User.findByEmail(email);
            
            if (!user) {
                throw new Error('Invalid email or password');
            }

            // Kiểm tra password
            const isPasswordValid = await user.comparePassword(password);
            
            if (!isPasswordValid) {
                throw new Error('Invalid email or password');
            }

            if (!user.is_active) {
                throw new Error('Account has been deactivated');
            }

            // Cập nhật last login
            await user.updateLastLogin();

            // Tạo tokens
            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);

            return {
                user: user.toSafeObject(),
                accessToken,
                refreshToken,
                message: 'Login successful'
            };
        } catch (error) {
            throw error;
        }
    }

    // Quên mật khẩu
    static async forgotPassword(email) {
        try {
            const user = await User.findByEmail(email);
            
            if (!user) {
                // Không tiết lộ thông tin user không tồn tại
                return {
                    message: 'If an account with that email exists, we will send a password reset link.'
                };
            }

            // Tạo reset token
            const resetToken = await user.createPasswordResetToken();

            // Gửi email reset password
            await this.sendPasswordResetEmail(user, resetToken);

            return {
                message: 'Password reset email sent successfully'
            };
        } catch (error) {
            throw error;
        }
    }

    // Reset mật khẩu
    static async resetPassword(token, newPassword) {
        try {
            const user = await User.findByResetToken(token);
            
            if (!user) {
                throw new Error('Invalid or expired reset token');
            }

            // Reset password
            await user.resetPassword(newPassword);

            return {
                message: 'Password reset successful'
            };
        } catch (error) {
            throw error;
        }
    }

    // Xác thực email
    static async verifyEmail(token) {
        try {
            const user = await User.findByVerificationToken(token);
            
            if (!user) {
                throw new Error('Invalid verification token');
            }

            if (user.email_verified) {
                throw new Error('Email already verified');
            }

            // Verify email
            await user.verifyEmail();

            return {
                message: 'Email verified successfully'
            };
        } catch (error) {
            throw error;
        }
    }

    // Gửi lại email xác thực
    static async resendVerificationEmail(email) {
        try {
            const user = await User.findByEmail(email);
            
            if (!user) {
                throw new Error('User not found');
            }

            if (user.email_verified) {
                throw new Error('Email already verified');
            }

            // Tạo token mới
            const newToken = crypto.randomBytes(32).toString('hex');
            await user.update({ email_verification_token: newToken });

            // Gửi email
            await this.sendVerificationEmail(user);

            return {
                message: 'Verification email sent successfully'
            };
        } catch (error) {
            throw error;
        }
    }

    // Cập nhật profile user
    static async updateProfile(userId, updateData) {
        try {
            const user = await User.findById(userId);
            
            if (!user) {
                throw new Error('User not found');
            }

            // Cập nhật thông tin
            const success = await user.update(updateData);
            
            if (!success) {
                throw new Error('Failed to update profile');
            }

            return {
                user: user.toSafeObject(),
                message: 'Profile updated successfully'
            };
        } catch (error) {
            throw error;
        }
    }

    // Đổi mật khẩu
    static async changePassword(userId, currentPassword, newPassword) {
        try {
            const user = await User.findById(userId);
            
            if (!user) {
                throw new Error('User not found');
            }

            // Kiểm tra mật khẩu hiện tại
            const isCurrentPasswordValid = await user.comparePassword(currentPassword);
            
            if (!isCurrentPasswordValid) {
                throw new Error('Current password is incorrect');
            }

            // Cập nhật mật khẩu mới
            const success = await user.update({ password: newPassword });
            
            if (!success) {
                throw new Error('Failed to change password');
            }

            return {
                message: 'Password changed successfully'
            };
        } catch (error) {
            throw error;
        }
    }

    // Lấy thông tin profile user
    static async getProfile(userId) {
        try {
            const user = await User.findById(userId);
            
            if (!user) {
                throw new Error('User not found');
            }

            return {
                user: user.toSafeObject()
            };
        } catch (error) {
            throw error;
        }
    }

    // Lấy danh sách users (admin only)
    static async getUsers(options) {
        try {
            const result = await User.getUsers(options);
            
            return {
                users: result.users.map(user => user.toSafeObject()),
                pagination: result.pagination
            };
        } catch (error) {
            throw error;
        }
    }

    // Cập nhật user (admin only)
    static async updateUser(userId, updateData) {
        try {
            const user = await User.findById(userId);
            
            if (!user) {
                throw new Error('User not found');
            }

            const success = await user.update(updateData);
            
            if (!success) {
                throw new Error('Failed to update user');
            }

            return {
                user: user.toSafeObject(),
                message: 'User updated successfully'
            };
        } catch (error) {
            throw error;
        }
    }

    // Xóa user (admin only)
    static async deleteUser(userId) {
        try {
            const user = await User.findById(userId);
            
            if (!user) {
                throw new Error('User not found');
            }

            if (user.isAdmin()) {
                throw new Error('Cannot delete admin user');
            }

            const success = await user.delete();
            
            if (!success) {
                throw new Error('Failed to delete user');
            }

            return {
                message: 'User deleted successfully'
            };
        } catch (error) {
            throw error;
        }
    }

    // Gửi email xác thực
    static async sendVerificationEmail(user) {
        try {
            console.log('🔧 Starting email verification for:', user.email);
            console.log('🔧 Email config - HOST:', process.env.EMAIL_HOST);
            console.log('🔧 Email config - USER:', process.env.EMAIL_USER);
            console.log('🔧 Email config - FROM:', process.env.EMAIL_FROM);
            
            const transporter = this.getEmailTransporter();
            console.log('✅ Email transporter created successfully');
            
            const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${user.email_verification_token}`;
            
            const mailOptions = {
                from: process.env.EMAIL_FROM,
                to: user.email,
                subject: 'Verify Your Email Address',
                html: `
                    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
                        <h2>Email Verification Required</h2>
                        <p>Hello ${user.full_name},</p>
                        <p>Thank you for registering with ${process.env.APP_NAME}. Please click the button below to verify your email address:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                                Verify Email
                            </a>
                        </div>
                        <p>If the button doesn't work, copy and paste this link into your browser:</p>
                        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
                        <p>This link will expire in 24 hours.</p>
                        <p>If you didn't create an account, please ignore this email.</p>
                        <hr>
                        <p><small>Best regards,<br>${process.env.APP_NAME} Team</small></p>
                    </div>
                `
            };

            console.log('📧 Sending email to:', user.email);
            await transporter.sendMail(mailOptions);
            console.log('✅ Email sent successfully to:', user.email);
        } catch (error) {
            console.error('❌ Failed to send verification email:', error);
            console.error('❌ Error details:', error.message);
            console.error('❌ Error code:', error.code);
            throw new Error('Failed to send verification email');
        }
    }

    // Gửi email reset password
    static async sendPasswordResetEmail(user, resetToken) {
        try {
            const transporter = this.getEmailTransporter();
            
            const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
            
            const mailOptions = {
                from: process.env.EMAIL_FROM,
                to: user.email,
                subject: 'Password Reset Request',
                html: `
                    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
                        <h2>Password Reset Request</h2>
                        <p>Hello ${user.full_name},</p>
                        <p>We received a request to reset your password. Click the button below to reset it:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetUrl}" style="background-color: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                                Reset Password
                            </a>
                        </div>
                        <p>If the button doesn't work, copy and paste this link into your browser:</p>
                        <p><a href="${resetUrl}">${resetUrl}</a></p>
                        <p>This link will expire in 10 minutes.</p>
                        <p>If you didn't request a password reset, please ignore this email.</p>
                        <hr>
                        <p><small>Best regards,<br>${process.env.APP_NAME} Team</small></p>
                    </div>
                `
            };

            await transporter.sendMail(mailOptions);
        } catch (error) {
            console.error('Failed to send password reset email:', error);
            // Trong development mode, không throw error để không block reset
            if (process.env.NODE_ENV === 'development') {
                console.log('⚠️ Email sending failed in development mode, but reset continues...');
                return;
            }
            throw new Error('Failed to send password reset email');
        }
    }

    // Lấy thống kê user (admin only)
    static async getUserStats() {
        try {
            const db = require('../config/database');
            
            const stats = await db.query(`
                SELECT 
                    COUNT(*) as total_users,
                    COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_users,
                    COUNT(CASE WHEN email_verified = 1 THEN 1 END) as verified_users,
                    COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as new_users_30_days,
                    COUNT(CASE WHEN last_login >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as active_last_7_days
                FROM users
            `);

            const roleStats = await db.query(`
                SELECT r.name, COUNT(u.id) as user_count
                FROM roles r
                LEFT JOIN users u ON r.id = u.role_id AND u.is_active = 1
                GROUP BY r.id, r.name
                ORDER BY user_count DESC
            `);

            return {
                stats: stats[0],
                role_distribution: roleStats
            };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = UserService;
