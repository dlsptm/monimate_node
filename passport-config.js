// Importation de la stratégie locale de Passport
const LocalStrategy = require("passport-local").Strategy;

// Importation de la bibliothèque bcrypt pour le hachage des mots de passe
const bcrypt = require("bcrypt");

// Fonction d'initialisation pour configurer Passport
function initialize(passport, Users) {
    // Fonction pour authentifier les utilisateurs
    const authenticateUsers = async (email, password, done) => {
        try {
            // Récupération de l'utilisateur par email
            const user =await Users.findOne({ where: { email: email } });;

            // Vérification si l'utilisateur existe
            if (!user) {
                // Si aucun utilisateur n'est trouvé avec cet e-mail, retourne une erreur
                return done(null, false, { message: "Aucun utilisateur n'a été trouvé" });
            }

            // Vérification du mot de passe
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (passwordMatch) {
                // Si le mot de passe correspond, l'authentification réussit et renvoie l'utilisateur
                return done(null, user);
            } else {
                // Si le mot de passe ne correspond pas, retourne une erreur
                return done(null, false, { message: "Password incorrect" });
            }
        } catch (error) {
            // Gestion des erreurs
            console.error("Error authenticating user:", error);
            return done(error);
        }
    };

    // Configuration de Passport pour utiliser la stratégie locale avec le champ "email" comme nom d'utilisateur
    passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUsers));

    // Sérialisation de l'utilisateur pour le stockage dans la session
    passport.serializeUser((user, done) => done(null, user.id));

    // Désérialisation de l'utilisateur à partir de l'ID stocké dans la session
    passport.deserializeUser(async (id, done) => {
        // Recherche de l'utilisateur par son ID
        const user = await Users.findByPk(id);
        if (!user) {
            // Si aucun utilisateur n'est trouvé avec cet ID, retourne une erreur
            return done(new Error("Utilisateur non trouvé"));
        }
        // Renvoie l'utilisateur
        return done(null, user);
    });
}

// Exportation de la fonction d'initialisation de Passport
module.exports = initialize;
