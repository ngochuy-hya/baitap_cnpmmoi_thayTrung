const db = require('../config/database');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

class User {
    constructor(userData) {
        this.id = userData.id;
        this.email = userData.email;
        this.password = userData.password;
        this.full_name = userData.full_name;
        this.phone = userData.phone;
        this.address = userData.address;
        this.avatar = userData.avatar;
        this.role_id = userData.role_id;
        this.email_verified = userData.email_verified;
        this.email_verification_token = userData.email_verification_token;
        this.password_reset_token = userData.password_reset_token;
        this.password_reset_expires = userData.password_reset_expires;
        this.last_login = userData.last_login;
        this.is_active = userData.is_active;
        this.created_at = userData.created_at;
        this.updated_at = userData.updated_at;
    }

    // Tìm user theo ID
    static async findById(id) {
        try {
            const sql = `
                SELECT u.*, r.name as role_name, r.description as role_description
                FROM users u
                LEFT JOIN roles r ON u.role_id = r.id
                WHERE u.id = ? AND u.is_active = 1
            `;
            const user = await db.findOne('users', { id, is_active: 1 });
            return user ? new User(user) : null;
        } catch (error) {
            throw error;
        }
    }

    // Tìm user theo email
    static async findByEmail(email) {
        try {
            const sql = `
                SELECT u.*, r.name as role_name, r.description as role_description
                FROM users u
                LEFT JOIN roles r ON u.role_id = r.id
                WHERE u.email = ? AND u.is_active = 1
            `;
            const users = await db.query(sql, [email]);
            return users.length > 0 ? new User(users[0]) : null;
        } catch (error) {
            throw error;
        }
    }

    // Tìm user theo token reset password
    static async findByResetToken(token) {
        try {
            const sql = `
                SELECT * FROM users 
                WHERE password_reset_token = ? 
                AND password_reset_expires > NOW()
                AND is_active = 1
            `;
            const users = await db.query(sql, [token]);
            return users.length > 0 ? new User(users[0]) : null;
        } catch (error) {
            throw error;
        }
    }

    // Tìm user theo email verification token
    static async findByVerificationToken(token) {
        try {
            const user = await db.findOne('users', { 
                email_verification_token: token,
                is_active: 1 
            });
            return user ? new User(user) : null;
        } catch (error) {
            throw error;
        }
    }

    // Tạo user mới
    static async create(userData) {
        try {
            // Hash password
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
            
            // Tạo email verification token
            const emailVerificationToken = crypto.randomBytes(32).toString('hex');
            
            const newUserData = {
                email: userData.email,
                password: hashedPassword,
                full_name: userData.full_name,
                phone: userData.phone || null,
                address: userData.address || null,
                role_id: userData.role_id || 2, // Default customer role
                email_verification_token: emailVerificationToken,
                email_verified: false,
                is_active: true
            };

            const result = await db.create('users', newUserData);
            
            if (result.insertId) {
                return await User.findById(result.insertId);
            }
            
            return null;
        } catch (error) {
            throw error;
        }
    }

    // Cập nhật user
    async update(updateData) {
        try {
            // Nếu có password mới thì hash
            if (updateData.password) {
                const saltRounds = 10;
                updateData.password = await bcrypt.hash(updateData.password, saltRounds);
            }

            const affectedRows = await db.update('users', updateData, { id: this.id });
            
            if (affectedRows > 0) {
                // Cập nhật object hiện tại
                Object.assign(this, updateData);
                return true;
            }
            
            return false;
        } catch (error) {
            throw error;
        }
    }

    // Xóa user (soft delete)
    async delete() {
        try {
            const affectedRows = await db.update('users', { is_active: false }, { id: this.id });
            if (affectedRows > 0) {
                this.is_active = false;
                return true;
            }
            return false;
        } catch (error) {
            throw error;
        }
    }

    // Kiểm tra password
    async comparePassword(candidatePassword) {
        try {
            return await bcrypt.compare(candidatePassword, this.password);
        } catch (error) {
            throw error;
        }
    }

    // Cập nhật last login
    async updateLastLogin() {
        try {
            const now = new Date();
            await db.update('users', { last_login: now }, { id: this.id });
            this.last_login = now;
        } catch (error) {
            throw error;
        }
    }

    // Tạo password reset token
    async createPasswordResetToken() {
        try {
            const resetToken = crypto.randomBytes(32).toString('hex');
            const resetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
            
            await db.update('users', {
                password_reset_token: resetToken,
                password_reset_expires: resetExpires
            }, { id: this.id });
            
            return resetToken;
        } catch (error) {
            throw error;
        }
    }

    // Reset password
    async resetPassword(newPassword) {
        try {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
            
            await db.update('users', {
                password: hashedPassword,
                password_reset_token: null,
                password_reset_expires: null
            }, { id: this.id });
            
            return true;
        } catch (error) {
            throw error;
        }
    }

    // Verify email
    async verifyEmail() {
        try {
            await db.update('users', {
                email_verified: true,
                email_verification_token: null
            }, { id: this.id });
            
            this.email_verified = true;
            this.email_verification_token = null;
            return true;
        } catch (error) {
            throw error;
        }
    }

    // Lấy danh sách users với phân trang
    static async getUsers(options = {}) {
        try {
            const {
                page = 1,
                limit = 10,
                search = '',
                role_id = null,
                is_active = 1
            } = options;
            
            const offset = (page - 1) * limit;
            
            let sql = `
                SELECT u.*, r.name as role_name, r.description as role_description
                FROM users u
                LEFT JOIN roles r ON u.role_id = r.id
                WHERE u.is_active = ?
            `;
            let params = [is_active];
            
            if (search) {
                sql += ` AND (u.full_name LIKE ? OR u.email LIKE ?)`;
                params.push(`%${search}%`, `%${search}%`);
            }
            
            if (role_id) {
                sql += ` AND u.role_id = ?`;
                params.push(role_id);
            }
            
            sql += ` ORDER BY u.created_at DESC LIMIT ? OFFSET ?`;
            params.push(limit, offset);
            
            const users = await db.query(sql, params);
            
            // Đếm tổng số users
            let countSql = `
                SELECT COUNT(*) as total FROM users u 
                WHERE u.is_active = ?
            `;
            let countParams = [is_active];
            
            if (search) {
                countSql += ` AND (u.full_name LIKE ? OR u.email LIKE ?)`;
                countParams.push(`%${search}%`, `%${search}%`);
            }
            
            if (role_id) {
                countSql += ` AND u.role_id = ?`;
                countParams.push(role_id);
            }
            
            const countResult = await db.query(countSql, countParams);
            const total = countResult[0].total;
            
            return {
                users: users.map(user => new User(user)),
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

    // Chuyển đổi user thành object an toàn (loại bỏ password)
    toSafeObject() {
        const { password, password_reset_token, email_verification_token, ...safeUser } = this;
        return safeUser;
    }

    // Kiểm tra quyền
    hasRole(roleName) {
        return this.role_name === roleName;
    }

    isAdmin() {
        return this.role_name === 'admin';
    }

    isCustomer() {
        return this.role_name === 'customer';
    }

    isStaff() {
        return this.role_name === 'staff';
    }
}

module.exports = User;
