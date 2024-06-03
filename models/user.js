const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  num: { type: Number, unique: true },
  titre: { type: String },
  nom: { type: String },
  prenom: { type: String },
  cin: { type: String },
  datenaiss: { type: String },
  sexe: { type: String, enum: ["femme", "homme"] },
  telephone: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  adresse: { type: String },
  role: { type: String, enum: ["admin", "enseignant", "etudiant"] },
  universite: { type: String },
});
module.exports = mongoose.model("User", userSchema);
