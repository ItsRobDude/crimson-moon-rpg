import { createReadStream } from 'node:fs';
import { access, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const host = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT || 8000);

const contentTypes = {
  '.cjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2'
};

function resolvePath(urlPathname) {
  const pathname = decodeURIComponent(urlPathname.split('?')[0]);
  const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const resolvedPath = path.resolve(rootDir, relativePath);
  if (!resolvedPath.startsWith(rootDir)) return null;
  return resolvedPath;
}

async function resolveFilePath(filePath) {
  try {
    const fileStats = await stat(filePath);
    if (fileStats.isDirectory()) {
      const indexPath = path.join(filePath, 'index.html');
      await access(indexPath);
      return indexPath;
    }
    return filePath;
  } catch {
    return null;
  }
}

const server = createServer(async (req, res) => {
  const filePath = resolvePath(req.url || '/');
  if (!filePath) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  const resolvedFile = await resolveFilePath(filePath);
  if (!resolvedFile) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
    return;
  }

  const extension = path.extname(resolvedFile).toLowerCase();
  res.writeHead(200, {
    'Cache-Control': 'no-cache',
    'Content-Type': contentTypes[extension] || 'application/octet-stream'
  });
  createReadStream(resolvedFile).pipe(res);
});

server.listen(port, host, () => {
  console.log(`Static server ready at http://${host}:${port}`);
});
