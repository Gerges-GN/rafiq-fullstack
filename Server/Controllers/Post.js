const Post = require('../Models/Post');
const Profile = require('../Models/TouristProfile');
const TourGuideProfile = require('../Models/TourGuideProfile');
const User = require('../Models/User');

const EDIT_FIELDS = ['images', 'tripLocation', 'title', 'description'];

function safePost(post) {
  const value = post.toObject ? post.toObject() : { ...post };
  delete value.saved;
  return value;
}

async function withAuthor(post) {
  const value = safePost(post);
  const ownerId = value.owner?._id || value.owner;
  const account = await User.findById(ownerId).select('name role');
  const profile = account?.role === 'tourguide'
    ? await TourGuideProfile.findOne({ owner: ownerId }).select('avatarUrl')
    : await Profile.findOne({ owner: ownerId }).select('avatarUrl');
  return {
    ...value,
    author: {
      _id: String(ownerId),
      name: account?.name || 'Unknown traveler',
      avatarUrl: profile?.avatarUrl || '',
    },
  };
}

function isOwnerOrAdmin(req, post) {
  return String(post.owner?._id || post.owner) === String(req.user.id) || req.user.role === 'admin';
}

function pick(body, fields) {
  return Object.fromEntries(fields.filter((field) => Object.hasOwn(body || {}, field)).map((field) => [field, body[field]]));
}

function validatePostFields(fields, { creating = false } = {}) {
  if (creating && (!fields.title || !fields.tripLocation || !fields.images)) return 'Title, trip location, and at least one image are required.';
  if (fields.title !== undefined && (typeof fields.title !== 'string' || !fields.title.trim() || fields.title.trim().length > 150)) return 'Title must be between 1 and 150 characters.';
  if (fields.tripLocation !== undefined && (typeof fields.tripLocation !== 'string' || !fields.tripLocation.trim() || fields.tripLocation.trim().length > 150)) return 'Trip location must be between 1 and 150 characters.';
  if (fields.description !== undefined && (typeof fields.description !== 'string' || fields.description.length > 5000)) return 'Description must be 5,000 characters or fewer.';
  if (fields.images !== undefined && (!Array.isArray(fields.images) || fields.images.length < 1 || fields.images.length > 6 || fields.images.some((url) => {
    if (typeof url !== 'string' || url.length > 2048) return true;
    try { return new URL(url).protocol !== 'https:'; } catch { return true; }
  }))) {
    return 'Add between one and six valid HTTPS image URLs.';
  }
  return null;
}

exports.createPost = async (req, res) => {
  try {
    if (req.user.role === 'tourist') {
      const profile = await Profile.findOne({ owner: req.user.id }).select('bio location');
      const missingFields = ['bio', 'location'].filter((field) => !profile?.[field]?.trim());
      if (missingFields.length) {
        return res.status(409).json({
          code: 'PROFILE_INCOMPLETE',
          message: 'Complete your profile bio and location before adding a memory.',
          missingFields,
        });
      }
    }

    const fields = pick(req.body, EDIT_FIELDS);
    const validationError = validatePostFields(fields, { creating: true });
    if (validationError) return res.status(400).json({ message: validationError });
    if (fields.title) fields.title = fields.title.trim();
    if (fields.tripLocation) fields.tripLocation = fields.tripLocation.trim();
    const post = await Post.create({ owner: req.user.id, ...fields });
    await Profile.findOneAndUpdate(
      { owner: req.user.id },
      { $addToSet: { posts: post._id }, $inc: { num_posts: 1 } },
    );
    return res.status(201).json(await withAuthor(post));
  } catch {
    return res.status(400).json({ message: 'Unable to create post.' });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    const filter = {};
    if (req.query.owner) filter.owner = req.query.owner;
    const posts = await Post.find(filter)
      .select('-saved')
      .populate('owner', 'name')
      .sort({ createdAt: -1 });
    return res.status(200).json(await Promise.all(posts.map(withAuthor)));
  } catch {
    return res.status(500).json({ message: 'Unable to fetch posts.' });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId).select('-saved').populate('owner', 'name');
    if (!post) return res.status(404).json({ message: 'Post not found.' });
    return res.status(200).json(await withAuthor(post));
  } catch {
    return res.status(400).json({ message: 'Unable to fetch post.' });
  }
};

exports.getPostsByUserId = async (req, res) => {
  try {
    const posts = await Post.find({ owner: req.params.userId })
      .select('-saved')
      .populate('owner', 'name')
      .sort({ createdAt: -1 });
    return res.status(200).json(await Promise.all(posts.map(withAuthor)));
  } catch {
    return res.status(400).json({ message: 'Unable to fetch posts.' });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found.' });
    if (!isOwnerOrAdmin(req, post)) return res.status(403).json({ message: 'Forbidden.' });
    const updates = pick(req.body, EDIT_FIELDS);
    if (!Object.keys(updates).length) return res.status(400).json({ message: 'No valid post fields provided.' });
    const validationError = validatePostFields(updates);
    if (validationError) return res.status(400).json({ message: validationError });
    if (updates.title) updates.title = updates.title.trim();
    if (updates.tripLocation) updates.tripLocation = updates.tripLocation.trim();
    Object.assign(post, updates);
    await post.save();
    return res.status(200).json(await withAuthor(post));
  } catch {
    return res.status(400).json({ message: 'Unable to update post.' });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: 'Post not found.' });
    if (!isOwnerOrAdmin(req, post)) return res.status(403).json({ message: 'Forbidden.' });
    await post.deleteOne();
    await Profile.findOneAndUpdate(
      { owner: post.owner },
      { $pull: { posts: post._id }, $inc: { num_posts: -1 } },
    );
    return res.status(200).json({ message: 'Post deleted successfully.' });
  } catch {
    return res.status(400).json({ message: 'Unable to delete post.' });
  }
};

exports.toggleLike = async (req, res) => {
  try {
    if (typeof req.body?.increment !== 'boolean') {
      return res.status(400).json({ message: 'increment must be a boolean.' });
    }
    const update = req.body.increment ? { $inc: { numLikes: 1 } } : { $inc: { numLikes: -1 } };
    const conditions = req.body.increment ? { _id: req.params.postId } : { _id: req.params.postId, numLikes: { $gt: 0 } };
    const post = await Post.findOneAndUpdate(conditions, update, { new: true }).select('-saved');
    if (!post) return res.status(404).json({ message: 'Post not found.' });
    return res.status(200).json(await withAuthor(post));
  } catch {
    return res.status(400).json({ message: 'Unable to update like count.' });
  }
};

exports.toggleSaved = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId).select('_id');
    if (!post) return res.status(404).json({ message: 'Post not found.' });
    const profile = await Profile.findOne({ owner: req.user.id }).select('saved_posts');
    if (!profile) return res.status(404).json({ message: 'Profile not found.' });
    const isSaved = profile.saved_posts.some((id) => String(id) === String(post._id));
    await Profile.findOneAndUpdate(
      { owner: req.user.id },
      isSaved ? { $pull: { saved_posts: post._id } } : { $addToSet: { saved_posts: post._id } },
    );
    return res.status(200).json({ postId: post._id, saved: !isSaved });
  } catch {
    return res.status(400).json({ message: 'Unable to update saved posts.' });
  }
};
