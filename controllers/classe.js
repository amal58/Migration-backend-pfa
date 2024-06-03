const Classe = require("../models/classe");
const Absence = require("../models/absence");
const Elimination = require("../models/elimination");
const fetchClasses = (req, res) => {
  Classe.find()
    .populate({
      path: "matieres.nomMatiere", // Population des matières
      model: "Matiere",
      select: "id nom code", // Sélectionner seulement le champ nom de la matière
    })
    .populate({
      path: "matieres.enseignant",
      model: "User",
      select: "id nom prenom",
    })
    .populate({
      path: "etudiants",
      model: "User",
      select: "nom prenom",
    })
    .then((classes) =>
      res.status(200).json({
        classes: classes,
        message: "Success",
      })
    )
    .catch((error) => {
      res.status(400).json({
        error: error.message,
        message: "Problème d'extraction",
      });
    });
};

//*********************** */

//tryyyyy classe + etudiant + nbr absence + etat nominé eliminé

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

const getClasseById = (req, res) => {
  Classe.findOne({ _id: req.params.id })
    .populate({
      path: "matieres.nomMatiere", // Population des matières
      model: "Matiere",
      select: "nom code", // Sélectionner seulement le champ nom de la matière
    })
    .populate({
      path: "matieres.enseignant",
      model: "User",
      select: "id nom prenom",
    })
    .populate({
      path: "etudiants",
      model: "User",
      select: "nom prenom",
    })
    .then((classes) => {
      if (!classes) {
        res.status(404).json({
          message: "Classe non trouve",
        });
        return;
      }
      res.status(200).json({
        model: classes,
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

//******************* */

// const getStudentsByClassAndSubjectId = async (req, res) => {
//   const { classeId, matiereId } = req.params;
//   console.log(classeId, matiereId);
//   try {
//     // Récupérer la classe par son ID
//     const classe = await Classe.findById(classeId).populate("etudiants");
//     console.log(classe);

//     if (!classe) {
//       return res.status(404).json({ message: "Classe non trouvée" });
//     }

//     const students = [];

//     // Pour chaque étudiant de la classe, récupérer le nombre d'absences et l'état
//     for (const etudiant of classe.etudiants) {
//       const absenceCount = await Absence.countDocuments({
//         etudiant: etudiant._id,
//         matiere: matiereId,
//       });

//       console.log("hedha id matiere", matiereId);
//       const elimination = await Elimination.findOne({
//         etudiant: etudiant._id,
//         matiere: matiereId,
//       });
//       console.log("hedhi", elimination);
//       const studentData = {
//         _id: etudiant._id,
//         nom: etudiant.nom,
//         prenom: etudiant.prenom,
//         nbAbsences: absenceCount,
//         etat: elimination ? elimination.etat : "", // Si l'étudiant est éliminé, récupérer son état
//       };

//       students.push(studentData);
//       console.log(students);
//     }

//     res.status(200).json({
//       classe: classe.nom,
//       matiereId: matiereId,
//       etudiants: students,
//     });
//   } catch (error) {
//     console.error(
//       "Une erreur s'est produite lors de la récupération des étudiants par ID de classe et de matière:",
//       error
//     );
//     res.status(500).json({ message: "Erreur serveur" });
//   }
// };

const getStudentsByClassAndSubjectId = async (req, res) => {
  const { classeId, matiereId } = req.params;
  console.log(classeId, matiereId);

  try {
    // Récupérer la classe par son ID
    const classe = await Classe.findById(classeId).populate("etudiants");
    console.log(classe);

    if (!classe) {
      return res.status(404).json({ message: "Classe non trouvée" });
    }

    const students = await Promise.all(
      classe.etudiants.map(async (etudiant) => {
        const absenceCount = await Absence.countDocuments({
          etudiant: etudiant._id,
          matiere: matiereId,
        });

        const elimination = await Elimination.findOne({
          etudiant: etudiant._id,
          matiere: matiereId,
        });

        return {
          _id: etudiant._id,
          nom: etudiant.nom,
          prenom: etudiant.prenom,
          nbAbsences: absenceCount,
          etat: elimination ? elimination.etat : "", // Si l'étudiant est éliminé, récupérer son état
        };
      })
    );

    res.status(200).json({
      classe: classe.nom,
      matiereId: matiereId,
      etudiants: students,
    });
  } catch (error) {
    console.error(
      "Une erreur s'est produite lors de la récupération des étudiants par ID de classe et de matière:",
      error
    );
    res.status(500).json({ message: "Erreur serveur" });
  }
};

//******************** */

const addClasse = (req, res) => {
  const classe = new Classe(req.body);
  classe
    .save()
    .then(() =>
      res.status(201).json({
        model: classe,
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

const UpdateClasse = (req, res) => {
  Classe.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true })
    .then((classe) => {
      if (!classe) {
        res.status(404).json({
          message: "classe not found ",
        });
        return;
      }
      res.status(200).json({
        model: classe,
        message: "classe updated",
      });
    })
    .catch((error) =>
      res.status(400).json({
        error: error.message,
        message: "classe not correct",
      })
    );
};

const DeleteClasse = (req, res) => {
  Classe.deleteOne({ _id: req.params.id })
    .then(() => res.status(200).json({ message: "classe deleted" }))
    .catch((error) => {
      res.status(400).json({
        error: error.message,
        message: "Id classe not correct ",
      });
    });
};

module.exports = {
  addClasse: addClasse,
  DeleteClasse: DeleteClasse,
  UpdateClasse: UpdateClasse,
  getClasseById: getClasseById,
  fetchClasses: fetchClasses,
  getStudentsByClassAndSubjectId: getStudentsByClassAndSubjectId,
};
