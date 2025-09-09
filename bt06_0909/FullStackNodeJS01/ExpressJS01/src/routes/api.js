const express = require('express');
const router = express.Router();

// Import controllers
const UserController = require('../controllers/userController');
const ProductController = require('../controllers/productController');
const CategoryController = require('../controllers/categoryController');
const HomeController = require('../controllers/homeController');

// Import middleware
const { 
    authenticateToken, 
    authenticateOptional,
    requireAdmin, 
    requireStaff,
    requireOwnerOrAdmin,
    requireEmailVerified
} = require('../middleware/auth');

const { 
    validate, 
    userSchemas, 
    productSchemas, 
    categorySchemas, 
    querySchemas 
} = require('../middleware/validation');

const delay = require('../middleware/delay');

// Apply delay middleware in development
if (process.env.NODE_ENV === 'development') {
    router.use(delay(500)); // 500ms delay for testing
}

// ===========================================
// HOME & PUBLIC ROUTES
// ===========================================

// Home data
router.get('/home', HomeController.getHomeData);
router.get('/home/sections/:section', HomeController.getSectionProducts);
router.get('/home/menu-categories', HomeController.getMenuCategories);
router.get('/home/search', validate(querySchemas.pagination, 'query'), HomeController.quickSearch);

// Health check
router.get('/health', HomeController.healthCheck);
router.get('/info', HomeController.apiInfo);

// ===========================================
// AUTHENTICATION ROUTES
// ===========================================

router.post('/auth/register', 
    validate(userSchemas.register), 
    UserController.register
);

router.post('/auth/login', 
    validate(userSchemas.login), 
    UserController.login
);

router.post('/auth/forgot-password', 
    validate(userSchemas.forgotPassword), 
    UserController.forgotPassword
);

router.post('/auth/reset-password', 
    validate(userSchemas.resetPassword), 
    UserController.resetPassword
);

router.get('/auth/verify-email/:token', 
    UserController.verifyEmail
);

router.post('/auth/resend-verification', 
    UserController.resendVerificationEmail
);

router.post('/auth/logout', 
    authenticateToken, 
    UserController.logout
);

router.post('/auth/refresh-token', 
    UserController.refreshToken
);

// ===========================================
// USER PROFILE ROUTES
// ===========================================

// User profile (protected)
router.get('/users/profile', 
    authenticateToken, 
    UserController.getProfile
);

router.put('/users/profile', 
    authenticateToken,
    validate(userSchemas.updateProfile),
    UserController.updateProfile
);

router.put('/users/change-password', 
    authenticateToken,
    validate(userSchemas.changePassword),
    UserController.changePassword
);

// ===========================================
// USER MANAGEMENT ROUTES (ADMIN)
// ===========================================

// Get all users (admin only)
router.get('/users', 
    authenticateToken,
    requireAdmin,
    validate(querySchemas.pagination, 'query'),
    UserController.getUsers
);

// Get user by ID (admin only)
router.get('/users/:id', 
    authenticateToken,
    requireAdmin,
    UserController.getUserById
);

// Update user (admin only)
router.put('/users/:id', 
    authenticateToken,
    requireAdmin,
    validate(userSchemas.updateProfile),
    UserController.updateUser
);

// Delete user (admin only)
router.delete('/users/:id', 
    authenticateToken,
    requireAdmin,
    UserController.deleteUser
);

// User statistics (admin only)
router.get('/users/stats/overview', 
    authenticateToken,
    requireAdmin,
    UserController.getUserStats
);

// ===========================================
// CATEGORY ROUTES
// ===========================================

// Public category routes
router.get('/categories', 
    validate(querySchemas.pagination, 'query'),
    CategoryController.getCategories
);

router.get('/categories/tree', 
    CategoryController.getCategoryTree
);

router.get('/categories/root', 
    CategoryController.getRootCategories
);

router.get('/categories/search', 
    validate(querySchemas.pagination, 'query'),
    CategoryController.searchCategories
);

router.get('/categories/:identifier', 
    CategoryController.getCategoryDetail
);

router.get('/categories/:parentId/children', 
    CategoryController.getChildCategories
);

// Admin category routes
router.get('/admin/categories', 
    authenticateToken,
    requireStaff,
    validate(querySchemas.pagination, 'query'),
    CategoryController.getCategoriesPaginated
);

router.post('/admin/categories', 
    authenticateToken,
    requireStaff,
    validate(categorySchemas.create),
    CategoryController.createCategory
);

router.put('/admin/categories/:id', 
    authenticateToken,
    requireStaff,
    validate(categorySchemas.update),
    CategoryController.updateCategory
);

