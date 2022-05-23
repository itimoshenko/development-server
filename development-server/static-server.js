const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');

const { log } = require('./logger');

const config = require('./config.json').staticServer;

const PORT = config.port;
const HOST = config.host;

const WORK_DIR = path.resolve(__dirname, config.workDir);
const ALLOWED_PATHES = config.allowedPathes;

function sendFile(req, res, filePath) {
  const absoluteFilePath = path.join(WORK_DIR, filePath);
  const stat = fs.statSync(absoluteFilePath);

  res.writeHead(200, {
    // TODO: add Content-Type for different files
    // 'Content-Type': 'text/html; charset=utf-8',
    'Content-Length': stat.size,
  });

  const fileStream = fs.createReadStream(absoluteFilePath);

  // TODO: add error handlers
  // We replaced all the event handlers with a simple call to readStream.pipe()
  fileStream.pipe(res);
}

function checkPermissions(req, res) {
  // TODO: add more checks

  if (req.method === 'HEAD') {
    // skip body for HEAD
    res.end();
  }

  if (ALLOWED_PATHES && !ALLOWED_PATHES.includes(req.url)) {
    res.writeHead(404);

    res.end();
  }
}

module.exports = function create(reload = false) {
  const server = http.createServer((req, res) => {
    log(req.method, req.url);

    checkPermissions(req, res);

    sendFile(req, res, req.url === '/' ? 'index.html' : req.url);
  });

  server.listen(PORT, HOST, () => {
    const localhostUrl = `http://localhost:${PORT}/`;

    log('static-server is running');
    log(`http://${HOST}:${PORT}/`);
    log(localhostUrl);
    log();

    if (!reload) {
      spawn('open', [localhostUrl]);
    }
  });

  server.on('close', () => {
    log('Server has been closed');
  });

  return server;
};
