const express = require("express");
const router = express.Router();
const passport = require('passport');

function requireAuth(req, res, next) {
  if (req.session && req.session.user) {
      // L'utilisateur est connecté, donc redirigez-le vers une autre page
      res.redirect('/');
  } else {
      // L'utilisateur n'est pas connecté, continuez vers la prochaine étape de traitement
      next();
  }
}

// Importation du contrôleur SecurityControllers avec l'instance Sequelize
const { register, login, validate} = require("../../controller/SecurityControllers");

router.get("/register",requireAuth, (req, res) => {
  res.render("users/register.ejs");
});
router.post("/register",requireAuth, register);



router.get("/login" , requireAuth,  (req, res) => {
  res.render("users/login.ejs");
});

router.post("/login",requireAuth, login);

router.get('/verify/:token', validate)

module.exports = router;
