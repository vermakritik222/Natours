const mongoose = require('mongoose');
const slugify = require('slugify');
const User = require('./userModel');
// const validator = require('validator');

const tourSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'A tour must have a name'],
            unique: true,
            maxlength: [
                40,
                'A toure name can not have more then 40 characters ',
            ],
            minlength: [
                10,
                'A toure name can not have less then 10 characters ',
            ],
            // validate: [
            //     validator.isAlpha,
            //     'Toure name cant only contain alphabets',
            // ],
        },
        slug: String,
        duration: {
            type: Number,
            required: [true, 'a toure must have a duration'],
        },
        maxGroupSize: {
            type: Number,
            required: [true, 'a toure must have size'],
        },
        difficulty: {
            type: String,
            required: [true, 'a toure must have dificulity'],
            enum: {
                values: ['easy', 'medium', 'difficult'],
                message: 'Difficulty is either: easy, medium, difficult',
            },
        },
        ratingsAverage: {
            type: Number,
            min: [1, 'Rating muist above 1.0'],
            max: [5, 'Rating muist below 5.0'],
            set: (val) => Math.round(val * 10) / 10,
            default: 4.5,
        },
        ratingsQuantity: {
            type: Number,
            default: 0,
        },
        price: {
            type: Number,
            required: [true, 'a toure must have price'],
        },
        priceDiscount: {
            type: Number,
            validate: {
                validator: function (val) {
                    // this this only points to current document createn THAT IS ONLY WORK FOR CTREAT QUERY
                    return val < this.price;
                },
                message:
                    'Discount price ({VALUE}) should be below regular price',
            },
        },
        summary: {
            type: String,
            trim: true,
            required: [true, 'a toure must have summery'],
        },
        description: {
            type: String,
            trim: true,
        },
        imageCover: {
            type: String,
            required: [true, 'a toure must have cover image'],
        },
        images: [String],
        createdAt: {
            type: Date,
            default: Date.now(),
            select: false,
        },
        startDates: [Date],
        secretTour: {
            type: Boolean,
            default: false,
        },

        startLocation: {
            //GeoJSON
            type: {
                type: String,
                default: 'Point',
                enum: {
                    values: ['Point'],
                },
            },
            coordinates: [Number],
            address: String,
            description: String,
        },

        locations: [
            {
                type: {
                    type: String,
                    default: 'Point',
                    enum: ['Point'],
                },
                coordinates: [Number],
                address: String,
                description: String,
                day: Number,
            },
        ],
        guides: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
            },
        ],
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

tourSchema.virtual('durationweeks').get(function () {
    return this.duration / 7;
});

// tourSchema.index({ price: 1 });
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });

tourSchema.virtual('reviews', {
    // section 11 video 11
    ref: 'Review', // model that ve want to referance
    foreignField: 'toureName', // reciew modale me toure id jha pe h vo chize
    localField: '_id', // voh refrence yha pe konsi firld me h
});

// DOCUMENT MIDDLEWARE/HOOK : runs befoure .save() and .create() Only
tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

// function for embeding
// tourSchema.pre('save', async function (next) {
//     const guidePromices = this.guides.map(
//         async (id) => await User.findById(id)
//     );

//     this.guides = await Promise.all(guidePromices);
//     next();
// });

// tourSchema.post('save', (doc, next) => {
//     console.log(doc);
//     next();
// });

// QUERY MIDDLEWARE
///  /^find/ is colled regula expretions search on google
tourSchema.pre(/^find/, function (next) {
    this.find({ secretTour: { $ne: true } });
    next();
});

tourSchema.pre(/^find/, function (next) {
    this.populate({ path: 'guides', select: `-__v -passwardChangedAt` });
    next();
});

// "/^find/" is an regular expretion which findes all the find
// tourSchema.post(/^find/, (docs, next) => {
//     console.log(docs);
//     next();
// });

// AGGRAGIATION MIDDLEWARE
tourSchema.pre('aggregate', function (next) {
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
    next();
});

const Toure = mongoose.model('Toure', tourSchema);

module.exports = Toure;
