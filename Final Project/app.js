const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const db = require('./db.js');
const mongoose = require('mongoose');
const Finances = require('./finances.js').Finances;
const Flight = mongoose.model('Flight');
const Client = mongoose.model('Client');
const Airline = mongoose.model('Airline');
const User = mongoose.model('User');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

//Variables used to keep track of the states of user input and produce meaningful messages
let loggedIn = false;
let redirected = false;
let wrongCredentials = false;
let wrongCurrentPassword = false;
let wrongConfirm = false;
let passChanged = false;

let settingRequest = 0; //this variable is used to keep track of the settings page to see which tab was used (Account, Finance, Airlines, Removals)

const finance = new Finances(); //Object used to make calulations on the financial aspect

const app = express();

// view engine setup
app.set('view options', 'layout');
app.set('view engine', 'hbs');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({secret: "cats"}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session());

//Simple passport strategy that is used for user authentication
//The strategy for user authentication uses username and password
//The strategy updates the states of user input.
passport.use(new LocalStrategy(
  {passReqToCallback: true},
  function(req, username, password, done){
    User.findOne({username: username}, function(err, user){
      if (err) {
        return done(err);
      }
      if (!user) {
        wrongCredentials = true;
         return done(null, false, {failureFlash: 'Incorrect username.'});
      }

      if (user.password !== password){
        wrongCredentials = true;
        return done(null, false, {failureFlash: 'Incorrect passoword.'});
      }
      finance.setRent(parseFloat(user.rent));
      finance.setUtilities(parseFloat(user.utilities));
      wrongCredentials = false;
      redirected = false;
      loggedIn = true;
      return done(null, user);
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

//Logout page which logs out the user and redirects to login page.
app.get('/logout', function(req, res){
  req.logout();
  loggedIn = false;
  res.redirect('/');
});


app.get('/clients', function(req, res){
  //shows all the clients of the agency
  if (!loggedIn){ //this if statement does not allow to access this page through manually writing the URL
    redirected = true; //it redirects you back to login page. Can only be accessed if you're logged in
    res.redirect('/login'); //this is used for all app.get(...) in the code
  } else {
    Client.find({}, function(err, clients){
      if (err){
        console.log("Error in finding the clients");
      } else {
        //in this case no client is selected for more details
        res.render('clients', {'clients': clients, 'clientSelected': false});
      }
    });
  }

});

app.get('/clients/:slug', function(req, res){
  //when a user clicks on a client to view his flight it's redirected here
  if (!loggedIn){
    redirected = true;
    res.redirect('/login');
  } else {

    Client.find({}, function (err, clients){
      if (err){
        console.log("Error in finding the clients");
      } else {
        Client.findOne({'slug': req.params.slug}, function(err, client){
          if (err){
            console.log("Error in finding client " + req.params.slug);
          } else {
            //this shows all the clients and all the selected clients flights
            if (settingRequest !== 6) {
              res.render('clients', {'clients': clients, 'clientSelected': true, 'clientName': client.name, 'clientFlights': client.flights});
            } else {
              res.render('clients', {'clients': clients, 'clientSelected': true, 'clientName': client.name, 'clientFlights': client.flights, 'flightDeleted': true});
              settingRequest = 0;
            }
          }
        });
      }
    });
  }
});

app.post('/clients/:slug', function(req, res){
  //method that is used to delete a flights of a specific client
  const toDelete = [];
  for (const checked in req.body){
    if (checked !== 'delete'){
      toDelete.push(checked);
    }
  }

  Client.findOneAndUpdate({'slug': req.params.slug}, {$pull: {'flights': {'_id': {$in: toDelete}}}, }, function(err){
    if (err) {
      console.log(err);
    } else {
      settingRequest = 6;
      res.redirect('/clients/' + req.params.slug);
    }
  });
});

//The login page of the website. Currently onle one user can use the app.
app.get('/login', function(req, res){
  User.find({}, function(err, users){
    if (users.length > 0){
      //If there exists a user the page wont allow you to create another user
      res.render('login', {'wrongCredentials': wrongCredentials, 'userExists': true})
    } else {
      //If there is no user created you can create a new account
      res.render('login', {'wrongCredentials': wrongCredentials, 'userExists': false});
    }
  })
});

//The method used to authenticate user login attempt
app.post('/login', passport.authenticate('local', {successRedirect: '/home',
                                                   failureRedirect: '/login',
                                                   failureFlash: true
                                                  }
));

//The method which allows you to sign up as a user. It is done through a modal that pops up
app.post('/login/register', function(req, res){
  new User({
    username: req.body.username,
    password: req.body.password,
    rent: parseFloat(req.body.rent),
    utilities: parseFloat(req.body.utilities),
  }).save(function(error){
    if (error){
      console.log(error);
    } else {
      //Update the rent and the utilities cost in the finance object
      finance.setRent(parseFloat(req.body.rent));
      finance.setUtilities(parseFloat(req.body.utilities));
      wrongCredentials = false;
      res.redirect('/login');
    }
  });
});

//The method that is used to dispay all the flights booked by the user
//It also provides a form to filter the flights by client
app.get('/myFlights', function(req, res){
  if (!loggedIn){
    redirected = true;
    res.redirect('/login');
  } else {
    Flight.find({}, function(err, flights){
      if (err){
        console.log("Error in finding the flights");
      } else if (req.query.client === undefined || req.query.client === "") {
        Client.find({}, function(err, clients){
          if (err){
            console.log(err);
          } else {
            res.render('myFlights', {'flights': flights, 'clients': clients});
          }
        });
      } else {
        Client.find({}, function(err, clients){
          if (err){
            console.log(err);
          } else {
            res.render('myFlights', {'flights': flights.filter(flight => flight.client === req.query.client), 'clients': clients});
          }
        });
      }
    });
  }
});

//Home page of the web app
app.get ('/home', function(req, res){
  if (!loggedIn){
    redirected = true;
    res.redirect('/login');
  } else {
    res.render('home', {});
  }

});

app.get('/', function(req, res){
  if (loggedIn){
    res.redirect('/home');
  } else {
    res.redirect('/login');
  }
});

//The post method that adds a flight to the database
app.post('/addFlight', function(req, res){

  Airline.findOne({name: req.body.airline}, function(err, airline){ //find the airline of the flight

    const flight = new Flight({
      airline: airline,
      price: parseFloat(req.body.price),
      bookedTime: req.body.bookedTime,
      origin: req.body.origin,
      destination:req.body.destination,
      client:req.body.client,
      type: req.body.flightType
    }); //create a flight document

    flight.save(function(err){ //save flight
      if (err){
        console.log(err);
      } else {
        Client.findOne({'name': req.body.client}, function(err, person){ //checks to see if this client has already booked a flight
          if (err){
            console.log(err)
          } else {
            if (person === null){ //if no such client create a new one
              const flights = [];
              flights.push(flight);
              new Client({
                name: req.body.client,
                flights: flights,
              }).save(function(err){
                if (err){
                  console.log.err;
                } else {
                  //update the start date and the end date of the finance object
                  finance.resetDates();
                  settingRequest = 5; //setting request 5 is used for validation of adding a new flight
                  res.redirect('/addFlight');
                }
              });
            } else { // in this case had the flight to the existing client's flight list
              const update = {
                $push: {
                  'flights': flight,
                }
              };
              Client.findOneAndUpdate({'name': req.body.client}, update, function(err, person){
                if (err) {
                  console.log(err);
                } else {
                  //update the start date and the end date of the finance object
                  finance.resetDates();
                  settingRequest = 5; //setting request 5 is used for validation of adding a new flight
                  res.redirect('/addFlight');
                }
              });
            }
          }
        });
      }
    });
  })
});

//The get method that renders the add flight page
app.get('/addFlight', function(req,res){
  if (!loggedIn){
    redirected = true;
    res.redirect('/login');
  } else {
    Airline.find({}, function(err, airlines){
      if (err){
        console.log(err);
      } else {
        //Checks to see if a flight was just added so it produces a confirmation message
        if (settingRequest != 5){
          res.render('addFlight', {'airlines': airlines});
        } else {
          res.render('addFlight', {'airlines': airlines, 'flightAdded': true});
          settingRequest = 0;
        }
      }
    });
  }
});

//The get method that produces a simple financial summary
app.get('/finances', function (req, res){
  if (!loggedIn){
    redirected = true;
    res.redirect('/login');
  } else {
    //reset dates so the rent is calculated daily
    finance.resetDates();

    Flight.find({}, function (err, flights){
      if (err){
        console.log(err);
      } else {
        //If financial summary is requested among to dates
        if (req.query.startDate !== undefined && req.query.endDate !== undefined && req.query.startDate !== "" && req.query.endDate !== ""){

          finance.setDates(req.query.startDate, req.query.endDate); //update the dates
          const timeConstrainedFlights = finance.getTimeReports(flights); //get the flights between those dates

          res.render('finances', {'financeInfo': finance.getFinancialInfo(timeConstrainedFlights), 'filtered': true, 'startDate': req.query.startDate,
            'endDate': req.query.endDate, 'summary': finance.calculateStatistics(timeConstrainedFlights)});
        } else {
          //else render the summary with all the flights
          res.render('finances', {'financeInfo': finance.getFinancialInfo(flights), 'filtered': false, 'summary': finance.calculateStatistics(flights)});
        }
      }
    });
  }
});

//The get method of the settings tab
app.get('/settings', function(req, res){
  if (!loggedIn){
    redirected = true;
    res.redirect('/login');
  } else {
    //All clients, airlines, and flights are needed for this page
    Airline.find({}, function(err, airlines){
      if (err){
        console.log(err);
      } else {
        Flight.find({}, function(err, flights){
          if (err){
            console.log(err);
          } else {
            Client.find({}, function(err, clients){
              if (err){
                console.log(err);
              } else {

                //Since we use tabs which are active withing the settings.hbs we need to keep track of what was our last request
                //This way we can produce the right message to the user based on his inputs
                switch (settingRequest){

                  //Redirect from settings/account
                  case 1: res.render('settings', {'client': clients, 'airline': airlines, 'flight': flights, 'accountActive': true,
                    'wrongCurrentPassword': wrongCurrentPassword, 'wrongConfirm': wrongConfirm, 'passChanged': passChanged,
                    'rent': finance.rent, 'utilities': finance.utilities});
                    settingRequest = 0; //set back to 0 so the user validation message is not shown after another request
                  break;

                  //Redirect from settings/finance
                  case 2: res.render('settings', {'client': clients, 'airline': airlines, 'flight': flights, 'financeActive': true,
                  'rent': finance.rent, 'utilities': finance.utilities});
                    settingRequest = 0;
                  break;

                  //Redirect from settings/airline
                  case 3: res.render('settings', {'client': clients, 'airline': airlines, 'flight': flights, 'airlineActive': true,
                  'rent': finance.rent, 'utilities': finance.utilities});
                    settingRequest = 0;
                  break;

                  //Redirect from settings/removal
                  case 4: res.render('settings', {'client': clients, 'airline': airlines, 'flight': flights, 'removalActive': true,
                  'rent': finance.rent, 'utilities': finance.utilities});
                    settingRequest = 0;
                  break;

                  //Accessing the page from links or url
                  default: res.render('settings', {'client': clients, 'airline': airlines, 'flight': flights, 'accountActive': true,
                  'rent': finance.rent, 'utilities': finance.utilities});
                    settingRequest = 0;
                  break;
                }
              }
            });
          }
        });
      }
    });
  }
});

//This post method is called when the user deletes his account. It requires a double confirmation from user to delete the account
//It empties the database
app.post('/settings', function(req, res){
  User.remove({}, function(err){
    if (err){
      console.log(err);
    } else {
      Flight.remove({}, function(err){
        if (err){
          console.log(err);
        } else {
          Client.remove({}, function(err){
            if (err) {
              console.log(err);
            } else {
              Airline.remove({}, function(err){
                if (err) {
                  console.log(err)
                } else {
                  loggedIn = false;
                  settingRequest = 0;
                  res.redirect('/login');
                }
              });
            }
          })
        }
      });
    }
  });
});

//Post method that handles the password change
app.post('/settings/account', function(req, res){

  User.findOne({password: req.body.currentPassword}, function(err, user){ //searches a user with the password entered in the current password field
    if (err) {
      console.log(err);
    } else if (!user){ //if no such user found that then the password is wrong
      //States updated accordingly
      wrongConfirm = false;
      wrongCurrentPassword = true;
      passChanged = false;
    } else {
      //if the right current password is entered but the new password field does not match the confirm new password field
      if (req.body.newPassword !== req.body.confirmPassword){
        //update the staes accordingly
        wrongConfirm = true;
        wrongCurrentPassword = false;
        passChanged = false;
      } else {
        //Password changed successfully
        wrongConfirm = false;
        wrongCurrentPassword = false;
        passChanged = true;
        User.findOneAndUpdate({password: req.body.currentPassword}, {$set: {password: req.body.newPassword}}, function(err){
          if (err) {
            console.log(err);
          }
        });
      }
    }
    settingRequest = 1;
    res.redirect('/settings'); //redirect back to settings with the settingRequest = 1 which handle this post method
  });
});

//Post method that handles the change in utilites price and rent
app.post('/settings/finances', function(req,res){
  User.findOneAndUpdate({'rent': finance.rent},
  {$set:
    {
      'rent': parseFloat(req.body.rentInput),
      'utilities': parseFloat(req.body.utilitiesInput),
    }
  },
  function(err, user){
    if (err){
      console.log(err);
    } else if (user){
      //updates the finance object; sets the setting request to 2 so when /settings is redirected this post method is handled
      finance.setRent(parseFloat(req.body.rentInput));
      finance.setUtilities(parseFloat(req.body.utilitiesInput));
      settingRequest = 2;
      res.redirect('/settings');
    }
  });
});

//Post method that handles adding new airlines
//similar to the two post methods above
app.post('/settings/airline', function(req,res){
  new Airline({
    name: req.body.airlineInput,
    profit: parseFloat(req.body.profitPercentage)
  }).save(function(err){
    if (err){
      console.log(err);
    } else {
      settingRequest = 3;
      res.redirect('/settings');
    }
  });
});

//Post method that removes clients, airlines, or flights
app.post('/settings/removals', function(req, res){

  const toRemove = []; //array used to remove the selected element
  const clients = []; //array used to remove the elements that are related with the elements to be removed

  //If client to be deleted
  if ('deleteClient' in req.body){
    for (const checked in req.body) {
      if (checked !== "deleteClient") {
        toRemove.push(checked); //holds the _id of each client
      }
    }
    Client.remove({_id: {$in: toRemove}}, function(err){ //removes the clients selected
      if (!err) {
        //settingRequest = 4 which handles this post method
        settingRequest = 4;
        res.redirect('/settings');
      }
    });

  } else if ('deleteAirline' in req.body){ //if airline to be deleted; this is similar as the client removal

    for (const checked in req.body) {
      if (checked !== "deleteAirline") {
        toRemove.push(checked);
      }
    }
    Airline.remove({_id: {$in: toRemove}}, function(err){
      if (!err) {
        settingRequest = 4;
        res.redirect('/settings');
      }
    });

  } else if ('deleteFlight' in req.body){ //if a flight is to be deleted it should be removed from the corresponding client's flight list

    for (const checked in req.body) {
      if (checked !== "deleteFlight") {
        toRemove.push(checked.split(",")[0]); //takes the _id of the flight
        clients.push(checked.split(",")[1]); //takes the client name of the flight
      }
    }
    //Similar as client removal
    Flight.remove({_id: {$in: toRemove}}, function(err){
      if (!err) {
        clients.forEach(function(name){
          //Here we just update the client's flight list
          Client.findOneAndUpdate({'name': name}, {$pull: {'flights': {'_id': {$in: toRemove}}}}, function(err){
            if (err){
              console.log(err);
            }
          });
        });
        settingRequest = 4;
        res.redirect('/settings');
      }
    });
  }
});

app.listen(process.env.PORT || 16666);
module.exports = app;
