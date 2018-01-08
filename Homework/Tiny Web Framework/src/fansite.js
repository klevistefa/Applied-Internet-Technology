// fansite.js
// create your own fansite using your miniWeb framework
const App = require('./miniWeb.js').App;
const app = new App();

app.get('/', function(req, res){
  res.sendFile("/html/index.html");
});

app.get('/about', function(req, res){
  res.sendFile("/html/about.html");
});

app.get('/css/base.css', function(req,res){
  res.sendFile("/css/base.css");
});

app.get('/rando', function(req, res) {
  res.sendFile("/html/random.html");
});

app.get('/image1.jpg', function(req,res){
  res.sendFile("/img/image1.jpg");
});

app.get('/image2.png', function(req,res){
  res.sendFile("/img/image2.png");
});

app.get('/image3.gif', function(req, res){
  res.sendFile("/img/image3.gif");
});

app.get('/image4.gif', function(req, res){
  res.sendFile("/img/image4.gif");
});

app.get('/image5.gif', function(req, res){
  res.sendFile("/img/image5.gif");
});

app.get('/background.jpg', function(req, res){
  res.sendFile("/img/background.jpg");
});

app.get('/randomGif', function(req,res){
  const rand = Math.floor(Math.random()*3) + 3; //random number from 3 to 5 to choose one of the gifs;
  res.sendFile("/img/image" + rand.toString() + ".gif");
});

app.get('/home', function(req,res){
  res.redirect(301, "/");
})
app.listen(8080, '127.0.0.1');
