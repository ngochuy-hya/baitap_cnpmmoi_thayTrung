"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = require("../models/User");
class CRUDService {
    // Create new user
    async createNewUser(userData) {
        try {
            const existingUser = await User_1.User.findOne({ email: userData.email });
            if (existingUser) {
                return {
                    success: false,
                    message: 'Email already exists',
                    error: 'DUPLICATE_EMAIL'
                };
            }
            const newUser = new User_1.User(userData);
            const savedUser = await newUser.save();
            return {
                success: true,
                message: 'User created successfully',
                data: savedUser
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Error creating user',
                error: error.message
            };
        }
    }
    // Get all users
    async getAllUsers() {
        try {
            const users = await User_1.User.find({})
                .sort({ createdAt: -1 })
                .lean();
            return {
                success: true,
                message: 'Users retrieved successfully',
                data: users
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Error retrieving users',
                error: error.message
            };
        }
    }
    // Get user by ID
    async getUserById(id) {
        try {
            const user = await User_1.User.findById(id);
            if (!user) {
                return {
                    success: false,
                    message: 'User not found',
                    error: 'USER_NOT_FOUND'
                };
            }
            return {
                success: true,
                message: 'User retrieved successfully',
                data: user
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Error retrieving user',
                error: error.message
            };
        }
    }
    // Update user
    async updateUser(id, updateData) {
        try {
            const updatedUser = await User_1.User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
            if (!updatedUser) {
                return {
                    success: false,
                    message: 'User not found',
                    error: 'USER_NOT_FOUND'
                };
            }
            return {
                success: true,
                message: 'User updated successfully',
                data: updatedUser
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Error updating user',
                error: error.message
            };
        }
    }
    // Delete user
    async deleteUser(id) {
        try {
            const deletedUser = await User_1.User.findByIdAndDelete(id);
            if (!deletedUser) {
                return {
                    success: false,
                    message: 'User not found',
                    error: 'USER_NOT_FOUND'
                };
            }
            return {
                success: true,
                message: 'User deleted successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Error deleting user',
                error: error.message
            };
        }
    }
}
exports.default = new CRUDService();
//# sourceMappingURL=CRUDService.js.map