const Trip = require('../Models/Trip');

// POST /api/trips
exports.createTrip = async (req, res) => {
  try {
    const { title, location, days, details, images, tourGuideId } = req.body;

    if (!title || !location || !days || !tourGuideId) {
      return res
        .status(400)
        .json({ message: 'Title, location, days, and tourGuideId are required.' });
    }

    const newTrip = await Trip.create({
      title,
      location,
      days,
      details,
      images,
      tourGuideId,
    });

    res.status(201).json(newTrip);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/trips  (supports ?location=&tourGuideId=)
exports.getTrips = async (req, res) => {
  try {
    const { location, tourGuideId } = req.query;

    const filter = {};

    if (location) filter.location = location;
    if (tourGuideId) filter.tourGuideId = tourGuideId;

    const trips = await Trip.find(filter).sort({ createdAt: -1 });

    res.status(200).json(trips);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/trips/:id
exports.getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    res.status(200).json(trip);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/trips/:id
exports.updateTrip = async (req, res) => {
  try {
    const updatedTrip = await Trip.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedTrip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    res.status(200).json(updatedTrip);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/trips/:id
exports.deleteTrip = async (req, res) => {
  try {
    const deletedTrip = await Trip.findByIdAndDelete(req.params.id);

    if (!deletedTrip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    res.status(200).json({ message: 'Trip deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/trips/tourguide/:tourGuideId
exports.getTripsByTourGuideId = async (req, res) => {
  try {
    const { tourGuideId } = req.params;

    const trips = await Trip.find({ tourGuideId }).sort({ createdAt: -1 });

    res.status(200).json(trips);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};