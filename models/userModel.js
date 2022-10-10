mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { now } = require('mongoose');
const crypto = require('crypto')



const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'provide name']
    },
    email: {
        type: String,
        required: [true, 'provide email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'invalid email']
    },
    photo: {
        type: String
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin']

    },
    password: {
        type: String,
        required: [true, 'provide password'],
        maxLength: [12, 'A password must have a max length of 12'],
        minLength: [8, 'A password must have a min length of 8'],
        select: false

    },
    active: {
        type: Boolean,
        default: true,
        select: false
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    passwordConfirm: {
        type: String,
        required: [true, 'please confirm password'],
        validate: {
            validator: function (el) {
                return el === this.password;
            },
            message: 'Passwords mismatch!'
        }
    },

});


//QUERY middleware
userSchema.pre(/^find/, function (next) {
    this.find({ active: { $ne: false } });
    next();
})

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    //Hash
    //higher the second params higher the difficulty to break it
    this.password = await bcrypt.hash(this.password, 10);

    this.passwordConfirm = undefined;
    next();

})


userSchema.methods.checkPassword = async function (givenPassword, userPassword) {
    console.log(givenPassword, userPassword)
    return await bcrypt.compare(givenPassword, userPassword);
}


userSchema.methods.changedPasswordAfter = async function (JWTTimeStamp) {
    if (this.passwordChangedAt) {
        const getTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        console.log(getTimeStamp, JWTTimeStamp)

        return JWTTimeStamp < getTimeStamp;

    }
    return false;
}


userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    console.log(this.passwordResetExpires, this.passwordResetToken)
    return resetToken;
}

const User = mongoose.model('User', userSchema);


module.exports = User;
