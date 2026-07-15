const express = require('express');
const router = express.Router();
const userController = require('../Controllers/User');

router.post('/register', userController.createUser);
router.post('/login', userController.loginUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.get('/:id', userController.getUserById);
router.get('/email/:email', userController.getUserByEmail);

module.exports = router;