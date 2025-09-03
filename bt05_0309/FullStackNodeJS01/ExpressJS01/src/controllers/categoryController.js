const Category = require('../models/category');

class CategoryController {
    // Lấy tất cả categories
    static async getCategories(req, res) {
        try {
            const options = {
                include_inactive: req.query.include_inactive === 'true',
                include_product_count: req.query.include_product_count !== 'false'
            };

            const categories = await Category.getAll(options);
            
            res.status(200).json({
                success: true,
                data: { categories }
            });
        } catch (error) {
            console.error('Get categories error:', error);
            
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get categories'
            });
        }
    }

    // Lấy categories với phân trang (admin)
    static async getCategoriesPaginated(req, res) {
        try {
            const options = {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 10,
                search: req.query.search || '',
                parent_id: req.query.parent_id !== undefined ? parseInt(req.query.parent_id) : null,
                is_active: req.query.is_active !== undefined ? parseInt(req.query.is_active) : 1
            };

            const result = await Category.getCategories(options);
            
            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error('Get categories paginated error:', error);
            
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get categories'
            });
        }
    }

    // Lấy categories cha (root categories)
    static async getRootCategories(req, res) {
        try {
            const categories = await Category.getRootCategories();
            
            res.status(200).json({
                success: true,
                data: { categories }
            });
        } catch (error) {
            console.error('Get root categories error:', error);
            
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get root categories'
            });
        }
    }

    // Lấy categories con
    static async getChildCategories(req, res) {
        try {
            const { parentId } = req.params;
            const categories = await Category.getChildren(parentId);
            
            res.status(200).json({
                success: true,
                data: { categories }
            });
        } catch (error) {
            console.error('Get child categories error:', error);
            
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get child categories'
            });
        }
    }

    // Lấy chi tiết category
    static async getCategoryDetail(req, res) {
        try {
            const { identifier } = req.params; // có thể là ID hoặc slug
            
            let category;
            
            if (/^\d+$/.test(identifier)) {
                category = await Category.findById(parseInt(identifier));
            } else {
                category = await Category.findBySlug(identifier);
            }
            
            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: 'Category not found'
                });
            }

            // Lấy categories con nếu có
            const children = await Category.getChildren(category.id);
            
            res.status(200).json({
                success: true,
                data: {
                    category,
                    children
                }
            });
        } catch (error) {
            console.error('Get category detail error:', error);
            
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get category detail'
            });
        }
    }

    // Tạo category mới (admin/staff only)
    static async createCategory(req, res) {
        try {
            const categoryData = { ...req.body };
            
            // Tạo slug từ tên nếu không có
            if (!categoryData.slug) {
                categoryData.slug = Category.createSlug(categoryData.name);
            }

            // Kiểm tra slug đã tồn tại chưa
            const existingCategory = await Category.findBySlug(categoryData.slug);
            if (existingCategory) {
                categoryData.slug = `${categoryData.slug}-${Date.now()}`;
            }

            // Kiểm tra parent category nếu có
            if (categoryData.parent_id) {
                const parentCategory = await Category.findById(categoryData.parent_id);
                if (!parentCategory) {
                    return res.status(400).json({
                        success: false,
                        message: 'Parent category not found'
                    });
                }
            }

            const category = await Category.create(categoryData);
            
            if (!category) {
                throw new Error('Failed to create category');
            }

            res.status(201).json({
                success: true,
                data: { category },
                message: 'Category created successfully'
            });
        } catch (error) {
            console.error('Create category error:', error);
            
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to create category'
            });
        }
    }

    // Cập nhật category (admin/staff only)
    static async updateCategory(req, res) {
        try {
            const { id } = req.params;
            const updateData = { ...req.body };
            
            const category = await Category.findById(id);
            
            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: 'Category not found'
                });
            }

            // Cập nhật slug nếu có thay đổi tên
            if (updateData.name && updateData.name !== category.name) {
                updateData.slug = Category.createSlug(updateData.name);
                
                // Kiểm tra slug mới có trùng không
                const existingCategory = await Category.findBySlug(updateData.slug);
                if (existingCategory && existingCategory.id != id) {
                    updateData.slug = `${updateData.slug}-${Date.now()}`;
                }
            }

            // Kiểm tra parent category nếu có cập nhật
            if (updateData.parent_id) {
                // Không cho phép set parent là chính nó
                if (updateData.parent_id == id) {
                    return res.status(400).json({
                        success: false,
                        message: 'Category cannot be its own parent'
                    });
                }

                const parentCategory = await Category.findById(updateData.parent_id);
                if (!parentCategory) {
                    return res.status(400).json({
                        success: false,
                        message: 'Parent category not found'
                    });
                }
            }

            const success = await category.update(updateData);
            
            if (!success) {
                throw new Error('Failed to update category');
            }

            res.status(200).json({
                success: true,
                data: { category },
                message: 'Category updated successfully'
            });
        } catch (error) {
            console.error('Update category error:', error);
            
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to update category'
            });
        }
    }

    // Xóa category (admin/staff only)
    static async deleteCategory(req, res) {
        try {
            const { id } = req.params;
            
            const category = await Category.findById(id);
            
            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: 'Category not found'
                });
            }

            const success = await category.delete();
            
            if (!success) {
                throw new Error('Failed to delete category');
            }

            res.status(200).json({
                success: true,
                message: 'Category deleted successfully'
            });
        } catch (error) {
            console.error('Delete category error:', error);
            
            if (error.message.includes('has products') || error.message.includes('has children')) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
            
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to delete category'
            });
        }
    }

    // Lấy cây danh mục (hierarchical structure)
    static async getCategoryTree(req, res) {
        try {
            const categories = await Category.getAll({
                include_product_count: true
            });
            
            // Xây dựng cây danh mục
            const categoryMap = new Map();
            const rootCategories = [];
            
            // Tạo map với tất cả categories
            categories.forEach(category => {
                categoryMap.set(category.id, {
                    ...category,
                    children: []
                });
            });
            
            // Xây dựng cây
            categories.forEach(category => {
                if (category.parent_id) {
                    const parent = categoryMap.get(category.parent_id);
                    if (parent) {
                        parent.children.push(categoryMap.get(category.id));
                    }
                } else {
                    rootCategories.push(categoryMap.get(category.id));
                }
            });
            
            res.status(200).json({
                success: true,
                data: { categories: rootCategories }
            });
        } catch (error) {
            console.error('Get category tree error:', error);
            
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get category tree'
            });
        }
    }

    // Tìm kiếm categories
    static async searchCategories(req, res) {
        try {
            const { q: query } = req.query;
            
            if (!query || query.trim().length < 2) {
                return res.status(400).json({
                    success: false,
                    message: 'Search query must be at least 2 characters'
                });
            }

            const options = {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 10,
                search: query.trim()
            };

            const result = await Category.getCategories(options);
            
            res.status(200).json({
                success: true,
                data: {
                    ...result,
                    query: query
                }
            });
        } catch (error) {
            console.error('Search categories error:', error);
            
            res.status(500).json({
                success: false,
                message: error.message || 'Search failed'
            });
        }
    }

    // Reorder categories (admin only)
    static async reorderCategories(req, res) {
        try {
            const { categories } = req.body; // Array of {id, sort_order}
            
            if (!Array.isArray(categories) || categories.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Categories array is required'
                });
            }

            const db = require('../config/database');
            
            // Update sort_order cho từng category
            const updatePromises = categories.map(item => {
                if (!item.id || item.sort_order === undefined) {
                    throw new Error('Each item must have id and sort_order');
                }
                
                return db.update('categories', 
                    { sort_order: item.sort_order }, 
                    { id: item.id }
                );
            });

            await Promise.all(updatePromises);
            
            res.status(200).json({
                success: true,
                message: 'Categories reordered successfully'
            });
        } catch (error) {
            console.error('Reorder categories error:', error);
            
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to reorder categories'
            });
        }
    }
}

module.exports = CategoryController;
