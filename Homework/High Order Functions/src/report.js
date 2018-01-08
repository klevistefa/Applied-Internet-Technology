
const fs = require('fs');
const request = require('request');
const yelpfunc = require('./yelpfunc.js');


// fs.readFile('./business.json', 'utf8', function(err,data){
//
//   if (err){
//     console.log('ERROR: ', err);
//   } else {
//     const restaurants = [];
//     data = data.trim();
//     const restaurantsString = data.split("\n");
//     restaurantsString.forEach(function(element){
//       if (restaurantsString.indexOf(element) !== restaurantsString.length - 1){
//         restaurants.push(JSON.parse(element));
//       }
//     });
//
//   console.log(yelpfunc.processYelpData(restaurants));
//
//   }
//
// });

console.log("======\nurl: https://foureyes.github.io/csci-ua.0480-fall2017-003/homework/02/086e27c89913c5c2dde62b6cdd5a27d2.json\n======\n");
request('https://foureyes.github.io/csci-ua.0480-fall2017-003/homework/02/086e27c89913c5c2dde62b6cdd5a27d2.json', function callback(error, response, data){

  if (error){
    console.log("Error: ");
  } else {

    const restaurants = [];
    data = data.trim();
    const restaurantsString = data.split("\n");

    restaurantsString.forEach(function(element){
      if (restaurantsString.indexOf(element) !== restaurantsString.length - 1){
        restaurants.push(JSON.parse(element));
      }
    });


    console.log(yelpfunc.processYelpData(restaurants));
    const nextFile = JSON.parse(restaurantsString[restaurantsString.length-1]);
    if (nextFile["nextFile"] !== undefined){
      const url = "https://foureyes.github.io/csci-ua.0480-fall2017-003/homework/02/" + nextFile["nextFile"];
      console.log("======\nurl: " + url + "\n======\n");
      request(url, callback);
    }
  }
});
