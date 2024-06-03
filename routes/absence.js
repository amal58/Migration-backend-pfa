const express = require("express");
const router = express.Router();
const absenceController = require("../controllers/absence");
const auth = require("../controllers/auth");

router.get(
  "/",
  auth.loggedMiddleware,
  auth.isAdmin,
  auth.isEnseig,
  absenceController.fetchAbsences
);

router.get("/abs", absenceController.abs);

router.get(
  "/list",
  auth.loggedMiddleware,
  auth.isAdmin,
  auth.isEnseig,
  absenceController.AbsencesParEtudiant
);

router.post("/", absenceController.addAbsence);

router.get(
  "/liste",
  auth.loggedMiddleware,
  auth.Etud,
  absenceController.AbsencebyEtudiant
);

router.get("/:id", auth.loggedMiddleware, absenceController.getAbsenceById);

router.patch(
  "/:id",
  auth.loggedMiddleware,
  auth.isAdmin,
  auth.isEnseig,
  absenceController.UpdateAbsence
);

router.delete(
  "/:id",
  auth.loggedMiddleware,
  auth.isAdmin,
  auth.isEnseig,
  absenceController.DeleteAbsence
);

module.exports = router;
