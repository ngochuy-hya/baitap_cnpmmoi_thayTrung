const Product = require('../models/product');
const Category = require('../models/category');

class ProductService {
    // Lấy danh sách sản phẩm với phân trang và lọc
    static async getProducts(options = {}) {
        try {
            const result = await Product.getProducts(options);
            
            return {
                products: result.products,
                pagination: result.pagination,
                filters: {
                    category_id: options.category_id || null,
                    category_slug: options.category_slug || null,
                    search: options.search || null,
                    min_price: options.min_price || null,
                    max_price: options.max_price || null,
                    is_featured: options.is_featured || null,
                    sort_by: options.sort_by || 'created_at',
                    sort_order: options.sort_order || 'DESC'
                }
            };
        } catch (error) {
            throw error;
        }
    }

    // Lấy sản phẩm theo danh mục (với lazy loading)
    static async getProductsByCategory(categorySlug, options = {}) {
        try {
            // Kiểm tra category có tồn tại không
            const category = await Category.findBySlug(categorySlug);
            
            if (!category) {
                throw new Error('Category not found');
            }

            const result = await Product.getProductsByCategory(categorySlug, options);
            
            return {
                category: category,
                products: result.products,
                pagination: result.pagination
            };
        } catch (error) {
            throw error;
        }
    }

    // Lấy chi tiết sản phẩm
    static async getProductDetail(identifier) {
        try {
            let product;
            
            // Kiểm tra identifier là ID hay slug
            if (/^\d+$/.test(identifier)) {
                product = await Product.findById(parseInt(identifier));
            } else {
                product = await Product.findBySlug(identifier);
            }
            
            if (!product) {
                throw new Error('Product not found');
            }

            // Lấy sản phẩm liên quan
            const relatedProducts = await Product.getRelatedProducts(product.id, product.category_id, 4);

            return {
                product: product,
                related_products: relatedProducts
            };
        } catch (error) {
            throw error;
        }
    }

    // Lấy sản phẩm nổi bật
    static async getFeaturedProducts(limit = 8) {
        try {
            const products = await Product.getFeaturedProducts(limit);
            
            return {
                products: products
            };
        } catch (error) {
            throw error;
        }
    }

    // Lấy sản phẩm mới nhất
    static async getLatestProducts(limit = 8) {
        try {
            const products = await Product.getLatestProducts(limit);
            
            return {
                products: products
            };
        } catch (error) {
            throw error;
        }
    }

    // Tìm kiếm sản phẩm
    static async searchProducts(query, options = {}) {
        try {
            if (!query || query.trim().length < 2) {
                throw new Error('Search query must be at least 2 characters');
            }

            const result = await Product.search(query.trim(), options);
            
            return {
                query: query,
                products: result.products,
                pagination: result.pagination
            };
        } catch (error) {
            throw error;
        }
    }

    // Tạo sản phẩm mới (admin/staff only)
    static async createProduct(productData) {
        try {
            // Kiểm tra category có tồn tại không
            const category = await Category.findById(productData.category_id);
            
            if (!category) {
                throw new Error('Category not found');
            }

            // Tạo slug từ tên
            if (!productData.slug) {
                productData.slug = Product.createSlug(productData.name);
            }

            // Kiểm tra slug đã tồn tại chưa
            const existingProduct = await Product.findBySlug(productData.slug);
            if (existingProduct) {
                productData.slug = `${productData.slug}-${Date.now()}`;
            }

            // Kiểm tra SKU đã tồn tại chưa
            if (productData.sku) {
                const existingSku = await Product.findBySku(productData.sku);
                if (existingSku) {
                    throw new Error('SKU already exists');
                }
            }

            // Xử lý gallery (nếu có)
            if (productData.gallery && Array.isArray(productData.gallery)) {
                productData.gallery = JSON.stringify(productData.gallery);
            }

            const product = await Product.create(productData);
            
            if (!product) {
                throw new Error('Failed to create product');
            }

            return {
                product: product,
                message: 'Product created successfully'
            };
        } catch (error) {
            throw error;
        }
    }

    // Cập nhật sản phẩm (admin/staff only)
    static async updateProduct(productId, updateData) {
        try {
            const product = await Product.findById(productId);
            
            if (!product) {
                throw new Error('Product not found');
            }

            // Kiểm tra category nếu có cập nhật
            if (updateData.category_id) {
                const category = await Category.findById(updateData.category_id);
                if (!category) {
                    throw new Error('Category not found');
                }
            }

            // Cập nhật slug nếu có thay đổi tên
            if (updateData.name && updateData.name !== product.name) {
                updateData.slug = Product.createSlug(updateData.name);
                
                // Kiểm tra slug mới có trùng không
                const existingProduct = await Product.findBySlug(updateData.slug);
                if (existingProduct && existingProduct.id !== productId) {
                    updateData.slug = `${updateData.slug}-${Date.now()}`;
                }
            }

            // Kiểm tra SKU nếu có cập nhật
            if (updateData.sku && updateData.sku !== product.sku) {
                const existingSku = await Product.findBySku(updateData.sku);
                if (existingSku && existingSku.id !== productId) {
                    throw new Error('SKU already exists');
                }
            }

            // Xử lý gallery
            if (updateData.gallery && Array.isArray(updateData.gallery)) {
                updateData.gallery = JSON.stringify(updateData.gallery);
            }

            const success = await product.update(updateData);
            
            if (!success) {
                throw new Error('Failed to update product');
            }

            return {
                product: product,
                message: 'Product updated successfully'
            };
        } catch (error) {
            throw error;
        }
    }

