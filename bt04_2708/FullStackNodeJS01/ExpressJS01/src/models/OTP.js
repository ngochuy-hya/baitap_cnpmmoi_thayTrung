const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const OTP = sequelize.define('OTP', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    otpCode: {
        type: DataTypes.STRING(6),
        allowNull: false
    },
    otpType: {
        type: DataTypes.ENUM('email_verification', 'forgot_password'),
        allowNull: false
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    isUsed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'otps',
    timestamps: true
});

OTP.generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports = OTP;