const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');

router.get('/', homeController.getHome);

// CREATE
router.post('/create-user', homeController.postCreateUser);

// READ
router.get('/users', homeController.getUsers);

// UPDATE
router.get('/edit-user/:id', homeController.getEditUser);
router.post('/update-user/:id', homeController.postUpdateUser);

// DELETE
router.get('/delete-user/:id', homeController.deleteUser);

module.exports = router;
