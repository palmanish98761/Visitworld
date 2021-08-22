var express = require("express");
var router = express.Router({mergeParams: true}); //allows :id to access DB when route defined by app.use("/:id", fooRoute)
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var Middleware = require("../middleware"); //if you require a dir, index is automatically loaded
//===============================================
// COMMENTS ROUTES
//===============================================
//Comments New
router.get("/new", Middleware.isLoggedIn, function(req, res){
    //find campground by id
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            req.flash("error", "Something went wrong!");
            console.log(err);
        } else {
            res.render("comments/new", {campground: campground});
        }
    });
    
});
//Comments Create
router.post("/", Middleware.isLoggedIn, function(req, res){
    //lookup campground using ID
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            req.flash("error", "Something went wrong!");
            console.log(err);
            res.redirect("/world");
        } else {
            //create new comment
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    req.flash("error", "Something went wrong!");
                    console.log(err);
                    res.redirect("/world");
                } else {
                    //add username and id to comments
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    //save comment
                    comment.save();
                    campground.comments.push(comment);
                    campground.save();
                    //console.log(comment);
                    req.flash("success", "Comment posted!");
                    res.redirect("/world/" + campground._id);
                }
            });
        }
    });
});


//EDIT
router.get("/:comment_id/edit", Middleware.checkCommentOwnership, function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundComment){
       if(err){
           req.flash("error", "Something went wrong!");
           res.redirect("back");
       } else {
           res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
       }
    });
    
});

//UPDATE
router.put("/:comment_id", Middleware.checkCommentOwnership, function(req, res){
   //find and update correct comment
   //Comment.findByIdAndUpdate(id to find by, data to update, callback function){
   Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err,updatedComment){
       if(err){
           res.redirect("back");
       } else {
           req.flash("success", "Comment updated!");
           res.redirect("/world/" + req.params.id);
       }
   });
});

//DESTROY
router.delete("/:comment_id", Middleware.checkCommentOwnership, function(req, res){
    //find and remove campground
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            req.flash("error", "Something went wrong!");
            res.redirect("/world/" + req.params.id);
        } else {
            req.flash("error", "Comment deleted!");
            res.redirect("/world/" + req.params.id);
        }
    });
});

module.exports = router;