const http = require('http');
const EventEmitter = require('node:events');

const log = require('./logger')('sse-server');

const sseServerEventEmitter = new EventEmitter();

const writeEvent = (context, message) => {
  const id = Date.now();

  context.res.write(`id: ${id} \n`);
  context.res.write(`data: ${message} \n\n`);
};

const startHeartbeat = (context) => setInterval(() => writeEvent(context, 'heartbeat'), context.config.heartbeatDelay);

module.exports = (config) => {
  const server = http.createServer((req, res) => {
    const context = {
      req,
      res,
      config
    };

    if (req.headers.accept && req.headers.accept == 'text/event-stream' && req.url == '/development-server') {
      res.writeHead(200, {
        'Content-Type' : 'text/event-stream',
        'Cache-Control' : 'no-cache',
        'Connection' : 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      });

      sseServerEventEmitter.on('message', (payload) => {
        writeEvent(context, payload.message);
      });

      startHeartbeat(context);
    } else {
      res.writeHead(404);
      res.end();
    }
  });

  server.listen(config.port, config.host, () => {
    const url = `http://${config.host}:${config.port}/`;

    log(`Server has been started on ${url}`);
  });

  server.on('close', () => log('Server has been closed'));

  return {
    send: (message) => sseServerEventEmitter.emit('message', { message })
  };
};
