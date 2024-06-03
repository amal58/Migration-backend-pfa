const express = require("express");

const router = express.Router();
const elimController = require("../controllers/elimination");
const auth = require("../controllers/auth");

router.get("/listElimParEnsParMat/:id", elimController.ListElimineByEnseig);

router.get(
  "/ListMatiereElimineByetud/:id",
  elimController.ListMatiereElimineByetud
);

router.get(
  "/elimine",
  // auth.loggedMiddleware,
  // auth.isAdmin,
  elimController.fetchEliminatedStudents
);

router.get("/elim", elimController.elimlist);
router.get("/nomi", elimController.nomlist);

router.get(
  "/nomine",
  auth.loggedMiddleware,
  auth.isAdmin,
  elimController.fetchNominatedStudents
);

router.get(
  "/etudiantsElimines/:classeId/:matiereId",
  elimController.getEtudiantsElimines
);

router.get(
  "/etudiantsNomines/:classeId/:matiereId",
  elimController.getEtudianteNomines
);

module.exports = router;
