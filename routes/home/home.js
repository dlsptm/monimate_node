const express = require("express");
const router = express.Router();
const HomeController = require('../../controller/HomeController');

router.get("/", (req, res) => {
  res.render("index.ejs");
});

router.post("/", HomeController.sendContactForm);

router.get("/legal", (req, res) => {
  res.render("legal.ejs");
});

router.get("/conditions", (req, res) => {
  res.render("conditions.ejs");
});

module.exports = router;
