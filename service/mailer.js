const express = require("express");
const nodemailer = require("nodemailer");

require('dotenv').config();


const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnAuthorized:true
  }
});

transporter.verify((err, success) => {
  if (err) console.error(err);
  
  if (success) console.log('Your config is correct');
});

const fs = require('fs');
const ejs = require('ejs');

const sendMail = (to, from, username, subject, message, link) => {
  fs.readFile('./views/mail/email-template.ejs', 'utf8', (err, data) => {
    if (err) {
      console.error('Erreur lors de la lecture du fichier de modèle d\'e-mail :', err);
      return;
    }

    const html = ejs.render(data, { username, message, link });

    const mailOptions = {
      from: from,
      to: to,
      subject: subject,
      html: html
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Erreur lors de l\'envoi de l\'e-mail :', error);
      } else {
        console.log('E-mail envoyé avec succès :', info.response);
      }
    });
  });

  console.log('mail bien envoyé')
};


module.exports = sendMail;
