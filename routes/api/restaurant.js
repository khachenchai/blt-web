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

router.post('/edit', upload, async (req, res) => {
    let newImage = req.body.oldImage; // Initialize the newImage variable with the old image by default

    if (req.file) {
        // If a new image is uploaded, update newImage with the new filename
        newImage = req.file.filename;

        // Check if the old image exists
        const oldImagePath = path.join(__dirname, "../../../public/uploads/", req.body.oldImage);
        const oldImageExists = await fileExists(oldImagePath);

        if (oldImageExists) {
            // Delete the old image from the server's file system asynchronously with retry
            try {
                await attemptUnlink(oldImagePath);
            } catch (err) {
                console.error('Error while deleting old image:', err);
            }
        } else {
            console.warn('Old image not found:', req.body.oldImage);
        }
    }

    const dataInfo = {
        name: req.body.name,
        phoneNumber: req.body.phoneNumber,
        allSeats: +req.body.allSeats,
        detail: req.body.detail,
        address: req.body.address,
        ggMapsLink: req.body.ggMaps,
        // Assuming onHands and orders should not be reset during the edit
        imageUrl: newImage, // Assign the new image to the dataInfo
    };

    // Use the Mongoose update method to update the restaurant data
    try {
        const updatedData = await Restaurant.findByIdAndUpdate(req.query.id, dataInfo, { new: true });

        console.log('updated data : ', updatedData);
        res.redirect(`/restaurant/${req.query.id}/manage`);
    } catch (error) {
        console.error('Error updating data:', error);
        // Handle the error and redirect or render an error page as needed
        res.status(500).send('Error updating data.');
    }
});

// Function to check if a file exists
async function fileExists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch (err) {
        return false;
    }
}

// Function to attempt unlink with retry
async function attemptUnlink(filePath, attempts = 3, delayMs = 1000) {
    for (let i = 0; i < attempts; i++) {
        try {
            await fs.unlink(filePath);
            return; // Exit the function on successful unlink
        } catch (err) {
            if (err.code === 'ENOENT') {
                console.warn('File does not exist:', filePath);
                return; // Exit the function if the file doesn't exist (already deleted or not found)
            }
            console.error('Attempt ' + (i + 1) + ' failed:', err);
            await new Promise(resolve => setTimeout(resolve, delayMs)); // Wait before retrying
        }
    }
    throw new Error('Failed to unlink file after multiple attempts.');
}

router.get('/delete', async (req, res, next) => {
    let userData = await User.findById(req.session.userId);
    let restaurant = await Restaurant.findById(req.query.id)

    restaurant.orders.forEach(order => {
        Order.findByIdAndRemove(order._id).then((deletedOrder) => {
            console.log('deleted : ' + deletedOrder);
        })
    })

    // console.log(userData['isAdmin']);

    Restaurant.findByIdAndRemove(req.query.id)
        .exec()
        .then((deletedData) => {
            console.log('deleted rest : ' + deletedData);
            if (userData['isAdmin']) {
                res.redirect('/admin/panel/restaurants')
            } else {
                res.redirect('/profile')
            }
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