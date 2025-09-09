const db = require('../config/database');

class Product {
    constructor(productData) {
        this.id = productData.id;
        this.name = productData.name;
        this.slug = productData.slug;
        this.description = productData.description;
        this.short_description = productData.short_description;
        this.price = productData.price;
        this.sale_price = productData.sale_price;
        this.sku = productData.sku;
        this.stock_quantity = productData.stock_quantity;
        this.category_id = productData.category_id;
        this.featured_image = productData.featured_image;
        this.gallery = productData.gallery;
        this.status = productData.status;
        this.is_featured = productData.is_featured;
        this.meta_title = productData.meta_title;
        this.meta_description = productData.meta_description;
        this.view_count = productData.view_count || 0;
        this.purchase_count = productData.purchase_count || 0;
        this.created_at = productData.created_at;
        this.updated_at = productData.updated_at;
        this.category_name = productData.category_name;
        this.category_slug = productData.category_slug;
        this.average_rating = productData.average_rating;
        this.review_count = productData.review_count;
    }

    // Lấy sản phẩm với phân trang
    static async getProducts(options = {}) {
        try {
            const {
                page = 1,
                limit = 12,
                search = '',
                category_id = null,
                category_slug = null,
                status = 'active',
                is_featured = null,
                sort_by = 'created_at',
                sort_order = 'DESC',
                min_price = null,
                max_price = null
            } = options;

            const offset = (page - 1) * limit;

            let sql = `
                SELECT p.*, c.name as category_name, c.slug as category_slug,
                COALESCE(AVG(r.rating), 0) as average_rating,
                COUNT(r.id) as review_count
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN reviews r ON p.id = r.product_id AND r.is_approved = 1
                WHERE p.status = ?
            `;
            let params = [status];

            if (search) {
                sql += ` AND (p.name LIKE ? OR p.description LIKE ? OR p.short_description LIKE ?)`;
                params.push(`%${search}%`, `%${search}%`, `%${search}%`);
            }

            if (category_id) {
                sql += ` AND p.category_id = ?`;
                params.push(category_id);
            }

            if (category_slug) {
                sql += ` AND c.slug = ?`;
                params.push(category_slug);
            }

            if (is_featured !== null) {
                sql += ` AND p.is_featured = ?`;
                params.push(is_featured);
            }

            if (min_price !== null) {
                sql += ` AND (COALESCE(p.sale_price, p.price) >= ?)`;
                params.push(min_price);
            }

            if (max_price !== null) {
                sql += ` AND (COALESCE(p.sale_price, p.price) <= ?)`;
                params.push(max_price);
            }

            sql += ` GROUP BY p.id`;

            // Sắp xếp
            const validSortFields = ['created_at', 'name', 'price', 'average_rating', 'stock_quantity'];
            const sortField = validSortFields.includes(sort_by) ? sort_by : 'created_at';
            const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

            if (sortField === 'price') {
                sql += ` ORDER BY COALESCE(p.sale_price, p.price) ${sortDirection}`;
            } else if (sortField === 'average_rating') {
                sql += ` ORDER BY average_rating ${sortDirection}`;
            } else {
                sql += ` ORDER BY p.${sortField} ${sortDirection}`;
            }

            sql += ` LIMIT ? OFFSET ?`;
            params.push(limit, offset);

            const products = await db.query(sql, params);

            // Đếm tổng số sản phẩm
            let countSql = `
                SELECT COUNT(DISTINCT p.id) as total
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                WHERE p.status = ?
            `;
            let countParams = [status];

            if (search) {
                countSql += ` AND (p.name LIKE ? OR p.description LIKE ? OR p.short_description LIKE ?)`;
                countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
            }

            if (category_id) {
                countSql += ` AND p.category_id = ?`;
                countParams.push(category_id);
            }

            if (category_slug) {
                countSql += ` AND c.slug = ?`;
                countParams.push(category_slug);
            }

            if (is_featured !== null) {
                countSql += ` AND p.is_featured = ?`;
                countParams.push(is_featured);
            }

            if (min_price !== null) {
                countSql += ` AND (COALESCE(p.sale_price, p.price) >= ?)`;
                countParams.push(min_price);
            }

            if (max_price !== null) {
                countSql += ` AND (COALESCE(p.sale_price, p.price) <= ?)`;
                countParams.push(max_price);
            }

            const countResult = await db.query(countSql, countParams);
            const total = countResult[0].total;

            return {
                products: products.map(product => new Product(product)),
                pagination: {
                    current_page: page,
                    total_pages: Math.ceil(total / limit),
                    total_records: total,
                    limit: limit,
                    has_next: page < Math.ceil(total / limit),
                    has_prev: page > 1
                }
            };
        } catch (error) {
            throw error;
        }
    }

