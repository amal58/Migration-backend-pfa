const Absence = require("../models/absence");
const Matiere = require("../models/matiere");
const Elimination = require("../models/elimination");
const Notification = require("../models/notifcation");
const User = require("../models/user");
const Classse = require("../models/classe");
const socketIo = require("socket.io");
const moment = require("moment");
const app = require("../app");
const fetchAbsences = (req, res) => {
  Absence.find()
    .populate("etudiant")
    .populate("matiere")
    .then((absences) =>
      res.status(200).json({
        nombre: absences.length,
        model: absences,
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

const getAbsenceById = (req, res) => {
  Absence.findOne({ _id: req.params.id })
    .populate("etudiant")
    .populate("matiere")
    .then((absences) => {
      if (!absences) {
        res.status(404).json({
          message: "absence non trouve",
        });
        return;
      }
      res.status(200).json({
        model: absences,
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

//********** */
// const addAbsence = async (req, res) => {
//   try {
//     const matiere = req.body.matiere;
//     const etud = req.body.etudiant;
//     let objectMatiere = {};
//     const absence = new Absence(req.body);
//     let abs = await absence.save();
//     let clase = await Classse.findOne({ etudiants: etud });
//     console.log(clase);
//     clase.matieres.map((element) => {
//       if (element.nomMatiere == matiere) {
//         objectMatiere.nomMatiere = element.nomMatiere;
//         objectMatiere.dateDebut = element.dateDebut;
//         objectMatiere.dateFin = element.dateFin;
//       }
//     });
//     const Totalabscences = await Absence.find({
//       etudiant: etud,
//       matiere: matiere,
//     });
//     let Total = 0;
//     Totalabscences.map((e) => {
//       if (
//         moment(e.date).isBetween(objectMatiere.dateDebut, objectMatiere.dateFin)
//       ) {
//         Total += e.seanceH;
//       }
//     });
//     const existMatiere = await Matiere.findById({ _id: matiere });
//     console.log(Total);
//     if (
//       existMatiere.NbrHElim == Total + 1.5 ||
//       existMatiere.NbrHElim == Total + 1
//     ) {
//       const nomination = new Elimination({
//         etat: "nomine",
//         etudiant: etud,
//         matiere: matiere,
//       });
//       const nominat = await nomination.save();
//       const notification = new Notification({
//         elimination: nominat._id,
//         contenu: "Vous etes nominé dans la matiére:",
//         etudiantId: etud,
//       });

//       await notification.save();
//     }
//     const elim = await Elimination.findOne({
//       etudiant: etud,
//       matiere: matiere,
//     });
//     if (elim) {
//       if (existMatiere.NbrHElim <= Total) {
//         const eliminat = await Elimination.findByIdAndUpdate(
//           { _id: elim._id },
//           {
//             etat: "elimine",
//           }
//         );
//         console.log("nbrhel", existMatiere.NbrHElim);
//         const existNotif = await Notification.findOne({
//           $and: [
//             { elimination: eliminat._id },
//             { contenu: "Vous etes eliminéé dans la matiére:" },
//           ],
//         });
//         console.log("exitnotif", existNotif);
//         console.log("etat elimination", eliminat.etat);
//         if (existNotif == null && eliminat.etat == "elimine") {
//           const notification = new Notification({
//             elimination: eliminat._id,
//             contenu: "Vous etes eliminéé dans la matiére:",
//             etudiantId: etud,
//           });
//           await notification.save();
//         }
//       }
//     }

//     res.json(objectMatiere);
//   } catch (e) {
//     console.log(e);
//   }
// };

const addAbsence = async (req, res) => {
  try {
    const { matiere, etudiant } = req.body;

    const absence = new Absence(req.body);
    await absence.save();

    const classe = await Classse.findOne({
      etudiants: etudiant,
      "matieres.nomMatiere": matiere,
    });

    if (!classe) {
      return res.status(404).json({
        message: "Classe non trouvée pour cet étudiant et cette matière",
      });
    }

    const matiereObj = classe.matieres.find(
      (element) => element.nomMatiere.toString() === matiere
    );

    if (!matiereObj) {
      return res
        .status(404)
        .json({ message: "Matière non trouvée dans cette classe" });
    }

    const { dateDebut, dateFin } = matiereObj;

    const totalAbsences = await Absence.find({
      etudiant: etudiant,
      matiere: matiere,
      date: { $gte: dateDebut, $lte: dateFin },
    });

    const totalHours = totalAbsences.reduce(
      (total, absence) => total + absence.seanceH,
      0
    );

    const matiereDetails = await Matiere.findById(matiere);

    if (!matiereDetails) {
      return res
        .status(404)
        .json({ message: "Détails de la matière non trouvés" });
    }

    if (matiereDetails.NbrHElim <= totalHours + 1.5) {
      let etat = "nomine";
      if (matiereDetails.NbrHElim <= totalHours) {
        etat = "elimine";
      }

      const elimination = await Elimination.findOneAndUpdate(
        { etudiant: etudiant, matiere: matiere },
        { etat: etat },
        { upsert: true, new: true }
      );

      const notification = new Notification({
        elimination: elimination._id,
        contenu: `Vous êtes ${etat} dans la matière:`,
        etudiantId: etudiant,
      });

      await notification.save();
    }

    res.json(matiereObj);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

//******************** */ list des etudiant lkol pas un seul etud ou matiere  tebe3 l'admin
const AbsencesEtudiantMatiere = async (req, res) => {
  try {
    const etudiants = await User.find({ role: "etudiant" });
    const resultats = [];
    for (const etudiant of etudiants) {
      const absences = await Absence.find({ etudiant: etudiant._id });
      const absencesParMatiere = {};
      for (const absence of absences) {
        const matiere = await Matiere.findById(absence.matiere);
        if (matiere) {
          absencesParMatiere[matiere.nom] =
            (absencesParMatiere[matiere.nom] || 0) + 1;
        }
      }
      resultats.push({
        etudiant: { nom: etudiant.nom, prenom: etudiant.prenom },
        matiere: absencesParMatiere,
      });
    }
    return res.status(200).json({ resultats });
  } catch (error) {
    console.error(
      "Une erreur s'est produite lors du comptage des absences par matière pour chaque étudiant:",
      error
    );
  }
};

//******************* */
const AbsencesParEtudiant = async (req, res) => {
  try {
    const etudiants = await User.find({ role: "etudiant" });
    const resultats = [];
    for (const etudiant of etudiants) {
      const absences = await Absence.find({ etudiant: etudiant._id });
      const nombreAbsences = absences.length;
      if (nombreAbsences > 0) {
        resultats.push({
          etudiant: {
            num: etudiant.num,
            nom: etudiant.nom,
            prenom: etudiant.prenom,
          },
          nombreAbsences,
        });
      }
    }
    if (resultats.length === 0) {
      return res.status(200).json({
        message: "Aucun étudiant n'est absent.",
      });
    }
    return res.status(200).json({ resultats });
  } catch (error) {
    console.error(
      "Une erreur s'est produite lors du comptage des absences par étudiant:",
      error
    );
  }
};

//************** token */
const AbsencebyEtudiant = async (req, res) => {
  const etudiantId = req.auth.userId;
  console.log(etudiantId);
  try {
    const absences = await Absence.find({ etudiant: etudiantId });
    const absencesParMatiere = {};
    for (const absence of absences) {
      const matiere = await Matiere.findById(absence.matiere);
      if (matiere) {
        absencesParMatiere[matiere.nom] =
          (absencesParMatiere[matiere.nom] || 0) + 1;
      }
      console.log(absencesParMatiere);
    }
    return res.status(200).json({ absencesParMatiere });
  } catch (error) {
    console.error(
      "Une erreur s'est produite lors du comptage des absences par matière pour l'étudiant:",
      error
    );
  }
};

//************* */

const UpdateAbsence = (req, res) => {
  Absence.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true })
    .then((absence) => {
      if (!absence) {
        res.status(404).json({
          message: "absence not found ",
        });
        return;
      }
      res.status(200).json({
        message: "absence updated",
        model: absence,
      });
    })
    .catch((error) =>
      res.status(400).json({
        error: error.message,
        message: "absence not correct",
      })
    );
};

const DeleteAbsence = (req, res) => {
  Absence.deleteOne({ _id: req.params.id })
    .then(() => res.status(200).json({ message: "Absence deleted" }))
    .catch((error) => {
      res.status(400).json({
        error: error.message,
        message: "Id Absence not correct ",
      });
    });
};

const abs = async (req, res) => {
  try {
    const absences = await Absence.find();
    res.status(200).json(absences);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des absences.", error });
  }
};

module.exports = {
  UpdateAbsence: UpdateAbsence,
  fetchAbsences: fetchAbsences,
  getAbsenceById: getAbsenceById,
  addAbsence: addAbsence,
  DeleteAbsence: DeleteAbsence,
  AbsencebyEtudiant: AbsencebyEtudiant,
  AbsencesParEtudiant: AbsencesParEtudiant,
  AbsencesEtudiantMatiere: AbsencesEtudiantMatiere,
  abs,
};
