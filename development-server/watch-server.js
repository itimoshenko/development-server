const fs = require('fs');
const path = require('path');

const { debounce } = require('./utils');

const { log } = require('./logger');

const config = require('./config.json').watchServer;

const WATCHED_FILES = config.watchedFiles || ['/index.html', '/index.js', '/index.css'];
const WATCH_DELAY = config.watchDelay;

const WORK_DIR = path.resolve(__dirname, config.workDir);

module.exports = function watch(cb) {
  log('watch-server is running');

  WATCHED_FILES.forEach((filePath) => {
    fs.watch(path.join(WORK_DIR, filePath), debounce((event, filename) => {

      log(`${filename} file Changed`);

      cb();
    }, WATCH_DELAY));
  });
};
