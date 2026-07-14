const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    touristId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Tourist id is required'],
    },
    touristName: {
      type: String,
      required: [true, 'Tourist name is required'],
      trim: true,
    },
    touristimg: {
      type: String,
      required: [true, 'Tourist image is required'],
      trim: true,
    },
    tourguideimg: {
      type: String,
      required: [true, 'Tour guide image is required'],
      trim: true,
    },
    tourGuideId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Tour guide id is required'],
    },
    tourGuideName: {
      type: String,
      required: [true, 'Tour guide name is required'],
      trim: true,
    },
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: [true, 'Trip id is required'],
    },
    tripTitle: {
      type: String,
      required: [true, 'Trip title is required'],
      trim: true,
    },
    duration: {
      type: String,
      required: [true, 'Duration is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'Confirmed', 'Cancelled', 'Completed'],
        message: 'Status must be one of Pending, Confirmed, Cancelled, or Completed',
      },
      default: 'Pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);