const ProductService = require('../services/productService');
const Category = require('../models/category');

class HomeController {
    // Trang chủ
    static async index(req, res) {
        try {
            res.render('index', {
                title: 'Welcome to Ecommerce API',
                message: 'API is running successfully'
            });
        } catch (error) {
            console.error('Home index error:', error);
            
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // API endpoint cho trang chủ - lấy dữ liệu tổng hợp
    static async getHomeData(req, res) {
        try {
            // Lấy dữ liệu song song để tối ưu hiệu suất
            const [
                featuredProducts,
                latestProducts,
                rootCategories
            ] = await Promise.all([
                ProductService.getFeaturedProducts(8),
                ProductService.getLatestProducts(8),
                Category.getRootCategories()
            ]);

            res.status(200).json({
                success: true,
                data: {
                    featured_products: featuredProducts.products,
                    latest_products: latestProducts.products,
                    categories: rootCategories,
                    banners: [], // TODO: Implement banner system if needed
                    stats: {
                        total_products: await this.getTotalProductsCount(),
                        total_categories: rootCategories.length
                    }
                }
            });
        } catch (error) {
            console.error('Get home data error:', error);
            
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get home data'
            });
        }
    }

    // Lấy sản phẩm cho section cụ thể
    static async getSectionProducts(req, res) {
        try {
            const { section } = req.params;
            const limit = parseInt(req.query.limit) || 8;
            
            let result;
            
            switch (section) {
                case 'featured':
                    result = await ProductService.getFeaturedProducts(limit);
                    break;
                    
                case 'latest':
                    result = await ProductService.getLatestProducts(limit);
                    break;
                    
                case 'bestseller':
                    // TODO: Implement bestseller logic based on order statistics
                    result = await ProductService.getProducts({
                        limit,
                        sort_by: 'created_at',
                        sort_order: 'DESC'
                    });
                    result = { products: result.products };
                    break;
                    
                case 'sale':
                    // Lấy sản phẩm đang sale (có sale_price)
                    const db = require('../config/database');
                    const saleProducts = await db.query(`
                        SELECT p.*, c.name as category_name, c.slug as category_slug,
                        COALESCE(AVG(r.rating), 0) as average_rating,
                        COUNT(r.id) as review_count
                        FROM products p
                        LEFT JOIN categories c ON p.category_id = c.id
                        LEFT JOIN reviews r ON p.id = r.product_id AND r.is_approved = 1
                        WHERE p.status = 'active' AND p.sale_price IS NOT NULL AND p.sale_price < p.price
                        GROUP BY p.id
                        ORDER BY p.created_at DESC
                        LIMIT ?
                    `, [limit]);
                    
                    const Product = require('../models/product');
                    result = { 
                        products: saleProducts.map(product => new Product(product))
                    };
                    break;
                    
                default:
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid section. Valid sections: featured, latest, bestseller, sale'
                    });
            }
            
            res.status(200).json({
                success: true,
                data: {
                    section,
                    ...result
                }
            });
        } catch (error) {
            console.error('Get section products error:', error);
            
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get section products'
            });
        }
    }

    // Lấy categories cho menu
    static async getMenuCategories(req, res) {
        try {
            const categories = await Category.getAll({
                include_product_count: true
            });
            
            // Xây dựng menu hierachical
            const categoryMap = new Map();
            const menuCategories = [];
            
            // Tạo map với tất cả categories
            categories.forEach(category => {
                categoryMap.set(category.id, {
                    id: category.id,
                    name: category.name,
                    slug: category.slug,
                    product_count: category.product_count,
                    children: []
                });
            });
            
            // Xây dựng cây menu
            categories.forEach(category => {
                if (category.parent_id) {
                    const parent = categoryMap.get(category.parent_id);
                    if (parent) {
                        parent.children.push(categoryMap.get(category.id));
                    }
                } else {
                    menuCategories.push(categoryMap.get(category.id));
                }
            });
            
            res.status(200).json({
                success: true,
                data: {
                    categories: menuCategories
                }
            });
        } catch (error) {
            console.error('Get menu categories error:', error);
            
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get menu categories'
            });
        }
    }

    // Tìm kiếm nhanh (suggestion)
    static async quickSearch(req, res) {
        try {
            const { q: query } = req.query;
            
            if (!query || query.trim().length < 2) {
                return res.status(400).json({
                    success: false,
                    message: 'Query must be at least 2 characters'
                });
            }

            const limit = parseInt(req.query.limit) || 5;
            
            // Tìm kiếm sản phẩm và categories
            const [productResult, categories] = await Promise.all([
                ProductService.searchProducts(query.trim(), { 
                    limit, 
                    page: 1 
                }),
                this.searchCategoriesQuick(query.trim(), limit)
            ]);
            
            res.status(200).json({
                success: true,
                data: {
                    query: query,
                    products: productResult.products,
                    categories: categories,
                    suggestions: this.generateSearchSuggestions(query.trim())
                }
            });
        } catch (error) {
            console.error('Quick search error:', error);
            
            res.status(500).json({
                success: false,
                message: error.message || 'Search failed'
            });
        }
    }

    // Health check endpoint
    static async healthCheck(req, res) {
        try {
            const db = require('../config/database');
            
            // Test database connection
            await db.query('SELECT 1');
            
            res.status(200).json({
                success: true,
                status: 'healthy',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                environment: process.env.NODE_ENV || 'development',
                version: require('../../package.json').version
            });
        } catch (error) {
            console.error('Health check error:', error);
            
            res.status(503).json({
                success: false,
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                error: error.message
            });
        }
    }

    // API info endpoint
    static async apiInfo(req, res) {
        try {
            const packageJson = require('../../package.json');
            
            res.status(200).json({
                success: true,
                data: {
                    name: packageJson.name || 'Ecommerce API',
                    version: packageJson.version || '1.0.0',
                    description: packageJson.description || 'Ecommerce API Backend',
                    environment: process.env.NODE_ENV || 'development',
                    node_version: process.version,
                    uptime: process.uptime(),
                    endpoints: {
                        auth: '/api/auth',
                        users: '/api/users',
                        products: '/api/products',
                        categories: '/api/categories',
                        home: '/api/home'
                    },
                    documentation: '/api/docs' // TODO: Add API documentation
                }
            });
        } catch (error) {
            console.error('API info error:', error);
            
            res.status(500).json({
                success: false,
                message: 'Failed to get API information'
            });
        }
    }

    // Helper methods
    static async getTotalProductsCount() {
        try {
            const db = require('../config/database');
            const result = await db.count('products', { status: 'active' });
            return result;
        } catch (error) {
            console.error('Get total products count error:', error);
            return 0;
        }
    }

    static async searchCategoriesQuick(query, limit = 5) {
        try {
            const db = require('../config/database');
            const categories = await db.query(`
                SELECT id, name, slug, 
                (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.status = 'active') as product_count
                FROM categories c
                WHERE c.name LIKE ? AND c.is_active = 1
                ORDER BY product_count DESC, c.name ASC
                LIMIT ?
            `, [`%${query}%`, limit]);
            
            return categories;
        } catch (error) {
            console.error('Search categories quick error:', error);
            return [];
        }
    }

    static generateSearchSuggestions(query) {
        // TODO: Implement intelligent search suggestions
        // Có thể dựa trên:
        // - Từ khóa phổ biến
        // - Lịch sử tìm kiếm
        // - Sản phẩm trending
        
        const suggestions = [
            `${query} giá rẻ`,
            `${query} chính hãng`,
            `${query} mới nhất`
        ];
        
        return suggestions.slice(0, 3);
    }
}

module.exports = HomeController;
