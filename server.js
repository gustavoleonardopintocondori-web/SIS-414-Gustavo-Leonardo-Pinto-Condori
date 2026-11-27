const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, 'dist/vSIAF_FE/browser');
const mime = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.gif': 'image/gif', '.ico': 'image/x-icon', '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' });
    return res.end('Method Not Allowed');
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch {
    res.writeHead(400);
    return res.end('Bad Request');
  }

  let file = path.resolve(root, '.' + pathname);
  if (file !== root && !file.startsWith(root + path.sep)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
    file = path.join(file, 'index.html');
  }

  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
    if (path.extname(pathname)) {
      res.writeHead(404);
      return res.end('Not Found');
    }
    file = path.join(root, 'index.html');
  }

  if (!fs.existsSync(file)) {
    res.writeHead(503);
    return res.end('La aplicación aún no se ha compilado.');
  }

  res.writeHead(200, {
    'Content-Type': mime[path.extname(file).toLowerCase()] || 'application/octet-stream',
    'Cache-Control': file.endsWith('index.html') ? 'no-cache' : 'public, max-age=31536000, immutable'
  });

  if (req.method === 'HEAD') return res.end();
  fs.createReadStream(file).pipe(res);
});

const port = Number(process.env.PORT || 8080);
server.listen(port, '0.0.0.0', () => {
  console.log('vSIAF visual replica listening on port ' + port);
});
