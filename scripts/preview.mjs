import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';

const { values } = parseArgs({ options: {
  host: { type: 'string', default: '127.0.0.1' },
  port: { type: 'string', default: process.env.PORT ?? '3000' },
  strictPort: { type: 'boolean' }
} });

const types = { html: 'text/html', css: 'text/css', js: 'text/javascript', svg: 'image/svg+xml' };
const pages = new URL('../dist/', import.meta.url);
createServer(async (request, response) => {
  const path = new URL(request.url, 'http://localhost').pathname;
  const relative = path.endsWith('/') ? `${path}index.html` : path;
  const file = new URL(`.${relative}`, pages);
  try {
    if (!file.href.startsWith(pages.href)) throw new Error('Not found');
    const content = await readFile(file);
    response.writeHead(200, { 'Content-Type': `${types[file.pathname.split('.').at(-1)] ?? 'text/plain'}; charset=utf-8` });
    response.end(content);
  } catch {
    response.writeHead(404).end('Not found');
  }
}).listen(Number(values.port), values.host);
