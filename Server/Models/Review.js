const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reviewer id is required'],
    },
    reviewerName: {
      type: String,
      required: [true, 'Reviewer name is required'],
      trim: true,
    },
    reviewerAvatarUrl: {
      type: String,
      default: '',
    },
    entityType: {
      type: String,
      enum: {
        values: ['Guide', 'Place'],
        message: "entityType must be either 'Guide' or 'Place'",
      },
      required: [true, 'entityType is required'],
    },
    tourGuideId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: function () {
        return this.entityType === 'Guide';
      },
    },
    placeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Place',
      required: function () {
        return this.entityType === 'Place';
      },
    },
    entityName: {
      type: String,
      required: [true, 'entityName is required'],
      trim: true,
    },
    entityAvatarUrl: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    text: {
      type: String,
      required: [true, 'Review text is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['PUBLISHED', 'FLAGGED', 'UNDER_REVIEW', 'REMOVED'],
        message: 'Invalid status value',
      },
      default: 'PUBLISHED',
    },
    action: {
      type: String,
      enum: {
        values: ['Menu', 'Delete', 'Verify'],
        message: 'Invalid status value',
      },
      default: 'Menu',
    },
    flagged: {
      type: Boolean,
      default: false,
    }
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Review || mongoose.model("Review", reviewSchema);