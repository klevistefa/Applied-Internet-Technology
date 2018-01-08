const fs = require('fs');
const colorsFile = fs.readFileSync("./colors.txt", 'utf8');
const colorsArray = colorsFile.split("\n");
let colorsName = colorsArray.map(function(csv){
  const colorCode = csv.split(",");
  return [colorCode[1], colorCode[0]];
});

class Color{
  constructor(req){
    this.r = +req.query.red;
    this.g = +req.query.green;
    this.b = +req.query.blue;
    this.total = +req.query.total;
    this.isValid = (this.r >= 0 && this.r <= 255 && this.g >= 0 && this.g <= 255 && this.b >= 0 && this.b <= 255 && this.total >= 2 && this.total <= 10);
    this.badInput = "Hey, \"Red\", \"Green\", and \"Blue\" should be from 0 through 255, and the \"How Many?\" should be between 2 and 10!";
  }

  getHexString(){

    let hexString = "";
    if (this.r.toString(16).toUpperCase().length < 2){
      hexString = "0" + this.r.toString(16).toUpperCase();
    } else {
      hexString += this.r.toString(16).toUpperCase();
    }
    if (this.g.toString(16).toUpperCase().length < 2){
      hexString += "0" + this.g.toString(16).toUpperCase();
    } else {
      hexString += this.g.toString(16).toUpperCase();
    }
    if (this.b.toString(16).toUpperCase().length < 2){
      hexString += "0" + this.b.toString(16).toUpperCase();
    } else {
      hexString += this.b.toString(16).toUpperCase();
    }

    return ("#" + hexString);
  }

  getColorsFullObject(hexString){

    const red = parseInt(hexString.substring(1,3), 16).toString();
    const green = parseInt(hexString.substring(3,5), 16).toString();
    const blue = parseInt(hexString.substring(5,7), 16).toString();

    for (let i = 0; i < colorsName.length; i++){
      if (colorsName[i][0] == hexString){
        return {name: colorsName[i][1] + " ", hex: colorsName[i][0], decimal: " (" + red + ", " + green + ", " + blue + ")"};
      }
    }
    return {name : "", hex: hexString, decimal: " (" + red + ", " + green + ", " + blue + ")"};
  }

  getRandomColorCodes(){
    let randomNumber;
    const randomColors = [];
    for (let i = 0; i < this.total; i++){
      randomNumber = Math.floor(Math.random() * 16777216); //possible number of RGB colors
      let hexString = randomNumber.toString(16);
      for (let i = hexString.length; i < 6; i++){
        hexString = "0" + hexString;
      }
      randomColors.push("#" + hexString.toUpperCase());
    }
    return randomColors;
  }

}

module.exports = {Color: Color};
