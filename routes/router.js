const express = require('express')
const router = express.Router()
const User = require('../models/user')
const Restaurant = require('../models/restaurant')
const Order = require('../models/order')
const redirectIfAuth = require('../middleware/redirectIfAuth')
const authMiddleware = require('../middleware/authMiddleware')
const checkAdmin = require('../middleware/admin')

router.get('/', authMiddleware, async (req, res) => {
    let userData = await User.findById(req.session.userId);
    const allRestaurants = await Restaurant.find();
    if (userData.isAdmin) {
        res.redirect('/admin/index')
    } else {
        res.render('index', {
            userData,
            restaurants: allRestaurants
        });
    }
})

router.get('/search', authMiddleware, async (req, res) => {
    let q = req.query.q
    const regex = new RegExp(q, 'i');

    let userData = await User.findById(req.session.userId);
    const allRestaurants = await Restaurant.find();
    Restaurant.find({ name: regex }).then((results) => {
        res.render('searchResult', {
            userData,
            restaurants: allRestaurants,
            results,
            q: q
        })
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error searching items');
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
    let historyData = await User.findById(req.session.userId).populate({
        path: 'orderHistory',
        populate: {
            path: 'restaurant',
            model: 'Restaurant'
        }
    });

    // console.log(historyData);

    res.render('profile', {
        userData,
        historyData
    });
})

router.get('/myOrders', authMiddleware, async (req, res) => {
    let userData = await User.findById(req.session.userId);
    let historyData = await User.findById(req.session.userId).populate({
        path: 'orderHistory',
        populate: {
            path: 'restaurant',
            model: 'Restaurant'
        }
    });

    // console.log(historyData);

    res.render('myOrders', {
        userData,
        historyData
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
    const allRestaurants = await Restaurant.find();
    res.render('restaurant/detail', {
        userData,
        restaurantData,
        restaurants: allRestaurants
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


// ADMIN

router.get('/admin/index', authMiddleware, async (req, res) => {
    let userData = await User.findById(req.session.userId);
    const allRestaurants = await Restaurant.find();
    res.render('admin/index', {
        userData,
        restaurants: allRestaurants
    });
})

router.get('/admin/panel', authMiddleware, async (req, res) => {
    let userData = await User.findById(req.session.userId);
    const allRestaurants = await Restaurant.find();
    res.render('admin/panel', {
        userData,
        restaurants: allRestaurants
    });
})

router.get('/admin/editUser', authMiddleware, async (req, res) => {
    let userData = await User.findById(req.session.userId);
    let userToEdit = await User.findById(req.query.id);
    let userToEditPassword = await User.findById(req.query.id).select('-password');
    res.render('admin/editUser', {
        userData,
        user: userToEdit,
        userToEditPassword
    });
})

router.get('/admin/panel/users', authMiddleware, async (req, res) => {
    let userData = await User.findById(req.session.userId);
    const allUsers = await User.find().populate('ownRestaurants');
    res.render('admin/usersPanel', {
        userData,
        users: allUsers
    });
})

router.get('/admin/panel/restaurants', authMiddleware, async (req, res) => {
    let userData = await User.findById(req.session.userId);
    const allRestaurants = await Restaurant.find();
    res.render('admin/restaurantsPanel', {
        userData,
        restaurants: allRestaurants
    });
})

router.get('/admin/panel/orders', authMiddleware, async (req, res) => {
    try {
        let userData = await User.findById(req.session.userId);
        const orders = await Order.find().populate('booker restaurant');

        res.render('admin/ordersPanel', {
            userData,
            orders,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});




module.exports = router
