const db = require('./db.js');
const mongoose = require('mongoose');
const Flight = mongoose.model('Flight');
const Airline = mongoose.model('Airline');

//Constructor with properties of two dates and rend and utilities
class Finances{
  constructor (){
    this.startDate = new Date();
    this.endDate = new Date();
    this.rent = 0.0;
    this.utilities = 0.0;
  }

//Returns some financial info from an array of flight objects that is passed to as a parameter
  getFinancialInfo(flights){
    const financialInfo = [];
    flights.forEach(function(flight){
      financialInfo.push({
        date: flight.bookedTime,
        price: flight.price,
        company: flight.airline.name,
        profit_percentage: flight.airline.profit,
        profit: flight.price * flight.airline.profit,
      });
    });
    return financialInfo;
  }

  //Reset the dates with the startDate as the earliest booked flight and endDate with the latest booked flight
  resetDates(){
    Flight.findOne({}, {}, {sort: {'bookedTime': -1}}, (err, flight) => {
      if (flight){
        this.startDate = new Date(flight.bookedTime);
      }
    });

    Flight.findOne({}, {}, {sort: {'bookedTime': 1}}, (err, flight) => {
      if (flight){
        this.endDate = new Date(flight.bookedTime);
      }
    });
  }

  //The following three methods are setters for rent, utilites, startDate, and endDate
  setRent(rent){
    this.rent = rent;
  }

  setUtilities(utilities){
    this.utilities = utilities;
  }

  setDates(startDate, endDate){
    this.startDate = new Date(startDate);
    this.endDate = new Date(endDate);
  }

  //Filters the array of flight objects based on the startDate and endDate
  getTimeReports(flights){
    return flights.filter(element => {
      return element.bookedTime <= this.endDate && element.bookedTime >= this.startDate;
    });
  }

  //Method that provides a simple financial summary based on the array of flight objects that is passed as a parameter
  calculateStatistics(flights){
    let revenue = 0.0
    let grossProfit = 0.0;
    const flightsBooked = flights.length;
    const timeDiff = Math.abs(this.endDate.getTime() - this.startDate.getTime()); //difference in milliseconds
    const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); //difference in days between the two dates

    const spendings = diffDays*(this.rent + this.utilities)/30; //spendings is calculated on a daily basis

    //Get the revenue and the grossProfit
    flights.forEach(function(flight){

      revenue += flight.price;
      grossProfit += (flight.price * flight.airline.profit);

    });

    //get the netProfit and average price of flight
    const netProfit = grossProfit - spendings;
    const avgFlightPrice = revenue/flightsBooked;

    return {
      revenue: revenue,
      netProfit: netProfit,
      grossProfit: grossProfit,
      flightsBooked: flightsBooked,
      spendings: spendings,
      avgFlightPrice: avgFlightPrice,
    };
  }
}

module.exports = {Finances: Finances};
