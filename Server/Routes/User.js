const express = require('express');
const router = express.Router();
const userController = require('../controllers/User');

router.post('/register', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.get('/:id', userController.getUserById);
router.get('/email/:email', userController.getUserByEmail);

module.exports = router;