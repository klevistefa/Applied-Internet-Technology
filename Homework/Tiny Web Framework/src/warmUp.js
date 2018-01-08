// warmUp.js
const net = require('net');
const HOST = '127.0.0.1';
const PORT = 8080;

const server = net.createServer((sock) => {
  sock.on('data', function(){

    sock.write("HTTP/1.1 200 OK\r\nContent-type: text/html\r\n\r\n<em>Hello</em> <strong>World</strong>");
    sock.end();

  });
});
server.listen(PORT, HOST);
