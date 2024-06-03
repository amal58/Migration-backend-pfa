const express = require("express");
const router = express.Router();
const classeController = require("../controllers/classe");
const auth = require("../controllers/auth");

router.get("/", auth.loggedMiddleware, classeController.fetchClasses);

router.get(
  "/classes/:classeId/matieres/:matiereId",
  auth.loggedMiddleware,
  classeController.getStudentsByClassAndSubjectId
);

router.get("/:id", auth.loggedMiddleware, classeController.getClasseById);

router.post(
  "/",

  classeController.addClasse
);

router.patch(
  "/:id",
  auth.loggedMiddleware,
  auth.isAdmin,
  classeController.UpdateClasse
);

router.delete(
  "/:id",
  auth.loggedMiddleware,
  auth.isAdmin,
  classeController.DeleteClasse
);

module.exports = router;