    // Xóa sản phẩm (admin/staff only)
    static async deleteProduct(productId) {
        try {
            const product = await Product.findById(productId);
            
            if (!product) {
                throw new Error('Product not found');
            }

            const success = await product.delete();
            
            if (!success) {
                throw new Error('Failed to delete product');
            }

            return {
                message: 'Product deleted successfully'
            };
        } catch (error) {
            throw error;
        }
    }

    // Cập nhật tồn kho
    static async updateStock(productId, quantity, operation = 'set') {
        try {
            const product = await Product.findById(productId);
            
            if (!product) {
                throw new Error('Product not found');
            }

            let newQuantity;
            
            switch (operation) {
                case 'add':
                    newQuantity = product.stock_quantity + quantity;
                    break;
                case 'subtract':
                    newQuantity = product.stock_quantity - quantity;
                    break;
                case 'set':
                default:
                    newQuantity = quantity;
                    break;
            }

            if (newQuantity < 0) {
                throw new Error('Stock quantity cannot be negative');
            }

            const success = await product.update({ stock_quantity: newQuantity });
            
            if (!success) {
                throw new Error('Failed to update stock');
            }

            return {
                product: product,
                message: 'Stock updated successfully'
            };
        } catch (error) {
            throw error;
        }
    }

    // Lấy thống kê sản phẩm (admin only)
    static async getProductStats() {
        try {
            const db = require('../config/database');
            
            const stats = await db.query(`
                SELECT 
                    COUNT(*) as total_products,
                    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_products,
                    COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_products,
                    COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_products,
                    COUNT(CASE WHEN is_featured = 1 THEN 1 END) as featured_products,
                    COUNT(CASE WHEN stock_quantity = 0 THEN 1 END) as out_of_stock,
                    COUNT(CASE WHEN stock_quantity <= 10 THEN 1 END) as low_stock,
                    AVG(price) as average_price,
                    MIN(price) as min_price,
                    MAX(price) as max_price
                FROM products
            `);

            const categoryStats = await db.query(`
                SELECT c.name, COUNT(p.id) as product_count
                FROM categories c
                LEFT JOIN products p ON c.id = p.category_id AND p.status = 'active'
                WHERE c.is_active = 1
                GROUP BY c.id, c.name
                ORDER BY product_count DESC
            `);

            const recentProducts = await db.query(`
                SELECT id, name, price, stock_quantity, created_at
                FROM products
                WHERE status = 'active'
                ORDER BY created_at DESC
                LIMIT 10
            `);

            return {
                stats: stats[0],
                category_distribution: categoryStats,
                recent_products: recentProducts
            };
        } catch (error) {
            throw error;
        }
    }

    // Lấy sản phẩm hết hàng hoặc sắp hết hàng
    static async getLowStockProducts(threshold = 10, options = {}) {
        try {
            const {
                page = 1,
                limit = 20
            } = options;

            const result = await Product.getProducts({
                page,
                limit,
                sort_by: 'stock_quantity',
                sort_order: 'ASC'
            });

            // Lọc sản phẩm có số lượng <= threshold
            const lowStockProducts = result.products.filter(product => 
                product.stock_quantity <= threshold
            );

            return {
                products: lowStockProducts,
                threshold: threshold,
                count: lowStockProducts.length
            };
        } catch (error) {
            throw error;
        }
    }

    // Bulk update cho nhiều sản phẩm
    static async bulkUpdateProducts(productIds, updateData) {
        try {
            const db = require('../config/database');
            
            // Validate product IDs
            if (!Array.isArray(productIds) || productIds.length === 0) {
                throw new Error('Product IDs must be a non-empty array');
            }

            const placeholders = productIds.map(() => '?').join(',');
            
            // Kiểm tra tất cả products có tồn tại không
            const existingProducts = await db.query(
                `SELECT id FROM products WHERE id IN (${placeholders})`,
                productIds
            );

            if (existingProducts.length !== productIds.length) {
                throw new Error('Some products not found');
            }

            // Xây dựng update query
            const updateFields = [];
            const updateValues = [];
            
            Object.keys(updateData).forEach(key => {
                updateFields.push(`${key} = ?`);
                updateValues.push(updateData[key]);
            });

            if (updateFields.length === 0) {
                throw new Error('No fields to update');
            }

            const sql = `
                UPDATE products 
                SET ${updateFields.join(', ')}, updated_at = NOW()
                WHERE id IN (${placeholders})
            `;

            const result = await db.query(sql, [...updateValues, ...productIds]);

            return {
                updated_count: result.affectedRows,
                message: `${result.affectedRows} products updated successfully`
            };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = ProductService;
