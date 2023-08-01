const express = require('express');
const router = express.Router();
const Restaurant = require('../../models/restaurant');
const User = require('../../models/user');
const Order = require('../../models/order');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, __dirname + "../../../public/uploads/")
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueName + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
}).single('imageUrl')

router.post('/addRestaurant', upload, (req, res) => {

    // if (!req.file) {
    //     return res.status(400).send('No file was uploaded.');
    // }
    const dataInfo = {
        name: req.body.name,
        phoneNumber: req.body.phoneNumber,
        allSeats: +req.body.allSeats,
        detail: req.body.detail,
        address: req.body.address,
        ggMapsLink: req.body.ggMaps,
        onHands: 0,
        orders: [],
        imageUrl: req.file ? req.file.filename : ''
    }
    // res.send(dataInfo);
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

router.post('/edit', upload, (req, res) => {
    let newImage = "";

    if (req.file) {
        newImage = req.file.filename;
        try {
            fs.unlink(path.join(__dirname + "../../../public/uploads/") + req.body.oldImage);
        } catch (err) {
            console.log(err);
        }
    } else {
        newImage = req.body.oldImage;
    }
    const dataInfo = {
        name: req.body.name,
        phoneNumber: req.body.phoneNumber,
        allSeats: +req.body.allSeats,
        detail: req.body.detail,
        address: req.body.address,
        ggMapsLink: req.body.ggMaps,
        onHands: 0,
        orders: [],
        imageUrl: newImage
    }
    Restaurant.findByIdAndUpdate(req.query.id, dataInfo, {new: true}).then((updatedData) => {
        console.log('updated data : ', updatedData);
        res.redirect(`/restaurant/${req.query.id}/manage`)
    })
})

router.get('/delete', async (req, res, next) => {

    let restaurant = await Restaurant.findById(req.query.id)

    restaurant.orders.forEach(order => {
        Order.findByIdAndRemove(order._id).then((deletedOrder) => {
            console.log('deleted : ' + deletedOrder);
        })
    })

    Restaurant.findByIdAndRemove(req.query.id)
        .exec()
        .then((deletedData) => {
            console.log('deleted rest : ' + deletedData);
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

        // restaurant.allSeats += order.seatsAmount;
        restaurant.onHands -= order.seatsAmount;

        restaurant.orders = restaurant.orders.filter(orderId => !orderId.equals(order._id));

        await restaurant.save();
        console.log(restaurant.orders);
        res.redirect(`/restaurant/${req.query.shopId}/manage`)
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