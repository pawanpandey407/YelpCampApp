const mongoose = require("mongoose");
const campgroundSchema = new mongoose.Schema({
  name: String,
  image: String,
  price: String,
  description: String,
  location: String,
  lat: Number,
  lng: Number,
  createdAt: { 
      type: Date, 
      default: Date.now 
   },
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    username: String
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment"
    }
  ]
});

  //Campground pre-hook
  // PRE HOOK THE MODEL, SO IF WE DELETE CAMPGROUNDS, WE DELETE ALL COMMENTS ON THAT CAMPGROUND
  // OPTIONAL
  const Comment = require('./comment');
  campgroundSchema.pre("remove",async function(){
     await Comment.deleteMany({
        _id:{
           $in:this.comments
        }
     });
  }); 

module.exports = mongoose.model("Campground", campgroundSchema);