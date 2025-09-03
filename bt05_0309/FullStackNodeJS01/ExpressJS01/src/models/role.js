const db = require('../config/database');

class Role {
    constructor(roleData) {
        this.id = roleData.id;
        this.name = roleData.name;
        this.description = roleData.description;
        this.created_at = roleData.created_at;
        this.updated_at = roleData.updated_at;
    }

    // Lấy tất cả roles
    static async getAll() {
        try {
            const roles = await db.findMany('roles', {}, {
                orderBy: 'name ASC'
            });
            return roles.map(role => new Role(role));
        } catch (error) {
            throw error;
        }
    }

    // Tìm role theo ID
    static async findById(id) {
        try {
            const role = await db.findOne('roles', { id });
            return role ? new Role(role) : null;
        } catch (error) {
            throw error;
        }
    }

    // Tìm role theo tên
    static async findByName(name) {
        try {
            const role = await db.findOne('roles', { name });
            return role ? new Role(role) : null;
        } catch (error) {
            throw error;
        }
    }

    // Tạo role mới
    static async create(roleData) {
        try {
            const result = await db.create('roles', roleData);
            
            if (result.insertId) {
                return await Role.findById(result.insertId);
            }
            
            return null;
        } catch (error) {
            throw error;
        }
    }

    // Cập nhật role
    async update(updateData) {
        try {
            const affectedRows = await db.update('roles', updateData, { id: this.id });
            
            if (affectedRows > 0) {
                Object.assign(this, updateData);
                return true;
            }
            
            return false;
        } catch (error) {
            throw error;
        }
    }

    // Xóa role
    async delete() {
        try {
            // Kiểm tra xem có user nào đang sử dụng role này không
            const userCount = await db.count('users', { role_id: this.id, is_active: 1 });
            
            if (userCount > 0) {
                throw new Error('Cannot delete role that is being used by users');
            }
            
            const affectedRows = await db.delete('roles', { id: this.id });
            return affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Role;
