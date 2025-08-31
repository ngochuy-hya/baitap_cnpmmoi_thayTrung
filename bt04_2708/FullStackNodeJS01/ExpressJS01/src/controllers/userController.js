const userService = require('../services/userService');

class UserController {
    // GET /api/users/profile - Lấy profile user đang login
    async getProfile(req, res) {
        try {
            const userId = req.user.userId;
            const user = await userService.getProfile(userId);
            res.status(200).json({
                EM: 'Lấy thông tin profile thành công',
                EC: 0,
                DT: user
            });
        } catch (error) {
            res.status(400).json({
                EM: error.message,
                EC: -1,
                DT: ''
            });
        }
    }

    // PUT /api/users/profile - Cập nhật profile
    async updateProfile(req, res) {
        try {
            const userId = req.user.userId;
            const result = await userService.updateProfile(userId, req.body);
            res.status(200).json({
                EM: result.message,
                EC: 0,
                DT: result.user
            });
        } catch (error) {
            res.status(400).json({
                EM: error.message,
                EC: -1,
                DT: ''
            });
        }
    }

    // GET /api/users - Lấy danh sách users (Admin, phân trang)
    async getAllUsers(req, res) {
        try {
            const { page = 1, limit = 10, search = '' } = req.query;
            const result = await userService.getAllUsers(page, limit, search);
            res.status(200).json({
                EM: 'Lấy danh sách users thành công',
                EC: 0,
                DT: result
            });
        } catch (error) {
            res.status(400).json({
                EM: error.message,
                EC: -1,
                DT: ''
            });
        }
    }

    // GET /api/users/:id - Lấy user theo ID (Admin)
    async getUserById(req, res) {
        try {
            const { id } = req.params;
            const user = await userService.getUserById(id);
            res.status(200).json({
                EM: 'Lấy thông tin user thành công',
                EC: 0,
                DT: user
            });
        } catch (error) {
            res.status(400).json({
                EM: error.message,
                EC: -1,
                DT: ''
            });
        }
    }

    // PUT /api/users/:id - Cập nhật user (Admin)
    async updateUser(req, res) {
        try {
            const { id } = req.params;
            const result = await userService.updateUser(id, req.body);
            res.status(200).json({
                EM: result.message,
                EC: 0,
                DT: result.user
            });
        } catch (error) {
            res.status(400).json({
                EM: error.message,
                EC: -1,
                DT: ''
            });
        }
    }

    // DELETE /api/users/:id - Xóa user (Admin)
    async deleteUser(req, res) {
        try {
            const { id } = req.params;
            const result = await userService.deleteUser(id);
            res.status(200).json({
                EM: result.message,
                EC: 0,
                DT: ''
            });
        } catch (error) {
            res.status(400).json({
                EM: error.message,
                EC: -1,
                DT: ''
            });
        }
    }

    // GET /api/users/email-status - Kiểm tra trạng thái email
    async getEmailStatus(req, res) {
        try {
            const { email } = req.query;
            if (!email) {
                return res.status(400).json({
                    EM: 'Email là bắt buộc',
                    EC: -1,
                    DT: ''
                });
            }
            
            const result = await userService.getEmailStatus(email);
            res.status(200).json({
                EM: 'Lấy trạng thái email thành công',
                EC: 0,
                DT: result
            });
        } catch (error) {
            res.status(400).json({
                EM: error.message,
                EC: -1,
                DT: ''
            });
        }
    }
}

module.exports = new UserController();