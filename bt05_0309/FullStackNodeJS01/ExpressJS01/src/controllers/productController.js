const ProductService = require('../services/productService');

class ProductController {
    // Lấy danh sách sản phẩm với phân trang và lọc
    static async getProducts(req, res) {
        try {
            const options = {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 12,
                search: req.query.search || '',
                category_id: req.query.category_id ? parseInt(req.query.category_id) : null,
                category_slug: req.query.category_slug || null,
                status: req.query.status || 'active',
                is_featured: req.query.is_featured ? req.query.is_featured === 'true' : null,
                sort_by: req.query.sort_by || 'created_at',
                sort_order: req.query.sort_order || 'DESC',
                min_price: req.query.min_price ? parseFloat(req.query.min_price) : null,
                max_price: req.query.max_price ? parseFloat(req.query.max_price) : null
            };

            const result = await ProductService.getProducts(options);
            
            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error('Get products error:', error);
            
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get products'
            });
        }
    }

    // Lấy sản phẩm theo danh mục (cho lazy loading)
    static async getProductsByCategory(req, res) {
        try {
            const { categorySlug } = req.params;
            const options = {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 12,
                sort_by: req.query.sort_by || 'created_at',
                sort_order: req.query.sort_order || 'DESC',
                min_price: req.query.min_price ? parseFloat(req.query.min_price) : null,
                max_price: req.query.max_price ? parseFloat(req.query.max_price) : null
            };

            const result = await ProductService.getProductsByCategory(categorySlug, options);
            
            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error('Get products by category error:', error);
            
            if (error.message === 'Category not found') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get products by category'
            });
        }
    }

    // Lấy chi tiết sản phẩm
    static async getProductDetail(req, res) {
        try {
            const { identifier } = req.params; // có thể là ID hoặc slug
            const result = await ProductService.getProductDetail(identifier);
            
            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error('Get product detail error:', error);
            
            if (error.message === 'Product not found') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get product detail'
            });
        }
    }

    // Lấy sản phẩm nổi bật
    static async getFeaturedProducts(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 8;
            const result = await ProductService.getFeaturedProducts(limit);
            
            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error('Get featured products error:', error);
            
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get featured products'
            });
        }
    }

    // Lấy sản phẩm mới nhất
    static async getLatestProducts(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 8;
            const result = await ProductService.getLatestProducts(limit);
            
            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error('Get latest products error:', error);
            
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get latest products'
            });
        }
    }

    // Tìm kiếm sản phẩm
    static async searchProducts(req, res) {
        try {
            const { q: query } = req.query;
            
            if (!query) {
                return res.status(400).json({
                    success: false,
                    message: 'Search query is required'
                });
            }

            const options = {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 12,
                category_id: req.query.category_id ? parseInt(req.query.category_id) : null,
                sort_by: req.query.sort_by || 'created_at',
                sort_order: req.query.sort_order || 'DESC',
                min_price: req.query.min_price ? parseFloat(req.query.min_price) : null,
                max_price: req.query.max_price ? parseFloat(req.query.max_price) : null
            };

            const result = await ProductService.searchProducts(query, options);
            
            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error('Search products error:', error);
            
            res.status(400).json({
                success: false,
                message: error.message || 'Search failed'
            });
        }
    }

    // Tạo sản phẩm mới (admin/staff only)
    static async createProduct(req, res) {
        try {
            const result = await ProductService.createProduct(req.body);
            
            res.status(201).json({
                success: true,
                data: result,
                message: result.message
            });
        } catch (error) {
            console.error('Create product error:', error);
            
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to create product'
            });
        }
    }

    // Cập nhật sản phẩm (admin/staff only)
    static async updateProduct(req, res) {
        try {
            const { id } = req.params;
            const result = await ProductService.updateProduct(id, req.body);
            
            res.status(200).json({
                success: true,
                data: result,
                message: result.message
            });
        } catch (error) {
            console.error('Update product error:', error);
            
            if (error.message === 'Product not found') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to update product'
            });
        }
    }

    // Xóa sản phẩm (admin/staff only)
    static async deleteProduct(req, res) {
        try {
            const { id } = req.params;
            const result = await ProductService.deleteProduct(id);
            
            res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (error) {
            console.error('Delete product error:', error);
            
            if (error.message === 'Product not found') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to delete product'
            });
        }
    }

    // Cập nhật tồn kho (admin/staff only)
    static async updateStock(req, res) {
        try {
            const { id } = req.params;
            const { quantity, operation = 'set' } = req.body;

            if (quantity === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'Quantity is required'
                });
            }

            const result = await ProductService.updateStock(id, quantity, operation);
            
            res.status(200).json({
                success: true,
                data: result,
                message: result.message
            });
        } catch (error) {
            console.error('Update stock error:', error);
            
            if (error.message === 'Product not found') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to update stock'
            });
        }
    }

    // Lấy thống kê sản phẩm (admin only)
    static async getProductStats(req, res) {
        try {
            const result = await ProductService.getProductStats();
            
            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error('Get product stats error:', error);
            
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get product statistics'
            });
        }
    }

    // Lấy sản phẩm hết hàng hoặc sắp hết hàng (admin/staff only)
    static async getLowStockProducts(req, res) {
        try {
            const threshold = parseInt(req.query.threshold) || 10;
            const options = {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 20
            };

            const result = await ProductService.getLowStockProducts(threshold, options);
            
            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error('Get low stock products error:', error);
            
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get low stock products'
            });
        }
    }

    // Bulk update cho nhiều sản phẩm (admin/staff only)
    static async bulkUpdateProducts(req, res) {
        try {
            const { product_ids, update_data } = req.body;

            if (!product_ids || !Array.isArray(product_ids) || product_ids.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Product IDs array is required'
                });
            }

            if (!update_data || Object.keys(update_data).length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Update data is required'
                });
            }

            const result = await ProductService.bulkUpdateProducts(product_ids, update_data);
            
            res.status(200).json({
                success: true,
                data: result,
                message: result.message
            });
        } catch (error) {
            console.error('Bulk update products error:', error);
            
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to bulk update products'
            });
        }
    }

    // API endpoint đặc biệt cho lazy loading
    static async loadMoreProducts(req, res) {
        try {
            const { categorySlug } = req.params;
            const lastProductId = parseInt(req.query.lastId) || 0;
            const limit = parseInt(req.query.limit) || 12;

            // Sử dụng cursor-based pagination cho lazy loading
            const options = {
                page: 1,
                limit: limit,
                sort_by: 'id',
                sort_order: 'DESC'
            };

            // Nếu có lastProductId, thêm điều kiện để load sản phẩm có ID nhỏ hơn
            if (lastProductId > 0) {
                // TODO: Implement cursor-based pagination trong ProductService
                // Hiện tại dùng page-based pagination
                const page = Math.floor(lastProductId / limit) + 1;
                options.page = page;
            }

            const result = categorySlug 
                ? await ProductService.getProductsByCategory(categorySlug, options)
                : await ProductService.getProducts(options);
            
            res.status(200).json({
                success: true,
                data: {
                    products: result.products,
                    hasMore: result.pagination.has_next,
                    nextCursor: result.products.length > 0 
                        ? result.products[result.products.length - 1].id 
                        : null
                }
            });
        } catch (error) {
            console.error('Load more products error:', error);
            
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to load more products'
            });
        }
    }
}

module.exports = ProductController;
