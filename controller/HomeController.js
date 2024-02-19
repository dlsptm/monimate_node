const sendMail = require("../service/mailer");
const validator = require("email-validator");

exports.sendContactForm = async (req, res) => {
  try {
    const { firstname, lastname, email, message } = req.body;

    if (validator.validate(email)) {
      sendMail(
        process.env.EMAIL_USER,
        email,
        `${firstname} ${lastname}`,
        `${firstname} ${lastname} vous a envoyé un message`,
        message
      );
      req.flash("success", "Email envoyé avec succès.");
    } else {
      req.flash("danger", "Email non valide.");
    }
    res.redirect("/#contact");
  } catch (error) {
    console.log(error);
    req.flash("danger", "Une erreur s'est produite lors de l'envoi de l'e-mail.");
    res.redirect("/#contact");
  }
};
