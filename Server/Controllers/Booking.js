const Booking = require('../Models/Booking');

// POST /api/bookings
exports.createBooking = async (req, res) => {
  try {
    const { touristId, tourGuideId, tripId } = req.body;

    if (!touristId || !tourGuideId || !tripId) {
      return res
        .status(400)
        .json({ message: 'touristId, tourGuideId, and tripId are required.' });
    }

    const newBooking = await Booking.create(req.body);

    res.status(201).json(newBooking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/bookings/:id
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.status(200).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/bookings/tourist/:touristId
exports.getBookingsByTouristId = async (req, res) => {
  try {
    const bookings = await Booking.find({ touristId: req.params.touristId }).sort({
      createdAt: -1,
    });

    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/bookings/tourguide/:tourGuideId
exports.getBookingsByTourGuideId = async (req, res) => {
  try {
    const bookings = await Booking.find({ tourGuideId: req.params.tourGuideId }).sort({
      createdAt: -1,
    });

    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/bookings/trip/:tripId
exports.getBookingsByTripId = async (req, res) => {
  try {
    const bookings = await Booking.find({ tripId: req.params.tripId }).sort({
      createdAt: -1,
    });

    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/bookings
exports.getBookings = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};

    if (status) filter.status = status;

    const bookings = await Booking.find(filter).sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/bookings/:id
exports.updateBooking = async (req, res) => {
  try {
    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.status(200).json(updatedBooking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/bookings/:id
exports.deleteBooking = async (req, res) => {
  try {
    const deletedBooking = await Booking.findByIdAndDelete(req.params.id);

    if (!deletedBooking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.status(200).json({ message: 'Booking deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};