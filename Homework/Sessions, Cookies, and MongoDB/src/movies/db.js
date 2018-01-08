// db.js
const mongoose = require('mongoose');

//my schema goes here
const Movie = new mongoose.Schema({
  title: String,
  director: String,
  year: Number
});

mongoose.model('Movie', Movie);

mongoose.connect('mongodb://kt1372:Andkle9496@localhost/hw05');
