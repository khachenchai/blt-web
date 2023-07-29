const User = require('../models/user')

module.exports = (req, res, next) => {
    User.findById(req.session.userId).then((user) => {
        if (!user) {
            res.locals.loggedIn = false
            return res.redirect('/login')
        }
        res.locals.loggedIn = true
        // console.log('User logged in successfully');
        next()
    }).catch(err => {
        console.error(err);
    })
}