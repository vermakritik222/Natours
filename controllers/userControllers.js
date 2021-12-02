const User = require('../models/userModel');
const catchAsync = require('../utils/chtchasync');
const AppError = require('../utils/appError');
const handlerFactory = require('./handlerFactory');

const fillterobj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach((el) => {
        if (allowedFields.includes(el)) {
            newObj[el] = obj[el];
        }
    });
    return newObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
    // 1) Creat error if user POST password data
    if (req.body.password || req.body.passwordConformation) {
        return next(
            new AppError(
                'This rout is not for password update. Please use /updateMyPassword',
                400
            )
        );
    }
    // 2) Update user document
    const fillteredBody = fillterobj(req.body, 'name', 'email');
    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        fillteredBody,
        {
            new: true,
            validator: true,
        }
    );
    res.status(200).json({
        status: 'success',
        data: {
            usre: updatedUser,
        },
    });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
        status: 'success',
        data: null,
    });
});

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};

exports.creatUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        Message: 'rout is not defined pleas go to /signup ',
    });
};

exports.getAllUsers = handlerFactory.getAll(User);

exports.getUser = handlerFactory.getOne(User);

//TODO: DON'T UPDATE PASSWORDS
exports.updateUser = handlerFactory.updateOne(User);

exports.deleteUser = handlerFactory.delete(User);
