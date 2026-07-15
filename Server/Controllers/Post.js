const Post = require('../Models/Post');
const Profile = require('../models/TouristProfile');

// Create Post
exports.createPost = async (req, res) => {
  try {
    const newPost = new Post(req.body);
    await newPost.save();

    // Automatically link this post to the owner's profile
    await Profile.findOneAndUpdate(
      { owner: newPost.owner },
      { 
        $push: { posts: newPost._id },
        $inc: { num_posts: 1 }
      }
    );

    res.status(201).json(newPost);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all posts (optionally filter by owner via query param)
exports.getAllPosts = async (req, res) => {
  try {
    const filter = {};
    if (req.query.owner) filter.owner = req.query.owner;

    const posts = await Post.find(filter)
                             .populate('owner', 'username email')
                             .sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single post by ID
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
                            .populate('owner', 'username email');
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all posts by a specific user
exports.getPostsByUserId = async (req, res) => {
  try {
    const posts = await Post.find({ owner: req.params.userId })
                             .populate('owner', 'username email')
                             .sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Post
exports.updatePost = async (req, res) => {
  try {
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.postId,
      { ...req.body },
      { new: true }
    );
    if (!updatedPost) return res.status(404).json({ message: "Post not found" });
    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete Post
exports.deletePost = async (req, res) => {
  try {
    const deletedPost = await Post.findByIdAndDelete(req.params.postId);
    if (!deletedPost) return res.status(404).json({ message: "Post not found" });

    // Remove the post reference from the owner's profile
    await Profile.findOneAndUpdate(
      { owner: deletedPost.owner },
      { 
        $pull: { posts: deletedPost._id },
        $inc: { num_posts: -1 }
      }
    );

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Toggle Like (increment/decrement numLikes)
exports.toggleLike = async (req, res) => {
  try {
    const { increment } = req.body; // true to like, false to unlike
    const post = await Post.findByIdAndUpdate(
      req.params.postId,
      { $inc: { numLikes: increment ? 1 : -1 } },
      { new: true }
    );
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.status(200).json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Toggle Saved
exports.toggleSaved = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.saved = !post.saved;
    await post.save();

    res.status(200).json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};