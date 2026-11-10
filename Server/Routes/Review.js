const express = require("express");
const router = express.Router();
const reviewController = require("../Controllers/Review");
const { verifyToken, requireRole } = require('../Middleware/Auth');

router.post('/', verifyToken, requireRole('tourist', 'tourguide'), reviewController.createReview);
router.get("/", reviewController.getReviews);
router.get("/reviewer/:reviewerId", reviewController.getReviewsByReviewerId);
router.get("/tourguide/:tourGuideId", reviewController.getReviewsByTourGuideId);
router.get("/place/:placeId", reviewController.getReviewsByPlaceId);
router.get("/:id", reviewController.getReviewById);
router.put('/:id', verifyToken, requireRole('tourist', 'tourguide', 'admin'), reviewController.updateReview);
router.delete('/:id', verifyToken, requireRole('tourist', 'tourguide', 'admin'), reviewController.deleteReview);

module.exports = router;
