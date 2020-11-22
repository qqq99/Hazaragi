var express = require("express");
var router = express.Router();
var passport = require("passport");
var users = require("../models/users");
/********************
 AUTHENTICATION ROUTE
 ********************/
router.get("/register", function(req, res) {
    res.render("register");
});
router.post("/register", function(req, res) {
    var newUser = new users({ username: req.body.username });
    users.register(newUser, req.body.password, function(err, user) {
        if (err) {
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function() {
            res.redirect("/posts");
        });
    })
});
//LOGIN ROUTE
router.get("/login", function(req, res) {
    res.render("login");
});
//handle login logic
//app.post("/login",middleware,callback)
//middleware will call possport.use(new LocalStrategy(users.authenticate()))
router.post("/login", passport.authenticate("local", {
    //应该是redirect到原 page待实现？？？？？？
    successRedirect: "/posts",
    failureRedirect: "/login"
}), function(req, res) {});
//LOGOUT ROUTE
router.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
});
//Middleware
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
};
module.exports = router;