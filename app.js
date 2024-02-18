// Import des dépendances nécessaires pour le projet
const express = require("express"); // Import d'Express pour la création de l'application
require("dotenv").config(); // Import du module dotenv pour la gestion des variables d'environnement
const morgan = require("morgan"); // Middleware de logging HTTP
const path = require("path"); // Module de manipulation de chemins de fichiers
const favicon = require("serve-favicon"); // Middleware pour servir le favicon
const sendMail = require("./service/mailer"); // Fonction pour l'envoi d'e-mails
const ejs = require("ejs"); // Moteur de template EJS
const session = require("express-session"); // Middleware pour la gestion des sessions utilisateur
const validator = require("email-validator"); // Module pour la validation des adresses e-mail
const flash = require("express-flash"); // Middleware pour les messages flash

// Initialisation de l'application Express
const app = express();

// Configuration des variables
const port = process.env.PORT || 3000; // Port d'écoute de l'application
const public = path.join(__dirname, "public"); // Chemin vers le répertoire public contenant les fichiers statiques

// Middleware de logging HTTP
app.use(morgan("dev"));

// Middleware pour servir les fichiers statiques (images, CSS, JavaScript, etc.)
app.use(express.static(public));

// Middleware pour servir le favicon
app.use(favicon(path.join(__dirname, "favicon.ico")));

// Middleware réccupérer Bootstrap depuis node_modules
app.use(
  "/bootstrap-css",
  express.static(path.join(__dirname, "node_modules/bootstrap/dist/css"))
);

app.use(
  "/bootstrap-js",
  express.static(path.join(__dirname, "node_modules/bootstrap/dist/js"))
);

// Middleware pour les messages flash
app.use(flash());

// Middleware pour la gestion des sessions utilisateur
app.use(
  session({
    secret: process.env.SESSION_SECRET, // Clé secrète pour signer les cookies de session
    resave: false, // Ne pas enregistrer la session à chaque requête
    saveUninitialized: true, // Enregistrer une nouvelle session sans données
  })
);

// Middleware pour parser le corps des requêtes POST
app.use(express.urlencoded({ extended: true }));

// Moteur de template EJS
app.set("view-engine", "ejs");

// Route pour la page d'accueil
app.get("/", (req, res) => {
  res.render(__dirname + "/views/index.ejs"); // Rendu de la page index.ejs
});

// Route pour la soumission du formulaire de contact
app.post("/", async (req, res) => {
  try {
    const { firstname, lastname, email, message } = req.body;

    // Vérification de la validité de l'adresse e-mail
    if (validator.validate(email)) {
      // Envoi de l'e-mail si l'adresse est valide
      sendMail(
        email,
        process.env.EMAIL_USER,
        `${firstname} ${lastname} vous a envoyé un message`,
        message
      );

      // Message flash en cas de succès
      req.flash("success", "Email envoyé avec succès.");
    } else {
      // Message flash en cas d'adresse e-mail non valide
      req.flash("danger", "Email non valide.");
    }

    // Redirection vers la page d'accueil avec l'ancre '#contact'
    res.redirect("/#contact");
  } catch (error) {
    console.log(error);
    // Message flash en cas d'erreur lors de l'envoi de l'e-mail
    req.flash(
      "danger",
      "Une erreur s'est produite lors de l'envoi de l'e-mail."
    );
    // Redirection vers la page d'accueil avec l'ancre '#contact'
    res.redirect("/#contact");
  }
});

// Démarrage du serveur
app.listen(port, () => {
  console.log(
    `notre application Node est démarée sur http://localhost:${port}`
  );
});