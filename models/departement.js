const mongoose = require("mongoose");

const departementSchema = new mongoose.Schema({
  nom: { type: String },
  universite: { type: String },
  classe: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Classe",
      required: true,
      validate: {
        validator: async function (value) {
          const count = await mongoose.models.Departement.countDocuments({
            classe: value,
            _id: { $ne: this._id }, // Ne pas vérifier le département actuel
          });
          return count === 0;
        },
        message: "Cette classe est déjà associée à un autre département",
      },
    },
  ],
  chef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  enseignants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],
});

module.exports = mongoose.model("Departement", departementSchema);
