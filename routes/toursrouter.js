const express = require('express');
const toursController = require('../controllers/toursController');
const AuthController = require('../controllers/AuthenticationController');
// const reviewController = require('../controllers/reviewController');
const reviewRouter = require('./reviewRouter');

const router = express.Router();

router.use('/:tourerId/review', reviewRouter);

router
    .route('/top-5-cheap')
    .get(toursController.aliasTopTours, toursController.getALLTours);

router
    .route('/tour-state')
    .get(AuthController.protect, toursController.getTourState);
router
    .route('/monthly-plans/:year')
    .get(AuthController.protect, toursController.getMonthlyPlans);

router
    .route('/')
    .get(toursController.getALLTours)
    .post(
        AuthController.protect,
        AuthController.restrictTo('admin', 'lead-guide'),
        toursController.creatTour
    );

router
    .route('/:id')
    .get(toursController.getTour)
    .patch(
        AuthController.protect,
        AuthController.restrictTo('admin', 'lead-guide'),
        toursController.updateTour
    )
    .delete(
        AuthController.protect,
        AuthController.restrictTo('admin', 'lead-guide'),
        toursController.deleteTour
    );

////// we can do this way but it is wrong and not prefred as we are calling reviewController in toure touter
// router.route('/:tourerId/review').post(
//     AuthController.protect,
//     AuthController.restrictTo('user'),
//     reviewController.creatReview
//     )

module.exports = router;
