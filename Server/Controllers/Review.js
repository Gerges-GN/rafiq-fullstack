const Review = require('../Models/Review');

// POST /api/reviews
exports.createReview = async (req, res) => {
  try {
    const { reviewerId, entityType, entityName } = req.body;

    if (!reviewerId || !entityType || !entityName) {
      return res
        .status(400)
        .json({ message: 'reviewerId, entityType, and entityName are required.' });
    }

    const newReview = await Review.create(req.body);

    res.status(201).json(newReview);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/reviews/:id
exports.getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.status(200).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/reviews/reviewer/:reviewerId
exports.getReviewsByReviewerId = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewerId: req.params.reviewerId }).sort({
      createdAt: -1,
    });

    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/reviews/tourguide/:tourGuideId
exports.getReviewsByTourGuideId = async (req, res) => {
  try {
    const reviews = await Review.find({ tourGuideId: req.params.tourGuideId }).sort({
      createdAt: -1,
    });

    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/reviews/place/:placeId
exports.getReviewsByPlaceId = async (req, res) => {
  try {
    const reviews = await Review.find({ placeId: req.params.placeId }).sort({
      createdAt: -1,
    });

    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/reviews
exports.getReviews = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};

    if (status) filter.status = status;

    const reviews = await Review.find(filter).sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/reviews/:id
exports.updateReview = async (req, res) => {
  try {
    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedReview) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.status(200).json(updatedReview);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/reviews/:id
exports.deleteReview = async (req, res) => {
  try {
    const deletedReview = await Review.findByIdAndDelete(req.params.id);

    if (!deletedReview) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};