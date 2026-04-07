import { createReadStream, existsSync } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');
const apiTargetHost = '127.0.0.1';
const apiTargetPort = 4000;
const port = 5173;

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

const proxyApi = (req, res) => {
  const proxyReq = http.request({
    hostname: apiTargetHost,
    port: apiTargetPort,
    path: req.url,
    method: req.method,
    headers: req.headers
  }, (proxyRes) => {
    res.writeHead(proxyRes.statusCode ?? 502, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (error) => {
    res.writeHead(502, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ success: false, error: { code: 'BAD_GATEWAY', message: error.message } }));
  });

  req.pipe(proxyReq);
};

const sendFile = async (filePath, res) => {
  const extension = path.extname(filePath).toLowerCase();
  const fileStat = await stat(filePath);
  res.writeHead(200, {
    'content-type': contentTypes[extension] ?? 'application/octet-stream',
    'content-length': fileStat.size
  });
  createReadStream(filePath).pipe(res);
};

const server = http.createServer(async (req, res) => {
  if (!req.url) {
    res.writeHead(400);
    res.end('Bad request');
    return;
  }

  if (req.url.startsWith('/api/')) {
    proxyApi(req, res);
    return;
  }

  const requestPath = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  const safePath = path.normalize(requestPath).replace(/^([.][.][/\\])+/, '');
  const candidate = path.join(distDir, safePath);

  try {
    if (existsSync(candidate) && (await stat(candidate)).isFile()) {
      await sendFile(candidate, res);
      return;
    }

    const indexHtml = path.join(distDir, 'index.html');
    const html = await readFile(indexHtml);
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(html);
  } catch (error) {
    res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
    res.end(`Static server error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
});

server.listen(port, () => {
  console.log(`AegisPlane web runtime listening on http://localhost:${port}`);
});