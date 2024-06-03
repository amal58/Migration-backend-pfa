const express = require("express");
const cors = require("cors");
const app = express();
const absenceRoutes = require("./routes/absence");
const matiereRoutes = require("./routes/matiere");
const classeRoutes = require("./routes/classe");
const userRoutes = require("./routes/user");
const departRoutes = require("./routes/departement");
const elimRoutes = require("./routes/elimination");
const notifRoutes = require("./routes/notification");
const bcrypt = require("bcryptjs");
const User = require("./models/user");
const mongoose = require("mongoose");

// Connexion à la base de données MongoDB
const connection = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/pfabd", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    // Création du compte admin s'il n'existe pas
    const admin = await User.findOne({ role: "admin" });
    if (!admin) {
      const password = "adminamal";
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(password, salt);
      const compteAdmin = new User({
        email: "admin@gmail.com",
        password: hashed,
        role: "admin",
      });
      await compteAdmin.save();
      console.log(`admin account has been added : ${compteAdmin.email}`);
    } else {
      console.log(
        `admin account already exists \n admin email : ${admin.email}`
      );
    }
  } catch (e) {
    console.log(e);
  }
};
connection();

app.use(cors());
app.use(express.static("images"));
app.use(express.json());

app.use("/absence", absenceRoutes);
app.use("/matiere", matiereRoutes);
app.use("/classe", classeRoutes);
app.use("/user", userRoutes);
app.use("/depart", departRoutes);
app.use("/elimine", elimRoutes);
app.use("/notif", notifRoutes);
module.exports = app;
