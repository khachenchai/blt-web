const checkAdmin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        // User is an admin, allow access to the route
        next();
    } else {
        // User is not an admin, redirect or render an error page
        res.redirect('/')
    }
};

module.exports = checkAdmin;