const Profile = require('../models/TouristProfile');

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