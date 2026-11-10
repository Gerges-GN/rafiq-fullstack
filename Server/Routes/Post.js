const express = require('express');
const router = express.Router();
const postController = require('../Controllers/Post');
const { verifyToken, requireRole } = require('../Middleware/Auth');

router.post('/', verifyToken, requireRole('tourist', 'tourguide'), postController.createPost);
router.get('/', postController.getAllPosts);
router.get('/user/:userId', postController.getPostsByUserId);
router.get('/:postId', postController.getPostById);
router.put('/:postId', verifyToken, requireRole('tourist', 'tourguide', 'admin'), postController.updatePost);
router.delete('/:postId', verifyToken, requireRole('tourist', 'tourguide', 'admin'), postController.deletePost);
router.patch('/:postId/like', verifyToken, requireRole('tourist', 'tourguide'), postController.toggleLike);
router.patch('/:postId/save', verifyToken, requireRole('tourist', 'tourguide'), postController.toggleSaved);

module.exports = router;
