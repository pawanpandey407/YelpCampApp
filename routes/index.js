var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");

// root route
router.get("/", function(req, res) {
    res.render("landing");
});

// show register form
router.get("/register", function(req, res) {
    res.render("register", {page: 'register'});
});

// handle sign up logic
router.post("/register", function(req, res) {
    var newUser = new User({username: req.body.username});
        User.register(newUser, req.body.password, function(err, user) {
            if(err) {
                console.log(err);
                return res.render("register", {error: err.message}); // err.message coming from a passport
            }
            passport.authenticate("local")(req, res, function(){
                // user coming from db(could use user.username also)
                req.flash("success", "Welcome to the YelpCamp " + req.body.username); 
                res.redirect("/campgrounds");
            });
        });
});

// show login form
router.get("/login", function(req, res) {
    res.render("login", {page: 'login'});
});

// handling login logic
// app.post("/login", middleware, callback)
router.post("/login", passport.authenticate("local",
     {
       successRedirect: "/campgrounds",
       failureRedirect: "/login",

       successFlash: "Welcome back to the YelpCamp",
       failureFlash: true // handles error when loggin in
    }), function(req, res) { // you can get rid of callback if needed
});

// logout route
router.get("/logout", function(req, res) {
    req.logout();
    req.flash("success", "Successfully logged you out"); // req.flash("key", "value");
    res.redirect("/campgrounds");
});

module.exports = router;