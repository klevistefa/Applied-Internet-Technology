// miniWeb.js
// define your Request, Response and App objects here
const net = require('net');
const fs = require('fs');
const HOST = '127.0.0.1';
const PORT = 8080;

function Request(httpRequest){
  const splitRequest = httpRequest.split("\r\n");
  const request = splitRequest[0];
  const headers = splitRequest[1];
  const body = splitRequest[3];

  this.method = request.split(" ")[0];
  this.path = request.split(" ")[1];

  const splitHeaders = headers.split(" ");

  if (splitRequest[2] !== ""){
    this.headers = {"Host": splitHeaders[1], "Referer": splitRequest[2].split(" ")[1]};
  } else {
    this.headers = {"Host": splitHeaders[1]};
  }

  this.body = body;

  this.toString = function() {
    return httpRequest;
  };

}

function Response(socket){
  this.sock = socket;
  this.headers = {};
  this.body = "";
  this.statusCode = "";
  this.statusCodes = {
    200: "OK",
    404: "Not Found",
    500: "Internal Server Error",
    400: "Bad Request",
    301: "Moved Permanently",
    302: "Found",
    303: "See Other"
  };

  this.setHeader = function(name, value){
    if (this.headers === null){
      this.headers = {};
    }
    this.headers[name] = value;
  };

  this.write = function(data){
    this.sock.write(data);
  };

  this.end = function(s){
    this.sock.end(s);
  };

  this.send = function(statusCode, body){
    let returnString = "HTTP/1.1 " + statusCode.toString() + " " + this.statusCodes[statusCode] + "\r\n";
    this.statusCode = statusCode;

    for (const i in this.headers){
      returnString += i + ": " + this.headers[i] + "\r\n";
    }

    returnString += "\r\n";
    this.body = body;
    returnString += body;

    this.end(returnString);
  };

  this.writeHead = function(statusCode){
    this.statusCode = statusCode;
    let returnString = "HTTP/1.1 " + statusCode.toString() + " " + this.statusCodes[statusCode] + "\r\n";

    for (const i in this.headers){
      returnString += i + ": " + this.headers[i] + "\r\n";
    }
    returnString+="\r\n";
    this.write(returnString);
  };

  this.redirect = function(statusCode, url){
    if (arguments.length === 1){
      url = arguments[0];
      statusCode = 301;
    }
    this.statusCode = statusCode;
    this.headers["Location"] = url;
    this.send(this.statusCode, this.body);
  };

  this.toString = function(){

    let stringResponse = "HTTP/1.1 " + this.statusCode + " " + this.statusCodes[this.statusCode] + "\r\n";

    if (this.headers !== null){
      for (const i in this.headers){
        stringResponse += i + ": " + this.headers[i] + "\r\n";
      }
    }
    stringResponse += "\r\n";

    if (this.headers !== null && this.body !== null){ stringResponse += this.body;}

    return stringResponse;
  };

  this.handleRead = function(contentType, data){
    this.setHeader("Content-Type", contentType);
    this.writeHead(200);
    this.write(data);
    this.end();
  };

  this.sendFile = function(fileName){

    const fs = require('fs');
    const publicRoot = __dirname + '/../public';
    const filePath = publicRoot + fileName;

    const ext = {
      "jpeg": "image/jpeg",
      "png": "image/png",
      "gif": "image/gif",
      "html": "text/html",
      "css": "text/css",
      "txt": "text/plain"
    };

    const fileExt = fileName.split(".")[1];
    

    if (fileExt === "txt" || fileExt === "css" || fileExt === "html"){

      fs.readFile(filePath, {encoding: 'utf8'}, (err,data) => {
        //this.handleRead(data);
        if (err){
          this.send(500, "");
        } else {
          this.handleRead(ext[fileExt], data);
        }
      });
      //fs.readFile(filePath, {encoding: 'utf8'}, this.handleRead.bind(this.contentType, err, data));

    } else {
      // fs.readFile(filePath, {}, (err,data) => {
      //   this.handleRead(data);
      // });
      fs.readFile(filePath, {}, (err,data) => {
        if (err){
          this.send(500, "");
        } else {
          this.handleRead(ext[fileExt], data);
        }
      });
      //fs.readFile(filePath, {}, this.handleRead.bind(this.contentType, data));
    }
  };
}


class App{

  constructor(){
    this.routes = {};
    this.server = net.createServer(this.handleConnection.bind(this));
    this.listen(PORT, HOST);
  }

  get(path, cb){
    this.routes[path] = cb;
  }

  listen(port, host){
    this.server.listen(port, host);
  }

  handleConnection(sock){
    sock.on('data', this.handleRequestData.bind(this, sock));
  }

  handleRequestData(sock, binaryData){
    const reqString = "" + binaryData;
    const req = new Request(reqString);
    const res = new Response(sock);

    //console.log(req.path);
    //handle the case when the path ends with a forward slash
    if (req.path.length > 1 && req.path.charAt(req.path.length - 1) === '/'){
      req.path = req.path.substring(0, req.path.length - 1);
    }

    if (this.routes[req.path]){
      this.routes[req.path](req, res);
    } else {
      res.setHeader("Content-Type", "text/plain");
      res.send(404, "uh oh... 404 page not found!");
    }

    sock.on('close', this.logResponse.bind(this, req, res));
  }

  logResponse(req, res){

    console.log(req.method, req.path, res.statusCode, res.statusCodes[res.statusCode]);
  }

}

module.exports = {
  App: App,
  Request: Request,
  Response: Response
}
