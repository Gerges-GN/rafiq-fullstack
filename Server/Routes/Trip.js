const express = require('express');
const router = express.Router();
const tripController = require('../Controllers/Trip');
const { verifyToken, requireRole } = require('../Middleware/Auth');

router.post('/', verifyToken, requireRole('tourguide'), tripController.createTrip);
router.get('/', tripController.getTrips);
router.get('/tourguide/:tourGuideId', tripController.getTripsByTourGuideId);
router.get('/:id', tripController.getTripById);
router.put('/:id', verifyToken, requireRole('tourguide', 'admin'), tripController.updateTrip);
router.delete('/:id', verifyToken, requireRole('tourguide', 'admin'), tripController.deleteTrip);

module.exports = router;
