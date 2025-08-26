import { User, IUserDocument } from '../models/User';
import { IUser, ApiResponse } from '../types';

class CRUDService {
  // Create new user
  async createNewUser(userData: IUser): Promise<ApiResponse<IUserDocument>> {
    try {
      const existingUser = await User.findOne({ email: userData.email });
      
      if (existingUser) {
        return {
          success: false,
          message: 'Email already exists',
          error: 'DUPLICATE_EMAIL'
        };
      }

      const newUser = new User(userData);
      const savedUser = await newUser.save();

      return {
        success: true,
        message: 'User created successfully',
        data: savedUser
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Error creating user',
        error: error.message
      };
    }
  }

  // Get all users
  async getAllUsers(): Promise<ApiResponse<IUserDocument[]>> {
    try {
      const users = await User.find({})
        .sort({ createdAt: -1 })
        .lean();

      return {
        success: true,
        message: 'Users retrieved successfully',
        data: users as IUserDocument[]
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Error retrieving users',
        error: error.message
      };
    }
  }

  // Get user by ID
  async getUserById(id: string): Promise<ApiResponse<IUserDocument>> {
    try {
      const user = await User.findById(id);
      
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
    } catch (error: any) {
      return {
        success: false,
        message: 'Error retrieving user',
        error: error.message
      };
    }
  }

  // Update user
  async updateUser(id: string, updateData: Partial<IUser>): Promise<ApiResponse<IUserDocument>> {
    try {
      const updatedUser = await User.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

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
    } catch (error: any) {
      return {
        success: false,
        message: 'Error updating user',
        error: error.message
      };
    }
  }

  // Delete user
  async deleteUser(id: string): Promise<ApiResponse<null>> {
    try {
      const deletedUser = await User.findByIdAndDelete(id);

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
    } catch (error: any) {
      return {
        success: false,
        message: 'Error deleting user',
        error: error.message
      };
    }
  }
}

export default new CRUDService();