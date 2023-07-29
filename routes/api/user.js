const express = require('express');
const router = express.Router();
const User = require('../../models/user');
const bcrypt = require('bcrypt');

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
                console.log('Login successful');
                res.redirect('/');
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
module.exports = router;