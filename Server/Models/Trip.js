const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    days: {
      type: Number,
      required: [true, 'Days is required'],
      min: [1, 'Days must be at least 1'],
    },
    details: {
      type: String,
      trim: true,
      default: '',
    },
    images: {
      type: [String],
      default: [],
    },
    tourGuideId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Tour guide id is required'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Trip', tripSchema);