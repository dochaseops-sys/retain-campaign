import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

function createHandler() {
  return (req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    let pathname = decodeURIComponent(parsedUrl.pathname);

    // Rewrites matching vercel.json
    if (pathname === '/') {
      pathname = '/index.html';
    } else if (pathname === '/follow') {
      pathname = '/follow.html';
    } else if (pathname === '/employee') {
      pathname = '/employee.html';
    } else if (pathname === '/campaign') {
      pathname = '/campaign.html';
    } else if (pathname === '/admin') {
      pathname = '/admin.html';
    }

    let filePath = path.join(__dirname, pathname);

    // If path is a directory, look for index.html
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    // If file doesn't exist, check with .html extension
    if (!fs.existsSync(filePath) && fs.existsSync(`${filePath}.html`)) {
      filePath = `${filePath}.html`;
    }

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<!DOCTYPE html><html><head><title>404 Not Found</title></head><body style="font-family:sans-serif;padding:40px;text-align:center;"><h2>404 - Page Not Found</h2><p><a href="/">Return to Home</a></p></body></html>`);
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*'
      });

      fs.createReadStream(filePath).pipe(res);
    });
  };
}

function startServer(port) {
  const s = http.createServer(createHandler());

  s.once('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is in use, trying ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });

  s.listen(port, () => {
    console.log(`\n🚀 Dochase Growth Challenge server running locally!`);
    console.log(`\n   ➜ Local:    http://localhost:${port}`);
    console.log(`   ➜ Follow:   http://localhost:${port}/follow`);
    console.log(`   ➜ Employee: http://localhost:${port}/employee`);
    console.log(`   ➜ Campaign: http://localhost:${port}/campaign`);
    console.log(`   ➜ Admin:    http://localhost:${port}/admin\n`);
  });
}

startServer(Number(PORT));


