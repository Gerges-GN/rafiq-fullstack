const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    writerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Writer id is required'],
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    edited: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

const chatSchema = new mongoose.Schema(
  {
    touristId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Tourist id is required'],
    },
    tourGuideId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Tour guide id is required'],
    },
    messages: {
      type: [messageSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Chat', chatSchema);