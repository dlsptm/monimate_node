const express = require("express");
require("dotenv").config(); 

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('monimate_node', process.env.DB_USER, process.env.DB_PASS, {
  host: 'localhost',
  dialect: 'mysql',
  port: 8889,
  logging: false
});

// // check if on est connecté à la BDD
// const connect = async () => {
//   try {
//     await sequelize.authenticate();
//     console.log('Connection has been established successfully.');
//   } catch (error) {
//     console.error('Unable to connect to the database:', error);
//   }
// }

// connect();

module.exports = sequelize;


