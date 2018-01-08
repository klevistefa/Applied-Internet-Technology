const mongoose = require('mongoose');
const URLSlugs = require('mongoose-url-slugs');

const User = new mongoose.Schema({
  username: String,
  password: String,
  rent: Number,
  utilities: Number,
});

const Airline = new mongoose.Schema({
  name: String,
  profit: Number,
});

const Flight = new mongoose.Schema({
  airline: Airline,
  price: Number,
  bookedTime:Date,
  origin: String,
  destination: String,
  type: String,
  client: String,
});

const Client = new mongoose.Schema({
  name: String,
  flights: [Flight],
});

Client.plugin(URLSlugs('name'));


mongoose.model('Flight', Flight);
mongoose.model('Client', Client);
mongoose.model('Airline', Airline);
mongoose.model('User', User);

let dbconf;

if (process.env.NODE_ENV === 'PRODUCTION'){
  const fs = require('fs');
  const path = require('path');
  const fn = path.join(__dirname, 'config.json');
  const data = fs.readFileSync(fn);

  const conf = JSON.parse(data);
  dbconf = conf.dbconf;
} else {
  dbconf = 'mongodb://localhost/kt1372';
}

mongoose.connect(dbconf);
