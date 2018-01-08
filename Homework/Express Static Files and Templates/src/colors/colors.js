// colors.js
const HOST = '127.0.0.1';
const PORT = 3000;
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const Color = require('./colorlib.js').Color;
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

app.get('/', function(req, res){
  res.redirect('colors');
});

app.get('/about', function(req, res){
  res.render('about', {});
});

let colorsArray = [];

app.get('/colors', function(req, res){

	if (req.query.red !== undefined && req.query.blue !== undefined && req.query.green !== undefined && req.query.total !== undefined){
		const color = new Color(req);
    colorsArray.push(color.getColorsFullObject(color.getHexString()));
    const randomColors = color.getRandomColorCodes();
    randomColors.forEach(function(element){
      colorsArray.push(color.getColorsFullObject(element));
		});
		res.render('colors', {'queryUndefined': false, 'isValid': color.isValid, 'badInput': color.badInput, 'colors': colorsArray});
		colorsArray = [];
	} else {
		res.render('colors', {'queryUndefined': true});
	}

});



app.listen(PORT, HOST);
