const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcrypt')

const UserSchema = new Schema({
    prefix: {
        type: String,
        required: [true, 'Please provide prefix'],
    },
    firstname: {
        type: String,
        required: [true, 'Please provide your firstname'],
    },
    lastname: {
        type: String,
        required: [true, 'Please provide your lastname'],
    },
    password: {
        type: String,
        required: [true, 'Please provide password'],
    },
    phoneNumber: {
        type: String,
        required: [true, 'Please provide phone number'],
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    ownRestaurants: {
        type: [{
            type: Schema.Types.ObjectId, ref: 'Restaurant',
            required: false
        }],
        require: false,
    },
    favRestaurants: {
        type: [{
            type: Schema.Types.ObjectId, ref: 'Restaurant',
            required: false
        }],
        require: false,
    },
    orderHistory: {
        type: [{
            type: Schema.Types.ObjectId, ref: 'Order', required: false
        }],
        require: false,
    },
})

UserSchema.pre('save', function(next) {
    const user = this

    if (!user.isModified('password')) {
        return next();
    }

    bcrypt.hash(user.password, 10).then(hash => {
        user.password = hash
        next()
    }).catch(error => {
        console.log(error);
    })
})

const User = mongoose.model('User', UserSchema)
module.exports = User