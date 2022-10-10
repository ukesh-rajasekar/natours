const User = require("../models/userModel");
const Jwt = require("jsonwebtoken");
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');
const crypto = require('crypto');


const { promisify } = require('util');
const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(err => next(err))
    }
}

const signToken = (_id) => { return Jwt.sign({ id: _id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN }) };

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    let cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
    res.cookie('jwt', token, cookieOptions)

    user.password = undefined;
    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    })
}

exports.signUp = catchAsync(async (req, res) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt,
        role: req.body.role


    });
    createSendToken(newUser, 201, res)


})


exports.logIn = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    //1. check if email and pass exist

    if (!email || !password) {
        return next(new AppError('email and password is needed', 400));
    }


    //check if user exist and password is right;
    const user = await User.findOne({ email }).select('+password');
    console.log(user)

    if (!user || !await user.checkPassword(password, user.password)) {
        return next(new AppError('email or password is incorrect', 401));
    }
    console.log(user)
    const token = signToken(user._id);
    console.log(token)

    res.status(200).json({
        status: "success",
        token
    })
})

exports.protect = catchAsync(async (req, res, next) => {
    //1) checking if token is present
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {

        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new AppError('you are not logged in!', 401));

    }

    //2) token verification

    const decoded = await promisify(Jwt.verify)(token, process.env.JWT_SECRET);

    //3) check if user exist

    const user = await User.findById(decoded.id);
    console.log(user);
    if (!user) {
        return next(new AppError('user no longer exist', 401));

    }

    //4) check if user changed password
    console.log(user.changedPasswordAfter(decoded.iat))
    if (await user.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('user recently changed password', 401));
    }

    //grant access
    req.user = user;
    next()

})


exports.restrictUserTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError('you dont have permisson to delete tours', 403)
            )
        }
        next();
    }
}


exports.forgotPassword = catchAsync(async (req, res, next) => {
    console.log(req.body.email)

    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError('no user found', 404))
    }
    console.log(user)

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    const message = `Forgot your password? Submit your new password and passwordConfirm to: ${resetURL}`;

    try {
        console.log(message);

        const response = await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid only for 10 mins)',
            message
        })

        console.log(response)

        res.status(200).json({
            status: "success",
            message: 'token sent to email'
        })
    }
    catch (err) {
        console.log(err)

        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new AppError('there is an error sending emial!', 500));


    }

})

exports.resetPassword = catchAsync(async (req, res, next) => {

    //get user based on token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } });

    console.log(user, hashedToken)
    if (!user) {
        return next(new AppError('token invalid or expired', 400));
    }

    //change the password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    const token = signToken(user._id);
    console.log(token)

    res.status(200).json({
        status: "success",
        token
    })

})


exports.updatePassword = catchAsync(async (req, res, next) => {
    //get user from collection

    const user = await User.findOne({ email: req.body.email }).select('+password');
    if (!user) {
        return next(new AppError('no user found', 404))
    }

    console.log(user)
    if (!await user.checkPassword(req.body.oldPassword, user.password)) {
        return next(new AppError('old password doesnt match', 401));
    }


    user.password = req.body.newPassword;
    user.passwordConfirm = req.body.passwordConfirm;

    await user.save({ validateBeforeSave: false })

    const token = signToken(user._id);

    res.status(200).json({
        status: "success",
        token
    })

})