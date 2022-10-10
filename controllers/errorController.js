const AppError = require("../utils/appError");

const sendErrorProd = (res, err) => {
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        })
    } else {
        console.log('ERROR  💥', err);
        res.status(500).json({
            status: 'error',
            message: 'something went wrong!'
        })
    }

}


const sendErrorDev = (res, err) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    })
}

const handleJwtError = (err) => {
    new AppError('Invalid token! please login again!', 401);
}

const handleCastError = (err) => {
    const message = `Invalid ${err.path}: ${err.value}.`
    return new AppError(message, 400);
}

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(res, err);
    } else if (process.env.NODE_ENV === 'production') {
        let error = { ...err };
        console.log(error.name)
        if (error.name === 'JsonWebTokenError') error = handleJwtError(error)
        console.log(error)

        // if (err.name === 'CastError') error = handleCastError(error)
        sendErrorProd(res, error);

    }
}