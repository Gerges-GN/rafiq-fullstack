const express = require('express');
const router = express.Router();
const profileController = require('../controllers/TouristProfile');

// No more verifyToken middleware needed
router.post('/', profileController.createProfile);
router.get('/:userId', profileController.getProfileByUserId);
router.put('/:userId', profileController.updateProfile);      // Changed to :userId
router.delete('/:userId', profileController.deleteProfile);   // Changed to :userId

module.exports = router;