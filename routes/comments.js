var express = require("express");
var router = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var campground = require("../models/campground");
var middleware = require("../middleware"); // index.js is the first file that is looked up so doesn't need to be included in the path

// COMMENT NEW ROUTE (GET)
router.get("/new", middleware.isLoggedIn, function(req, res) {
    // find Campground by id
    Campground.findById(req.params.id, function(err, campground) {
        if(err) {
          console.log(err);
        } else {
          res.render("comments/new", {campground: campground}); // the second campground is coming from database above
        }
    });
});

// COMMENT CREATE ROUTE (POST)
router.post("/", middleware.isLoggedIn, function(req, res) {
    // lookup campground using id
    Campground.findById(req.params.id, function(err, campground) {
      if(err) {
        console.log(err);
        res.redirect("/campgrounds");
      } else {
        // create a new comment
        Comment.create(req.body.comment, function(err, comment) {
          if(err) {
            req.flash("error", "Something went wrong");
            console.log(err);
        } else {
          //add username and id to the comment
          comment.author.username = req.user.username;
          comment.author.id = req.user._id;
          // save the comment
          comment.save();
          // connect new comment to campground
          campground.comments.push(comment);
          campground.save();
          req.flash("success", "Comment successfully created");
          //redirect campground show page
          res.redirect("/campgrounds/" + campground._id);
        }
      });
    }
  });
});

// COMMENT EDIT ROUTE
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res) {
    Campground.findById(req.params.id, function(err, foundCampground) {
        if(err || !foundCampground) {
            req.flash("error", "Campground not found");
            return res.redirect("back");
        }
        Comment.findById(req.params.comment_id, function(err, foundComment) {
            if(err) {
                res.redirect("back");
            } else {
                res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
            }
        });
    });
});

// COMMENT UPDATE ROUTE
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment) {
        if(err) {
          res.redirect("back");
        } else {
          req.flash("success", "Comment successfully updated");
          res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

// COMMENT DELETE/DESTROY ROUTE
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res) {
    // findByIdAndRemove
      Comment.findByIdAndRemove(req.params.comment_id, function(err) {
        if(err) {
          req.flash("error", "Something went wrong");
          res.redirect("back");
        } else {
          req.flash("success", "Comment deleted");
          res.redirect("/campgrounds/" + req.params.id);
        }
      })
});

module.exports = router;
