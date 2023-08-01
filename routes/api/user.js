const express = require('express');
const router = express.Router();
const User = require('../../models/user');
const bcrypt = require('bcrypt');
const Restaurant = require('../../models/restaurant');
const Order = require('../../models/order');

router.post('/register', async (req, res) => {
    const { phoneNumber, password } = req.body;

    try {
        // Check if a user with the given phone number already exists
        const existingUser = await User.findOne({ phoneNumber });

        if (existingUser) {
            // Phone number already registered
            req.flash('error', 'เบอร์โทรศัพท์ถูกใช้งานแล้ว');
            return res.redirect('/register');
        }

        // Create a new user
        const newUser = await User.create(req.body);

        // Log in the newly registered user
        req.session.userId = newUser._id;
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});


router.get('/', (req, res, next) => {
    User.find().exec()
        .then((user) => {
            res.json(user);
        })
        .catch((err) => {
            next(err);
        });
});

router.post('/login', async (req, res) => {
    const { phoneNumber, password } = req.body;

    try {
        const user = await User.findOne({ phoneNumber });

        if (user) {
            const match = await bcrypt.compare(password, user.password);

            if (match) {
                req.session.userId = user._id;

                if (user.isAdmin) {
                    console.log('Admin login successful');
                    res.redirect('/admin/index');
                } else {
                    console.log('Login successful');
                    res.redirect('/');
                }
                
            } else {
                req.flash('error', 'เบอร์โทรศัพท์หรือรหัสผ่านไม่ถูกต้อง');
                res.redirect('/login');
            }
        } else {
            req.flash('error', 'ไม่พบผู้ใช้');
            res.redirect('/login');
        }
    } catch (err) {
        console.error(err);
        req.flash('error', 'เบอร์โทรศัพท์หรือรหัสผ่านไม่ถูกต้อง');
        res.redirect('/login');
    }
});

router.get('/update/fav', async (req, res) => {
    const userId = req.session.userId;
    const shopId = req.query.shopId;
    const isFav = req.query.isFav === "true";

    console.log(isFav);
    
    User.findById(userId).then((user) => {
        if (isFav) {
            user.favRestaurants = user.favRestaurants.filter(favId => !favId.equals(shopId));
            user.save();
        } else {
            user['favRestaurants'].push(shopId);
            user.markModified('favRestaurants');
            user.save();
        }

        console.log('updated user : ' + user);
        res.redirect(`/restaurant/${shopId}/detail`)
    })
    .catch((error) => {
        res.send(error);
    })

    // User.findByIdAndUpdate(userId, dataInfo, {new: true}).then((updatedData) => {
    //     console.log('updated data : ', updatedData);
    //     res.redirect(`/restaurant/${shopId}/detail`)
    // })
})

router.get('/delete', (req, res) => {
    let id = req.query.id;

    User.findById(id).then((user) => {
        user.ownRestaurants.forEach(restaurant => {

            // restaurant.orders.forEach(order => {
            //     Order.findByIdAndRemove(order._id).then((deletedOrder) => {
            //         console.log('deleted : ' + deletedOrder);
            //     })
            // })
            
            Restaurant.findByIdAndRemove(restaurant._id).then((deletedRestaurant) => {
                console.log('deleted : ' + deletedRestaurant);
            })
            .catch(err => {
                console.log(err);
            });
        });

        user.orderHistory.forEach(order => {
            Order.findByIdAndRemove(order._id).then((deletedOrder) => {
                console.log('deleted : ' + deletedOrder);
            })
        })
    });

    User.findByIdAndRemove(id)
    .exec()
        .then((deletedUser) => {
            console.log('deleted : ' + deletedUser);
            res.redirect('/admin/panel/users')
        })
        .catch((err) => {
            next(err);
        });
})

router.post('/edit', async (req, res) => {
    const id = req.query.id;

    try {
        // Check if the password is provided and not empty
        if (req.body.password && req.body.password.trim().length > 0) {
            // Hash the new password before saving it to the database
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            req.body.password = hashedPassword;
        } else {
            // If the password is not provided in the update, remove it from the req.body
            delete req.body.password;
        }

        // Find the user by ID and update the fields
        const updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true });

        console.log('updated: ', updatedUser);
        res.redirect('/admin/panel/users');
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
});
module.exports = router;