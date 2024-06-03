const User = require("../models/user");
const mongoose = require("mongoose");
const Matiere = require("../models/matiere");
const Elimination = require("../models/elimination");
const Classe = require("../models/classe");
const csvtojson = require("csvtojson");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
var generator = require("generate-password");
const bcrypt = require("bcryptjs");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "lajiliamal218@gmail.com",
    pass: "iwpe xeyj wutw sbpt",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

//********** */
const fetchUsers = (req, res) => {
  User.find()
    .then((users) =>
      res.status(200).json({
        model: users,
        message: "success",
      })
    )
    .catch((error) => {
      res.status(400).json({
        error: error.message,
        message: "probleme d'extraction",
      });
    });
};

//******************** */
const fetchEtudiants = (req, res) => {
  User.find({ role: "etudiant" })
    .then((users) =>
      res.status(200).json({
        model: users,
        message: "success",
      })
    )
    .catch((error) => {
      res.status(400).json({
        error: error.message,
        message: "probleme d'extraction",
      });
    });
};

//************ */
const fetchEnseignants = (req, res) => {
  User.find({ role: "enseignant" })
    .then((users) =>
      res.status(200).json({
        model: users,
        message: "success",
      })
    )
    .catch((error) => {
      res.status(400).json({
        error: error.message,
        message: "probleme d'extraction",
      });
    });
};

// //************ token */

const consulterProfil = async (req, res) => {
  try {
    const userId = req.auth.userId;
    console.log(userId);
    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({
        message: "Profil utilisateur non trouvé",
      });
    }

    res.status(200).json({
      profil: {
        numero: user.num || undefined,
        nom: user.nom,
        prenom: user.prenom,
        cin: user.cin,
        datenaiss: user.datenaiss,
        sexe: user.sexe,
        telephone: user.telephone,
        email: user.email,
        adresse: user.adresse,
        role: user.role,
        universite: user.universite,
      },
      message: "Profil utilisateur récupéré avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la recherche du profil utilisateur :", error);
    res.status(500).json({
      error: "Problème lors de la recherche du profil utilisateur",
      message: error.message,
    });
  }
};

const modifierProfil = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const userData = req.body;

    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "Profil utilisateur non trouvé" });
    }

    user.nom = userData.name || user.nom;
    user.prenom = userData.prenom || user.prenom;
    user.cin = userData.cin || user.cin;
    user.adresse = userData.adresse || user.adresse;
    user.email = userData.email || user.email;
    user.telephone = userData.telephone || user.telephone;

    await user.save();

    res
      .status(200)
      .json({ message: "Profil utilisateur mis à jour avec succès" });
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour du profil utilisateur :",
      error
    );
    res.status(500).json({
      error: "Problème lors de la mise à jour du profil utilisateur",
      message: error.message,
    });
  }
};

//***************** */

const addUser = async (req, res) => {
  try {
    console.log(req.files[0].path);
    var arrayToInsert = [];
    csvtojson({ encoding: "utf-8" })
      .fromFile(req.files[0].path)
      .then(async (source) => {
        for (var i = 0; i < source.length; i++) {
          let existUser = await User.findOne({ email: source[i]["email"] });
          if (!existUser) {
            console.log(source[i]["num"]);
            var singleRow = {
              num: source[i]["num"],
              nom: source[i]["nom"],
              prenom: source[i]["prenom"],
              cin: source[i]["cin"],
              datenaiss: source[i]["datenaiss"],
              sexe: source[i]["sexe"],
              telephone: source[i]["telephone"],
              email: source[i]["email"],
              titre: source[i]["titre"],
              adresse: source[i]["adresse"],
            };

            if (source[i].titre == "") {
              singleRow.role = "etudiant";
            } else {
              singleRow.role = "enseignant";
            }
            arrayToInsert.push(singleRow);
          }
        }
        for (i = 0; i < arrayToInsert.length; i++) {
          let passwords = generator.generate({
            length: 10,
            numbers: true,
          });
          const salt = await bcrypt.genSalt(10);
          const hashed = await bcrypt.hash(passwords, salt);

          const Users = new User({
            universite: "ISAMM",
            password: hashed,
            num: arrayToInsert[i].num,
            nom: arrayToInsert[i].nom,
            prenom: arrayToInsert[i].prenom,
            cin: arrayToInsert[i].cin,
            datenaiss: arrayToInsert[i].datenaiss,
            sexe: arrayToInsert[i].sexe,
            telephone: arrayToInsert[i].telephone,
            email: arrayToInsert[i].email,
            adresse: arrayToInsert[i].adresse,
            role: arrayToInsert[i].role,
          });

          if (arrayToInsert[i].titre != "") {
            Users.titre = arrayToInsert[i].titre;
          }

          transporter.sendMail(
            {
              from: "amal ",
              to: arrayToInsert[i].email,
              subject: "[ Compte to login -]",
              html: `<br><br>Cher <strong>${arrayToInsert[i].nom} ${arrayToInsert[i].prenom}</strong>,<br><br>
    Cher Etudiant voici votre compte pour accéder a notre plateforme <br><br>
    Votre email est: ${arrayToInsert[i].email} et votre Password est: ${passwords}`,
            },
            (err, info) => {
              if (err) {
                console.log(err);
                return res.status(400).json({
                  message: {
                    error: err,
                  },
                });
              }
              console.log(info);
            }
          );
          const response = await Users.save();
        }
        res.json(arrayToInsert);
      });
  } catch (error) {
    res.json(error);
  }
};

