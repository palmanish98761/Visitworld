var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var Middleware = require("../middleware"); //if you require a dir, index is automatically loaded
//===============================================
//CAMPGROUND ROUTES
//===============================================

//INDEX -show all campgrounds
//router.get("/", *}); pulls "/campgrounds" from 
//app.use("/campgrounds", campgroundRoutes); of app.js
//does not work on res.*("campgrounds/*")
router.get("/", function(req, res){
    //get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds){
        if(err){
            req.flash("error", "Something went wrong!");
            console.log(err);
        } else {
            res.render("campgrounds/index", {campgrounds: allCampgrounds});
        }
    });
});
//CREATE - add new campgrounds to DB
router.post("/", Middleware.isLoggedIn, function(req, res){
   //get data from form and add to campgrounds array
   var name = req.body.name;
   var price = req.body.price;
   var image = req.body.image;
   var desc = req.body.description;
   var author = {
       id: req.user._id,
       username: req.user.username
   };
   var newCampground = {name: name, price: price, image: image, description: desc, author: author};
  //Create a new campground and save to DB
  Campground.create(newCampground, function(err, newlyCreated){
      if(err){
          //redirect user with error message
          console.log(err);
      } else {
          //redirect with new campground
          req.flash("success", "Campground Created!");
          res.redirect("/world");
      }
     });
  });
//NEW - show form to create new campground
router.get("/new", Middleware.isLoggedIn, function(req, res){
    res.render("campgrounds/new");
});
//SHOW -shows more info about one campground
router.get("/:id", function(req, res){
    //find campground with provided id
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err){
            req.flash("error", "Somthing went wrong!");
            console.log(err);
        } else {
            console.log(foundCampground);
            //render show template
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

//EDIT campground route (form)
router.get("/:id/edit", Middleware.checkCampgroundOwnership, function(req, res){
   Campground.findById(req.params.id, function(err, foundCampground){
       if(err){
        req.flash("error", "Something went wrong!");
        res.redirect("back");   
       } else {
        res.render("campgrounds/edit", {campground: foundCampground});
       }
     });
});

//UPDATE campground route (submit edits)
router.put("/:id", Middleware.checkCampgroundOwnership, function(req, res){
   //find and update correct campground
   Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
       if(err){
           req.flash("error", "Something went wrong!");
           res.redirect("/world");
       } else {
           req.flash("success", "Campground updated!");
           res.redirect("/world/" + req.params.id);
       }
   });
});
//DESTROY campground route (delete campground)
router.delete("/:id", Middleware.checkCampgroundOwnership, function(req, res){
    //find and remove campground
    Campground.findByIdAndRemove(req.params.id, function(err){
        if(err){
            req.flash("error", "Something went wrong!");
            res.redirect("/world");
        } else {
            req.flash("error", "Campground deleted!");
            res.redirect("/world");
        }
    });
});

module.exports = router;