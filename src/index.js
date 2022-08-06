#!/usr/bin/env node

const path = require('path');

const args = process.argv.slice(2);

if (args.some(arg => arg.includes('--help') || arg.includes('-h'))) {
  console.log('Usage: development-server [options] <root_path>');
  console.log();
  console.log('Options:');
  console.log('-o, --open\topen server in the local browser');
  console.log('-h, --help\toutput usage information');

  return;
}

const { spawn } = require('child_process');

const createStaticServer = require('./static-server');
const createWatchServer = require('./watch-server');
const createSSEServer = require('./sse-server');

const config = require(path.resolve(process.cwd(), './development-server.config'));

const staticServer = createStaticServer(config.staticServer);
const watchServer = createWatchServer(config.watchServer);
const sseServer = createSSEServer(config.sseServer);

staticServer.on('init', (payload) => {
  if (args.some(arg => arg.includes('--open') || arg.includes('-o'))) {
    spawn('open', [payload.url]);
  }
});

watchServer.on('file:changed', () => {
  sseServer.send('action:reload');
});
