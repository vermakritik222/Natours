const Tour = require('../models/toursModel');
// const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/chtchasync');
// const AppError = require('../utils/appError');
const handlerFactory = require('./handlerFactory');

//////        MIDDLEWARE

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,summery,ratingsAverage,duration';
    next();
};

exports.getTourState = catchAsync(async (req, res, next) => {
    const state = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } },
        },
        {
            $group: {
                _id: { $toUpper: '$difficulty' },
                numTour: { $sum: 1 },
                numRatings: { $sum: '$ratingsQuantity' },
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' },
            },
        },
        {
            $sort: { avgPrice: 1 },
        },
        // {
        //     $match: { _id: { $ne: 'EASY' } },
        // },
    ]);
    res.status(200).json({
        status: 'success',
        data: {
            state,
        },
    });
});

exports.getMonthlyPlans = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1;
    const plane = await Tour.aggregate([
        {
            $unwind: '$startDates',
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`),
                },
            },
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numTourstarts: { $sum: 1 },
                tours: { $push: '$name' },
            },
        },
        {
            $addFields: { month: '$_id' },
        },
        {
            $project: {
                _id: 0,
            },
        },
        {
            $sort: {
                numTourstarts: -1,
            },
        },
    ]);

    res.status(200).json({
        status: 'success',
        results: plane.length,
        data: {
            plane,
        },
    });
});

exports.getALLTours = handlerFactory.getAll(Tour);
// exports.getALLTours = catchAsync(async (req, res, next) => {
//     //// EXECUTING QUERY
//     const features = new APIFeatures(Tour.find(), req.query)
//         .filter()
//         .sort()
//         .limitFields()
//         .paginate();
//     const tours = await features.query;

//     //// SENDING RESPONSE
//     res.status(200).json({
//         status: 'success',
//         results: tours.length,
//         data: {
//             tours: tours,
//         },
//     });
// });

exports.getTour = handlerFactory.getOne(Tour, { path: 'reviews' });
// exports.getTour = catchAsync(async (req, res, next) => {
//     // console.log(req.params);

//     const tour = await Tour.findById(req.params.id).populate('reviews');
//     // const tour = await Tour.findOne({ _id: req.params.id });
//     if (!tour) {
//         return next(new AppError(' No tour found with that ID', 404));
//     }
//     res.status(200).json({
//         status: 'success',
//         requestedAt: req.requestTime,
//         data: {
//             tour: tour,
//         },
//     });
// });

exports.creatTour = handlerFactory.createOne(Tour);

// exports.creatTour = catchAsync(async (req, res, next) => {
//     // try {
//     const newTour = await Tour.create(req.body);

//     res.status(201).json({
//         status: 'success',
//         data: {
//             tour: newTour,
//         },
//     });
//     // } catch (err) {
//     //     res.status(400).json({
//     //         status: 'fail',
//     //         message: err,
//     //     });
//     // }
// });

exports.updateTour = handlerFactory.updateOne(Tour);

// exports.updateTour = catchAsync(async (req, res, next) => {
//     const update = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//         new: true,
//         runValidators: true,
//     });
//     res.status(200).json({
//         status: 'success',
//         data: {
//             tour: update,
//         },
//     });
// });

exports.deleteTour = handlerFactory.delete(Tour);

// exports.deleteTour = catchAsync(async (req, res, next) => {
//     const tour = await Tour.findByIdAndDelete(req.params.id);
//     if (!tour) {
//         return next(new AppError(' No tour found with that ID', 404));
//     }
//     res.status(204).json({
//         status: 'success',
//     });
// });
