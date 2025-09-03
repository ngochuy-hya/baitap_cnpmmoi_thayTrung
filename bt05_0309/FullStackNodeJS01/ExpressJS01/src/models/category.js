const db = require('../config/database');

class Category {
    constructor(categoryData) {
        this.id = categoryData.id;
        this.name = categoryData.name;
        this.slug = categoryData.slug;
        this.description = categoryData.description;
        this.image = categoryData.image;
        this.parent_id = categoryData.parent_id;
        this.sort_order = categoryData.sort_order;
        this.is_active = categoryData.is_active;
        this.created_at = categoryData.created_at;
        this.updated_at = categoryData.updated_at;
        this.parent_name = categoryData.parent_name;
        this.product_count = categoryData.product_count;
    }

    // Lấy tất cả categories
    static async getAll(options = {}) {
        try {
            const {
                include_inactive = false,
                include_product_count = false
            } = options;

            let sql = `
                SELECT c.*, parent.name as parent_name
                ${include_product_count ? ', (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.status = "active") as product_count' : ''}
                FROM categories c
                LEFT JOIN categories parent ON c.parent_id = parent.id
            `;

            if (!include_inactive) {
                sql += ' WHERE c.is_active = 1';
            }

            sql += ' ORDER BY c.sort_order ASC, c.name ASC';

            const categories = await db.query(sql);
            return categories.map(category => new Category(category));
        } catch (error) {
            throw error;
        }
    }

    // Lấy categories với phân trang
    static async getCategories(options = {}) {
        try {
            const {
                page = 1,
                limit = 10,
                search = '',
                parent_id = null,
                is_active = 1
            } = options;

            const offset = (page - 1) * limit;

            let sql = `
                SELECT c.*, parent.name as parent_name,
                (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.status = 'active') as product_count
                FROM categories c
                LEFT JOIN categories parent ON c.parent_id = parent.id
                WHERE c.is_active = ?
            `;
            let params = [is_active];

            if (search) {
                sql += ` AND c.name LIKE ?`;
                params.push(`%${search}%`);
            }

            if (parent_id !== null) {
                sql += ` AND c.parent_id = ?`;
                params.push(parent_id);
            }

            sql += ` ORDER BY c.sort_order ASC, c.name ASC LIMIT ? OFFSET ?`;
            params.push(limit, offset);

            const categories = await db.query(sql, params);

            // Đếm tổng số categories
            let countSql = `SELECT COUNT(*) as total FROM categories c WHERE c.is_active = ?`;
            let countParams = [is_active];

            if (search) {
                countSql += ` AND c.name LIKE ?`;
                countParams.push(`%${search}%`);
            }

            if (parent_id !== null) {
                countSql += ` AND c.parent_id = ?`;
                countParams.push(parent_id);
            }

            const countResult = await db.query(countSql, countParams);
            const total = countResult[0].total;

            return {
                categories: categories.map(category => new Category(category)),
                pagination: {
                    current_page: page,
                    total_pages: Math.ceil(total / limit),
                    total_records: total,
                    limit: limit
                }
            };
        } catch (error) {
            throw error;
        }
    }

    // Tìm category theo ID
    static async findById(id) {
        try {
            const sql = `
                SELECT c.*, parent.name as parent_name,
                (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.status = 'active') as product_count
                FROM categories c
                LEFT JOIN categories parent ON c.parent_id = parent.id
                WHERE c.id = ? AND c.is_active = 1
            `;
            const categories = await db.query(sql, [id]);
            return categories.length > 0 ? new Category(categories[0]) : null;
        } catch (error) {
            throw error;
        }
    }

    // Tìm category theo slug
    static async findBySlug(slug) {
        try {
            const sql = `
                SELECT c.*, parent.name as parent_name,
                (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.status = 'active') as product_count
                FROM categories c
                LEFT JOIN categories parent ON c.parent_id = parent.id
                WHERE c.slug = ? AND c.is_active = 1
            `;
            const categories = await db.query(sql, [slug]);
            return categories.length > 0 ? new Category(categories[0]) : null;
        } catch (error) {
            throw error;
        }
    }

    // Lấy categories con
    static async getChildren(parentId) {
        try {
            const sql = `
                SELECT c.*,
                (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.status = 'active') as product_count
                FROM categories c
                WHERE c.parent_id = ? AND c.is_active = 1
                ORDER BY c.sort_order ASC, c.name ASC
            `;
            const categories = await db.query(sql, [parentId]);
            return categories.map(category => new Category(category));
        } catch (error) {
            throw error;
        }
    }

    // Lấy categories cha (root categories)
    static async getRootCategories() {
        try {
            const sql = `
                SELECT c.*,
                (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.status = 'active') as product_count
                FROM categories c
                WHERE c.parent_id IS NULL AND c.is_active = 1
                ORDER BY c.sort_order ASC, c.name ASC
            `;
            const categories = await db.query(sql);
            return categories.map(category => new Category(category));
        } catch (error) {
            throw error;
        }
    }

    // Tạo category mới
    static async create(categoryData) {
        try {
            const result = await db.create('categories', categoryData);
            
            if (result.insertId) {
                return await Category.findById(result.insertId);
            }
            
            return null;
        } catch (error) {
            throw error;
        }
    }

    // Cập nhật category
    async update(updateData) {
        try {
            const affectedRows = await db.update('categories', updateData, { id: this.id });
            
            if (affectedRows > 0) {
                Object.assign(this, updateData);
                return true;
            }
            
            return false;
        } catch (error) {
            throw error;
        }
    }

    // Xóa category (soft delete)
    async delete() {
        try {
            // Kiểm tra xem có sản phẩm nào đang sử dụng category này không
            const productCount = await db.count('products', { category_id: this.id, status: 'active' });
            
            if (productCount > 0) {
                throw new Error('Cannot delete category that has products');
            }

            // Kiểm tra xem có category con nào không
            const childrenCount = await db.count('categories', { parent_id: this.id, is_active: 1 });
            
            if (childrenCount > 0) {
                throw new Error('Cannot delete category that has children');
            }

            const affectedRows = await db.update('categories', { is_active: false }, { id: this.id });
            
            if (affectedRows > 0) {
                this.is_active = false;
                return true;
            }
            
            return false;
        } catch (error) {
            throw error;
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
}

module.exports = Category;
