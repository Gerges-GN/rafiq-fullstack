const express = require('express');
const router = express.Router();
const postController = require('../Controllers/Post');

router.post('/', postController.createPost);
router.get('/', postController.getAllPosts);
router.get('/user/:userId', postController.getPostsByUserId);
router.get('/:postId', postController.getPostById);
router.put('/:postId', postController.updatePost);
router.delete('/:postId', postController.deletePost);
router.patch('/:postId/like', postController.toggleLike);
router.patch('/:postId/save', postController.toggleSaved);

module.exports = router;