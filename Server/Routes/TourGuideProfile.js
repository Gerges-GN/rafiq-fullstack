const express = require('express');
const router = express.Router();
const tourGuideProfileController = require('../Controllers/TourGuideProfile');

router.post('/', tourGuideProfileController.createTourGuideProfile);
router.get('/', tourGuideProfileController.getTourGuideProfiles);
router.get('/owner/:ownerId', tourGuideProfileController.getTourGuideProfileByOwnerId);
router.get('/:id', tourGuideProfileController.getTourGuideProfileById);
router.put('/:id', tourGuideProfileController.updateTourGuideProfile);
router.delete('/:id', tourGuideProfileController.deleteTourGuideProfile);

module.exports = router;