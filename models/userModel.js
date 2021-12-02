const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please tell us your name!!!! '],
        },
        email: {
            type: String,
            unique: true,
            lowercase: true,
            require: [true, 'enter an email'],
            validate: [validator.isEmail, 'Please provide a valid email'],
        },
        photo: {
            type: String,
        },
        role: {
            type: String,
            enum: {
                values: ['user', 'admin', 'guide', 'lead-guide'],
            },
            default: 'user',
        },
        password: {
            type: String,
            required: [true, 'Please creat an password'],
            minlength: [6, 'A password must have 6 characters'],
            select: false,
        },
        passwordConformation: {
            type: String,
            required: [true, 'Please confirm your password'],
            validate: {
                validator: function (el) {
                    return el === this.password;
                },
                message: 'password are not same',
            },
        },
        passwordChangedAt: Date,
        passwordResetToken: String,
        passwordResetExpires: Date,
        active: {
            type: Boolean,
            default: true,
            select: false,
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);

    this.passwordConformation = undefined;

    next();
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
});

userSchema.pre(/^find/, function (next) {
    this.find({ active: { $ne: false } });
    next();
});

// INSTANCE method's
userSchema.methods.correctPassword = async function (
    candidatePassword,
    userPassword
) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    //  in instance method this keyword always point to the current document
    if (this.passwordChangedAt) {
        const changedTimestamps = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        ); // this time is in seconds
        return JWTTimestamp < changedTimestamps;
    }
    return false;
};

userSchema.methods.creatPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex'); // hex convert number to hexadesimal

    // sha256 is an algorithms to has resetToken
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    console.log(resetToken, this.passwordResetToken);

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
