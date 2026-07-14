// models/Report.js
//
// ASSUMPTIONS (adjust if wrong):
//   - CommonJS + Mongoose, matching a typical Express backend (swap to
//     `import`/`export` if your project uses ES modules).
//   - One report document per calendar day → `date` is stored at
//     midnight UTC and has a unique index so re-running the generator
//     for the same day upserts instead of duplicating.

const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      unique: true, // one aggregate row per day
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    flaggedCount: {
      type: Number,
      default: 0,
    },
    avgRating: {
      type: Number,
      default: 0,
    },
    activeUsers: {
      type: Number,
      default: 0,
    },
    guidesActive: {
      type: Number,
      default: 0,
    },
    bookingsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    // adds createdAt automatically; we don't need updatedAt for an
    // immutable daily snapshot, but Mongoose requires both if you use
    // `timestamps: true`, so we set createdAt manually instead below.
    timestamps: { createdAt: true, updatedAt: false },
  },
);

module.exports = mongoose.model("Report", reportSchema);