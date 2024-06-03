const Depart = require("../models/departement");

const fetchDeparts = (req, res) => {
  Depart.find()
    .populate("classe")
    .populate("chef")
    .populate("enseignants")
    .then((departs) =>
      res.status(200).json({
        model: departs,
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

const getDepartById = (req, res) => {
  Depart.findOne({ _id: req.params.id })
    .populate("classe")
    .populate("chef")
    .populate("enseignants")
    .then((departs) => {
      if (!departs) {
        res.status(404).json({
          message: "departement non trouve",
        });
        return;
      }
      res.status(200).json({
        model: departs,
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

//****************

const addDepart = (req, res) => {
  const depart = new Depart(req.body);
  depart
    .save()
    .then(() =>
      res.status(201).json({
        model: Depart,
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

//******************
const UpdateDepart = (req, res) => {
  Depart.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true })
    .then((depart) => {
      if (!depart) {
        res.status(404).json({
          message: "departement not found ",
        });
        return;
      }
      res.status(200).json({
        message: "departement updated",
        model: depart,
      });
    })
    .catch((error) =>
      res.status(400).json({
        error: error.message,
        message: "departement not correct",
      })
    );
};

const DeleteDepart = (req, res) => {
  Depart.deleteOne({ _id: req.params.id })
    .then(() => res.status(200).json({ message: "Depart deleted" }))
    .catch((error) => {
      res.status(400).json({
        error: error.message,
        message: "Id Depart not correct ",
      });
    });
};

module.exports = {
  UpdateDepart: UpdateDepart,
  fetchDeparts: fetchDeparts,
  getDepartById: getDepartById,
  addDepart: addDepart,
  DeleteDepart: DeleteDepart,
};