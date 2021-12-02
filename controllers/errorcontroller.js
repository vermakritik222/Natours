const AppError = require('../utils/appError');

// eslint-disable-next-line no-unused-vars
const handelJsonWebTokenError = (err) =>
    new AppError('Invalid Token pleas login again', 401);

const handelTokenExpiredError = () =>
    new AppError('your token has expired! pleas log in again.', 401);

const handelCastErrorDB = (err) => {
    const msg = `Invalided ${err.path}:${err.value}`;
    return new AppError(msg, 400);
};

const handelDuplicatesFieldsDB = (err) => {
    const val = err.errmsg.match(/(["'])(\\?.)*?\1/);
    const msg = `Duplicate field value: ${val}. please use another value!`;
    // console.log(val, msg);
    return new AppError(msg, 400);
};

const handelValidationErrorDB = (err) => {
    const val = Object.values(err.errors).map((el) => el.message);
    const msg = `Invalid input data. ${val.join('.')}`;
    return new AppError(msg, 400);
};

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
    });
};

const sendErrorPro = (err, res) => {
    // OPERATIONAL ERROR sent res to clint
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    } else {
        // DEVELOPMENT ERROR
        console.log('ERROR !!!', err);

        res.status(500).json({
            status: 'error',
            message: 'Something went very wrong',
        });
    }
};

module.exports = (err, _req, res, _next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = { ...err };
        if (err.name === 'CastError') error = handelCastErrorDB(err);

        if (err.code === 11000) error = handelDuplicatesFieldsDB(error); // FIXME: HANDLER IS NOT WORKING
        if (err.name === 'ValidationError')
            error = handelValidationErrorDB(error);
        if (err.name === 'JsonWebTokenError')
            error = handelJsonWebTokenError(error);
        if (err.name === 'TokenExpiredError') error = handelTokenExpiredError();

        sendErrorPro(error, res);
    }
};
