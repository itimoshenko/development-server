const http = require('http');

const { log } = require('./logger');

const config = require('./config.json').sseServer;

const PORT = config.port;
const HOST = config.host;

const PING_DELAY = config.pingDelay;

function sendServerSendEvent(req, res) {
  res.writeHead(200, {
    'Content-Type' : 'text/event-stream',
    'Cache-Control' : 'no-cache',
    'Connection' : 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });

  const sseId = (new Date()).toLocaleTimeString();

  setInterval(function() {
    writeServerSendEvent(res, sseId, (new Date()).toLocaleTimeString());
  }, PING_DELAY);

  writeServerSendEvent(res, sseId, (new Date()).toLocaleTimeString());
}

function writeServerSendEvent(res, sseId, data) {
  res.write('id: ' + sseId + '\n');
  res.write('data: new server event ' + data + '\n\n');
}

module.exports = function create() {
  const server = http.createServer(function(req, res) {
    if (req.headers.accept && req.headers.accept == 'text/event-stream' && req.url == '/development-server') {
      sendServerSendEvent(req, res);
    } else {
      res.writeHead(404);
      res.end();
    }

  }).listen(PORT, HOST, () => {
    log('sse-server is running');
    log(`http://${PORT}:${HOST}/`);
    log();
  });

  return server;
};
