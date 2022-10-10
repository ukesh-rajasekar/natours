mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');




const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        trim: true,
        maxLength: [40, 'A tour must have a max length of 40'],
        minLength: [10, 'A tour must have a min length of 10'],
        // validate: [validator.isAlpha, 'name should only contain characters']
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a maxGroupSize']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'difficulty is either easy, medium or difficult'
        }
    },

    ratingAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'rating must have a min of 1'],
        max: [5, 'rating must have a max of 5']
    },
    ratingQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price']

    },
    priceDiscount: {
        type: Number,
        validate: function (val) {
            //this only points to crrent doc on new doc creation
            return val < this.price;
        },
        message: 'discount should be lesser than the actual price'
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a summary']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startLocation: {
        //GeoJSON
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [{
        //GeoJSON
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
    }],
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
})

//MIDDLEWARE runs before: .save() and .create() and not when .insertMany()
tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();
})

//second pre function that runs after the first one
// tourSchema.pre('save', function (next) {
//     console.log('saving doc here...');
//     next();
// })

//post function that runs after the controller function
// tourSchema.post('save', function (doc, next) {
//     console.log(doc);
//     next();
// })

//QUERY middleware
tourSchema.pre(/^find/, function (next) {
    this.find({ secretTour: { $ne: true } });
    this.start = Date.now();
    next();
})

tourSchema.post(/^find/, function (doc, next) {
    console.log(`query took ${Date.now() - this.start} millisecs to execute`)
    next();
})


//AGGREGATE MIDDLEWARE
tourSchema.pre('aggregate', function (next) {
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
    next();
})
const Tour = mongoose.model('Tour', tourSchema);


module.exports = Tour;
