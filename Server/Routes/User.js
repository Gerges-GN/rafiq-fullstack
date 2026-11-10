const express = require('express');
const router = express.Router();
const userController = require('../Controllers/User');
const { verifyToken, requireRole } = require('../Middleware/Auth');

router.post('/register', userController.createUser);
router.post('/login', userController.loginUser);
router.get('/me', verifyToken, requireRole('tourist', 'tourguide', 'admin'), userController.getCurrentUser);
router.put('/:id', verifyToken, requireRole('tourist', 'tourguide', 'admin'), userController.updateUser);
router.delete('/:id', verifyToken, requireRole('admin'), userController.deleteUser);
router.get('/:id', verifyToken, requireRole('tourist', 'tourguide', 'admin'), userController.getUserById);

module.exports = router;
