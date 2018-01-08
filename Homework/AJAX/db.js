const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

//using mongoose models
const placeSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  cuisine: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  }
});

mongoose.model('Place', placeSchema);

mongoose.connect('mongodb://localhost/hw08', {useMongoClient: true});
