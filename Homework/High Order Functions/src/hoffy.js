// hoffy.js

function sum(num1, num2, ...numn){
  if (arguments.length === 0){return 0;}
  if (arguments.length === 1){return num1;}
  if (numn.length === 0){return num1+num2;}

  const answer = numn.reduce(function(result, currentNum){
    return result + currentNum;
  }, 0);

  return num1+num2+answer;
}

function repeatCall(fn, n, args){
  if (n === 0){ return;}
  fn(args);
  repeatCall(fn, n-1, args);
}

function repeatCallAllArgs(fn, n, ... argsn){
  if (n===0){return;}
  fn(...argsn);
  repeatCallAllArgs(fn,n-1,... argsn);
}

function maybe(fn){
   return function(){
    const args = [...arguments];
    if(args.indexOf(undefined) > -1 || args.indexOf(null) > -1){
      return undefined;
    }else{
      return fn(...args);
    }
  };
}

function constrainDecorator(fn, min, max){
  return function(){
    if (fn.apply(this, arguments) > max){ return max;}
    if (fn.apply(this, arguments) < min){ return min;}
    return fn.apply(this, arguments);
  };
}

function limitCallsDecorator(fn, n){
  let counter = 0;
  return function(){
    if (counter < n){
      counter++;
      return fn.apply(this, arguments);
    } else {
      return undefined;
    }
  };
}

function filterWith(fn){
  return function(args){
    return args.filter(fn);
  };
}

function simpleINIParse(s){
  s = s.split("\n");
  const object = s.reduce(function(object, value){
    if (value.indexOf("=") < 0){ return object;}
    const splitVal = value.split("=");

    if (splitVal[0] === undefined || splitVal[0] === null){
      splitVal[0] = "";
    }
    else if (splitVal[1] === undefined || splitVal[1] === null){
      splitVal[1] = "";
    }
    object[splitVal[0]] = splitVal[1];
    return object;
  }, {});
  return object;
}

function readFileWith(fn){
  return function(filename, callback){
    const fs = require('fs');
    const directory = filename;
    let parsed = {};
    return fs.readFile(directory, 'utf8', function(err,data){
      if (err === null){
        parsed = fn(data);
        callback(err, parsed);
      } else {
        callback(err, undefined);
      }
    });
  };
}




module.exports = {
  sum: sum,
  repeatCall: repeatCall,
  repeatCallAllArgs: repeatCallAllArgs,
  maybe: maybe,
  constrainDecorator: constrainDecorator,
  limitCallsDecorator: limitCallsDecorator,
  filterWith: filterWith,
  simpleINIParse: simpleINIParse,
  readFileWith: readFileWith
};