    // Lấy sản phẩm theo danh mục (cho lazy loading)
    static async getProductsByCategory(categorySlug, options = {}) {
        try {
            const {
                page = 1,
                limit = 12,
                sort_by = 'created_at',
                sort_order = 'DESC'
            } = options;

            return await Product.getProducts({
                ...options,
                category_slug: categorySlug,
                page,
                limit,
                sort_by,
                sort_order
            });
        } catch (error) {
            throw error;
        }
    }

    // Lấy sản phẩm nổi bật
    static async getFeaturedProducts(limit = 8) {
        try {
            const result = await Product.getProducts({
                is_featured: true,
                limit,
                sort_by: 'created_at',
                sort_order: 'DESC'
            });

            return result.products;
        } catch (error) {
            throw error;
        }
    }

    // Lấy sản phẩm mới nhất
    static async getLatestProducts(limit = 8) {
        try {
            const result = await Product.getProducts({
                limit,
                sort_by: 'created_at',
                sort_order: 'DESC'
            });

            return result.products;
        } catch (error) {
            throw error;
        }
    }

    // Lấy sản phẩm liên quan
    static async getRelatedProducts(productId, categoryId, limit = 4) {
        try {
            const sql = `
                SELECT p.*, c.name as category_name, c.slug as category_slug,
                COALESCE(AVG(r.rating), 0) as average_rating,
                COUNT(r.id) as review_count
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN reviews r ON p.id = r.product_id AND r.is_approved = 1
                WHERE p.category_id = ? AND p.id != ? AND p.status = 'active'
                GROUP BY p.id
                ORDER BY RAND()
                LIMIT ?
            `;

            const products = await db.query(sql, [categoryId, productId, limit]);
            return products.map(product => new Product(product));
        } catch (error) {
            throw error;
        }
    }

    // Tìm sản phẩm theo ID
    static async findById(id) {
        try {
            const sql = `
                SELECT p.*, c.name as category_name, c.slug as category_slug,
                COALESCE(AVG(r.rating), 0) as average_rating,
                COUNT(r.id) as review_count
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN reviews r ON p.id = r.product_id AND r.is_approved = 1
                WHERE p.id = ? AND p.status = 'active'
                GROUP BY p.id
            `;

            const products = await db.query(sql, [id]);
            return products.length > 0 ? new Product(products[0]) : null;
        } catch (error) {
            throw error;
        }
    }

    // Tìm sản phẩm theo slug
    static async findBySlug(slug) {
        try {
            const sql = `
                SELECT p.*, c.name as category_name, c.slug as category_slug,
                COALESCE(AVG(r.rating), 0) as average_rating,
                COUNT(r.id) as review_count
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN reviews r ON p.id = r.product_id AND r.is_approved = 1
                WHERE p.slug = ? AND p.status = 'active'
                GROUP BY p.id
            `;

            const products = await db.query(sql, [slug]);
            return products.length > 0 ? new Product(products[0]) : null;
        } catch (error) {
            throw error;
        }
    }

    // Tìm sản phẩm theo SKU
    static async findBySku(sku) {
        try {
            const product = await db.findOne('products', { sku });
            return product ? new Product(product) : null;
        } catch (error) {
            throw error;
        }
    }

    // Tạo sản phẩm mới
    static async create(productData) {
        try {
            const result = await db.create('products', productData);
            
            if (result.insertId) {
                return await Product.findById(result.insertId);
            }
            
            return null;
        } catch (error) {
            throw error;
        }
    }

    // Cập nhật sản phẩm
    async update(updateData) {
        try {
            const affectedRows = await db.update('products', updateData, { id: this.id });
            
            if (affectedRows > 0) {
                Object.assign(this, updateData);
                return true;
            }
            
            return false;
        } catch (error) {
            throw error;
        }
    }

    // Xóa sản phẩm (soft delete)
    async delete() {
        try {
            const affectedRows = await db.update('products', { status: 'inactive' }, { id: this.id });
            
            if (affectedRows > 0) {
                this.status = 'inactive';
                return true;
            }
            
            return false;
        } catch (error) {
            throw error;
        }
    }

    // Cập nhật số lượng tồn kho
    async updateStock(quantity) {
        try {
            const newStock = this.stock_quantity + quantity;
            
            if (newStock < 0) {
                throw new Error('Insufficient stock');
            }

            const affectedRows = await db.update('products', { stock_quantity: newStock }, { id: this.id });
            
            if (affectedRows > 0) {
                this.stock_quantity = newStock;
                return true;
            }
            
            return false;
        } catch (error) {
            throw error;
        }
    }

    // Kiểm tra tồn kho
    hasStock(quantity = 1) {
        return this.stock_quantity >= quantity;
    }

    // Lấy giá hiện tại (sale_price nếu có, không thì price)
    getCurrentPrice() {
        return this.sale_price || this.price;
    }

    // Kiểm tra có đang giảm giá không
    isOnSale() {
        return this.sale_price && this.sale_price < this.price;
    }

    // Tính phần trăm giảm giá
    getDiscountPercentage() {
        if (!this.isOnSale()) {
            return 0;
        }
        
        return Math.round(((this.price - this.sale_price) / this.price) * 100);
    }

