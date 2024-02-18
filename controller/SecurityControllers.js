const express = require("express");
const app = express();
const sendMail = require("../service/mailer"); // Module pour l'envoi d'e-mails
const validator = require("email-validator"); // Module de validation des adresses e-mail
const flash = require("express-flash"); // Middleware pour afficher des messages flash
const bcrypt = require("bcrypt"); // Module pour le hachage des mots de passe
const JWT = require("jsonwebtoken");

const Sequelize = require("sequelize"); // ORM pour interagir avec la base de données MySQL
const sequelize = require("../config/DB"); // Connexion à la base de données
const initializePassport = require("../passport-config"); // Initialisation de Passport.js pour l'authentification
const Users = require("../models/Users")(sequelize, Sequelize.DataTypes); // Modèle Sequelize pour les utilisateurs
const passport = require("passport"); // Middleware pour l'authentification
initializePassport(passport, Users); // Initialisation de Passport.js

app.use(flash()); // Utilisation du middleware express-flash pour afficher des messages flash

// Importation de la bibliothèque de validation Joi
const Joi = require("joi");


// utilisation de crypto pour généré un token
// const crypto = require('crypto');
// const token = crypto.randomUUID().replace(/-/g, '');

// function validatePassword(password) {
//   // longueur de mot de passe : 8 caractères
//   if (password.length < 8) {
//     return false;
//   }

//   // Vérification au moins une minuscule, une majuscule, un chiffre et un caractère spécial
//   const regex =
//     /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;

//   return regex.test(password);
// }

// exports.register = async (req, res) => {
//   try {
//     const { username, email, password, confirm, RGDPConsent } = req.body;

//     // un champ est manquant
//     if (!username || !email || !password || !confirm) {
//       req.flash("danger", "Veuillez remplir tous les champs");
//       return res.redirect("/register");
//     }
//     if (!RGDPConsent) {
//       req.flash("danger", "Veuillez accepter les conditions d'utilisation et nos mentions légales");
//       return res.redirect("/register");
//     }

//     // on valide si l'utilisateur a bien mit un email valide
//     if (!validator.validate(email)) {
//       req.flash("danger", "Adresse email non valide.");
//       return res.redirect("/register");
//     }

//     // on verifie que le mot de passe a longueur et les caract!res qui faut
//     if (!validatePassword(password)) {
//       req.flash(
//         "danger",
//         "Le mot de passe doit faire au minimum 8 caractères, contenir une lettre en minuscule, une lettre en majuscule, un caractère spécial et un chiffre"
//       );
//       return res.redirect("/register");
//     }

//     // on vérifie si les deux champs mots de passes sont bien identiques
//     if (password !== confirm) {
//       req.flash("danger", "Les mots de passe ne correspondent pas");
//       return res.redirect("/register");
//     }

//     // Si toutes les conditions sont remplies, rediriger avec un message de succès
//     req.flash("success", "Tous les champs sont bons");
//     res.redirect("/register");
//   } catch (error) {
//     console.log(error);
//     req.flash("danger", "Une erreur s'est produite lors de l'inscription.");
//     res.redirect("/register");
//   }
// };

// Fonction de contrôleur pour l'inscription d'un utilisateur

