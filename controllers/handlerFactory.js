const catchAsync = require('../utils/chtchasync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.getAll = (Model) =>
    catchAsync(async (req, res, next) => {
        // To Allow Nested GET route work
        let filterReviews = {};
        if (req.params.tourerId)
            filterReviews = { toureName: req.params.tourerId };

        //// EXECUTING QUERY
        const features = new APIFeatures(Model.find(filterReviews), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate();
        // const doc = await features.query.explain();  // give data about query
        const doc = await features.query;

        //// SENDING RESPONSE
        res.status(200).json({
            status: 'success',
            results: doc.length,
            data: {
                data: doc,
            },
        });
    });

exports.getOne = (Model, populateOptions) =>
    catchAsync(async (req, res, next) => {
        let query = Model.findById(req.params.id);
        if (popOptions) query = query.populate(populateOptions);

        const doc = await query;
        // const tourer = await Tourer.findOne({ _id: req.params.id });
        if (!doc) {
            return next(new AppError(' No document found with that ID', 404));
        }
        res.status(200).json({
            status: 'success',
            requestedAt: req.requestTime,
            data: {
                data: doc,
            },
        });
    });

exports.createOne = (Model) =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.create(req.body);

        res.status(201).json({
            status: 'success',
            data: {
                data: doc,
            },
        });
    });

exports.updateOne = (Model) =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        res.status(200).json({
            status: 'success',
            data: {
                data: doc,
            },
        });
    });

exports.delete = (Model) => {
    return catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndDelete(req.params.id);
        if (!doc) {
            return next(new AppError(' No tourer found with that ID', 404));
        }
        res.status(204).json({
            status: 'success',
        });
    });
};