    // Parse gallery JSON
    getGallery() {
        try {
            return this.gallery ? JSON.parse(this.gallery) : [];
        } catch (error) {
            return [];
        }
    }

    // Tạo slug từ tên
    static createSlug(name) {
        return name
            .toLowerCase()
            .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
            .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
            .replace(/[ìíịỉĩ]/g, 'i')
            .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
            .replace(/[ùúụủũưừứựửữ]/g, 'u')
            .replace(/[ỳýỵỷỹ]/g, 'y')
            .replace(/đ/g, 'd')
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-');
    }

    // Search sản phẩm
    static async search(query, options = {}) {
        try {
            return await Product.getProducts({
                ...options,
                search: query
            });
        } catch (error) {
            throw error;
        }
    }

    // Increment view count
    async incrementViewCount() {
        try {
            const sql = 'UPDATE products SET view_count = view_count + 1 WHERE id = ?';
            await db.query(sql, [this.id]);
            this.view_count += 1;
            return true;
        } catch (error) {
            throw error;
        }
    }

    // Track product view
    static async trackView(productId, viewData = {}) {
        try {
            const { user_id = null, ip_address = '', user_agent = '', referer = '', session_id = '' } = viewData;
            
            // Insert view record
            const sql = `
                INSERT INTO product_views (product_id, user_id, ip_address, user_agent, referer, session_id)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            await db.query(sql, [productId, user_id, ip_address, user_agent, referer, session_id]);

            // Update view count
            const updateSql = 'UPDATE products SET view_count = view_count + 1 WHERE id = ?';
            await db.query(updateSql, [productId]);

            return true;
        } catch (error) {
            throw error;
        }
    }

    // Get product with tags
    static async getProductWithTags(identifier) {
        try {
            const product = await Product.findBySlug(identifier) || await Product.findById(identifier);
            
            if (product) {
                // Get tags for this product
                const tagsSql = `
                    SELECT tag_name 
                    FROM product_tags 
                    WHERE product_id = ?
                    ORDER BY tag_name
                `;
                const tags = await db.query(tagsSql, [product.id]);
                product.tags = tags.map(tag => tag.tag_name);
            }

            return product;
        } catch (error) {
            throw error;
        }
    }

    // Add tags to product
    async addTags(tags) {
        try {
            if (!tags || !Array.isArray(tags) || tags.length === 0) {
                return false;
            }

            // Remove existing tags
            await db.query('DELETE FROM product_tags WHERE product_id = ?', [this.id]);

            // Insert new tags
            const sql = 'INSERT INTO product_tags (product_id, tag_name) VALUES ?';
            const values = tags.map(tag => [this.id, tag]);
            await db.query(sql, [values]);

            return true;
        } catch (error) {
            throw error;
        }
    }

    // Get popular products (based on views)
    static async getPopularProducts(options = {}) {
        try {
            const { limit = 12 } = options;
            
            const result = await Product.getProducts({
                ...options,
                limit,
                sort_by: 'view_count',
                sort_order: 'DESC'
            });

            return result.products;
        } catch (error) {
            throw error;
        }
    }

    // Get trending products (based on recent views and purchases)
    static async getTrendingProducts(options = {}) {
        try {
            const { limit = 12, days = 7 } = options;
            
            const sql = `
                SELECT p.*, c.name as category_name, c.slug as category_slug,
                COALESCE(AVG(r.rating), 0) as average_rating,
                COUNT(r.id) as review_count,
                COUNT(DISTINCT pv.id) as recent_views
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN reviews r ON p.id = r.product_id AND r.is_approved = 1
                LEFT JOIN product_views pv ON p.id = pv.product_id 
                    AND pv.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
                WHERE p.status = 'active'
                GROUP BY p.id
                HAVING recent_views > 0
                ORDER BY recent_views DESC, p.purchase_count DESC
                LIMIT ?
            `;

            const products = await db.query(sql, [days, limit]);
            return products.map(product => new Product(product));
        } catch (error) {
            throw error;
        }
    }

    // Increment purchase count
    async incrementPurchaseCount(quantity = 1) {
        try {
            const sql = 'UPDATE products SET purchase_count = purchase_count + ? WHERE id = ?';
            await db.query(sql, [quantity, this.id]);
            this.purchase_count += quantity;
            return true;
        } catch (error) {
            throw error;
        }
    }

    // Get view analytics for product
    static async getViewAnalytics(productId, days = 30) {
        try {
            const sql = `
                SELECT 
                    DATE(created_at) as date,
                    COUNT(*) as views,
                    COUNT(DISTINCT user_id) as unique_users,
                    COUNT(DISTINCT ip_address) as unique_ips
                FROM product_views 
                WHERE product_id = ? 
                    AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
                GROUP BY DATE(created_at)
                ORDER BY date DESC
            `;

            const analytics = await db.query(sql, [productId, days]);
            return analytics;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Product;
