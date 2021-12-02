const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/chtchasync');
const sendEmail = require('../utils/email');
const AppError = require('../utils/appError');

const signToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });

const creatSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
    };

    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    res.cookie('jwt', token, cookieOptions);
    //  Removing password from output
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
    });
};

exports.signup = catchAsync(async (req, res, next) => {
    // const newuser = await User.create(req.body);
    const newuser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConformation: req.body.passwordConformation,
        passwordChangedAt: req.body.passwordChangedAt,
        role: req.body.role,
    });
    creatSendToken(newuser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
    // const email = req.body.email;
    //the above thing is writin same an bellow this is colled object destructuring.
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError('please enter email and password!', 400));
    }
    // 2)
    const user = await User.findOne({ email }).select('+password');
    // console.log(user);

    // correctPassword is an instance function awavelable everywear in usear's

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incurrent email or password'));
    }
    // 3) send token
    creatSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
    // 1) geting token and check of its there
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }
    // console.log(token);

    if (!token) {
        return next(
            new AppError(
                'You are not longged in! Pleas log in to get access.',
                401
            )
        );
    }
    // 2) verification of token
    const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) check if user still exists
    const freshUser = await User.findById(decode.id);
    if (!freshUser) {
        return next(
            new AppError(
                'The token belonged to this User is no longer exist.',
                401
            )
        );
    }

    // 4) check if user changed pas after the token was issued
    if (freshUser.changedPasswordAfter(decode.iat)) {
        return next(
            new AppError(
                'User has changed there Password! please login again',
                401
            )
        );
    }
    // Greant acces to protected rout
    req.user = freshUser;
    next();
});

// as we canot take darect input in midelware function
exports.restrictTo =
    (...role) =>
    (req, res, next) => {
        if (!role.includes(req.user.role)) {
            return next(
                new AppError(
                    'You do not have peremption to perform this action',
                    403
                )
            );
        }
        next();
    };

exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(
            new AppError('There is no user with that email address', 404)
        );
    }
    // 2) Generate the random reset token
    const resetToken = user.creatPasswordResetToken();
    // console.log(resetToken);
    await user.save({ validateBeforeSave: false });
    // 3) send it to user's email
    const resetURL = `${req.protocol}://${req.get(
        'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 min)',
            message,
        });

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!',
        });
    } catch (err) {
        console.log(err);
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(
            new AppError(
                'There was an error sending the email. Try again later!'
            ),
            500
        );
    }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
    //1) get the tokent and encript it
    const hashtoken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    //2) get the user and velodate exprie of token
    const user = await User.findOne({
        passwordResetToken: hashtoken,
        passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) {
        return next(new AppError('Token is invalied or has expired'));
    }
    user.password = req.body.password;
    user.passwordConformation = req.body.passwordConformation;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    // 3) login user
    creatSendToken(user, 200, res);
});
//FIXME:
exports.updatePassword = catchAsync(async (req, res, next) => {
    // 1) Get user from collection
    const user = await User.findById(req.user.id).select('password');
    // 2) check if POSTed current password is correct
    if (!user.correctPassword(user.password, req.body.currentPassword)) {
        next(new AppError('Your current password is wrong', 401));
    }
    // 3)if so update password
    user.password = req.body.Password;
    user.passwordConformation = req.body.passwordConformation;
    await user.save();
    // 4)log user in send jwt
    creatSendToken(user, 200, res);
});
