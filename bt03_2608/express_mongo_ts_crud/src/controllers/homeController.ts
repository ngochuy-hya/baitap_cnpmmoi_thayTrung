import { Request, Response } from 'express';
import CRUDService from '../services/CRUDService';

class HomeController {
  // Display homepage with form
  async getHomePage(req: Request, res: Response): Promise<void> {
    try {
      res.render('crud', { title: 'CRUD Application' });
    } catch (error) {
      console.error('Error rendering homepage:', error);
      res.status(500).send('Internal Server Error');
    }
  }

  // Display all users
  async displayAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const result = await CRUDService.getAllUsers();
      
      if (result.success) {
        res.render('users/findAllUser', { 
          title: 'All Users',
          users: result.data || []
        });
      } else {
        res.render('users/findAllUser', { 
          title: 'All Users',
          users: [],
          error: result.message
        });
      }
    } catch (error) {
      console.error('Error displaying users:', error);
      res.status(500).send('Internal Server Error');
    }
  }

  // Create new user
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const { firstName, lastName, email, address } = req.body;

      if (!firstName || !lastName || !email) {
        res.redirect('/crud?error=missing_fields');
        return;
      }

      const result = await CRUDService.createNewUser({
        firstName,
        lastName,
        email,
        address
      });

      if (result.success) {
        res.redirect('/crud?success=user_created');
      } else {
        res.redirect(`/crud?error=${result.error || 'create_failed'}`);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      res.redirect('/crud?error=server_error');
    }
  }

  // Display edit form
  async getEditPage(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await CRUDService.getUserById(id);

      if (result.success && result.data) {
        res.render('users/updateUser', {
          title: 'Update User',
          user: result.data
        });
      } else {
        res.redirect('/users?error=user_not_found');
      }
    } catch (error) {
      console.error('Error getting edit page:', error);
      res.status(500).send('Internal Server Error');
    }
  }

  // Update user
  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { firstName, lastName, email, address } = req.body;

      const result = await CRUDService.updateUser(id, {
        firstName,
        lastName,
        email,
        address
      });

      if (result.success) {
        res.redirect('/users?success=user_updated');
      } else {
        res.redirect(`/edit-user/${id}?error=${result.error || 'update_failed'}`);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      res.redirect(`/edit-user/${req.params.id}?error=server_error`);
    }
  }

  // Delete user
  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await CRUDService.deleteUser(id);

      res.json({
        success: result.success,
        message: result.message
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({
        success: false,
        message: 'Internal Server Error'
      });
    }
  }
}

export default new HomeController();