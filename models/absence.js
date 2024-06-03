const mongoose = require("mongoose");

const absenceSchema =new  mongoose.Schema({
  date: { type: Date, required: true },
  seanceH: { type: Number, required: true,default:1.5 },
  raison: { type: String },
  etudiant: {
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



module.exports = mongoose.model("Absence", absenceSchema);


