const express = require('express');
const morgan = require('morgan');
const rateLimit = require('ratelimit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const hpp = require('hpp');

const toursRouter = require('./routes/toursrouter');
const userRouter = require('./routes/userrouter');
const reviewRouter = require('./routes/reviewRouter');
const AppError = require('./utils/appError');
const globelErrorHandlear = require('./controllers/errorcontroller');

const app = express();

/////////////////  Middleware
// Set sequacity HTTP headers
app.use(helmet());

// development logging
// npm installed morgan : give info about request by clint
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// limiting IP address
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many request from this IP, pleas try again in an houre',
});
// limiting IP address
// app.use('/api', limiter); //TODO: DEKHNA H

// build is express // body parser ,reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
// app.use(express.json());

// Data sanitization against NoSQL query injection eg {$gt:""}
app.use(mongoSanitize());

// Data sanitization against xss
app.use(xssClean());

// Prevent parameter pollution
app.use(
    hpp({
        whitelist: [
            'duration',
            'ratingsAverage',
            'ratingsQuantity',
            'maxGroupSize',
            'difficulty',
            'price',
        ],
    })
);

// Serving static files
app.use(express.static(`${__dirname}/public`));

// use to send time // Testing middleware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    // console.log(req.headers);
    next();
});

app.use('/api/v1/tours', toursRouter);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
    // not used in production original apps
    // res.status(404).json({
    //     status: 'fail',
    //     message: `Can't find ${req.originalUrl} on this server!`,
    // });

    // not a recommended way
    // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
    // err.statusCode(404);
    // err.status('fail');

    // best method
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globelErrorHandlear);
module.exports = app;
