const express = require('express');
const router = express.Router();
const Restaurant = require('../../models/restaurant');
const User = require('../../models/user');
const Order = require('../../models/order');

router.post('/addRestaurant', (req, res) => {
    const dataInfo = {
        name: req.body.name,
        phoneNumber: req.body.phoneNumber,
        allSeats: +req.body.allSeats,
        detail: req.body.detail,
        address: req.body.address,
        ggMapsLink: req.body.ggMaps,
        onHands: 0,
        orders: []
    }
    console.log(req.session.userId);
    Restaurant.create(dataInfo).then((restaurant) => {
        console.log('Adding success : ' + restaurant);
        console.log('id: ', restaurant._id);
        User.findById(req.session.userId).then((user) => {
            user['ownRestaurants'].push(restaurant._id);
            user.markModified('ownRestaurants');
            user.save();

            console.log('updated user : ' + user);
            return res.redirect('/profile')
        })
            .catch((error) => {
                console.error(error);
            })
    })
        .catch((err) => {
            console.error(err);
        })
});

router.post('/edit', (req, res) => {
    Restaurant.findByIdAndUpdate(req.query.id, req.body).then((updatedData) => {
        console.log('updated data : ', updatedData);
        res.redirect(`/restaurant/${req.query.id}/manage`)
    })
})

router.delete('/delete', (req, res, next) => {
    Restaurant.findByIdAndRemove(req.query.id)
        .exec()
        .then((deletedData) => {
            res.redirect('/profile')
        })
        .catch((err) => {
            next(err);
        });
});

router.put('/clear', async (req, res, next) => {
    try {
        const restaurant = await Restaurant.findById(req.query.shopId);
        const order = await Order.findById(req.query.orderId);

        restaurant.allSeats += order.seatsAmount;
        restaurant.onHands -= order.seatsAmount;

        restaurant.orders = restaurant.orders.filter(orderId => !orderId.equals(order._id));

        await restaurant.save();
        console.log(restaurant.orders);
        res.send({ msg: 'okay' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});


router.get('/', (req, res, next) => {
    Restaurant.find().exec()
        .then((user) => {
            res.json(user);
        })
        .catch((err) => {
            next(err);
        });
});

module.exports = router;