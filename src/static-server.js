const fs = require('fs');
const path = require('path');
const http = require('http');
const EventEmitter = require('node:events');

const log = require('./logger')('static-server');

const staticServerEventEmitter = new EventEmitter();

const getFileContentType = (filePath) => {
  if (filePath.includes('.svg')) {
    return 'image/svg+xml';
  }

  if (filePath.includes('.jpeg')) {
    return 'image/jpeg';
  }

  return null;
};

const sendFile = (context, filePath) => {
  const stat = fs.statSync(filePath);

  const headers = {
    'Content-Length': stat.size,
  };

  const fileContentType = getFileContentType(filePath);

  if (fileContentType) {
    headers['Content-Type'] = fileContentType;
  }

  const fileStream = fs.createReadStream(filePath, 'utf-8');

  if (filePath.includes('index.html')) {
    fileStream.on('readable', () => {
      const chunk = fileStream.read();

      const injectionTag = `<script src="/development-server-injection.js"></script>`;

      if (chunk) {
        context.res.write(chunk.replace('</body>', `${injectionTag}</body>`));
      } else {
        context.res.end();
      }
    });
  } else {
    context.res.writeHead(200, headers);

    // TODO: add error handlers
    fileStream.pipe(context.res);
  }
};

const getFilePathByUrl = (context, url) => {
  const workDir = path.resolve(process.cwd(), context.config.workDir);

  if (url === '/') return  path.join(workDir, 'index.html');

  if (url.includes('development-server-injection.js')) return path.join(__dirname, 'development-server-injection.js');

  return  path.join(workDir, url);
}

module.exports = (config) => {
  const server = http.createServer((req, res) => {
    const context = {
      req,
      res,
      config
    };

    log(req.method, req.url);

    if (req.method === 'GET') {
      const filePath = getFilePathByUrl(context, req.url);

      fs.access(filePath, fs.F_OK, (err) => {
        if (!err) {
          sendFile(context, filePath);
        } else {
          console.log(err)
          res.writeHead(404);
          res.end();
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
