const Campground = require("../models/campground");
const Comment = require("../models/comment");

// All the middleware goes here
const middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function(req, res, next) {
    // Is user logged in?
    if(req.isAuthenticated()) {    
        Campground.findById(req.params.id, function(err, foundCampground) {
          if(err || !foundCampground) { //!foundCampground prevents from null value and crashing the app
            req.flash("error", "Campground not found");
            res.redirect("back");
          } else {
              // does the user owns the campground?
              if(foundCampground.author.id.equals(req.user._id)) {
                next();
              } else {
                req.flash("error", "Permission denied");
                res.redirect("back");
              }
          }
    });
   } else {
     req.flash("error", "Need to be logged in");
       res.redirect("back");
   }
}

middlewareObj.checkCommentOwnership = function(req, res, next) {
    // Is user logged in?
    if(req.isAuthenticated()) {    
        Comment.findById(req.params.comment_id, function(err, foundComment) {
          if(err || !foundComment) { //!foundComment prevents from null value and from crashing the app
            req.flash("error", "Comment not found");
            res.redirect("back");
          } else {
            // does the user owns the comment?
            if(foundComment.author.id.equals(req.user._id)) { // req.user._id is kept on passport
              next();
            } else {
              req.flash("error", "Permission denied");
              res.redirect("back");
            }
          }
    });
  } else {
        req.flash("error", "Need to be logged in"); 
        res.redirect("back");
  }
}

middlewareObj.isLoggedIn = function(req, res, next) {
    if(req.isAuthenticated()) {
      return next();
    }
      req.flash("error", "Need to be logged in"); // req.flash("key", "value");
      res.redirect("/login");
}


module.exports = middlewareObj;