router.delete('/admin/categories/:id', 
    authenticateToken,
    requireStaff,
    CategoryController.deleteCategory
);

router.put('/admin/categories/reorder', 
    authenticateToken,
    requireStaff,
    CategoryController.reorderCategories
);

// ===========================================
// PRODUCT ROUTES
// ===========================================

// Public product routes
router.get('/products', 
    authenticateOptional,
    validate(querySchemas.productFilter, 'query'),
    ProductController.getProducts
);

router.get('/products/featured', 
    ProductController.getFeaturedProducts
);

router.get('/products/latest', 
    ProductController.getLatestProducts
);

router.get('/products/search', 
    validate(querySchemas.productFilter, 'query'),
    ProductController.searchProducts
);

// Advanced search and filtering routes
router.get('/products/advanced-search',
    authenticateOptional,
    ProductController.advancedSearch
);

router.get('/products/filter',
    authenticateOptional,
    ProductController.filterProducts
);

router.get('/products/suggestions',
    ProductController.getSearchSuggestions
);

router.get('/products/popular-terms',
    ProductController.getPopularSearchTerms
);

router.get('/products/popular',
    ProductController.getPopularProducts
);

router.get('/products/trending',
    ProductController.getTrendingProducts
);

router.get('/products/category/:categorySlug', 
    authenticateOptional,
    validate(querySchemas.productFilter, 'query'),
    ProductController.getProductsByCategory
);

// Lazy loading endpoint for infinite scroll
router.get('/products/category/:categorySlug/load-more', 
    authenticateOptional,
    ProductController.loadMoreProducts
);

router.get('/products/load-more', 
    authenticateOptional,
    ProductController.loadMoreProducts
);

router.get('/products/:identifier', 
    authenticateOptional,
    ProductController.getProductDetailWithTracking
);

// Track product view endpoint
router.post('/products/:productId/track-view',
    authenticateOptional,
    ProductController.trackProductView
);

// Admin product routes
router.get('/admin/products', 
    authenticateToken,
    requireStaff,
    validate(querySchemas.productFilter, 'query'),
    ProductController.getProducts
);

router.post('/admin/products', 
    authenticateToken,
    requireStaff,
    validate(productSchemas.create),
    ProductController.createProduct
);

router.put('/admin/products/:id', 
    authenticateToken,
    requireStaff,
    validate(productSchemas.update),
    ProductController.updateProduct
);

router.delete('/admin/products/:id', 
    authenticateToken,
    requireStaff,
    ProductController.deleteProduct
);

router.put('/admin/products/:id/stock', 
    authenticateToken,
    requireStaff,
    ProductController.updateStock
);

router.get('/admin/products/stats/overview', 
    authenticateToken,
    requireAdmin,
    ProductController.getProductStats
);

router.get('/admin/products/low-stock', 
    authenticateToken,
    requireStaff,
    validate(querySchemas.pagination, 'query'),
    ProductController.getLowStockProducts
);

router.put('/admin/products/bulk-update', 
    authenticateToken,
    requireStaff,
    ProductController.bulkUpdateProducts
);

// Elasticsearch management routes (admin only)
router.post('/admin/products/sync-elasticsearch',
    authenticateToken,
    requireAdmin,
    ProductController.syncToElasticsearch
);

router.get('/admin/search/health',
    authenticateToken,
    requireAdmin,
    ProductController.getSearchHealth
);

// ===========================================
// UPLOAD ROUTES (TODO: Implement file upload)
// ===========================================

/*
const multer = require('multer');
const { fileValidation } = require('../middleware/validation');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, process.env.UPLOAD_PATH || './uploads')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 // 5MB
    }
});

// Single image upload
router.post('/upload/image', 
    authenticateToken,
    upload.single('image'),
    fileValidation.image,
    UploadController.uploadImage
);

// Multiple images upload
router.post('/upload/images', 
    authenticateToken,
    upload.array('images', 10),
    fileValidation.multipleImages,
    UploadController.uploadImages
);
*/

// ===========================================
// ERROR HANDLING
// ===========================================

// Handle 404 for API routes
router.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found',
        path: req.originalUrl,
        method: req.method
    });
});

// Global error handler for API routes
router.use((err, req, res, next) => {
    console.error('API Error:', err);
    
    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => ({
            field: e.path,
            message: e.message
        }));
        
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: errors
        });
    }
    
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
    
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expired'
        });
    }
    
    // Database errors
    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({
            success: false,
            message: 'Duplicate entry error'
        });
    }
    
    // Default error
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

module.exports = router;
