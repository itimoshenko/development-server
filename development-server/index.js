const http = require('http');

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// TODO: replace with config
const HOST_NAME = '127.0.0.1';
const PORT = 6009;
const DEVELOPMENT_SERVER_SSE_PORT = 9006;
const WORK_DIR = path.resolve(__dirname, '../');
const ALLOWED_PATHES = ['/', '/index.css', '/index.js', '/development-server-injection.js'];
const WATCHED_FILES = ['/index.html', '/index.css', '/index.js', '/development-server-injection.js'];
const FILES_WATCH_DELAY = 100;
const SERVER_SIDE_EVENTS_DELAY = 5000;

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

  if (!ALLOWED_PATHES.includes(req.url)) {
    res.writeHead(404);

    res.end();
  }
}

function log(req, res) {
  console.log(req.method, req.url);
}

// TODO: replace to utils
function debounce(cb, ms) {

  let isCooldown = false;

  return function() {
    if (isCooldown) return;

    cb.apply(this, arguments);

    isCooldown = true;

    setTimeout(() => isCooldown = false, ms);
  };

}

function watchFiles(cb) {
  WATCHED_FILES.forEach((filePath) => {
    fs.watch(path.join(WORK_DIR, filePath), debounce((event, filename) => {

      console.log(`${filename} file Changed`);

      cb();
    }, FILES_WATCH_DELAY));
  });
}

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
  }, SERVER_SIDE_EVENTS_DELAY);

  writeServerSendEvent(res, sseId, (new Date()).toLocaleTimeString());
}

function writeServerSendEvent(res, sseId, data) {
  res.write('id: ' + sseId + '\n');
  res.write("data: new server event " + data + '\n\n');
}

function createSSEServer() {
  const server = http.createServer(function(req, res) {
    if (req.headers.accept && req.headers.accept == 'text/event-stream' && req.url == '/development-server') {
      sendServerSendEvent(req, res);
    } else {
      res.writeHead(404);
      res.end();
    }

  }).listen(DEVELOPMENT_SERVER_SSE_PORT, HOST_NAME, () => {
    console.log('Server side events running at');
    console.log(`http://${HOST_NAME}:${DEVELOPMENT_SERVER_SSE_PORT}/`);
  });

  return server;
}

function createServer(reload = false) {
  const server = http.createServer((req, res) => {
    log(req, res);

    checkPermissions(req, res);

    sendFile(req, res, req.url === '/' ? 'index.html' : req.url);
  });

  server.listen(PORT, HOST_NAME, () => {
    const localhostUrl = `http://localhost:${PORT}/`
    console.log('Server running at');
    console.log(`http://${HOST_NAME}:${PORT}/`);
    console.log(localhostUrl);

    if (!reload) {
      spawn('open', [localhostUrl]);
    }
  });

  server.on('close', () => {
    console.log('Server has been closed');
  })

  return server;
}

watchFiles(() => {
  server.close();

  server = createServer(true);
});

let server = createServer();
createSSEServer();


