"use strict";
// import { Router } from 'express';
// import homeController from '../controllers/homeController';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
const express_1 = require("express");
const homeController_1 = __importDefault(require("../controllers/homeController"));
const router = (0, express_1.Router)();
// Homepage routes
router.get('/', homeController_1.default.getHomePage);
router.get('/crud', homeController_1.default.getHomePage);
// User CRUD routes
router.get('/users', homeController_1.default.displayAllUsers);
router.post('/create-user', homeController_1.default.createUser);
// Sử dụng format rõ ràng cho route parameters
router.get('/edit-user/:id([0-9a-fA-F]{24})', homeController_1.default.getEditPage);
router.post('/update-user/:id([0-9a-fA-F]{24})', homeController_1.default.updateUser);
router.delete('/delete-user/:id([0-9a-fA-F]{24})', homeController_1.default.deleteUser);
exports.default = router;
//# sourceMappingURL=web.js.map