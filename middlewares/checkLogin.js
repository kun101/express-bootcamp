var checkLogin = function (req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.send("You are not authenticated");
    }
};

module.exports = checkLogin;