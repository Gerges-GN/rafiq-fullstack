const Review = require('../Models/Review');
const User = require('../Models/User');
const Place = require('../Models/Place');
const Profile = require('../Models/TouristProfile');
const TourGuideProfile = require('../Models/TourGuideProfile');

const PUBLIC_FIELDS = [
  '_id', 'reviewerName', 'reviewerAvatarUrl', 'entityType', 'tourGuideId', 'placeId',
  'entityName', 'entityAvatarUrl', 'rating', 'text', 'createdAt', 'updatedAt',
];

function publicReview(review) {
  const value = review.toObject ? review.toObject() : { ...review };
  return Object.fromEntries(PUBLIC_FIELDS.filter((field) => value[field] !== undefined).map((field) => [field, value[field]]));
}

function isAuthorOrAdmin(req, review) {
  return String(review.reviewerId) === String(req.user.id) || req.user.role === 'admin';
}

async function publicReviews(filter) {
  const rows = await Review.find({ ...filter, status: 'PUBLISHED' }).sort({ createdAt: -1 });
  return rows.map(publicReview);
}

exports.createReview = async (req, res) => {
  try {
    const { entityType, rating, text } = req.body || {};
    if (!['Guide', 'Place'].includes(entityType) || !Number.isInteger(rating) || rating < 1 || rating > 5 || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ message: 'A valid review target, rating, and text are required.' });
    }

    const [reviewer, profile] = await Promise.all([
      User.findById(req.user.id).select('name'),
      req.user.role === 'tourguide'
        ? TourGuideProfile.findOne({ owner: req.user.id }).select('avatarUrl')
        : Profile.findOne({ owner: req.user.id }).select('avatarUrl'),
    ]);
    if (!reviewer) return res.status(401).json({ message: 'Authentication required.' });

    let target;
    let targetFields;
    if (entityType === 'Guide') {
      target = await TourGuideProfile.findOne({ owner: req.body.tourGuideId }).select('owner name avatarUrl status verified');
      if (!target || target.status !== 'approved' || target.verified !== true) {
        return res.status(404).json({ message: 'Review target not found.' });
      }
      const targetAccount = await User.findById(target.owner).select('name');
      if (!targetAccount) return res.status(404).json({ message: 'Review target not found.' });
      targetFields = { tourGuideId: target.owner, entityName: targetAccount.name, entityAvatarUrl: target.avatarUrl || '' };
    } else {
      target = await Place.findById(req.body.placeId).select('name imageUrl');
      if (!target) return res.status(404).json({ message: 'Review target not found.' });
      targetFields = { placeId: target._id, entityName: target.name, entityAvatarUrl: target.imageUrl || '' };
    }

    const review = await Review.create({
      reviewerId: req.user.id,
      reviewerName: reviewer.name,
      reviewerAvatarUrl: profile?.avatarUrl || '',
      entityType,
      ...targetFields,
      rating,
      text: text.trim().slice(0, 5000),
      status: 'PUBLISHED',
    });
    return res.status(201).json(publicReview(review));
  } catch {
    return res.status(400).json({ message: 'Unable to create review.' });
  }
};

exports.getReviewById = async (req, res) => {
  try {
    const review = await Review.findOne({ _id: req.params.id, status: 'PUBLISHED' });
    if (!review) return res.status(404).json({ message: 'Review not found.' });
    return res.status(200).json(publicReview(review));
  } catch {
    return res.status(400).json({ message: 'Unable to fetch review.' });
  }
};

exports.getReviewsByReviewerId = async (req, res) => {
  try {
    return res.status(200).json(await publicReviews({ reviewerId: req.params.reviewerId }));
  } catch {
    return res.status(500).json({ message: 'Unable to fetch reviews.' });
  }
};

exports.getReviewsByTourGuideId = async (req, res) => {
  try {
    return res.status(200).json(await publicReviews({ tourGuideId: req.params.tourGuideId }));
  } catch {
    return res.status(500).json({ message: 'Unable to fetch reviews.' });
  }
};

exports.getReviewsByPlaceId = async (req, res) => {
  try {
    return res.status(200).json(await publicReviews({ placeId: req.params.placeId }));
  } catch {
    return res.status(500).json({ message: 'Unable to fetch reviews.' });
  }
};

exports.getReviews = async (req, res) => {
  try {
    return res.status(200).json(await publicReviews({}));
  } catch {
    return res.status(500).json({ message: 'Unable to fetch reviews.' });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found.' });
    if (!isAuthorOrAdmin(req, review)) return res.status(404).json({ message: 'Review not found.' });

    const allowedFields = req.user.role === 'admin' ? ['text', 'rating', 'status', 'flagged', 'action'] : ['text', 'rating'];
    const updates = Object.fromEntries(allowedFields
      .filter((field) => Object.hasOwn(req.body || {}, field))
      .map((field) => [field, req.body[field]]));
    if (!Object.keys(updates).length) return res.status(400).json({ message: 'No valid review fields provided.' });
    if (updates.text !== undefined && (typeof updates.text !== 'string' || !updates.text.trim() || updates.text.length > 5000)) {
      return res.status(400).json({ message: 'Review text is invalid.' });
    }
    if (updates.rating !== undefined && (!Number.isInteger(updates.rating) || updates.rating < 1 || updates.rating > 5)) {
      return res.status(400).json({ message: 'Review rating must be from 1 to 5.' });
    }

    Object.assign(review, updates);
    await review.save();
    return res.status(200).json(req.user.role === 'admin' ? review : publicReview(review));
  } catch {
    return res.status(400).json({ message: 'Unable to update review.' });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found.' });
    if (!isAuthorOrAdmin(req, review)) return res.status(404).json({ message: 'Review not found.' });
    await review.deleteOne();
    return res.status(200).json({ message: 'Review deleted successfully.' });
  } catch {
    return res.status(400).json({ message: 'Unable to delete review.' });
  }
};
