const express = require('express');
const router = express.Router();
const reviewController = require('../Controllers/Review');

router.post('/', reviewController.createReview);
router.get('/', reviewController.getReviews);
router.get('/reviewer/:reviewerId', reviewController.getReviewsByReviewerId);
router.get('/tourguide/:tourGuideId', reviewController.getReviewsByTourGuideId);
router.get('/place/:placeId', reviewController.getReviewsByPlaceId);
router.get('/:id', reviewController.getReviewById);
router.put('/:id', reviewController.updateReview);
router.delete('/:id', reviewController.deleteReview);

module.exports = router;