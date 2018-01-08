// app.js
require('./db.js');
const mongoose = require('mongoose');
const Movie = mongoose.model('Movie');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');

app.set('view engine', 'hbs');
app.set('view options', 'layout');

const publicPath = path.resolve(__dirname, "views");
app.use(express.static(publicPath));
app.use(bodyParser.urlencoded({ extended: false }));

const sessionOptions = {
  secret: 'secret for signing session id',
  saveUninitialized: false,
  resave: false
};
app.use(session(sessionOptions));

app.get('/movies', function(req, res){

  Movie.find({}, function (err, movies){
    if (err){
      console.log("Error in finding the movies");
    } else if (req.query.director === undefined || req.query.director === "") {
      res.render('movies', {movies: movies, filteredSearch: false});

    } else {
        res.render('movies', {movies: movies.filter(movie => movie.director === req.query.director), filteredSearch: true, director: req.query.director});
    }
  });
});


app.get('/', function (req, res){
  res.redirect('/movies');
});

app.get('/movies/add', function (req, res){
  res.render('addMovie', {});
});

app.post('/movies/add', function (req, res){
  new Movie({
    title: req.body.title,
    year: parseInt(req.body.year),
    director: req.body.director
  }).save(function(err){
    if (err){
      console.log(err);

    } else if (req.session.myMovie === undefined){
      req.session.myMovie = [];
      req.session.myMovie.push({
        title: req.body.title,
        year: parseInt(req.body.year),
        director: req.body.director
      });
    } else {
      req.session.myMovie.push({
        title: req.body.title,
        year: parseInt(req.body.year),
        director: req.body.director
      });
    }
    res.redirect('/movies');
  });
});

app.get('/mymovies', function(req, res){
  const myMovies = req.session.myMovie || [];
  res.render('mymovies', {myMovies: myMovies});
});
app.listen(3000);
