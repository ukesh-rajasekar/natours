const fs = require('fs');
const Tour = require('../models/tourModel')
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');

const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(err => next(err))
    }
}



exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingAverage,price';
    req.query.fields = 'name,price,ratingAverage,description';
    next();
}

exports.checkID = (req, res, next, val) => {
    console.log(`tour function called with id: ${val}`)
    const id = req.params.id * 1;
    // if (id > tours.length) {
    //     return res.status(404).json({
    //         status: 'fail',
    //         message: 'invalid id'
    //     })
    // }
    next();
}

exports.checkBody = (req, res, next) => {
    console.log(`tour create function called`)
    const { body } = req;

    if (body.name === undefined || body.price === undefined) {
        return res.status(400).json({
            status: 'fail',
            message: 'price and name is required'
        })
    }
    next();
}

//ROUTE HANDLERS
exports.getAllTours = async (req, res) => {
    try {
        //Execute query
        const features = new APIFeatures(Tour.find(), req.query).filter().sort().limit().paginate();
        const tours = await features.query;
        //Send response
        res.status(200).json({
            status: 'success',
            results: tours.length,
            data: {
                tours
            }
        })
    }

    catch (err) {
        res.status(400).json({
            status: 'failed to find tours',
            message: err
        })
    }

}

exports.getTour = async (next, req, res) => {
    try {
        const tour = await Tour.findById(req.params.id);

        //same as
        //Tour.findOne({_id: req.params.id}) 
        res.status(200).json({
            status: 'success',
            data: {
                tour
            }
        })
    }
    catch (err) {
        res.status(400).json({
            status: 'failed to find tour',
            message: err
        })
    }

}

exports.updateTour = async (req, res, next) => {
    try {
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        //same as
        //Tour.findOne({_id: req.params.id}) 
        res.status(200).json({
            status: 'success',
            data: {
                tour
            }
        })
    }
    catch (err) {
        res.status(400).json({
            status: 'failed to update tour',
            message: err
        })
    }
}

exports.deleteTour = async (req, res) => {
    try {
        const tour = await Tour.findByIdAndDelete(req.params.id);
        //same as
        //Tour.findOne({_id: req.params.id}) 
        res.status(200).json({
            status: 'success',
            data: null
        })
    }
    catch (err) {
        res.status(400).json({
            status: 'failed to delete tour',
            message: err
        })
    }
}


exports.createTour = catchAsync(async (req, res, next) => {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
        status: "success",
        data: {
            tour: newTour
        }
    })
    // catch (err) {
    //     res.status(400).json({
    //         status: 'failed to create new tour',
    //         message: err
    //     })
    // }
})



//Aggregation PipeLine

exports.getTourStats = async (req, res) => {
    try {
        const stats = await Tour.aggregate([
            {
                $match: { ratingAverage: { $gte: 4.5 } }
            },
            {
                $group: {
                    _id: { $toUpper: '$difficulty' },
                    numTours: { '$sum': 1 },
                    numOfRatings: { '$sum': '$ratingAverage' },
                    avgRating: { $avg: '$ratingAverage' },
                    avgPrice: { $avg: '$price' },
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' },


                }
            },
            {
                $sort: {
                    minPrice: 1
                }
            },
            {
                $match: {
                    _id: { '$ne': 'DIFFICULT' }
                }
            }
        ]);
        console.log(stats)

        res.status(200).json({
            status: 'success',
            data: stats
        })

    } catch (err) {
        res.status(400).json({
            status: 'failed to create new tour',
            message: err
        })
    }
}



exports.getMonthlyPlan = async (req, res) => {
    try {
        const year = req.params.year * 1;
        const plans = await Tour.aggregate([
            {
                $unwind: '$startDates'
            },
            {
                $match: {
                    startDates: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`),

                    }
                }
            },
            {
                $group: {
                    _id: { $month: '$startDates' },
                    numTourStarts: { $sum: 1 },
                    tours: {
                        $push: '$name'
                    }
                }
            }, {
                $addFields: { month: '$_id' }

            },
            {
                $project: {
                    _id: 0
                }
            },
            {
                $sort: {
                    numTourStarts: 1
                }
            },
            {
                $limit: 12
            }

        ]);
        console.log(plans)

        res.status(200).json({
            status: 'success',
            data: plans
        })

    } catch (err) {
        res.status(400).json({
            status: 'failed to get monthly plan',
            message: err
        })
    }
}