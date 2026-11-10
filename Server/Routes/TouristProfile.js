const express = require('express');
const router = express.Router();
const profileController = require('../Controllers/TouristProfile');
const { verifyToken, requireRole } = require('../Middleware/Auth');

router.post('/', verifyToken, requireRole('tourist', 'admin'), profileController.createProfile);
router.get('/', verifyToken, requireRole('admin'), profileController.getAllProfiles);
router.get('/:userId', verifyToken, requireRole('tourist', 'tourguide', 'admin'), profileController.getProfileByUserId);
router.put('/:userId', verifyToken, requireRole('tourist', 'admin'), profileController.updateProfile);
router.delete('/:userId', verifyToken, requireRole('tourist', 'admin'), profileController.deleteProfile);
router.patch('/:userId/status', verifyToken, requireRole('admin'), profileController.updateProfileStatus);

module.exports = router;