exports.register = async (req, res) => {
  try {
    const { username, email, password, confirm, RGDPConsent } = req.body;

    // Vérifier si l'utilisateur existe déjà dans la base de données
    const existingUser = await Users.findOne({ where: { email: email } });
    if (existingUser) {
      req.flash("danger", "Un compte avec cet e-mail existe déjà.");
      return res.redirect("/register");
    }

    // Définition du schéma de validation des données d'entrée avec Joi
    const schema = Joi.object({
      username: Joi.string().required().messages({
        "any.required": "Le nom d'utilisateur est requis",
        "string.empty": "Le nom d'utilisateur ne peut pas être vide",
      }),
      email: Joi.string().email().required().messages({
        "any.required": "L'adresse email est requise",
        "string.empty": "L'adresse email ne peut pas être vide",
        "string.email": "L'adresse email doit être valide",
      }),
      password: Joi.string()
        .min(8) // Champ 'password' obligatoire, d'au moins 8 caractères
        .pattern(
          new RegExp(
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})"
          )
        ) // Doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial
        .required()
        .messages({
          "any.required": "Le mot de passe est requis",
          "string.empty": "Le mot de passe ne peut pas être vide",
          "string.min":
            "Le mot de passe doit contenir au moins {#limit} caractères",
          "string.pattern.base":
            "Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial",
        }),
      confirm: Joi.string().valid(Joi.ref("password")).required().messages({
        "any.required": "La confirmation du mot de passe est requise",
        "string.empty": "La confirmation du mot de passe ne peut pas être vide",
        "any.only":
          "La confirmation du mot de passe doit correspondre au mot de passe",
      }),
      RGDPConsent: Joi.boolean().required().messages({
        "any.required":
          "Vous devez accepter les conditions d'utilisation et notre politique de confidentialité",
        "any.only":
          "Vous devez accepter les conditions d'utilisation et notre politique de confidentialité",
      }),
    });

    // Validation des données d'entrée par rapport au schéma défini
    const { error } = RGDPConsent // Vérifie si RGDPConsent est défini (non nul)
      ? schema.validate(
          // Si RGDPConsent est défini, valide avec les valeurs du formulaire
          {
            username,
            email,
            password,
            confirm,
            RGDPConsent: RGDPConsent === "on", // Convertir RGDPConsent en booléen
          },
          { abortEarly: false } // Option pour obtenir toutes les erreurs de validation à la fois
        )
      : schema.validate(req.body, { abortEarly: false }); // Si RGDPConsent n'est pas défini, valide avec les données de req.body et avoir un message d'erreur concernant le RGPD

    // S'il y a des erreurs de validation
    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(". ");
      req.flash("danger", errorMessage); // Ajout du message d'erreur à afficher via flash
      return res.redirect("/register"); // Redirection vers la page d'inscription
    }

    // Si toutes les données sont valides

    // Hash du mot de passe
    // Le deuxième argument définit le niveau de résistance aux attaques par force brute en déterminant le nombre d'itérations pour générer le hachage du mot de passe. 10 est un bon compromis entre résistance et performance
    const hashedPassword = await bcrypt.hash(password, 10);



    // Création de l'utilisateur dans la base de données
    await Users.create({
      username: username,
      email: email,
      password: hashedPassword, // Utilisation du mot de passe haché
      token: token,
    });

    // Redirection vers la page d'accueil
    req.flash(
      "success",
      " Un mail vous a été envoyé. Veuillez activer votre compte"
    ); // Message de succès à afficher via flash

    const user = await Users.findOne({ where: { email: email } });

    sendMail(
      email,
      process.env.EMAIL_USER,
      username,
      "Bienvenue à Monimate : Activer votre compte",
      `Veuiller cliquer sur le bouton ci-dessous afin de valider votre compte.`,
      process.env.URL + "verify/" + user.token
    );

    res.redirect("/login"); // Redirection vers la page d'accueil
  } catch (error) {
    // En cas d'erreur imprévue, affichage de l'erreur dans la console
    console.log(error);
    // Envoi d'un message flash d'erreur générique
    req.flash("danger", "Une erreur s'est produite lors de l'inscription.");
    // Redirection vers la page d'inscription
    res.redirect("/register");
  }
};

exports.login = async (req, res, next) => {
  passport.authenticate("local", (err, user) => {
    if (err) { return next(err); }
    if (!user) {
      req.flash("danger", "Nom d'utilisateur ou mot de passe incorrect");
      
      return res.redirect("/login");
    }
    if (!user.active) {
      req.flash("danger", "Votre compte n'est pas activé. Veuillez vérifier votre e-mail pour activer votre compte.");
      return res.redirect("/login");
    }
    req.logIn(user, (err) => {
      if (err) { return next(err); }
      req.flash("success", "Connecté");
      req.session.user = user.username;

      return res.redirect("/");
    });
  })(req, res, next);
};


exports.validate = async (req, res, next) => {
  try {
    const token = req.params.token; // Supposons que le token soit passé en tant que paramètre d'URL

    // Vérifier si le token est valide
    const user = await Users.findOne({ where: { token: token } });

    // Si aucun utilisateur n'est trouvé avec ce token, alors le token est invalide
    if (!user) {
      req.flash("danger", "Token invalide");
      return res.redirect("/login");
    }

    if (user.active == 1) {
      req.flash("danger", "Votre compte est déjà activé");
      return res.redirect("/login");
    }

    // Mettre à jour l'utilisateur dans la base de données en utilisant le token
    await Users.update({ active: 1 }, { where: { token: token } });
    req.flash("success", "Vous avez bien activé votre compte");
    return res.redirect("/login");
  } catch (error) {
    console.error(error);
    req.flash(
      "danger",
      "Une erreur s'est produite lors de l'activation de votre compte"
    );
    return res.redirect("/login");
  }
};