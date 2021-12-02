const Review = require('../models/reviewModel');
const catchAsync = require('../utils/chtchasync');
// const AppError = require('../utils/appError');
const handlerFactory = require('./handlerFactory');

exports.getAllReviews = catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.tourerId) filter = { toureName: req.params.tourerId };
    const review = await Review.find(filter);

    res.status(200).json({
        status: 'success',
        totalResults: review.length,
        data: {
            review,
        },
    });
});

exports.setUserAndTourIds = catchAsync(async (req, res, next) => {
    if (!req.body.toureName) req.body.toureName = req.params.tourerId;
    if (!req.body.userName) req.body.userName = req.user.id;
    next();
});
exports.creatReview = handlerFactory.createOne(Review);

////////// earlyer the are one functin now we divided it into two endfepandent functions ie. setUserAndTourIds and creatReview (handlerFactory function)
// exports.creatReview = catchAsync(async (req, res, next) => {
//     if (!req.body.toureName) req.body.toureName = req.params.tourerId;
//     if (!req.body.userName) req.body.userName = req.user.id;
//     const newReview = await Review.create(req.body);

//     res.status(201).json({
//         status: 'success',
//         data: {
//             newReview,
//         },
//     });
// });

exports.updateReview = handlerFactory.updateOne(Review);

exports.deleteReview = handlerFactory.delete(Review);

// exports.deleteReview = catchAsync(async (req, res, next) => {
//     const review = await Review.findByIdAndDelete(req.params.id);

//     if (!review) {
//         return next(new AppError('can not find review ', 404));
//     }

//     res.status(204).json({
//         status: 'success',
//     });
// });
