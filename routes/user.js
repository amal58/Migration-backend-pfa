const express = require("express");
const multer = require("multer");
const router = express.Router();
const userController = require("../controllers/user");
const auth = require("../controllers/auth");

let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
let upload = multer({ storage: storage });

//router.get("/", userController.fetchUsers);

router.get(
  "/etudiantsList",
  auth.loggedMiddleware,
  userController.fetchEtudiants
);

router.get(
  "/enseignantsList",
  auth.loggedMiddleware,
  userController.fetchEnseignants
);

router.get(
  "/listelimine",
  auth.loggedMiddleware,
  auth.isAdmin,
  userController.EtudiantsEliminerParMatiere
);

router.get(
  "/listnomine",
  auth.loggedMiddleware,
  auth.isAdmin,
  userController.EtudiantsNominerParMatiere
);

router.post("/login", auth.login);

router.post(
  "/",
  upload.any("image"),
  auth.loggedMiddleware,
  auth.isAdmin,
  userController.addUser
);

router.get(
  "/profil",
  auth.loggedMiddleware,
  auth.lesdeux,
  userController.consulterProfil
);

router.patch(
  "/update",
  auth.loggedMiddleware,
  auth.lesdeux,
  userController.modifierProfil
);

router.patch(
  "/modif",
  auth.loggedMiddleware,
  auth.lesdeux,
  userController.UpdateUser
);

router.delete(
  "/:id",
  auth.loggedMiddleware,
  auth.isAdmin,
  userController.DeleteUser
);

router.get("/listEtudByClas/:id", userController.ListEtudByClasse);

router.get(
  "/etudiant/:id/enseignants",
  userController.getEnseignantsByEtudiant
);

module.exports = router;
