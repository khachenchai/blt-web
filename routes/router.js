const express = require('express')
const router = express.Router()
const User = require('../models/user')
const Restaurant = require('../models/restaurant')
const Order = require('../models/order')
const redirectIfAuth = require('../middleware/redirectIfAuth')
const authMiddleware = require('../middleware/authMiddleware')

router.get('/', async (req, res) => {
    let userData = await User.findById(req.session.userId);
    const allRestaurants = await Restaurant.find();

    // console.log(allRestaurants);

    res.render('index', {
        userData,
        restaurants: allRestaurants
    });
})

router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        console.log('Logout completed');
        res.redirect('/')
    })
})

router.get('/login', redirectIfAuth, (req, res) => {
    res.render('login');
})

router.get('/register', redirectIfAuth, (req, res) => {
    res.render('register');
})

router.get('/profile', authMiddleware, async (req, res) => {
    let userData = await User.findById(req.session.userId).populate('ownRestaurants');
    // in "userData", it has the document named "ownRestaurants" that types an array of object ids and I want to get the data from restaurants collection using these ids
    res.render('profile', {
        userData
    });
})

router.get('/addRestaurant', authMiddleware, async (req, res) => {
    let userData = await User.findById(req.session.userId);
    res.render('addRestaurant', {
        userData
    });
})

// Restaurants

router.get('/restaurant/:id/detail', authMiddleware, async (req, res) => {
    let userData = await User.findById(req.session.userId);
    let restaurantData = await Restaurant.findById(req.params.id)
    res.render('restaurant/detail', {
        userData,
        restaurantData
    });
})

router.get('/restaurant/:id/orderInform', authMiddleware, async (req, res) => {
    let userData = await User.findById(req.session.userId);
    let restaurantData = await Restaurant.findById(req.params.id)
    res.render('restaurant/orderInform', {
        userData,
        restaurantData
    });
})

router.get('/restaurant/:id/book', authMiddleware, async (req, res) => {
    let userData = await User.findById(req.session.userId);
    let restaurantData = await Restaurant.findById(req.params.id)
    res.render('restaurant/book', {
        userData,
        restaurantData
    });
})

router.get('/restaurant/:id/edit', authMiddleware, async (req, res) => {
    let userData = await User.findById(req.session.userId);
    let restaurantData = await Restaurant.findById(req.params.id)
    res.render('restaurant/edit', {
        userData,
        restaurantData
    });
})

// router.get('/restaurant/delele', (req, res) => {
//     // Confirm deletion
//     Restaurant.findByIdAndRemove(req.query.id).then((deletedData) => {
//         console.log('deleted data : ', deletedData);
//         res.redirect('/profile')
//     })
// })

router.get('/restaurant/:id/manage', authMiddleware, async (req, res) => {
    let userData = await User.findById(req.session.userId);
    let restaurantData = await Restaurant.findById(req.params.id).populate({
        path: 'orders',
        populate: {
            path: 'booker',
            model: 'User'
        }
    }) // booker is an document in orders
    res.render('restaurant/manage', {
        userData,
        restaurantData
    });
})

module.exports = router
