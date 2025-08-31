const User = require('../models/user');
const OTP = require('../models/OTP');
const RefreshToken = require('../models/RefreshToken');
const emailService = require('./emailService');
const jwtService = require('./jwtService');
const { Op } = require('sequelize');

class AuthService {
    async register(userData) {
        const { email, password, fullName, phone } = userData;

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            throw new Error('Email đã được đăng ký');
        }

        const user = await User.create({
            email, password, fullName, phone,
            status: 'pending',
            isEmailVerified: false
        });

        await this.generateAndSendOTP(email, 'email_verification');

        return {
            message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực.',
            user: user.toJSON()
        };
    }

    async verifyEmail(email, otpCode) {
        const otp = await OTP.findOne({
            where: {
                email, otpCode,
                otpType: 'email_verification',
                isUsed: false,
                expiresAt: { [Op.gt]: new Date() }
            }
        });

        if (!otp) {
            throw new Error('Mã OTP không hợp lệ hoặc đã hết hạn');
        }

        await otp.update({ isUsed: true });

        const user = await User.findOne({ where: { email } });
        await user.update({
            isEmailVerified: true,
            status: 'active'
        });

        return { message: 'Xác thực email thành công!' };
    }

    async login(email, password) {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            throw new Error('Email hoặc mật khẩu không chính xác');
        }

        if (!user.isEmailVerified) {
            throw new Error('Vui lòng xác thực email trước khi đăng nhập');
        }

        if (user.status !== 'active') {
            throw new Error('Tài khoản đang bị khóa');
        }

        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            throw new Error('Email hoặc mật khẩu không chính xác');
        }

        const tokens = await this.generateTokens(user);

        return {
            message: 'Đăng nhập thành công!',
            user: user.toJSON(),
            ...tokens
        };
    }

    async forgotPassword(email) {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            throw new Error('Không tìm thấy tài khoản với email này');
        }

        await this.generateAndSendOTP(email, 'forgot_password');
        return { message: 'Mã OTP đã được gửi đến email của bạn' };
    }

    async verifyForgotOTP(email, otpCode) {
        const otp = await OTP.findOne({
            where: {
                email, otpCode,
                otpType: 'forgot_password',
                isUsed: false,
                expiresAt: { [Op.gt]: new Date() }
            }
        });

        if (!otp) {
            throw new Error('Mã OTP không hợp lệ hoặc đã hết hạn');
        }

        await otp.update({ isUsed: true });

        const user = await User.findOne({ where: { email } });
        const resetToken = jwtService.generateAccessToken({ 
            userId: user.id, 
            email: user.email,
            purpose: 'password_reset'
        });

        return { 
            message: 'Xác thực OTP thành công!',
            resetToken
        };
    }

    async resetPassword(resetToken, newPassword) {
        const decoded = jwtService.verifyAccessToken(resetToken);
        if (decoded.purpose !== 'password_reset') {
            throw new Error('Token không hợp lệ');
        }

        const user = await User.findByPk(decoded.userId);
        await user.update({ password: newPassword });

        return { message: 'Đặt lại mật khẩu thành công!' };
    }

    async changePassword(userId, currentPassword, newPassword) {
        const user = await User.findByPk(userId);
        
        const isValidPassword = await user.comparePassword(currentPassword);
        if (!isValidPassword) {
            throw new Error('Mật khẩu hiện tại không chính xác');
        }

        await user.update({ password: newPassword });
        return { message: 'Đổi mật khẩu thành công!' };
    }

    async generateAndSendOTP(email, type) {
        await OTP.destroy({
            where: { email, otpType: type, isUsed: false }
        });

        const otpCode = OTP.generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await OTP.create({
            email, otpCode, otpType: type, expiresAt
        });

        const result = await emailService.sendOTPEmail(email, otpCode, type);
        if (!result.success) {
            throw new Error('Không thể gửi email');
        }

        return { message: 'Mã OTP đã được gửi đến email của bạn' };
    }

    async resendOTP(email, type) {
        const lastOTP = await OTP.findOne({
            where: { email, otpType: type },
            order: [['createdAt', 'DESC']]
        });

        if (lastOTP) {
            const nextAllowedTime = new Date(lastOTP.createdAt.getTime() + 2 * 60 * 1000); // 2 minutes
            const now = new Date();
            if (now < nextAllowedTime) {
                const remainingSeconds = Math.ceil((nextAllowedTime - now) / 1000);
                throw new Error(`Vui lòng đợi ${remainingSeconds} giây trước khi gửi lại OTP`);
            }
        }

        return await this.generateAndSendOTP(email, type);
    }

    async generateTokens(user) {
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role
        };

        const accessToken = jwtService.generateAccessToken(payload);
        const refreshToken = jwtService.generateRefreshToken(payload);

        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        await RefreshToken.create({
            userId: user.id,
            token: refreshToken,
            expiresAt
        });

        return { accessToken, refreshToken };
    }

    async refreshAccessToken(refreshToken) {
        const decoded = jwtService.verifyRefreshToken(refreshToken);

        const tokenRecord = await RefreshToken.findOne({
            where: {
                token: refreshToken,
                userId: decoded.userId,
                expiresAt: { [Op.gt]: new Date() }
            }
        });

        if (!tokenRecord) {
            throw new Error('Refresh token không hợp lệ');
        }

        const user = await User.findByPk(decoded.userId);
        const newAccessToken = jwtService.generateAccessToken({
            userId: user.id,
            email: user.email,
            role: user.role
        });

        return { accessToken: newAccessToken };
    }

    async logout(refreshToken) {
        if (refreshToken) {
            await RefreshToken.destroy({ where: { token: refreshToken } });
        }
        return { message: 'Đăng xuất thành công!' };
    }
}

module.exports = new AuthService();