//************ tokeeeeen ******
const UpdateUser = async (req, res) => {
  try {
    const userId = req.auth.userId;
    console.log(userId);
    const user = await User.findOneAndUpdate({ _id: userId }, req.body, {
      new: true,
    });

    if (!user) {
      return res.status(404).json({
        message: "Utilisateur non trouvé",
      });
    }

    return res.status(200).json({
      model: user,
      message: "Utilisateur mis à jour",
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur :", error);
    return res.status(400).json({
      error: "Mauvaise requête utilisateur",
      message: error.message,
    });
  }
};

//************

const DeleteUser = (req, res) => {
  User.deleteOne({ _id: req.params.id })
    .then(() => res.status(200).json({ message: "Utilisateur supprimé" }))
    .catch((error) => {
      res.status(400).json({
        error: error.message,
        message: "Id utilisateur incorrect",
      });
    });
};

// *****************************

const EtudiantsEliminerParMatiere = async (req, res) => {
  try {
    const eliminations = await Elimination.find({ etat: "elimine" }).populate(
      "etudiant matiere"
    );

    const etudiantsEliminerParMatiere = {};

    eliminations.forEach((elimination) => {
      const matiereNom = elimination.matiere.nom;
      const etudiant = elimination.etudiant;

      if (!etudiantsEliminerParMatiere[matiereNom]) {
        etudiantsEliminerParMatiere[matiereNom] = [];
      }

      etudiantsEliminerParMatiere[matiereNom].push(etudiant);
    });

    const tailleParMatiere = {};
    for (const matiereNom in etudiantsEliminerParMatiere) {
      tailleParMatiere[matiereNom] =
        etudiantsEliminerParMatiere[matiereNom].length;
    }

    res.status(200).json({ tailleParMatiere, etudiantsEliminerParMatiere });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des étudiants éliminés par matière :",
      error
    );
    res.status(500).json({
      erreur:
        "Erreur lors de la récupération des étudiants éliminés par matière.",
    });
  }
};
// **********************

const EtudiantsNominerParMatiere = async (req, res) => {
  try {
    const eliminations = await Elimination.find({ etat: "nomine" }).populate(
      "etudiant matiere"
    );

    const etudiantsEliminerParMatiere = {};

    eliminations.forEach((elimination) => {
      const matiereNom = elimination.matiere.nom;
      const etudiant = elimination.etudiant;

      if (!etudiantsEliminerParMatiere[matiereNom]) {
        etudiantsEliminerParMatiere[matiereNom] = [];
      }

      etudiantsEliminerParMatiere[matiereNom].push(etudiant);
    });

    const tailleParMatiere = {};
    for (const matiereNom in etudiantsEliminerParMatiere) {
      tailleParMatiere[matiereNom] =
        etudiantsEliminerParMatiere[matiereNom].length;
    }

    res.status(200).json({ tailleParMatiere, etudiantsEliminerParMatiere });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des étudiants éliminés par matière :",
      error
    );
    res.status(500).json({
      erreur:
        "Erreur lors de la récupération des étudiants éliminés par matière.",
    });
  }
};

//get list etud by classe
const ListEtudByClasse = async (req, res) => {
  try {
    let id = req.params.id;
    const existUser = await Classe.findById(req.params.id).populate(
      "etudiants"
    );
    res.json(existUser.etudiants);
  } catch (e) {
    console.log(e);
    res.status(500).send("Internal Server Error");
  }
};

const getEnseignantsByEtudiant = async (req, res) => {
  try {
    const etudiantId = req.params.id;

    const classe = await Classe.findOne({ etudiants: etudiantId }).populate({
      path: "matieres.enseignant",
      model: "User",
    });

    if (!classe) {
      return res.status(404).json({
        message: "Aucune classe trouvée pour cet étudiant",
      });
    }

    const enseignants = classe.matieres.map((matiere) => matiere.enseignant);

    res.status(200).json({ enseignants });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des enseignants de l'étudiant :",
      error
    );
    res.status(500).json({
      error: "Erreur lors de la récupération des enseignants de l'étudiant.",
      message: error.message,
    });
  }
};

module.exports = {
  UpdateUser: UpdateUser,
  fetchUsers: fetchUsers,
  addUser: addUser,
  DeleteUser: DeleteUser,
  consulterProfil: consulterProfil,
  EtudiantsEliminerParMatiere: EtudiantsEliminerParMatiere,
  fetchEtudiants: fetchEtudiants,
  fetchEnseignants: fetchEnseignants,
  EtudiantsNominerParMatiere: EtudiantsNominerParMatiere,
  ListEtudByClasse: ListEtudByClasse,
  modifierProfil: modifierProfil,
  getEnseignantsByEtudiant,
};
