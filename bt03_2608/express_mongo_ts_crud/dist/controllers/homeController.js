"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CRUDService_1 = __importDefault(require("../services/CRUDService"));
class HomeController {
    // Display homepage with form
    async getHomePage(req, res) {
        try {
            res.render('crud', { title: 'CRUD Application' });
        }
        catch (error) {
            console.error('Error rendering homepage:', error);
            res.status(500).send('Internal Server Error');
        }
    }
    // Display all users
    async displayAllUsers(req, res) {
        try {
            const result = await CRUDService_1.default.getAllUsers();
            if (result.success) {
                res.render('users/findAllUser', {
                    title: 'All Users',
                    users: result.data || []
                });
            }
            else {
                res.render('users/findAllUser', {
                    title: 'All Users',
                    users: [],
                    error: result.message
                });
            }
        }
        catch (error) {
            console.error('Error displaying users:', error);
            res.status(500).send('Internal Server Error');
        }
    }
    // Create new user
    async createUser(req, res) {
        try {
            const { firstName, lastName, email, address } = req.body;
            if (!firstName || !lastName || !email) {
                res.redirect('/crud?error=missing_fields');
                return;
            }
            const result = await CRUDService_1.default.createNewUser({
                firstName,
                lastName,
                email,
                address
            });
            if (result.success) {
                res.redirect('/crud?success=user_created');
            }
            else {
                res.redirect(`/crud?error=${result.error || 'create_failed'}`);
            }
        }
        catch (error) {
            console.error('Error creating user:', error);
            res.redirect('/crud?error=server_error');
        }
    }
    // Display edit form
    async getEditPage(req, res) {
        try {
            const { id } = req.params;
            const result = await CRUDService_1.default.getUserById(id);
            if (result.success && result.data) {
                res.render('users/updateUser', {
                    title: 'Update User',
                    user: result.data
                });
            }
            else {
                res.redirect('/users?error=user_not_found');
            }
        }
        catch (error) {
            console.error('Error getting edit page:', error);
            res.status(500).send('Internal Server Error');
        }
    }
    // Update user
    async updateUser(req, res) {
        try {
            const { id } = req.params;
            const { firstName, lastName, email, address } = req.body;
            const result = await CRUDService_1.default.updateUser(id, {
                firstName,
                lastName,
                email,
                address
            });
            if (result.success) {
                res.redirect('/users?success=user_updated');
            }
            else {
                res.redirect(`/edit-user/${id}?error=${result.error || 'update_failed'}`);
            }
        }
        catch (error) {
            console.error('Error updating user:', error);
            res.redirect(`/edit-user/${req.params.id}?error=server_error`);
        }
    }
    // Delete user
    async deleteUser(req, res) {
        try {
            const { id } = req.params;
            const result = await CRUDService_1.default.deleteUser(id);
            res.json({
                success: result.success,
                message: result.message
            });
        }
        catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({
                success: false,
                message: 'Internal Server Error'
            });
        }
    }
}
exports.default = new HomeController();
//# sourceMappingURL=homeController.js.map