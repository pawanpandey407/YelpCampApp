var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware"); // index.js is the first file that is looked up so doesn't need to be included in the path
var NodeGeocoder = require("node-geocoder");
 
var options = {
  provider: "google",
  httpAdapter: "https",
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);

// INDEX  CAMPGROUND ROUTE - show all campgrounds
router.get("/", function(req, res) {
    // Get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds) {
        if(err) {
          console.log(err);
        } else {
          res.render("campgrounds/index", {campgrounds: allCampgrounds, page: 'campgrounds'});
        }
    });
    });

//CREATE CAMPGROUND ROUTE- add new campground to DB
router.post("/", middleware.isLoggedIn, function(req, res){
  // get data from form and add to campgrounds array
  var name = req.body.name;
  var image = req.body.image;
  var desc = req.body.description;
  var price = req.body.price;
  var author = {
      id: req.user._id,
      username: req.user.username
  }
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash("error", "Invalid address");
      return res.redirect("back");
    }
    var lat = data[0].latitude;
    var lng = data[0].longitude;
    var location = data[0].formattedAddress;
    var newCampground = {name: name, image: image, description: desc, price: price, author:author, location: location, lat: lat, lng: lng};
    // Create a new campground and save to DB
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to campgrounds page
            console.log(newlyCreated);
            req.flash("success", "New Campground Created");
            res.redirect("/campgrounds");
        }
    });
  });
});

// NEW CAMPGROUND ROUTE - show  form to create a new campground
// Always put it before SHOW ROUTE
router.get("/new", middleware.isLoggedIn, function(req, res) {
    res.render("campgrounds/new");
});

// SHOW  CAMPGROUND ROUTE - show info about one campground
router.get("/:id", function(req, res) {
    // find campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground) {
      if(err || !foundCampground) { //!foundCampground prevents from null value
        req.flash("error", "Campground not found");
        res.redirect("back");
        console.log(err);
      } else {
        console.log(foundCampground);
        // render SHOW template with that campground
        res.render("campgrounds/show", {campground: foundCampground});
      }
    });
});

// EDIT CAMPGROUND ROUTE 
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findById(req.params.id, function(err, foundCampground) {
      res.render("campgrounds/edit", {campground: foundCampground});
    });
});

// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash("error", "Invalid address");
      return res.redirect("back");
    }
    req.body.campground.lat = data[0].latitude;
    req.body.campground.lng = data[0].longitude;
    req.body.campground.location = data[0].formattedAddress;
    
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, campground){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
        }
    });
  });
});

// DELETE/DESTROY  CAMPGROUND ROUTE
// Same thing as above i.e. commented,but newer syntaxes
router.delete("/:id", middleware.checkCampgroundOwnership, async(req,res)=>{
    try {
      let foundCampground = await Campground.findById(req.params.id);
      await foundCampground.remove();
      req.flash("success", "Campground successfully deleted!!!");
      res.redirect("/campgrounds");
    } catch (error) {
      res.redirect("/campgrounds");
    }
});

module.exports = router;