const express = require("express");

const router = express.Router();

const notifController = require("../controllers/notification");

router.get("/getall/:id", notifController.fetchAllNotifByEtud);

router.get("/getallSorted/:id", notifController.fetchAllNotifByEtudSorted);

router.patch("/update/:id", notifController.updateNotif);

module.exports = router;
