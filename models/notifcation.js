const mongoose = require("mongoose");

const notificationSchema =new  mongoose.Schema({
  date:{type:Date,default:new Date()},
  open:{type:Boolean,default:false},
  contenu:{type:String},
  elimination: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Elimination",
    required: true,
  },
  etudiantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }
});

module.exports = mongoose.model("Notification", notificationSchema);


