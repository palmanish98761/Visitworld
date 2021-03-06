var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Campground = require("../models/campground");
var Comment = require("../models/comment");

//Root route
router.get("/", function(req, res){
    res.render("landing");
});
//Show register form
router.get("/register", function(req, res){
    res.render("register");
});
//Handle sign up logic
router.post("/register", function(req, res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            req.flash("error", err.message);
            return res.redirect("/register");
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to visitWorld! " + user.username);
            res.redirect("/world");
        });
    });
});
//Show login form
router.get("/login", function(req, res){
    res.render("login");
});
//Handle login logic with middleware and callback function
router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/world",
        failureRedirect: "/login"
    }), function(req, res){
});
//Logout logic
router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "Logged you out!")
    res.redirect("/world");
});

module.exports = router;