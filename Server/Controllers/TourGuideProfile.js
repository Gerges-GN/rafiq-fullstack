const TourGuideProfile = require('../Models/TourGuideProfile');

// POST /api/tourguide-profiles
exports.createTourGuideProfile = async (req, res) => {
  try {
    const { owner, name } = req.body;

    if (!owner || !name) {
      return res
        .status(400)
        .json({ message: 'owner and name are required.' });
    }

    const existing = await TourGuideProfile.findOne({ owner });

    if (existing) {
      return res
        .status(400)
        .json({ message: 'A profile already exists for this owner.' });
    }

    const newProfile = await TourGuideProfile.create(req.body);

    res.status(201).json(newProfile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/tourguide-profiles/:id
exports.getTourGuideProfileById = async (req, res) => {
  try {
    const profile = await TourGuideProfile.findById(req.params.id);

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.status(200).json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/tourguide-profiles/owner/:ownerId
exports.getTourGuideProfileByOwnerId = async (req, res) => {
  try {
    const profile = await TourGuideProfile.findOne({ owner: req.params.ownerId });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.status(200).json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/tourguide-profiles
exports.getTourGuideProfiles = async (req, res) => {
  try {
    const { city, verified } = req.query;

    const filter = {};

    if (city) filter.city = city;
    if (verified !== undefined) filter.verified = verified === 'true';

    const profiles = await TourGuideProfile.find(filter).sort({ createdAt: -1 });

    res.status(200).json(profiles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/tourguide-profiles/:id
exports.updateTourGuideProfile = async (req, res) => {
  try {
    const updatedProfile = await TourGuideProfile.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.status(200).json(updatedProfile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/tourguide-profiles/:id
exports.deleteTourGuideProfile = async (req, res) => {
  try {
    const deletedProfile = await TourGuideProfile.findByIdAndDelete(req.params.id);

    if (!deletedProfile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.status(200).json({ message: 'Profile deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};