// Import des dépendances nécessaires pour le projet
const express = require("express"); // Import d'Express pour la création de l'application
require("dotenv").config(); // Import du module dotenv pour la gestion des variables d'environnement
const morgan = require("morgan"); // Middleware de logging HTTP
const path = require("path"); // Module de manipulation de chemins de fichiers
const favicon = require("serve-favicon"); // Middleware pour servir le favicon
const sendMail = require("./service/mailer"); // Fonction pour l'envoi d'e-mails
const ejs = require("ejs"); // Moteur de template EJS
const session = require("express-session"); // Middleware pour la gestion des sessions utilisateur
const flash = require("express-flash"); // Middleware pour les messages flash
const cookieParser = require('cookie-parser');

// Initialisation de l'application Express
const app = express();

// Configuration des variables
const port = process.env.PORT || 3000; // Port d'écoute de l'application
const public = path.join(__dirname, "public"); // Chemin vers le répertoire public contenant les fichiers statiques

// Middleware de logging HTTP
app.use(morgan("dev"));
// Utilisez cookie-parser pour parser les cookies
app.use(cookieParser());

// Middleware pour servir les fichiers statiques (images, CSS, JavaScript, etc.)
app.use(express.static(public));

// Middleware pour servir le favicon
app.use(favicon(path.join(__dirname, "favicon.ico")));

// Réccupérer Bootstrap depuis node_modules
app.use(
  "/bootstrap",
  express.static(path.join(__dirname, "node_modules/bootstrap/dist/"))
);
// Middleware pour les messages flash
app.use(flash());

// Middleware pour la gestion des sessions utilisateur
app.use(
  session({
    secret: process.env.SESSION_SECRET, // Clé secrète pour signer les cookies de session
    resave: false, // Ne pas enregistrer la session à chaque requête
    saveUninitialized: true, // Enregistrer une nouvelle session sans données
    cookie: { secure: false } // Si true, le cookie ne sera envoyé que sur HTTPS

  })
);

// Middleware pour parser le corps des requêtes POST
app.use(express.urlencoded({ extended: true }));

// Moteur de template EJS
app.set("view-engine", "ejs");

const db = require('./config/DB')
const Sequelize = require('sequelize')
const Users = require('./models/Users')(db, Sequelize.DataTypes);

Users.sync()


// GESTION DES ROUTES
const homeRoutes = require('./routes/home/home');
app.use('/', homeRoutes);

const usersRoutes = require('./routes/security/security');
app.use('/', usersRoutes);

const mainRoutes = require('./routes/main/main');
app.use('/', mainRoutes);




// Démarrage du serveur
app.listen(port, () => {
  console.log(
    `notre application Node est démarée sur http://localhost:${port}`
  );
});