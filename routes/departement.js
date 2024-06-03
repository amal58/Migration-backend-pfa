const express = require("express");

const router = express.Router();

const depController = require("../controllers/departement");

const auth = require("../controllers/auth");

router.get("/", auth.loggedMiddleware, depController.fetchDeparts);

router.get("/:id", auth.loggedMiddleware, depController.getDepartById);

router.post("/", auth.loggedMiddleware, auth.isAdmin, depController.addDepart);

router.patch(
  "/:id",
  auth.loggedMiddleware,
  auth.isAdmin,
  depController.UpdateDepart
);

router.delete(
  "/:id",
  auth.loggedMiddleware,
  auth.isAdmin,
  depController.DeleteDepart
);

module.exports = router;