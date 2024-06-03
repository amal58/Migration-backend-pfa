const Notification = require("../models/notifcation");
const elimination = require("../models/elimination");
const matiere = require("../models/matiere");
const etudiantId = require("../models/user");

exports.updateNotif = async (req, res) => {
  try {
    const existNotif = await Notification.find({ etudiantId: req.params.id });
    console.log(existNotif);
    for (let i = 0; i < existNotif.length; i++) {
      const notif = await Notification.findByIdAndUpdate(
        { _id: existNotif[i]._id },
        { open: true },
        { new: true }
      );
      console.log(existNotif[i]._id);
    }
    return res.status(200).json("updated succes");
  } catch (error) {
    console.log(error);
  }
};

exports.fetchAllNotifByEtud = async (req, res) => {
  try {
    const notifications = await Notification.find({ etudiantId: req.params.id })
      .populate("etudiantId")
      .populate({ path: "elimination", populate: { path: "matiere" } })
      .sort({ date: -1 });
    return res.status(200).json({ notifications });
  } catch (error) {
    console.log(error);
  }
};

exports.fetchAllNotifByEtudSorted = async (req, res) => {
  try {
    const notifications = await Notification.find({ etudiantId: req.params.id })
      .populate("etudiantId")
      .populate({ path: "elimination", populate: { path: "matiere" } })
      .sort({ date: -1 })
      .limit(5);
    return res.status(200).json({ notifications });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
