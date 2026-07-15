const express = require('express');
const router = express.Router();
const tripController = require('../Controllers/Trip');

router.post('/', tripController.createTrip);
router.get('/', tripController.getTrips);
router.get('/tourguide/:tourGuideId', tripController.getTripsByTourGuideId);
router.get('/:id', tripController.getTripById);
router.put('/:id', tripController.updateTrip);
router.delete('/:id', tripController.deleteTrip);

module.exports = router;