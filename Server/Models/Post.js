const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  images: [{ type: String, required: true }],
  tripLocation: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  numLikes: { type: Number, default: 0 },
  saved: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);