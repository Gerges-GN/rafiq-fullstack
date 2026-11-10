const Booking = require('../Models/Booking');
const Trip = require('../Models/Trip');
const User = require('../Models/User');
const Profile = require('../Models/TouristProfile');
const TourGuideProfile = require('../Models/TourGuideProfile');

const BOOKING_STATUSES = ['Pending', 'Confirmed', 'Cancelled', 'Completed'];

function isParticipant(booking, userId) {
  return String(booking.touristId) === String(userId) || String(booking.tourGuideId) === String(userId);
}

async function sortedBookings(filter) {
  return Booking.find(filter).sort({ createdAt: -1 });
}

exports.createBooking = async (req, res) => {
  try {
    const tripId = req.body?.tripId;
    if (!tripId) return res.status(400).json({ message: 'tripId is required.' });
    const [trip, tourist, touristProfile] = await Promise.all([
      Trip.findById(tripId),
      User.findById(req.user.id).select('name'),
      Profile.findOne({ owner: req.user.id }).select('avatarUrl'),
    ]);
    if (!trip) return res.status(404).json({ message: 'Trip not found.' });
    if (!tourist) return res.status(401).json({ message: 'Authentication required.' });
    const [guideProfile, guide] = await Promise.all([
      TourGuideProfile.findOne({ owner: trip.tourGuideId }).select('avatarUrl status verified'),
      User.findById(trip.tourGuideId).select('name'),
    ]);
    if (!guideProfile || guideProfile.status !== 'approved' || guideProfile.verified !== true || !guide) {
      return res.status(409).json({ message: 'The guide profile is unavailable.' });
    }

    const booking = await Booking.create({
      touristId: req.user.id,
      touristName: tourist.name,
      touristimg: touristProfile?.avatarUrl || '',
      tourGuideId: trip.tourGuideId,
      tourGuideName: guide.name,
      tourguideimg: guideProfile.avatarUrl || '',
      tripId: trip._id,
      tripTitle: trip.title,
      duration: `${trip.days} ${trip.days === 1 ? 'Day' : 'Days'}`,
      status: 'Pending',
    });
    return res.status(201).json(booking);
  } catch {
    return res.status(400).json({ message: 'Unable to create booking.' });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });
    if (req.user.role !== 'admin' && !isParticipant(booking, req.user.id)) {
      return res.status(404).json({ message: 'Booking not found.' });
    }
    return res.status(200).json(booking);
  } catch {
    return res.status(400).json({ message: 'Unable to fetch booking.' });
  }
};

exports.getBookingsByTouristId = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && String(req.params.touristId) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Forbidden.' });
    }
    return res.status(200).json(await sortedBookings({ touristId: req.params.touristId }));
  } catch {
    return res.status(500).json({ message: 'Unable to fetch bookings.' });
  }
};

exports.getBookingsByTourGuideId = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && String(req.params.tourGuideId) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Forbidden.' });
    }
    return res.status(200).json(await sortedBookings({ tourGuideId: req.params.tourGuideId }));
  } catch {
    return res.status(500).json({ message: 'Unable to fetch bookings.' });
  }
};

exports.getBookingsByTripId = async (req, res) => {
  try {
    return res.status(200).json(await sortedBookings({ tripId: req.params.tripId }));
  } catch {
    return res.status(500).json({ message: 'Unable to fetch bookings.' });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const filter = {};
    if (BOOKING_STATUSES.includes(req.query.status)) filter.status = req.query.status;
    return res.status(200).json(await sortedBookings(filter));
  } catch {
    return res.status(500).json({ message: 'Unable to fetch bookings.' });
  }
};

exports.updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });
    if (req.user.role !== 'admin' && !isParticipant(booking, req.user.id)) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    const status = req.body?.status;
    if (!BOOKING_STATUSES.includes(status)) return res.status(400).json({ message: 'Invalid booking status.' });
    if (req.user.role === 'admin') {
      booking.status = status;
    } else if (String(booking.touristId) === String(req.user.id)) {
      if (booking.status !== 'Pending' || status !== 'Cancelled') {
        return res.status(403).json({ message: 'Tourists may only cancel pending bookings.' });
      }
      booking.status = status;
    } else {
      if (booking.status !== 'Pending' || !['Confirmed', 'Cancelled'].includes(status)) {
        return res.status(403).json({ message: 'Guides may only confirm or cancel pending bookings.' });
      }
      booking.status = status;
    }

    await booking.save();
    return res.status(200).json(booking);
  } catch {
    return res.status(400).json({ message: 'Unable to update booking.' });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });
    return res.status(200).json({ message: 'Booking deleted successfully.' });
  } catch {
    return res.status(400).json({ message: 'Unable to delete booking.' });
  }
};
