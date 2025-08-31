const Joi = require('joi');

const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                EM: error.details[0].message,
                EC: -1,
                DT: ''
            });
        }
        next();
    };
};

const schemas = {
    register: Joi.object({
        email: Joi.string().email().required().messages({
            'string.email': 'Email không hợp lệ',
            'any.required': 'Email là bắt buộc'
        }),
        password: Joi.string().min(6).required().messages({
            'string.min': 'Mật khẩu phải có ít nhất 6 ký tự',
            'any.required': 'Mật khẩu là bắt buộc'
        }),
        fullName: Joi.string().optional(),
        phone: Joi.string().optional()
    }),

    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    }),

    verifyOTP: Joi.object({
        email: Joi.string().email().required(),
        otpCode: Joi.string().length(6).required().messages({
            'string.length': 'Mã OTP phải có 6 số'
        })
    }),

    forgotPassword: Joi.object({
        email: Joi.string().email().required()
    }),

    resetPassword: Joi.object({
        resetToken: Joi.string().required(),
        newPassword: Joi.string().min(6).required()
    }),

    changePassword: Joi.object({
        currentPassword: Joi.string().required(),
        newPassword: Joi.string().min(6).required()
    })
};

module.exports = { validateRequest, schemas };