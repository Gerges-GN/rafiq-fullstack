const TourGuideProfile = require('../Models/TourGuideProfile');
const User = require('../Models/User');
const syncUserDisplayName = require('../Services/syncUserDisplayName');
const Trip = require('../Models/Trip');
const Booking = require('../Models/Booking');
const Review = require('../Models/Review');
const Chat = require('../Models/Chat');

const GUIDE_EDIT_FIELDS = ['name', 'avatarUrl', 'bio', 'city', 'languages', 'rate', 'phone', 'email'];
const ADMIN_FIELDS = ['status', 'verified', 'rating', 'reviews', 'completedTrips'];
const PUBLIC_FIELDS = [
  '_id', 'owner', 'name', 'role', 'avatarUrl', 'bio', 'city', 'languages',
  'status', 'rate', 'rating', 'reviews', 'completedTrips', 'verified', 'createdAt', 'updatedAt',
];

function publicProfile(profile) {
  const value = profile.toObject ? profile.toObject() : { ...profile };
  return Object.fromEntries(PUBLIC_FIELDS.filter((field) => value[field] !== undefined).map((field) => [field, value[field]]));
}

function pick(source, fields) {
  return Object.fromEntries(fields.filter((field) => Object.hasOwn(source || {}, field)).map((field) => [field, source[field]]));
}

async function getPublicById(id) {
  return TourGuideProfile.findOne({ _id: id, status: 'approved', verified: true }).select(PUBLIC_FIELDS.join(' '));
}

exports.createTourGuideProfile = async (req, res) => {
  try {
    const owner = req.user.role === 'admin' ? req.body?.owner : req.user.id;
    if (!owner || !req.body?.name) return res.status(400).json({ message: 'Owner and name are required.' });
    const ownerAccount = await User.findById(owner).select('role name');
    if (!ownerAccount || ownerAccount.role !== 'tourguide') {
      return res.status(400).json({ message: 'A guide account is required for this profile.' });
    }
    if (await TourGuideProfile.findOne({ owner })) {
      return res.status(409).json({ message: 'A profile already exists for this owner.' });
    }

    const newProfile = await TourGuideProfile.create({ owner, ...pick(req.body, GUIDE_EDIT_FIELDS), name: ownerAccount.name });
    return res.status(201).json(req.user.role === 'admin' ? newProfile : publicProfile(newProfile));
  } catch {
    return res.status(400).json({ message: 'Unable to create guide profile.' });
  }
};

exports.getMyTourGuideProfile = async (req, res) => {
  try {
    const profile = await TourGuideProfile.findOne({ owner: req.user.id });
    if (!profile) return res.status(404).json({ message: 'Profile not found.' });
    return res.status(200).json(profile);
  } catch {
    return res.status(500).json({ message: 'Unable to fetch guide profile.' });
  }
};

exports.getAllTourGuideProfilesForAdmin = async (req, res) => {
  try {
    const profiles = await TourGuideProfile.find({}).sort({ createdAt: -1 });
    return res.status(200).json(profiles);
  } catch {
    return res.status(500).json({ message: 'Unable to fetch guide profiles.' });
  }
};

exports.getTourGuideProfileById = async (req, res) => {
  try {
    const profile = await getPublicById(req.params.id);
    if (!profile) return res.status(404).json({ message: 'Profile not found.' });
    return res.status(200).json(publicProfile(profile));
  } catch {
    return res.status(400).json({ message: 'Unable to fetch guide profile.' });
  }
};

exports.getTourGuideProfileByOwnerId = async (req, res) => {
  try {
    const profile = await TourGuideProfile.findOne({ owner: req.params.ownerId, status: 'approved', verified: true }).select(PUBLIC_FIELDS.join(' '));
    if (!profile) return res.status(404).json({ message: 'Profile not found.' });
    return res.status(200).json(publicProfile(profile));
  } catch {
    return res.status(400).json({ message: 'Unable to fetch guide profile.' });
  }
};

exports.getTourGuideProfiles = async (req, res) => {
  try {
    const filter = {};
    if (req.query.city) filter.city = req.query.city;
    // Only approved guides are discoverable; ignore caller-supplied status filters.
    filter.status = 'approved';
    filter.verified = true;
    const profiles = await TourGuideProfile.find(filter)
      .select(PUBLIC_FIELDS.join(' '))
      .sort({ createdAt: -1 });
    return res.status(200).json(profiles.map(publicProfile));
  } catch {
    return res.status(500).json({ message: 'Unable to fetch guide profiles.' });
  }
};

exports.updateTourGuideProfile = async (req, res) => {
  try {
    const profile = await TourGuideProfile.findById(req.params.id);
    if (!profile) return res.status(404).json({ message: 'Profile not found.' });
    const isOwner = String(profile.owner) === String(req.user.id);
    if (!isOwner && req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden.' });

    const updates = pick(req.body, req.user.role === 'admin' ? [...GUIDE_EDIT_FIELDS, ...ADMIN_FIELDS] : GUIDE_EDIT_FIELDS);
    if (!Object.keys(updates).length) return res.status(400).json({ message: 'No valid profile fields provided.' });
    if (updates.verified !== undefined && typeof updates.verified !== 'boolean') {
      return res.status(400).json({ message: 'verified must be a boolean.' });
    }
    if (updates.status !== undefined && !['pending', 'approved', 'rejected', 'suspended'].includes(updates.status)) {
      return res.status(400).json({ message: 'Invalid guide status.' });
    }

    Object.assign(profile, updates);
    await profile.save();
    if (updates.name !== undefined) {
      const account = await User.findByIdAndUpdate(profile.owner, { $set: { name: profile.name } }, { new: true, runValidators: true });
      if (!account) return res.status(404).json({ message: 'Guide account not found.' });
      try {
        await syncUserDisplayName(account._id, account.name);
      } catch {
        return res.status(503).json({ message: 'The guide name was saved, but related display names could not be refreshed. Please retry.' });
      }
    }
    if (req.user.role === 'admin' && (updates.status !== undefined || updates.verified !== undefined)) {
      const ownerRole = profile.status === 'approved' && profile.verified === true ? 'tourguide' : 'tourist';
      await User.updateOne({ _id: profile.owner, role: { $ne: 'admin' } }, { $set: { role: ownerRole } });
    }
    return res.status(200).json(req.user.role === 'admin' ? profile : publicProfile(profile));
  } catch {
    return res.status(400).json({ message: 'Unable to update guide profile.' });
  }
};

exports.deleteTourGuideProfile = async (req, res) => {
  try {
    const profile = await TourGuideProfile.findById(req.params.id);
    if (!profile) return res.status(404).json({ message: 'Profile not found.' });
    if (String(profile.owner) !== String(req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden.' });
    }
    const relatedRecords = await Promise.all([
      Trip.exists({ tourGuideId: profile.owner }),
      Booking.exists({ tourGuideId: profile.owner }),
      Review.exists({ entityType: 'Guide', tourGuideId: profile.owner }),
      Chat.exists({ tourGuideId: profile.owner }),
    ]);
    if (relatedRecords.some(Boolean)) {
      return res.status(409).json({ message: 'This Guide has trip, booking, review, or chat history and cannot be deleted.' });
    }
    await profile.deleteOne();
    await User.updateOne({ _id: profile.owner, role: 'tourguide' }, { $set: { role: 'tourist' } });
    return res.status(200).json({ message: 'Profile deleted successfully.' });
  } catch {
    return res.status(400).json({ message: 'Unable to delete guide profile.' });
  }
};
