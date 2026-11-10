const Profile = require('../Models/TouristProfile');
const User = require('../Models/User');

const PROFILE_FIELDS = [
  'headline', 'quote', 'bio', 'location', 'website',
  'languages', 'avatarUrl', 'coverUrl',
];

function isOwnerOrAdmin(req, ownerId) {
  return String(req.user.id) === String(ownerId) || req.user.role === 'admin';
}

function profileUpdates(body) {
  return Object.fromEntries(PROFILE_FIELDS
    .filter((field) => Object.hasOwn(body || {}, field))
    .map((field) => [field, body[field]]));
}

exports.createProfile = async (req, res) => {
  try {
    const owner = req.user.role === 'admin' ? req.body?.owner : req.user.id;
    if (!owner) return res.status(400).json({ message: 'Profile owner is required.' });
    const ownerAccount = await User.findById(owner).select('role name');
    if (!ownerAccount || ownerAccount.role !== 'tourist') {
      return res.status(400).json({ message: 'A tourist account is required for this profile.' });
    }
    const existingProfile = await Profile.findOne({ owner });
    if (existingProfile) return res.status(409).json({ message: 'Profile already exists.' });

    const profile = await Profile.create({ owner, ...profileUpdates(req.body), ownerName: ownerAccount.name });
    return res.status(201).json(profile);
  } catch {
    return res.status(400).json({ message: 'Unable to create profile.' });
  }
};

exports.getProfileByUserId = async (req, res) => {
  try {
    if (!isOwnerOrAdmin(req, req.params.userId)) return res.status(403).json({ message: 'Forbidden.' });
    const profile = await Profile.findOne({ owner: req.params.userId })
      .populate('owner', 'name')
      .populate({ path: 'posts', select: '-saved' });
    if (!profile) return res.status(404).json({ message: 'Profile not found.' });
    return res.status(200).json(profile);
  } catch {
    return res.status(400).json({ message: 'Unable to fetch profile.' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    if (!isOwnerOrAdmin(req, req.params.userId)) return res.status(403).json({ message: 'Forbidden.' });
    const updates = profileUpdates(req.body);
    if (!Object.keys(updates).length) return res.status(400).json({ message: 'No valid profile fields provided.' });

    const profile = await Profile.findOneAndUpdate(
      { owner: req.params.userId },
      { $set: updates },
      { new: true, runValidators: true },
    );
    if (!profile) return res.status(404).json({ message: 'Profile not found.' });
    return res.status(200).json(profile);
  } catch {
    return res.status(400).json({ message: 'Unable to update profile.' });
  }
};

exports.deleteProfile = async (req, res) => {
  try {
    if (!isOwnerOrAdmin(req, req.params.userId)) return res.status(403).json({ message: 'Forbidden.' });
    const profile = await Profile.findOneAndDelete({ owner: req.params.userId });
    if (!profile) return res.status(404).json({ message: 'Profile not found.' });
    return res.status(200).json({ message: 'Profile deleted successfully.' });
  } catch {
    return res.status(400).json({ message: 'Unable to delete profile.' });
  }
};

exports.getAllProfiles = async (req, res) => {
  try {
    const filter = {};
    if (req.query.city) filter.city = req.query.city;
    const profiles = await Profile.find(filter)
      .populate('owner', 'name email')
      .populate({ path: 'posts', select: '-saved' })
      .sort({ createdAt: -1 });
    return res.status(200).json(profiles);
  } catch {
    return res.status(500).json({ message: 'Unable to fetch profiles.' });
  }
};

exports.updateProfileStatus = async (req, res) => {
  try {
    const requestedStatus = typeof req.body?.status === 'string' ? req.body.status.toLowerCase() : '';
    const status = requestedStatus === 'suspended' ? 'suspicious' : requestedStatus;
    if (!['active', 'suspicious'].includes(status)) {
      return res.status(400).json({ message: 'Status must be active or suspicious.' });
    }
    const profile = await Profile.findOneAndUpdate(
      { owner: req.params.userId },
      { $set: { status } },
      { new: true, runValidators: true },
    );
    if (!profile) return res.status(404).json({ message: 'Profile not found.' });
    return res.status(200).json({ message: 'Profile status updated.', profile });
  } catch {
    return res.status(500).json({ message: 'Unable to update profile status.' });
  }
};
