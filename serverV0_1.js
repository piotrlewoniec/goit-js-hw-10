let http = require('http');
let server = http.createServer(function (req, res) {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.write('CodeRonin sever welcome');
  res.end();
});
server.listen(8080);
