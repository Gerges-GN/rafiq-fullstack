const Trip = require('../Models/Trip');
const TourGuideProfile = require('../Models/TourGuideProfile');
const Booking = require('../Models/Booking');

const EDIT_FIELDS = ['title', 'location', 'days', 'details', 'images'];

function pick(body, fields) {
  return Object.fromEntries(fields.filter((field) => Object.hasOwn(body || {}, field)).map((field) => [field, body[field]]));
}

function isOwnerOrAdmin(req, trip) {
  return String(trip.tourGuideId) === String(req.user.id) || req.user.role === 'admin';
}

exports.createTrip = async (req, res) => {
  try {
    const fields = pick(req.body, EDIT_FIELDS);
    if (!fields.title || !fields.location || !fields.days) {
      return res.status(400).json({ message: 'Title, location, and days are required.' });
    }
    const guideProfile = await TourGuideProfile.findOne({ owner: req.user.id }).select('status verified');
    if (!guideProfile || guideProfile.status !== 'approved' || guideProfile.verified !== true) {
      return res.status(403).json({ message: 'Only approved, verified guides can publish trips.' });
    }
    const trip = await Trip.create({ ...fields, tourGuideId: req.user.id });
    return res.status(201).json(trip);
  } catch {
    return res.status(400).json({ message: 'Unable to create trip.' });
  }
};

exports.getTrips = async (req, res) => {
  try {
    const filter = {};
    if (req.query.location) filter.location = req.query.location;
    if (req.query.tourGuideId) filter.tourGuideId = req.query.tourGuideId;
    const trips = await Trip.find(filter).sort({ createdAt: -1 });
    return res.status(200).json(trips);
  } catch {
    return res.status(500).json({ message: 'Unable to fetch trips.' });
  }
};

exports.getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found.' });
    return res.status(200).json(trip);
  } catch {
    return res.status(400).json({ message: 'Unable to fetch trip.' });
  }
};

exports.updateTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found.' });
    if (!isOwnerOrAdmin(req, trip)) return res.status(403).json({ message: 'Forbidden.' });
    const updates = pick(req.body, EDIT_FIELDS);
    if (!Object.keys(updates).length) return res.status(400).json({ message: 'No valid trip fields provided.' });
    Object.assign(trip, updates);
    await trip.save();
    return res.status(200).json(trip);
  } catch {
    return res.status(400).json({ message: 'Unable to update trip.' });
  }
};

exports.deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found.' });
    if (!isOwnerOrAdmin(req, trip)) return res.status(403).json({ message: 'Forbidden.' });
    if (await Booking.exists({ tripId: trip._id })) {
      return res.status(409).json({ message: 'This trip has bookings and cannot be deleted while those records exist.' });
    }
    await trip.deleteOne();
    return res.status(200).json({ message: 'Trip deleted successfully.' });
  } catch {
    return res.status(400).json({ message: 'Unable to delete trip.' });
  }
};

exports.getTripsByTourGuideId = async (req, res) => {
  try {
    const trips = await Trip.find({ tourGuideId: req.params.tourGuideId }).sort({ createdAt: -1 });
    return res.status(200).json(trips);
  } catch {
    return res.status(400).json({ message: 'Unable to fetch trips.' });
  }
};
