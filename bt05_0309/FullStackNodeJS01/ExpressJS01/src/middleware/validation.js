const Joi = require('joi');

// Middleware để validate request data
const validate = (schema, property = 'body') => {
    return (req, res, next) => {
        const { error } = schema.validate(req[property], {
            abortEarly: false,
            allowUnknown: false,
            stripUnknown: true
        });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message,
                value: detail.context.value
            }));

            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors
            });
        }

        next();
    };
};

// Validation schemas for User
const userSchemas = {
    register: Joi.object({
        email: Joi.string().email().required().messages({
            'string.email': 'Email must be a valid email address',
            'any.required': 'Email is required'
        }),
        password: Joi.string().min(6).required().messages({
            'string.min': 'Password must be at least 6 characters',
            'any.required': 'Password is required'
        }),
        full_name: Joi.string().min(2).max(255).required().messages({
            'string.min': 'Full name must be at least 2 characters',
            'string.max': 'Full name must be less than 255 characters',
            'any.required': 'Full name is required'
        }),
        phone: Joi.string().pattern(/^[0-9+\-\s()]+$/).min(10).max(20).optional().messages({
            'string.pattern.base': 'Phone number format is invalid'
        }),
        address: Joi.string().max(500).optional()
    }),

    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    }),

    forgotPassword: Joi.object({
        email: Joi.string().email().required()
    }),

    resetPassword: Joi.object({
        token: Joi.string().required(),
        password: Joi.string().min(6).required()
    }),

    updateProfile: Joi.object({
        full_name: Joi.string().min(2).max(255).optional(),
        phone: Joi.string().pattern(/^[0-9+\-\s()]+$/).min(10).max(20).optional().allow(''),
        address: Joi.string().max(500).optional().allow('')
    }),

    changePassword: Joi.object({
        current_password: Joi.string().required(),
        new_password: Joi.string().min(6).required(),
        confirm_password: Joi.string().valid(Joi.ref('new_password')).required().messages({
            'any.only': 'Confirm password must match new password'
        })
    })
};

// Validation schemas for Product
const productSchemas = {
    create: Joi.object({
        name: Joi.string().min(2).max(255).required(),
        description: Joi.string().optional(),
        short_description: Joi.string().max(500).optional(),
        price: Joi.number().positive().required(),
        sale_price: Joi.number().positive().optional(),
        sku: Joi.string().max(100).optional(),
        stock_quantity: Joi.number().integer().min(0).default(0),
        category_id: Joi.number().integer().positive().required(),
        featured_image: Joi.string().uri().optional(),
        gallery: Joi.array().items(Joi.string().uri()).optional(),
        status: Joi.string().valid('active', 'inactive', 'draft').default('active'),
        is_featured: Joi.boolean().default(false),
        meta_title: Joi.string().max(255).optional(),
        meta_description: Joi.string().max(500).optional()
    }),

    update: Joi.object({
        name: Joi.string().min(2).max(255).optional(),
        description: Joi.string().optional(),
        short_description: Joi.string().max(500).optional(),
        price: Joi.number().positive().optional(),
        sale_price: Joi.number().positive().optional(),
        sku: Joi.string().max(100).optional(),
        stock_quantity: Joi.number().integer().min(0).optional(),
        category_id: Joi.number().integer().positive().optional(),
        featured_image: Joi.string().uri().optional(),
        gallery: Joi.array().items(Joi.string().uri()).optional(),
        status: Joi.string().valid('active', 'inactive', 'draft').optional(),
        is_featured: Joi.boolean().optional(),
        meta_title: Joi.string().max(255).optional(),
        meta_description: Joi.string().max(500).optional()
    })
};

// Validation schemas for Category
const categorySchemas = {
    create: Joi.object({
        name: Joi.string().min(2).max(255).required(),
        description: Joi.string().optional(),
        image: Joi.string().uri().optional(),
        parent_id: Joi.number().integer().positive().optional(),
        sort_order: Joi.number().integer().min(0).default(0),
        is_active: Joi.boolean().default(true)
    }),

    update: Joi.object({
        name: Joi.string().min(2).max(255).optional(),
        description: Joi.string().optional(),
        image: Joi.string().uri().optional(),
        parent_id: Joi.number().integer().positive().optional(),
        sort_order: Joi.number().integer().min(0).optional(),
        is_active: Joi.boolean().optional()
    })
};

// Validation for query parameters
const querySchemas = {
    pagination: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(12),
        search: Joi.string().max(255).optional(),
        sort_by: Joi.string().optional(),
        sort_order: Joi.string().valid('ASC', 'DESC', 'asc', 'desc').optional()
    }),

    productFilter: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(12),
        search: Joi.string().max(255).optional(),
        category_id: Joi.number().integer().positive().optional(),
        category_slug: Joi.string().optional(),
        status: Joi.string().valid('active', 'inactive', 'draft').optional(),
        is_featured: Joi.boolean().optional(),
        sort_by: Joi.string().valid('created_at', 'name', 'price', 'average_rating', 'stock_quantity').optional(),
        sort_order: Joi.string().valid('ASC', 'DESC', 'asc', 'desc').optional(),
        min_price: Joi.number().min(0).optional(),
        max_price: Joi.number().min(0).optional()
    })
};

// Validation schemas for Review
const reviewSchemas = {
    create: Joi.object({
        product_id: Joi.number().integer().positive().required(),
        rating: Joi.number().integer().min(1).max(5).required(),
        title: Joi.string().max(255).optional(),
        comment: Joi.string().max(1000).optional()
    }),

    update: Joi.object({
        rating: Joi.number().integer().min(1).max(5).optional(),
        title: Joi.string().max(255).optional(),
        comment: Joi.string().max(1000).optional()
    })
};

// Custom validation cho upload file
const fileValidation = {
    image: (req, res, next) => {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        
        if (!allowedTypes.includes(req.file.mimetype)) {
            return res.status(400).json({
                success: false,
                message: 'Only image files are allowed (JPEG, PNG, GIF, WebP)'
            });
        }

        const maxSize = 5 * 1024 * 1024; // 5MB
        
        if (req.file.size > maxSize) {
            return res.status(400).json({
                success: false,
                message: 'File size must be less than 5MB'
            });
        }

        next();
    },

    multipleImages: (req, res, next) => {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No files uploaded'
            });
        }

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB
        const maxFiles = 10;

        if (req.files.length > maxFiles) {
            return res.status(400).json({
                success: false,
                message: `Maximum ${maxFiles} files allowed`
            });
        }

        for (const file of req.files) {
            if (!allowedTypes.includes(file.mimetype)) {
                return res.status(400).json({
                    success: false,
                    message: 'Only image files are allowed (JPEG, PNG, GIF, WebP)'
                });
            }

            if (file.size > maxSize) {
                return res.status(400).json({
                    success: false,
                    message: 'Each file size must be less than 5MB'
                });
            }
        }

        next();
    }
};

module.exports = {
    validate,
    userSchemas,
    productSchemas,
    categorySchemas,
    querySchemas,
    reviewSchemas,
    fileValidation
};
