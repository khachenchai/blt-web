const dotenv = require('dotenv');

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const userApi = require('./routes/api/user');
const restaurantApi = require('./routes/api/restaurant');
const orderApi = require('./routes/api/order');
const expressSession = require('express-session');
const flash = require('connect-flash');

dotenv.config();

mongoose.Promise = global.Promise

mongoose.connect(process.env.CONNECT_MONGO, {
    useNewUrlParser: true,
})
    .then(() => console.log('Connection successfully!'))
    .catch((err) => console.error(err))

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname + '/views'));

global.loggedIn = null
app.use(expressSession({
    secret: 'chenchoy',
    resave: false,
    saveUninitialized: false
}))

app.use(flash());
app.use((req, res, next) => {
    res.locals.messages = req.flash();
    next();
});

app.use('*', (req, res, next) => {

    // if (res.statusCode === 404) {
    //     res.render('errors/notFound')
    //     return
    // }
    
    loggedIn = req.session.userId
    next()
})

// app.use((req, res, next) => {
//     res.status(404);

//     if (req.accepts('ejs')) {
//         res.render('errors/notFound')
//         return;
//     }
// })

app.use(require('./routes/router.js'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use('/api/user', userApi)
app.use('/api/restaurant', restaurantApi)
app.use('/api/order', orderApi)

app.use(express.static(__dirname + '/public'))

app.listen(process.env.PORT, (req, res) => {
    console.log("Server is running on port " + process.env.PORT);
})
