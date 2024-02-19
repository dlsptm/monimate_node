const express = require("express");
const router = express.Router();
const MainController = require('../../controller/MainController');

router.get("/main", (req, res) => {
  const username = req.session.user; // Récupérer le nom d'utilisateur depuis la session
  res.render("main/main.ejs", { username: username }); // Passer le nom d'utilisateur au modèle pour l'affichage
});


module.exports = router;
