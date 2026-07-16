const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true 
  },
  ownerName: { type: String, default: "" },
  headline: { type: String, default: "" },    // tagline
  quote: { type: String, default: "" },        // separate inspirational quote
  bio: { type: String, default: "" },
  location: { type: String, default: "" },     // "Cairo, Egypt"
  website: { type: String, default: "" },
  isVerified: { type: Boolean, default: false },
  status: {
    type: String,
    enum: {
      values: ['active', 'suspicious'],
      message: "Status must be either 'active' or 'suspicious'",
    },
    default: 'active',
  },
  languages: [{ type: String }],
  num_trips: { type: Number, default: 0 },
  num_posts: { type: Number, default: 0 },
  num_followers: { type: Number, default: 0 },
  num_following: { type: Number, default: 0 },
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  saved_posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  avatarUrl: { type: String },
  coverUrl: { type: String },
}, { timestamps: true }); // adds createdAt (your joinedDate) and updatedAt

module.exports =
  mongoose.models.Profile ||
  mongoose.model("Profile", profileSchema);