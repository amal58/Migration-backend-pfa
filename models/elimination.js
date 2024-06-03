const mongoose = require("mongoose");

const eliminationSchema =new  mongoose.Schema({
  etat: { type: String, enum: ["elimine", "nomine"] },
  etudiant:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  matiere: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Matiere",
    required: true,
  },
});

module.exports = mongoose.model("Elimination", eliminationSchema);


