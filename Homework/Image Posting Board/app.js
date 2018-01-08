require('./db.js');
const mongoose = require('mongoose');
const ImagePost = mongoose.model('ImagePost');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');

app.set('view engine', 'hbs');
app.set('view options', 'layout');

const publicPath = path.resolve(__dirname, "views");

app.use(express.static(publicPath));
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function(req, res){
  res.redirect('/image-posts');
})

app.get('/image-posts', function(req, res){

  ImagePost.find({}, function(err, posts){
    if (err){
      res.send(err);
    } else {
      res.render('image-posts', {'imagePosts': posts});
    }
  });
});

app.get('/image-post/:slug', function(req, res){
  ImagePost.findOne({'slug': req.params.slug}, function(err, post){
    if (err){
      res.status(404).send(err);
    } else {
      res.render('image-post', {'imagePost': post});
    }
  });
});

app.post('/image-posts', function(req, res){
  const images = [];
  for (let i = 1; i < 4; i++){
    if (req.body['url' + i] !== undefined && req.body['url' + i] !== ""){
      images.push({
        caption: req.body['caption' + i],
        url: req.body['url' + i]
      });
    }
  }

  const imagePost = new ImagePost({
    title: req.body.title,
    images: images
  });

  imagePost.save((err) => {
    if (err){
      res.send(err);
    }
    res.redirect('image-posts');
  });


});

app.post('/image-post/:slug', function(req, res){
  let update = {};
  if ('add' in req.body){
    update = {
      $push: {
        'images': {
          'caption': req.body.caption,
          'url': req.body.url
        }
      }
    };
  } else {
    const toDelete = [];
    for (const checked in req.body) {
      if (checked !== "delete") {
        toDelete.push(checked);
      }
    }
    update = {$pull: {'images': {'_id': {$in: toDelete}}}};
  }

  ImagePost.findOneAndUpdate({'slug': req.params.slug}, update, function(err){
    if (err){
      res.status(404).send(err);
    } else {
      res.redirect('/image-post/' + req.params.slug);
    }
  });
});

app.listen(3000);
