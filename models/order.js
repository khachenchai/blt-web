const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcrypt')

const orderSchema = new Schema({
    seatsAmount: {
        type: Number,
        required: true,
    },
    booker: {
        type: Schema.Types.ObjectId, 
        ref: 'User',
        required: true,
    },
    restaurant: {
        type: Schema.Types.ObjectId, 
        ref: 'Restaurant',
        required: true,
    },
    sendingDateTime: {
        type: Date,
        required: true,
        default: Date.now()
    },
    orderDateTime: {
        type: Date,
        required: true,
    },
    detail: {
        type: String,
        required: false
    }
})

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;