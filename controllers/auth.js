const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/user");

exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res
          .status(401)
          .json({ message: "Login ou mot de passe incorrect" });
      }
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res
              .status(401)
              .json({ message: "Login ou mot de passe incorrect" });
          }
          let userResponse = {
            nom: user.nom,
            prenom: user.prenom,
            role: user.role,
            id: user._id,
          };
          res.status(200).json({
            resultat: userResponse,
            token: jwt.sign({ userId: user._id }, "RANDOM_TOKEN_SECRET", {
              expiresIn: "24h",
            }),
          });
        })
        .catch((error) => {
          res.status(500).json({ error: error });
        });
    })
    .catch((error) => {
      res.status(500).json({ error: error });
    });
};

//**************** */
module.exports.loggedMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, "RANDOM_TOKEN_SECRET");
    const userId = decodedToken.userId;
    User.findOne({ _id: userId })
      .then((response) => {
        if (response) {
          req.auth = {
            userId: userId,
            role: response.role,
          };
          next();
        } else {
          res.status(401).json({ error: "user doesn't exist" });
        }
      })
      .catch((error) => {
        res.status(500).json({ error: error.message });
      });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

//****** */
module.exports.isAdmin = (req, res, next) => {
  try {
    if (req.auth.role === "admin") {
      next();
    } else {
      res.status(403).json({ error: "no access to this route" });
    }
  } catch (e) {
    res.status(401).json({ error: error.message });
  }
};

//********* */
module.exports.isEnseig = (req, res, next) => {
  try {
    if (req.auth.role === "enseignant") {
      next();
    } else {
      res.status(403).json({ error: "no access to this route" });
    }
  } catch (e) {
    res.status(401).json({ error: error.message });
  }
};

//***** */
module.exports.Etud = (req, res, next) => {
  try {
    if (req.auth.role === "etudiant") {
      next();
    } else {
      res.status(403).json({ error: "no access to this route" });
    }
  } catch (e) {
    res.status(401).json({ error: error.message });
  }
};
//*********** */
module.exports.lesdeux = (req, res, next) => {
  try {
    if (req.auth.role === "etudiant" || req.auth.role === "enseignant") {
      next();
    } else {
      res.status(403).json({ error: "Pas d'accès à cette route" });
    }
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};
