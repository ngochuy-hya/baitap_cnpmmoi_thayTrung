const User = require('../models/user');
const { Op } = require('sequelize');

class UserService {
    async getProfile(userId) {
        const user = await User.findByPk(userId);
        if (!user) {
            throw new Error('Không tìm thấy tài khoản');
        }
        return user.toJSON();
    }

    async updateProfile(userId, updateData) {
        const user = await User.findByPk(userId);
        if (!user) {
            throw new Error('Không tìm thấy tài khoản');
        }

        const { fullName, phone } = updateData;
        await user.update({ fullName, phone });

        return {
            message: 'Cập nhật thông tin thành công!',
            user: user.toJSON()
        };
    }

    async getAllUsers(page = 1, limit = 10, search = '') {
        const offset = (page - 1) * limit;
        const whereClause = search ? {
            [Op.or]: [
                { fullName: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } }
            ]
        } : {};

        const { count, rows } = await User.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        return {
            users: rows.map(user => user.toJSON()),
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                totalUsers: count,
                hasNextPage: page < Math.ceil(count / limit),
                hasPrevPage: page > 1
            }
        };
    }

    async getUserById(userId) {
        const user = await User.findByPk(userId);
        if (!user) {
            throw new Error('Không tìm thấy tài khoản');
        }
        return user.toJSON();
    }

    async updateUser(userId, updateData) {
        const user = await User.findByPk(userId);
        if (!user) {
            throw new Error('Không tìm thấy tài khoản');
        }

        const { fullName, phone, status, role } = updateData;
        await user.update({ fullName, phone, status, role });

        return {
            message: 'Cập nhật thông tin user thành công!',
            user: user.toJSON()
        };
    }

    async deleteUser(userId) {
        const user = await User.findByPk(userId);
        if (!user) {
            throw new Error('Không tìm thấy tài khoản');
        }

        await user.destroy();
        return { message: 'Xóa user thành công!' };
    }

    async getEmailStatus(email) {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            throw new Error('Không tìm thấy tài khoản');
        }

        return {
            email: user.email,
            isEmailVerified: user.isEmailVerified,
            status: user.status
        };
    }
}

module.exports = new UserService();