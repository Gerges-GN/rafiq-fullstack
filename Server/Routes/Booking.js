const express = require('express');
const router = express.Router();
const bookingController = require('../Controllers/Booking');
const { verifyToken, requireRole } = require('../Middleware/Auth');

router.post('/', verifyToken, requireRole('tourist'), bookingController.createBooking);
router.get('/', verifyToken, requireRole('admin'), bookingController.getBookings);
router.get('/tourist/:touristId', verifyToken, requireRole('tourist', 'admin'), bookingController.getBookingsByTouristId);
router.get('/tourguide/:tourGuideId', verifyToken, requireRole('tourguide', 'admin'), bookingController.getBookingsByTourGuideId);
router.get('/trip/:tripId', verifyToken, requireRole('admin'), bookingController.getBookingsByTripId);
router.get('/:id', verifyToken, requireRole('tourist', 'tourguide', 'admin'), bookingController.getBookingById);
router.put('/:id', verifyToken, requireRole('tourist', 'tourguide', 'admin'), bookingController.updateBooking);
router.delete('/:id', verifyToken, requireRole('admin'), bookingController.deleteBooking);

module.exports = router;
