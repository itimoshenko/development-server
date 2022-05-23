const staticServer = require('./static-server');
const watchServer = require('./watch-server');
const sseServer = require('./sse-server');

watchServer(() => {
  server.close();

  server = staticServer(true);
});

let server = staticServer();

sseServer();


