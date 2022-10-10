const User = require('../models/userModel');
const AppError = require('../utils/appError');

const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(err => next(err))
    }
}

const filterObj = (obj, ...allowedFields) => {
    let newObj = {}
    Object.keys(obj).forEach((el) => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    })
    return newObj;
}
exports.getAllUsers = catchAsync(async (req, res) => {
    const users = await User.find();

    //Send response
    res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
            users
        }
    })
}
)


exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined'
    });
}

exports.getUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined'
    });
}


exports.updateUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined'
    });
}


exports.deleteUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined'
    });
}

exports.updateMe = catchAsync(async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirm) {
        return new AppError('this route is not for updating password', 400)
    }

    //filter out unwanted fields that are not allowed like user roles and password
    const sanitizedBody = filterObj(req.body, 'name', 'email');

    const updatedUser = await User.findByIdAndUpdate(req.user.id, sanitizedBody, { new: true, runValidators: true })

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    })
})


exports.deleteMe = catchAsync(async (req, res, next) => {

    const updatedUser = await User.findByIdAndUpdate(req.user.id, { active: false })

    res.status(204).json({
        status: 'success',
        data: null
    })
})