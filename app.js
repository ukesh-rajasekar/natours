const express = require('express');
const morgan = require('morgan')
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')
const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')
const rateLimit = require('express-rate-limit');

const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');







const app = express();

//Set security http headers
app.use(helmet())


//MIDDLEWARES 


if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}
console.log(process.env.NODE_ENV)


// Body parser: reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitization against query injection
app.use(mongoSanitize());

// Data sanitize against xss attacks (removes malicious HTML)
app.use(xss());


// Prevent parameter pollution
app.use(hpp({ whitelist: ["duration", "ratingQuantity", "ratingAverage", "price", "maxGroupSize", "difficulty"] }));



//Rate Limiter
const limiter = rateLimit({
    max: 100,
    windowms: 60 * 60 * 1000,
    message: 'too many request, please try again later!'
})

app.use('/api', limiter);



//Test middleware
app.use((req, res, next) => {
    console.log('hello from the server');
    req.requestedTime = new Date().toISOString();
    next()
})


//MOUNTING ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl}`, 404));
})

app.use(globalErrorHandler)
module.exports = app;