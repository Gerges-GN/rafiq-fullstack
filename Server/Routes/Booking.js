const express = require('express');
const router = express.Router();
const bookingController = require('../Controllers/Booking');

router.post('/', bookingController.createBooking);
router.get('/', bookingController.getBookings);
router.get('/tourist/:touristId', bookingController.getBookingsByTouristId);
router.get('/tourguide/:tourGuideId', bookingController.getBookingsByTourGuideId);
router.get('/trip/:tripId', bookingController.getBookingsByTripId);
router.get('/:id', bookingController.getBookingById);
router.put('/:id', bookingController.updateBooking);
router.delete('/:id', bookingController.deleteBooking);

module.exports = router;