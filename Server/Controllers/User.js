const User = require('../Models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const TourGuideProfile = require('../Models/TourGuideProfile');
const Profile = require('../Models/TouristProfile');
const Trip = require('../Models/Trip');
const Booking = require('../Models/Booking');
const Review = require('../Models/Review');
const Post = require('../Models/Post');
const Chat = require('../Models/Chat');
const syncUserDisplayName = require('../Services/syncUserDisplayName');

const PASSWORD_HASH_ROUNDS = 12;
const ACCOUNT_FIELDS = ['name', 'email', 'location'];

function toSafeUser(user) {
  const safeUser = user.toObject ? user.toObject() : { ...user };
  delete safeUser.password;
  return safeUser;
}

// Create
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, location, accountType } = req.body || {};
    const normalizedName = typeof name === 'string' ? name.trim() : '';
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const normalizedLocation = typeof location === 'string' ? location.trim() : '';

    if (!normalizedName || !normalizedEmail || !normalizedLocation || typeof password !== 'string') {
      return res.status(400).json({ message: 'Name, email, password, and location are required.' });
    }
    if (normalizedName.length > 100 || normalizedEmail.length > 254 || normalizedLocation.length > 200) {
      return res.status(400).json({ message: 'One or more registration fields are too long.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ message: 'A valid email address is required.' });
    }
    if (password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
      return res.status(400).json({ message: 'Password must be between 8 and 72 characters.' });
    }
    if (accountType !== undefined && !['tourist', 'tourguide'].includes(accountType)) {
      return res.status(400).json({ message: 'Account type must be tourist or tourguide.' });
    }

    const isGuideApplication = accountType === 'tourguide';
    const guideFields = req.body?.guideProfile || {};
    if (isGuideApplication) {
      const languages = Array.isArray(guideFields.languages)
        ? [...new Set(guideFields.languages.map((item) => typeof item === 'string' ? item.trim() : '').filter(Boolean))]
        : [];
      if (!guideFields.bio?.trim() || !guideFields.city?.trim() || languages.length === 0) {
        return res.status(400).json({ message: 'Guide applications require a short bio, operating city, and at least one language.' });
      }
      if (guideFields.bio.trim().length > 1000 || guideFields.city.trim().length > 100 || languages.length > 8) {
        return res.status(400).json({ message: 'One or more guide application fields are too long.' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, PASSWORD_HASH_ROUNDS);
    const newUser = new User({
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
      location: normalizedLocation,
      role: 'tourist',
    });
    try {
      await newUser.save();
      if (isGuideApplication) {
        const languages = [...new Set(guideFields.languages.map((item) => item.trim()).filter(Boolean))];
        await TourGuideProfile.create({
          owner: newUser._id,
          name: normalizedName,
          email: normalizedEmail,
          phone: typeof guideFields.phone === 'string' ? guideFields.phone.trim().slice(0, 40) : '',
          bio: guideFields.bio.trim(),
          city: guideFields.city.trim(),
          languages,
          status: 'pending',
          verified: false,
        });
        await Profile.create({
          owner: newUser._id,
          ownerName: normalizedName,
          bio: guideFields.bio.trim(),
          location: normalizedLocation,
          languages,
        });
      }
    } catch (error) {
      if (newUser._id) {
        await TourGuideProfile.deleteOne({ owner: newUser._id }).catch(() => {});
        await Profile.deleteOne({ owner: newUser._id }).catch(() => {});
      }
      if (newUser._id) await User.deleteOne({ _id: newUser._id }).catch(() => {});
      throw error;
    }
    return res.status(201).json({
      message: isGuideApplication ? 'Guide application submitted for admin review.' : 'User created',
      applicationStatus: isGuideApplication ? 'pending' : undefined,
      user: toSafeUser(newUser),
    });
  } catch (error) {
    res.status(400).json({ message: 'Unable to create user.' });
  }
};

// Update
exports.updateUser = async (req, res) => {
  try {
    const isSelf = req.user.id === req.params.id;
    if (!isSelf && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden.' });
    }

    const updates = {};
    for (const field of ACCOUNT_FIELDS) {
      if (Object.hasOwn(req.body || {}, field)) updates[field] = req.body[field];
    }
    if (typeof updates.name === 'string') updates.name = updates.name.trim();
    if (typeof updates.email === 'string') updates.email = updates.email.trim().toLowerCase();
    if (typeof updates.location === 'string') updates.location = updates.location.trim();
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid account fields provided.' });
    }
    if (Object.values(updates).some((value) => typeof value !== 'string' || !value.trim())) {
      return res.status(400).json({ message: 'Account fields must be non-empty strings.' });
    }
    if (updates.name && updates.name.length > 100 || updates.email && updates.email.length > 254 || updates.location && updates.location.length > 200) {
      return res.status(400).json({ message: 'One or more account fields are too long.' });
    }
    if (updates.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.email)) {
      return res.status(400).json({ message: 'A valid email address is required.' });
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true });
    if (!updatedUser) return res.status(404).json({ message: 'User not found.' });
    if (updates.name) {
      try {
        await syncUserDisplayName(updatedUser._id, updatedUser.name);
      } catch {
        return res.status(503).json({ message: 'Your account name was saved, but related display names could not be refreshed. Please retry.' });
      }
    }
    return res.status(200).json({ user: toSafeUser(updatedUser) });
  } catch {
    return res.status(400).json({ message: 'Unable to update user.' });
  }
};

