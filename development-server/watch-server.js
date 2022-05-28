const fs = require('fs');
const path = require('path');
const EventEmitter = require('node:events');

const { debounce } = require('./utils');

const log = require('./logger')('watch-server');

const watchServerEventEmitter = new EventEmitter();

module.exports = (config) => {
  const workDir = path.resolve(__dirname, config.workDir);

  (config.watchedFiles || []).forEach((filePath) => {
    const fullPath = path.join(workDir, filePath);

    fs.access(fullPath, fs.F_OK, (err) => {
      if (!err) {
        fs.watch(fullPath, debounce((event, fileName) => {

          log(`${fileName} file changed`);

          watchServerEventEmitter.emit('file:changed', { fileName });
        }, config.watchDelay));
      } else {
        log(`${filePath} not found`);
      }
    });
  });

  log('Server has been started');

  return {
    on: (...args) => watchServerEventEmitter.on(...args)
  };
};
