const nodemailer = require('nodemailer');
require('dotenv').config();

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            },
            tls: {
                rejectUnauthorized: false
            }
        });
    }

    async verifyConnection() {
        try {
            await this.transporter.verify();
            console.log('Email service is ready');
            return true;
        } catch (error) {
            console.error('Email service error:', error);
            return false;
        }
    }

    async sendOTPEmail(email, otpCode, type) {
        try {
            let subject, html;
            
            if (type === 'email_verification') {
                subject = 'Xác thực email đăng ký';
                html = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Xác thực email đăng ký</h2>
                    <p>Mã OTP của bạn là: <strong style="font-size: 24px; color: #4CAF50;">${otpCode}</strong></p>
                    <p>Mã có hiệu lực trong 10 phút.</p>
                </div>`;
            } else if (type === 'forgot_password') {
                subject = 'Mã OTP đặt lại mật khẩu';
                html = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Đặt lại mật khẩu</h2>
                    <p>Mã OTP của bạn là: <strong style="font-size: 24px; color: #FF6B35;">${otpCode}</strong></p>
                    <p>Mã có hiệu lực trong 10 phút.</p>
                </div>`;
            }

            await this.transporter.sendMail({
                from: `"FullStack App" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: subject,
                html: html
            });

            return { success: true };
        } catch (error) {
            console.error('Email error:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = new EmailService();