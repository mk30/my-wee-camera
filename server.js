var http = require('http');
var ecstatic = require('ecstatic')(__dirname + '/static');

var server = http.createServer(function (req, res) {
    ecstatic(req, res);
});
server.listen(5000);

server.on('listening', function () {
    console.log('listening on http://localhost:' + server.address().port);
});
