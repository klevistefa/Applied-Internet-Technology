// yelpfunc.js


function processYelpData(restaurants){

  let stringReport = "";
  let starSum = 0.0;

  //Getting the average star rating
  starSum = restaurants.reduce(function(sum, element){
    return sum + element["stars"];
  }, 0);
  const starAvg = starSum/restaurants.length;

  stringReport += "* Average rating of the dataset: " + starAvg + "\n";

  stringReport += "\n* All restaurants in Las Vegas, NV that serve pizza\n\n";


  //Getting all the restaurants in Las Vegas, NV that serve Pizza
  restaurants.filter(function(element) {

    return (element["city"] === "Las Vegas" && element["state"] === "NV" && element["categories"].includes("Pizza"));

  }).forEach(function(element) {

      stringReport += "\t* " + element["name"] + " (* " + element["stars"] + " stars *)\n";

  });

  //Getting Mexican restaurants with the most reviews

  stringReport += "\n* The two highest reviewed Mexican serving restaurants are:"
  let mostReviews = -1;
  let mostReviewsID = "";
  let secondMost = -1;
  let secondMostReviewsID = ""

  restaurants.filter(function(element){

    return element["categories"].includes("Mexican");

  }).forEach(function(element){

    if (element["review_count"] > mostReviews){
      secondMostReviews = mostReviews;
      secondMostReviewsID = mostReviewsID;
      mostReviews = element["review_count"];
      mostReviewsID = element["business_id"];

    } else if (element["review_count"] > secondMostReviews && element["review_count"] !== mostReviews){
      secondMostReviews = element["review_count"];
      secondMostReviewsID = element["business_id"];
    }
  });

  let mostReviewed;
  let secondMostReviewed;
  for (let i = 0; i < restaurants.length; i++){
    if (restaurants[i]["business_id"] === mostReviewsID){
      mostReviewed = restaurants[i];
    } else if (restaurants[i]["business_id"] === secondMostReviewsID){
      secondMostReviewed = restaurants[i];
    }
  }
  stringReport += "\n\t* " + mostReviewed["name"] + ", " + mostReviewed["city"] + " (" + mostReviewed["state"] + "), " +
  mostReviews + " reviews (* " + mostReviewed["stars"] + " stars *)\n";
  stringReport += "\t* " + secondMostReviewed["name"] + ", " + secondMostReviewed["city"] + " (" + secondMostReviewed["state"] + "), " +
  secondMostReviews+ " reviews (* " + secondMostReviewed["stars"] + " stars *)\n";


  //Getting the most common name in dataset.
  let restaurantNames = restaurants.map(function(element){
    return element["name"];
  }); //this creates an array of the same size as restaurants but contains only strings (name of the restaurants);

  //now we need to find the name that appears the most in the restaurantNames array
  let count = 0;
  let tempCount;

  mostCommonName = restaurantNames[0];
  let temp = "";

  for (let i = 0; i < restaurantNames.length-1; i++){
    temp = restaurantNames[i];
    tempCount = 0;

    for (let j = 1; j < restaurantNames.length; j++){
      if (temp === restaurantNames[j]){ tempCount++; }
    }

    if (tempCount > count){
      mostCommonName = temp;
      count = tempCount;
    }
  }

  stringReport += "\n* The most common name in the dataset: \n";
  stringReport += "\t* " + mostCommonName + " is the most common name in the dataset and appears " + count + " times.\n"

  //Getting restaurant count by state
  let states = restaurants.map(function(element){
    return element["state"];
  });

  //sorting the states array
  states = states.sort();

  stringReport += "\n* Restaurant count by state:\n";

  let currentState = states[0];
  let stateCount = 0;
  states.forEach(function(element){
    if(currentState === element){
      stateCount++;
    } else {
      stringReport += "\t* " + currentState + ": " + stateCount + "\n";
      stateCount = 1;
      currentState = element
    }
  });

  stringReport += "\t* " + currentState + ": " + stateCount + "\n";


  return stringReport;

}

module.exports = {
  processYelpData: processYelpData
};
