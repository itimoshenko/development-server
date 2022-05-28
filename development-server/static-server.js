const fs = require('fs');
const path = require('path');
const http = require('http');
const EventEmitter = require('node:events');

const log = require('./logger')('static-server');

const staticServerEventEmitter = new EventEmitter();

const sendFile = (context, filePath) => {
  const stat = fs.statSync(filePath);

  context.res.writeHead(200, {
    'Content-Length': stat.size,
  });

  const fileStream = fs.createReadStream(filePath);

  // TODO: add error handlers
  // We replaced all the event handlers with a simple call to readStream.pipe()
  fileStream.pipe(context.res);
};

module.exports = (config) => {
  const workDir = path.resolve(__dirname, config.workDir);

  const server = http.createServer((req, res) => {
    const context = {
      req,
      res,
      config
    };

    log(req.method, req.url);

    if (req.method === 'GET') {
      const filePath = path.join(workDir, req.url === '/' ? 'index.html' : req.url);

      fs.access(filePath, fs.F_OK, (err) => {
        if (!err) {
          sendFile(context, filePath);
        } else {
          res.writeHead(404);
        }
      });
    }
  });

  server.listen(config.port, config.host, () => {
    const url = `http://${config.host}:${config.port}/`;

    log(`Server has been started on ${url}`);

    staticServerEventEmitter.emit('init', { url });
  });

  server.on('close', () => log('Server has been closed'));

  return {
    on: (...args) => staticServerEventEmitter.on(...args),
  };
};
