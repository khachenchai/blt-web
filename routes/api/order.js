const express = require('express');
const router = express.Router();
const Restaurant = require('../../models/restaurant');
const User = require('../../models/user');
const Order = require('../../models/order');

router.post('/addOrder', (req, res) => {
    const dataInfo = {
        seatsAmount: +req.body.seatsAmount,
        orderDateTime: req.body.orderDateTime,
        booker: req.session.userId,
        restaurant: req.query.shopId,
        detail: req.body.detail
    }
    Order.create(dataInfo).then((order) => {
        Restaurant.findById(req.query.shopId).then((restaurant) => {
            restaurant['orders'].push(order._id);
            // restaurant['allSeats'] = restaurant['allSeats'] - (+req.body.seatsAmount)
            restaurant['onHands'] = restaurant['onHands'] + (+req.body.seatsAmount)
            restaurant.save();
            console.log('updated restaurant' + restaurant);
        }).catch((error) => {
            console.error(error);
        });
        User.findById(req.session.userId).then((user) => {
            user['orderHistory'].push(order._id);
            user.markModified('orderHistory');
            user.save();
            console.log('updated user' + user);
        }).catch((error) => {
            console.error(error);
        });

        console.log('Order successfully created');
        res.redirect('/')
    })
    
});

router.get('/delete', async (req, res) => {
    let id = req.query.id;

    let orderData = await Order.findById(id);

    let restaurantData = await Restaurant.findById(orderData.restaurant);

    

    // console.log(restaurantData);

    if (!restaurantData) {
        Order.findByIdAndRemove(id).then(deletedOrder => {
            console.log('Deleted order : ' + deletedOrder);
            res.redirect('/admin/panel/orders');
        }).catch(err => {
            console.log(err);
        })
    } else {
        restaurantData['onHands'] = restaurantData['onHands'] - orderData['seatsAmount']

        console.log('updated restaurant : ' + restaurantData);
        Order.findByIdAndRemove(id).then(deletedOrder => {
            console.log('Deleted order : ' + deletedOrder);
            res.redirect('/admin/panel/orders');
        }).catch(err => {
            console.log(err);
        })
    }

    

    
})


router.get('/', (req, res, next) => {
    Order.find().exec()
        .then((user) => {
            res.json(user);
        })
        .catch((err) => {
            next(err);
        });
});

module.exports = router;