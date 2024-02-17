// import des dépendances nécessaire pour le projet
const express = require("express");
require('dotenv').config();

// middleware afin de charger les log
const morgan = require("morgan");
const path = require("path");
const favicon = require("serve-favicon");

const sendMail = require('./service/mailer')

// EJS (Embedded JavaScript Templating) = template qui permet de générer du balisage HTML en utilisant JavaScript.
const ejs = require("ejs");

// Initialisation de l'application Express
const app = express();
// Set le port 3000
const port = process.env.PORT || 3000;
const public = path.join(__dirname, "public");

app
  .use(morgan("dev"))
  // autotisation d'accéder au dossier public afin de charger les fichiers statics comme les img / fichiers s.css / js
  .use(express.static(public))
  // inclusion d'une image dans chaque onglet
  .use(favicon(__dirname + "/favicon.ico"))
  .use(
    "/bootstrap-css",
    express.static(__dirname + "/node_modules/bootstrap/dist/css")
  )
  .use(
    "/bootstrap-js",
    express.static(__dirname + "/node_modules/bootstrap/dist/js")
  );

// Middleware pour parser le corps de la requête
app.use(express.urlencoded({ extended: true }));

// utilisation des template js
app.set("view-engine", "ejs");



app.get("/", (req, res) => {
  res.render(__dirname + "/views/index.ejs");
});

// Route pour la soumission du formulaire
app.post("/", async (req, res) => {
  try {
    const { firstname, lastname, email, message } = req.body;

    await sendMail(
      email,
      process.env.EMAIL_USER,
      `${firstname} ${lastname} vous a envoyé un message`,
      message,

       );

    res.send("Email envoyé avec succès."); // Réponse à envoyer une fois l'e-mail envoyé avec succès

  } catch (error) {
    console.log(error);
    res.status(500).send("Une erreur s'est produite lors de l'envoi de l'e-mail."); // Réponse en cas d'erreur
  }
});


app.get("/category", (req, res) => {
  res.render(__dirname + "/views/category/index.ejs");
});

// on démarre le serveur
// utilisation de nomdemon afin d'automatiser l'actualisation de la page en prenant compte des changements
app.listen(port, () =>
  console.log(`notre application Node est démarée sur http://localhost:${port}`)
);
