const Report = require("../Models/Report");
const Review = require("../Models/Review");
const Booking = require("../Models/Booking");
const TourGuideProfile = require("../Models/TourGuideProfile");

function dayBounds(dateInput) {
  const start = new Date(dateInput);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

// Core aggregation: builds (but does not save) the metrics for one day.
async function computeDailyMetrics(dateInput) {
  const { start, end } = dayBounds(dateInput);
  const dateRange = { $gte: start, $lt: end };

  const [reviewStats, flaggedCount, bookingsCount, guidesActive, reviewerIds, touristIds] =
    await Promise.all([
      Review.aggregate([
        { $match: { createdAt: dateRange } },
        {
          $group: {
            _id: null,
            reviewsCount: { $sum: 1 },
            avgRating: { $avg: "$rating" },
          },
        },
      ]),
      Review.countDocuments({ createdAt: dateRange, flagged: true }),
      Booking.countDocuments({ createdAt: dateRange }),
      TourGuideProfile.countDocuments({
        status: "Approved",
        verified: true,
        createdAt: { $lt: end }, // existed as of that day
      }),
      Review.distinct("reviewerId", { createdAt: dateRange }),
      Booking.distinct("touristId", { createdAt: dateRange }),
    ]);

  const reviewsCount = reviewStats[0]?.reviewsCount || 0;
  const avgRating = reviewStats[0]?.avgRating || 0;

  const activeUserSet = new Set([
    ...reviewerIds.map((id) => String(id)),
    ...touristIds.map((id) => String(id)),
  ]);

  return {
    date: start,
    reviewsCount,
    flaggedCount,
    avgRating: Number(avgRating.toFixed(2)),
    activeUsers: activeUserSet.size,
    guidesActive,
    bookingsCount,
  };
}

// POST /api/reports/generate  { date? }
// Computes and upserts the report for a given date (defaults to today).
exports.generateReport = async (req, res) => {
  try {
    const targetDate = req.body?.date ? new Date(req.body.date) : new Date();
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({ message: "Invalid date." });
    }

    const metrics = await computeDailyMetrics(targetDate);

    const report = await Report.findOneAndUpdate(
      { date: metrics.date },
      { $set: metrics },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    res.status(200).json(report);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to generate report." });
  }
};

// GET /api/reports?from=&to=
// Lists reports, optionally filtered by a date range, newest first.
exports.getReports = async (req, res) => {
  try {
    const filter = {};
    if (req.query.from || req.query.to) {
      filter.date = {};
      if (req.query.from) filter.date.$gte = new Date(req.query.from);
      if (req.query.to) filter.date.$lte = new Date(req.query.to);
    }

    const reports = await Report.find(filter).sort({ date: -1 });
    res.status(200).json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch reports." });
  }
};

// GET /api/reports/:date  (YYYY-MM-DD)
exports.getReportByDate = async (req, res) => {
  try {
    const { start, end } = dayBounds(req.params.date);
    const report = await Report.findOne({ date: { $gte: start, $lt: end } });

    if (!report) {
      return res.status(404).json({ message: "No report found for that date." });
    }
    res.status(200).json(report);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch report." });
  }
};

// DELETE /api/reports/:id
exports.deleteReport = async (req, res) => {
  try {
    const deleted = await Report.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Report not found." });
    }
    res.status(200).json({ message: "Report deleted." });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to delete report." });
  }
};