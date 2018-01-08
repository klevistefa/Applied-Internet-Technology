// bandz.js
const HOST = '127.0.0.1';
const PORT = 3000;
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const publicPath = path.resolve(__dirname, "public");

app.set('view engine', 'hbs');
app.set('view options', 'layout');
app.use(express.static(publicPath));
app.use(bodyParser.urlencoded({ extended: false}));

app.use(function(req, res, next) {
	console.log(req.method, req.path);
	next();
});

const bands = [{name: "AC/DC", genre: "rock", description: "Alternating current/Direct current", location: "Sydney, Australia"},
               {name: "The Beatles", genre: "pop", description: "Best band of all times", location: "Liverpool, England"},
               {name: "N.W.A", genre: "hip-hop", description: "Earliest gansta rap", location: "Los Angeles, California"}];

app.get("/", function(req, res){

  if (req.query.filterGenre !== undefined){
    res.render('bands', {'bands': bands.filter(band => band.genre.toLowerCase() === req.query.filterGenre)});
  } else {
    res.render('bands', {'bands': bands});
  }
});

app.post("/", function(req,res){
  bands.push({name: req.body.name, genre:req.body.filterGenre, description: req.body.description, location: req.body.location});
  res.redirect("/");
});

app.listen(PORT, HOST);
