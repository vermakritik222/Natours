const mongoose = require('mongoose');
const Toure = require('./toursModel');

const reviewSchema = mongoose.Schema({
    review: {
        type: String,
        require: [true, 'pleas enter an review'],
    },
    rating: {
        type: Number,
    },
    ceratedAt: {
        type: Date,
        default: Date.now(),
    },
    toureName: {
        type: mongoose.Schema.ObjectId,
        ref: 'Toure',
    },
    userName: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    },
});

reviewSchema.index({ toure: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'userName',
        select: 'name photo',
    });
    next();
});
//  Schema | methods | function name
reviewSchema.statics.calcAverageRatings = async function (toureId) {
    const stats = await this.aggregate([
        {
            // toureId is coming from review
            $match: { tour: toureId },
        },
        {
            // calculating statistics
            $group: {
                _id: '$toureName',
                nRating: { $sum: 1 },
                AvgRating: { $avg: $rating },
            },
        },
    ]);
    console.log(stats);
    if (stats.length > 1) {
        await Toure.findByIdAndUpdate(toureId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].AvgRating,
        });
    } else {
        await Toure.findByIdAndUpdate(toureId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5,
        });
    }
};
// post me next function nahi hota
reviewSchema.post('save', function () {
    // this. constructor is used to use Review before it decelerade
    // calling above function
    this.constructor.calcAverageRatings(this.toureName);
});

// doing when documennt is updated
//findByIdAndUpdate |
//findByIdAndDelete | both are equal to  findOneAnd
reviewSchema.pre(/^findOneAnd/, async function (next) {
    this.r = await this.findOne();
    next();
});

reviewSchema.post(/^findOneAnd/, async function () {
    await this.r.constructor.calcAverageRatings(this.r.toureName);
});
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
