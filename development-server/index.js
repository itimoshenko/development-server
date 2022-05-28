const { spawn } = require('child_process');

const createStaticServer = require('./static-server');
const createWatchServer = require('./watch-server');
const createSSEServer = require('./sse-server');

const config = require('./config.json');

const staticServer = createStaticServer(config.staticServer);
const watchServer = createWatchServer(config.watchServer);
const sseServer = createSSEServer(config.sseServer);

staticServer.on('init', (payload) => {
  spawn('open', [payload.url]);
});

watchServer.on('file:changed', () => {
  sseServer.send('action:reload');
  // TODO: for backend server
  // staticServer.reload();
});
