const express = require('express');
const router = express.Router();
const chatController = require('../Controllers/Chat');
const { verifyToken, requireRole } = require('../Middleware/Auth');

router.use(verifyToken, requireRole('tourist', 'tourguide'));

router.post('/', chatController.createChat);
router.post('/:id/messages', chatController.sendMessage);
router.get('/:id', chatController.getChatById);
router.get('/user/:userId', chatController.getChatsForUser);
router.delete('/:id', chatController.deleteChat);
router.put('/:id/messages/:messageId', chatController.editMessage);
router.delete('/:id/messages/:messageId', chatController.deleteMessage);

module.exports = router;