// Delete
exports.deleteUser = async (req, res) => {
  try {
    const target = await User.findById(req.params.id).select('role');
    if (!target) return res.status(404).json({ message: 'User not found.' });
    if (target.role === 'admin') return res.status(403).json({ message: 'Admin accounts cannot be deleted through this endpoint.' });

    const relatedRecords = await Promise.all([
      Profile.exists({ owner: req.params.id }),
      TourGuideProfile.exists({ owner: req.params.id }),
      Trip.exists({ tourGuideId: req.params.id }),
      Booking.exists({ $or: [{ touristId: req.params.id }, { tourGuideId: req.params.id }] }),
      Review.exists({ $or: [{ reviewerId: req.params.id }, { tourGuideId: req.params.id }] }),
      Post.exists({ owner: req.params.id }),
      Chat.exists({ $or: [{ touristId: req.params.id }, { tourGuideId: req.params.id }] }),
    ]);
    if (relatedRecords.some(Boolean)) {
      return res.status(409).json({ message: 'This account has travel records and cannot be deleted from this screen.' });
    }

    await User.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: 'User deleted.' });
  } catch {
    return res.status(400).json({ message: 'Unable to delete user.' });
  }
};

// Get User by ID
exports.getUserById = async (req, res) => {
  try {
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden.' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    return res.status(200).json({ user: toSafeUser(user) });
  } catch {
    return res.status(400).json({ message: 'Unable to fetch user.' });
  }
};

// GET /api/users/me — identity comes only from the verified JWT claims.
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(401).json({ message: 'Authentication required.' });
    const guideApplication = user.role === 'tourist'
      ? await TourGuideProfile.findOne({ owner: user._id, status: { $in: ['pending', 'rejected', 'suspended'] } }).select('status')
      : null;
    return res.status(200).json({ user: { ...toSafeUser(user), guideApplicationStatus: guideApplication?.status || null } });
  } catch {
    return res.status(500).json({ message: 'Unable to fetch current user.' });
  }
};

// Login
exports.loginUser = async (req, res) => {
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = req.body?.password;
    if (!email || typeof password !== 'string') {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
 
    const user = await User.findOne({ email }).select('+password');
    if (!user || typeof password !== 'string' || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
 
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const pendingGuideProfile = user.role === 'tourist'
      ? await TourGuideProfile.findOne({ owner: user._id, status: { $in: ['pending', 'rejected', 'suspended'] } }).select('status')
      : null;

    res.status(200).json({ token, user: toSafeUser(user), guideApplicationStatus: pendingGuideProfile?.status || null });
  } catch (error) {
    res.status(500).json({ message: 'Unable to authenticate.' });
  }
};
