const express = require('express');
const reviewController = require('../controllers/reviewController');
const {
    protect,
    restrictTo,
} = require('../controllers/AuthenticationController');
const router = express.Router({ mergeParams: true });

router.use(protect, restrictTo('user'));

router
    .route('/')
    .get(reviewController.getAllReviews)
    .post(reviewController.setUserAndTourIds, reviewController.creatReview);

router
    .route('/:id')
    .delete(reviewController.deleteReview)
    .patch(reviewController.updateReview);

module.exports = router;
