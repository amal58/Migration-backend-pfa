const express = require("express");

const router = express.Router();

const matController = require("../controllers/matiere");
const auth = require("../controllers/auth");

router.get(
  "/",
  auth.loggedMiddleware,
  auth.isAdmin,
  matController.fetchMatieres
);

router.get("/mat", matController.mat);

router.get(
  "/ListMatByEnseige",
  auth.loggedMiddleware,
  matController.ListMatByEnseige
);

router.get("/list/:id", matController.ListMatByEtud);

router.get("/listMatByEnseig", matController.ListMatByEnseig);
router.get("/ListClasseByEnseig", matController.ListClasseByEnseig);

router.get(
  "/:id",
  auth.loggedMiddleware,
  auth.isAdmin,
  matController.getMatiereById
);

router.post("/", matController.addMatiere);

router.patch(
  "/:id",
  auth.loggedMiddleware,
  auth.isAdmin,
  matController.UpdateMatiere
);

router.delete(
  "/:id",
  auth.loggedMiddleware,
  auth.isAdmin,
  matController.DeleteMatiere
);

module.exports = router;
