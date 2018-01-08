const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Bring in mongoose model, Place, to represent a restaurant
const Place = mongoose.model('Place');

// TODO: create two routes that return json
// GET /api/places
// POST /api/places/create
// You do not have to specify api in your urls
// since that's taken care of in app.js when
// this routes file is loaded as middleware

router.get('/places', (req, res) => {
  let query = {};

  if (req.query.location !== undefined && req.query.location !== ""){
    query["location"] = req.query.location;
  }

  if (req.query.cuisine !== "" && req.query.cuisine !== undefined){
    query["cuisine"] = req.query.cuisine;
  }

  Place.find(query, function(err, places){
    if (err){
      console.log(err);
    } else {
      res.json(places.map(function(place){
        return {
          'name': place['name'],
          'location': place['location'],
          'cuisine': place['cuisine']
        }
      }));
    }
  });
});

router.post('/places/create', (req, res) => {
  Place.findOne(req.body, function(err, result){
    if (err){
      console.log(err);
    } else if (!result) {
      const place = new Place (req.body);

      place.save(function(err){
        if (err) {
          res.status(500).send("Error occured; database error");
        } else {
          res.json(place);
        }
      });
    } else {
      res.status(501).send("The restaurant already exists");
    }
  })
});

module.exports = router;
