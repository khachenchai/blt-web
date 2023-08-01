const express = require('express');
const router = express.Router();
const User = require('../../models/user');
const bcrypt = require('bcrypt');
const Restaurant = require('../../models/restaurant');

router.post('/register', (req, res) => {
    User.create(req.body).then((user) => {
        console.log('regist success : ' + user);
        const { phoneNumber, password } = req.body

        User.findOne({ phoneNumber: phoneNumber }).then((user) => {
            // console.log('Logging successful');

            if (user) {
                let cmp = bcrypt.compare(password, user.password).then((match) => {
                    if (match) {
                        req.session.userId = user._id
                        res.redirect('/')
                    } else {
                        res.redirect('/login')
                    }
                })
            } else {
                res.redirect('/login')
            }
        })
    })
        .catch((err) => {
            console.error(err);
        })
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

    User.findByIdAndRemove(id)
    .exec()
        .then((deletedUser) => {
            res.redirect('/admin/panel/users')
        })
        .catch((err) => {
            next(err);
        });
})
module.exports = router;