const mongoose = require("mongoose");
const classeSchema = new mongoose.Schema({
  nom: { type: String, required: true, unique: true },
  niveau: { type: String, required: true },
  etudiants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],
  matieres: [
    {
      nomMatiere: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Matiere",
        required: true,
      },
      dateDebut: { type: Date, required: true },
      dateFin: { type: Date, required: true },
      enseignant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    },
  ],
});

module.exports = mongoose.model("Classe", classeSchema);
