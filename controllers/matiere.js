const Matiere = require("../models/matiere");
const Classe = require("../models/classe");
const User = require("../models/user");
const Absence = require("../models/absence");
const Elimination = require("../models/elimination");

const moment = require("moment");

const fetchMatieres = (req, res) => {
  Matiere.find()
    .then((matieres) =>
      res.status(200).json({
        model: matieres,
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

const getMatiereById = (req, res) => {
  Matiere.findOne({ _id: req.params.id })
    .then((matieres) => {
      if (!matieres) {
        res.status(404).json({
          message: "Matiere non trouve",
        });
        return;
      }
      res.status(200).json({
        model: matieres,
        message: "objet trouve",
      });
    })
    .catch((error) => {
      res.status(400).json({
        error: error.message,
        message: "probleme ",
      });
    });
};

const addMatiere = (req, res) => {
  const matiere = new Matiere(req.body);
  matiere
    .save()
    .then(() =>
      res.status(201).json({
        model: matiere,
        message: "creation avec success!",
      })
    )
    .catch((error) => {
      res.status(400).json({
        error: error.message,
        message: "Données invalides",
      });
    });
};

const UpdateMatiere = (req, res) => {
  Matiere.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true })
    .then((matiere) => {
      if (!matiere) {
        res.status(404).json({
          message: "Matiere not found ",
        });
        return;
      }
      res.status(200).json({
        model: matiere,
        message: "matiere updated",
      });
    })
    .catch((error) =>
      res.status(400).json({
        error: error.message,
        message: "matiere not correct",
      })
    );
};

const DeleteMatiere = (req, res) => {
  Matiere.deleteOne({ _id: req.params.id })
    .then(() => res.status(200).json({ message: "Matiere deleted" }))
    .catch((error) => {
      res.status(400).json({
        error: error.message,
        message: "Id Matiere not correct ",
      });
    });
};

//get liste des matiere eli ya9rahom chaque etud +nbr d'absence
const ListMatByEtud = async (req, res) => {
  try {
    const existClas = await Classe.findOne({ etudiants: req.params.id });
    let tab = [];
    for (let i = 0; i < existClas.matieres.length; i++) {
      const existMat = await Matiere.findById(existClas.matieres[i].nomMatiere);
      const existAb = await Absence.find({
        $and: [{ etudiant: req.params.id }, { matiere: existMat._id }],
      });
      console.log(existAb);
      let sum = 0;
      for (let j = 0; j < existAb.length; j++) {
        sum += existAb[j].seanceH;
      }
      const existElim = await Elimination.find({
        $and: [{ etudiant: req.params.id }, { matiere: existMat._id }],
      });
      console.log(existElim);
      let status = "Normal";
      for (let k = 0; k < existElim.length; k++) {
        status = existElim[k].etat;
      }
      tab.push({
        mat: existMat,
        dateDebut: existClas.matieres[i].dateDebut,
        dateFin: existClas.matieres[i].dateFin,
        sumAbsence: sum,
        status: status,
      });
    }
    res.status(200).json({ tab });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

//get list mtaa les matieres eli y9arihom
const ListMatByEnseig = async (req, res) => {
  try {
    let tab = [];
    let id = req.params.id;
    existClas = await Classe.find();
    for (let i = 0; i < existClas.length; i++) {
      for (let j = 0; j < existClas[i].matieres.length; j++) {
        if (existClas[i].matieres[j].enseignants == id) {
          const existMat = await Matiere.findById(
            existClas[i].matieres[j].nomMatiere
          );
          tab.push(existMat);
        }
      }
    }
    console.log(tab);
    res.json(tab);
  } catch (e) {
    console.log(e);
  }
};

//get liste des classes by enseig
const ListClasseByEnseig = async (req, res) => {
  try {
    let tab = [];
    const userId = req.auth.userId;
    console.log(userId);
    const existClas = await Classe.find({});
    for (let i = 0; i < existClas.length; i++) {
      for (let j = 0; j < existClas[i].matieres.length; j++) {
        if (existClas[i].matieres[j].enseignant == userId) {
          const existc = await Classe.findById(existClas[i]._id);
          tab.push(existc);
        }
      }
    }
    res.json(tab);
  } catch (e) {
    console.log(e);
  }
};

//classe matiere pour chaque enseignant
const ListMatByEnseige = async (req, res) => {
  try {
    const userId = req.auth.userId;
    console.log(userId);
    const currentDate = new Date();

    const classes = await Classe.find({
      "matieres.enseignant": userId,
    }).populate({
      path: "matieres.nomMatiere",
      select: "nom coeff nbHTotal",
    });
    console.log(classes);

    const classesParMatiere = {};

    classes.forEach((classe) => {
      classe.matieres.forEach((matiere) => {
        const dateDebut = moment(matiere.dateDebut);
        const dateFin = moment(matiere.dateFin);

        if (moment(currentDate).isBetween(dateDebut, dateFin)) {
          if (!classesParMatiere[matiere.nomMatiere._id]) {
            classesParMatiere[matiere.nomMatiere._id] = {
              matiere: matiere.nomMatiere.nom,
              coeff: matiere.nomMatiere.coeff,
              nbHTotal: matiere.nomMatiere.nbHTotal,
              classes: [],
            };
          }
          classesParMatiere[matiere.nomMatiere._id].classes.push({
            classeId: classe._id,
            nomClasse: classe.nom,
            niveau: classe.niveau,
            dateDebut: matiere.dateDebut,
            dateFin: matiere.dateFin,
          });
        }
      });
    });
    res.json(classesParMatiere);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

const mat = async (req, res) => {
  try {
    const matieres = await Matiere.find();
    res.status(200).json(matieres);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des matières.", error });
  }
};

module.exports = {
  UpdateMatiere: UpdateMatiere,
  fetchMatieres: fetchMatieres,
  getMatiereById: getMatiereById,
  addMatiere: addMatiere,
  DeleteMatiere: DeleteMatiere,
  ListMatByEtud: ListMatByEtud,
  ListMatByEnseig: ListMatByEnseig,
  ListClasseByEnseig: ListClasseByEnseig,
  ListMatByEnseige: ListMatByEnseige,
  mat,
};
