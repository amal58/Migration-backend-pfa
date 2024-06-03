const Elimination = require("../models/elimination");
const Matiere = require("../models/matiere");
const Classe = require("../models/classe");
const User = require("../models/user");
const Absence = require("../models/absence");
const moment = require("moment");

//admin get list elimine  par matiere

const fetchEliminatedStudents = async (req, res) => {
  try {
    const classes = await Classe.find().populate("matieres.nomMatiere");

    const resultats = [];

    for (const classe of classes) {
      for (const matiere of classe.matieres) {
        const classeId = classe._id;
        const matiereId = matiere.nomMatiere._id;

        // Récupérer les étudiants éliminés pour cette classe et cette matière
        const eliminations = await Elimination.find({
          etat: "elimine",
          matiere: matiereId,
        }).populate("etudiant", "nom prenom");

        // Vérifier s'il y a des étudiants éliminés pour cette matière
        if (eliminations.length > 0) {
          const etudiantsElimines = eliminations
            .filter((elim) => elim.etudiant !== null) // Filtrer les éliminations où l'étudiant est défini
            .map((elim) => {
              return {
                id: elim.etudiant._id,
                nom: elim.etudiant.nom,
                prenom: elim.etudiant.prenom,
              };
            });

          resultats.push({
            classe: classe.nom,
            matiere: matiere.nomMatiere.nom,
            etudiants: etudiantsElimines,
          });
        }
      }
    }

    res.json(resultats);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des étudiants éliminés pour toutes les classes:",
      error
    );
    res.status(500).json({
      message:
        "Erreur lors de la récupération des étudiants éliminés pour toutes les classes",
    });
  }
};

const fetchNominatedStudents = async (req, res) => {
  try {
    const nominations = await Elimination.find({ etat: "nomine" }).populate(
      "etudiant"
    );

    const nominatedStudents = nominations.map(
      (nomination) => nomination.etudiant
    );

    const nominatedStudentsCount = nominations.length;

    res.status(200).json({ nominatedStudents, nominatedStudentsCount });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des étudiants nominés:",
      error
    );
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des données" });
  }
};

//list elimine par matiere par enseignant
const ListElimineByEnseig = async (req, res) => {
  try {
    let tab = [];
    let Elim = [];
    let idMat = req.params.id;
    let idEns = req.body.idEns;
    const existClas = await Classe.find();
    for (let i = 0; i < existClas.length; i++) {
      for (let j = 0; j < existClas[i].matieres.length; j++) {
        if (
          existClas[i].matieres[j].nomMatiere == idMat &&
          existClas[i].matieres[j].enseignants == idEns
        ) {
          tab.push(existClas[i].etudiants);
        }
      }
    }
    for (let k = 0; k < tab.length; k++) {
      const existElim = await Elimination.findOne({
        $and: [
          { etudiant: tab[k] },
          { matiere: req.params.id },
          { etat: "elimine" },
        ],
      }).populate("etudiant");
      Elim.push(existElim.etudiant);
    }
    console.log(tab);

    res.json(Elim);
  } catch (e) {
    console.log(e);
  }
};

//GET LIST MTAA LES MATIERE ELIMINE PAR ETUD
const ListMatiereElimineByetud = async (req, res) => {
  try {
    const existClas = await Classe.findOne({ etudiants: req.params.id });
    let tab = [];
    let Elim = [];
    for (let i = 0; i < existClas.matieres.length; i++) {
      const existMat = await Matiere.findById(existClas.matieres[i].nomMatiere);
      const currentDate = moment();
      console.log(currentDate);
      console.log(existMat.dateDebut);
      console.log(existMat.dateFin);
      if (
        currentDate.isBetween(
          existClas.matieres[i].dateDebut,
          existClas.matieres[i].dateFin
        )
      ) {
        tab.push(existMat);
        console.log(tab);
      }
      for (let k = 0; k < tab.length; k++) {
        const existElim = await Elimination.findOne({
          $and: [
            { etudiant: req.params.id },
            { matiere: tab[k]._id },
            { etat: "elimine" },
          ],
        }).populate("matiere");
        Elim.push(existElim.matiere);
      }
    }
    res.json(Elim);
  } catch (e) {
    console.log(e);
  }
};

const getEtudiantsElimines = async (req, res) => {
  const classeId = req.params.classeId;
  const matiereId = req.params.matiereId;

  console.log("1", classeId);
  console.log("2", matiereId);
  try {
    const classe = await Classe.findOne({
      _id: classeId,
      "matieres.nomMatiere": matiereId,
    }).populate("etudiants");

    console.log("3", classe);
    if (!classe) {
      return res.status(404).json({ message: "Classe non trouvée" });
    }
    const eliminations = await Elimination.find({
      etat: "elimine",
      matiere: matiereId,
    }).populate("etudiant", "nom prenom");

    console.log("4", eliminations);
    const etudiantsElimines = eliminations
      .filter((elim) => {
        return classe.etudiants.some((etudiant) =>
          etudiant._id.equals(elim.etudiant._id)
        );
      })
      .map((elim) => {
        return {
          id: elim.etudiant._id,
          nom: elim.etudiant.nom,
          prenom: elim.etudiant.prenom,
        };
      });

    const mat = await Matiere.findById(matiereId).populate("nom");
    const clas = await Classe.findById(classeId).populate("nom");
    res.json({
      classe: clas.nom,
      matiere: mat.nom,
      etudiants: etudiantsElimines,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des étudiants éliminés :",
      error
    );
    res.status(500).json({
      message: "Erreur lors de la récupération des étudiants éliminés",
    });
  }
};

const getEtudianteNomines = async (req, res) => {
  const classeId = req.params.classeId;
  const matiereId = req.params.matiereId;

  console.log("1", classeId);
  console.log("2", matiereId);
  try {
    const classe = await Classe.findOne({
      _id: classeId,
      "matieres.nomMatiere": matiereId,
    }).populate("etudiants");

    console.log("3", classe);
    if (!classe) {
      return res.status(404).json({ message: "Classe non trouvée" });
    }
    const eliminations = await Elimination.find({
      etat: "nomine",
      matiere: matiereId,
    }).populate("etudiant", "nom prenom");

    console.log("4", eliminations);
    const etudiantsElimines = eliminations
      .filter((elim) => {
        return classe.etudiants.some((etudiant) =>
          etudiant._id.equals(elim.etudiant._id)
        );
      })
      .map((elim) => {
        return {
          id: elim.etudiant._id,
          nom: elim.etudiant.nom,
          prenom: elim.etudiant.prenom,
        };
      });

    const mat = await Matiere.findById(matiereId).populate("nom");
    const clas = await Classe.findById(classeId).populate("nom");
    res.json({
      classe: clas.nom,
      matiere: mat.nom,
      etudiants: etudiantsElimines,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des étudiants éliminés :",
      error
    );
    res.status(500).json({
      message: "Erreur lors de la récupération des étudiants éliminés",
    });
  }
};

const elimlist = async (req, res) => {
  try {
    const lista = await Elimination.find({ etat: "elimine" });
    res.status(200).json(lista);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des étudiants éliminés.",
      error,
    });
  }
};

const nomlist = async (req, res) => {
  try {
    const lista = await Elimination.find({ etat: "nomine" });
    res.status(200).json(lista);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des étudiants éliminés.",
      error,
    });
  }
};

module.exports = {
  fetchEliminatedStudents,
  ListElimineByEnseig,
  ListMatiereElimineByetud,
  getEtudiantsElimines,
  fetchNominatedStudents,
  getEtudianteNomines,
  elimlist,
  nomlist,
};
