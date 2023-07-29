const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcrypt')

const restaurantSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Enter a name'],
    },
    detail: {
        type: String,
        required: false,
    },
    allSeats: {
        type: Number,
        required: [true, 'Enter all seats number']
    },
    onHands: {
        type: Number,
        required: true,
    },
    address: {
        type: String,
        required: [true, 'Enter address']
    },
    ggMapsLink: {
        type: String,
        required: false,
    },
    phoneNumber: {
        type: String,
        required: false,
    },
    orders: [{
        type: Schema.Types.ObjectId, ref: 'Order',
        required: false
    }]
})

const Restaurant = mongoose.model('Restaurant', restaurantSchema);
module.exports = Restaurant;