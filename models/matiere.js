const mongoose = require("mongoose");
const matiereSchema = new mongoose.Schema({
  nom: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true },
  coeff: { type: Number, required: true },
  nbHTotal: { type: Number, required: true },
  NbrHElim :{ type: Number, required: true  },
 
});
module.exports = mongoose.model("Matiere", matiereSchema);


