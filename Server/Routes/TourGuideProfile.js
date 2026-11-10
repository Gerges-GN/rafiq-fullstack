const express = require('express');
const router = express.Router();
const tourGuideProfileController = require('../Controllers/TourGuideProfile');
const { verifyToken, requireRole } = require('../Middleware/Auth');

router.get('/me', verifyToken, requireRole('tourguide'), tourGuideProfileController.getMyTourGuideProfile);
router.post('/', verifyToken, requireRole('tourguide', 'admin'), tourGuideProfileController.createTourGuideProfile);
router.get('/admin/all', verifyToken, requireRole('admin'), tourGuideProfileController.getAllTourGuideProfilesForAdmin);
router.get('/', tourGuideProfileController.getTourGuideProfiles);
router.get('/owner/:ownerId', tourGuideProfileController.getTourGuideProfileByOwnerId);
router.get('/:id', tourGuideProfileController.getTourGuideProfileById);
router.put('/:id', verifyToken, requireRole('tourguide', 'admin'), tourGuideProfileController.updateTourGuideProfile);
router.delete('/:id', verifyToken, requireRole('tourguide', 'admin'), tourGuideProfileController.deleteTourGuideProfile);

module.exports = router;
