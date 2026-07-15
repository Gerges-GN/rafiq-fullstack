const Profile = require('../Models/TouristProfile');

// Create Profile
exports.createProfile = async (req, res) => {
  try {
    // We expect the user ID to be passed in the request body as 'owner'
    const { owner } = req.body;

    const existingProfile = await Profile.findOne({ owner });
    if (existingProfile) return res.status(400).json({ message: "Profile already exists" });

    const newProfile = new Profile(req.body);
    await newProfile.save();
    res.status(201).json(newProfile);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get Profile by User ID (No changes needed here, it uses req.params)
exports.getProfileByUserId = async (req, res) => {
  try {
    const profile = await Profile.findOne({ owner: req.params.userId })
      .populate('owner', 'username email')
      .populate('posts');
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Profile
exports.updateProfile = async (req, res) => {
  try {
    // We use the User ID passed in the URL (req.params.userId)
    const updatedProfile = await Profile.findOneAndUpdate(
      { owner: req.params.userId },
      { ...req.body },
      { new: true }
    );
    if (!updatedProfile) return res.status(404).json({ message: "Profile not found" });
    res.status(200).json(updatedProfile);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
// Delete Profile
exports.deleteProfile = async (req, res) => {
  try {
    // We use the User ID passed in the URL (req.params.userId)
    const deleted = await Profile.findOneAndDelete({ owner: req.params.userId });
    if (!deleted) return res.status(404).json({ message: "Profile not found" });
    res.status(200).json({ message: "Profile deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get All Profiles with filtering and sorting
exports.getAllProfiles = async (req, res) => {
  try {
    // Extract query parameters (e.g., /api/profiles?city=Cairo)
    const { city } = req.query;

    const filter = {};

    // Apply filter if city is provided
    if (city) filter.city = city;

    const profiles = await Profile.find(filter)
      .populate('owner', 'username email')
      .populate('posts')
      .sort({ createdAt: -1 }); // Default sorting by newest first

    res.status(200).json(profiles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PATCH /api/profiles/:userId/status
exports.updateProfileStatus = async (req, res) => {
  try {
    const { status } = req.body;


    const profile = await Profile.findOneAndUpdate(
      { owner: req.params.userId },
      { $set: { status } },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!profile) {
      return res.status(404).json({
        message: "Profile not found",
      });
    }

    res.status(200).json({
      message: "Profile status updated successfully",
      profile,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};