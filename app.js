require("dotenv").config();
var        express = require("express"),
               app = express(),
        bodyParser = require("body-parser"),
          mongoose = require("mongoose"),
             flash = require("connect-flash"),
          passport = require("passport"),
     LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"),
        Campground = require("./models/campground"),
        Comment    = require("./models/comment"),
        User       = require("./models/user"),
        seedDB     = require("./seeds")

var campgroundRoutes = require("./routes/campgrounds"),
         commentRoutes = require("./routes/comments"),
           indexRoutes = require("./routes/index")
 
var url = process.env.DATABASEURL || "mongodb://localhost:27017/yelp_camp_v12";
mongoose
      .connect(url, {

          useNewUrlParser: true,
          useUnifiedTopology: true
      })
      .then(()=> console.log("Connected to Database")) 
      .catch((error) => console.log(error.message));

// tell express to use body-parser
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
// serve the public directory 
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
//seedDB(); // seed the database

// adding a time since feature to our application
app.locals.moment = require('moment'); // this makes moment available as a variable in every EJS page

// PASSPORT CONFIGURATION
app.use(require("express-session")({
  secret: "Allowed to put anything you want",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// helps to check if user is already logged in (to show current user logged in)
app.use(function(req, res, next) {
    res.locals.currentUser = req.user; // passing currentUser to every templates
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

// requiring routes
app.use("/", indexRoutes); // you can get rid of "/" too
app.use("/campgrounds", campgroundRoutes); // all campgrounds routes should start with /campgrounds
app.use("/campgrounds/:id/comments", commentRoutes);

var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Server Has Started!");
});