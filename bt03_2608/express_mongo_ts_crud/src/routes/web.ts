// import { Router } from 'express';
// import homeController from '../controllers/homeController';

// const router = Router();

// // Homepage routes
// router.get('/', homeController.getHomePage);
// router.get('/crud', homeController.getHomePage);

// // User CRUD routes
// router.get('/users', homeController.displayAllUsers);
// router.post('/create-user', homeController.createUser);
// router.get('/edit-user/:id', homeController.getEditPage);
// router.post('/update-user/:id', homeController.updateUser);
// router.delete('/delete-user/:id', homeController.deleteUser);

// export default router;

import { Router } from 'express';
import homeController from '../controllers/homeController';

const router = Router();

// Homepage routes
router.get('/', homeController.getHomePage);
router.get('/crud', homeController.getHomePage);

// User CRUD routes
router.get('/users', homeController.displayAllUsers);
router.post('/create-user', homeController.createUser);

// Sử dụng format rõ ràng cho route parameters
router.get('/edit-user/:id([0-9a-fA-F]{24})', homeController.getEditPage);
router.post('/update-user/:id([0-9a-fA-F]{24})', homeController.updateUser);
router.delete('/delete-user/:id([0-9a-fA-F]{24})', homeController.deleteUser);

export default router;