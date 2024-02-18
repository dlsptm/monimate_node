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

const sendMail = (to, from, subject, message, link ) => {
  let mailOptions;

  if (link) {
    mailOptions = {
      from: from,
      to: to,
      subject: subject,
      text: message,
      html: `<p>${message}</p><a href="${link}">Cliquez ici pour plus de détails</a>`,
    };
  } else {
    mailOptions = {
      from: from,
      to: to,
      subject: subject,
      text: message,
      html: `<p>${message}</p>`,
    };
  }

  transporter.sendMail(mailOptions);
}

module.exports = sendMail;
