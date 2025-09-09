require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import configurations
const configViewEngine = require('./config/viewEngine');
const { testConnection } = require('./config/database');
const { initializeElasticsearch } = require('./config/elasticsearch');

// Import routes
const apiRoutes = require('./routes/api');
const HomeController = require('./controllers/homeController');

// Create Express app
const app = express();
const PORT = process.env.PORT || 8080;

// ===========================================
// MIDDLEWARE CONFIGURATION
// ===========================================

// CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, etc.)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            process.env.FRONTEND_URL || 'http://localhost:3000',
            'http://localhost:3001',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:3001'
        ];
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
});

// Request logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url} - ${req.ip}`);
    next();
});

// Configure view engine and static files
configViewEngine(app);

// ===========================================
// ROUTES CONFIGURATION
// ===========================================

// Root route
app.get('/', HomeController.index);

// API routes
app.use('/api', apiRoutes);

// ===========================================
// ERROR HANDLING
// ===========================================

// Handle 404 for non-API routes
app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
        return next();
    }
    
    res.status(404).render('404', {
        title: '404 - Page Not Found',
        message: 'The page you are looking for does not exist.'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global Error Handler:', err);
    
    // CORS error
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({
            success: false,
            message: 'CORS policy violation'
        });
    }
    
    // For API routes
    if (req.path.startsWith('/api')) {
        return res.status(err.status || 500).json({
            success: false,
            message: err.message || 'Internal server error',
            ...(process.env.NODE_ENV === 'development' && { 
                stack: err.stack 
            })
        });
    }
    
    // For web routes
    res.status(err.status || 500).render('error', {
        title: 'Error',
        message: err.message || 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// ===========================================
// SERVER STARTUP
// ===========================================

async function startServer() {
    try {
        // Test database connection
        console.log('🔄 Testing database connection...');
        await testConnection();
        
        // Initialize Elasticsearch
        console.log('🔄 Initializing Elasticsearch...');
        const esInitialized = await initializeElasticsearch();
        if (!esInitialized) {
            console.log('⚠️ Continuing without Elasticsearch - basic search will still work');
        }
        
        // Start server
        app.listen(PORT, () => {
            console.log('');
            console.log('🚀 Server is running!');
            console.log('');
            console.log(`📍 Local:            http://localhost:${PORT}`);
            console.log(`📍 Network:          http://0.0.0.0:${PORT}`);
            console.log(`🔗 API Endpoint:     http://localhost:${PORT}/api`);
            console.log(`📊 Health Check:     http://localhost:${PORT}/api/health`);
            console.log(`📖 API Info:         http://localhost:${PORT}/api/info`);
            console.log('');
            console.log(`🌍 Environment:      ${process.env.NODE_ENV || 'development'}`);
            console.log(`📦 Node Version:     ${process.version}`);
            console.log(`⏰ Started at:       ${new Date().toISOString()}`);
            console.log('');
            console.log('📚 Available API endpoints:');
            console.log('   GET  /api/home                    - Home page data');
            console.log('   POST /api/auth/register           - User registration');
            console.log('   POST /api/auth/login              - User login');
            console.log('   GET  /api/users/profile           - Get user profile (auth required)');
            console.log('   GET  /api/products                - Get products with pagination');
            console.log('   GET  /api/products/search         - Search products (fuzzy search)');
            console.log('   GET  /api/products/advanced-search - Advanced search with filters');
            console.log('   GET  /api/products/filter         - Filter products by criteria');
            console.log('   GET  /api/products/suggestions    - Get search suggestions');
            console.log('   GET  /api/products/popular        - Get popular products');
            console.log('   GET  /api/products/trending       - Get trending products');
            console.log('   GET  /api/products/category/:slug - Get products by category');
            console.log('   GET  /api/categories              - Get all categories');
            console.log('   GET  /api/health                  - Health check');
            console.log('');
            console.log('🔐 Admin endpoints (authentication required):');
            console.log('   GET  /api/users                   - Manage users');
            console.log('   POST /api/admin/products          - Create products');
            console.log('   POST /api/admin/categories        - Create categories');
            console.log('');
            console.log('✨ Ready to accept connections!');
            console.log('');
        });
        
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM received, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('👋 SIGINT received, shutting down gracefully...');
    process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('💥 Uncaught Exception:', err);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Promise Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Start the server
startServer();

module.exports = app;
