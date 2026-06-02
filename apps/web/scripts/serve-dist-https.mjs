#!/usr/bin/env node
/**
 * Sert dist/web/browser en HTTPS (recette PWA / push locale).
 * Proxy /v1 et /actuator vers l’API Spring — équivalent proxy.conf.json de ng serve.
 */
import { createServer as createHttpsServer } from 'node:https';
import { request as httpRequest } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { dirname, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '../dist/web/browser');
const PORT = Number(process.env.HATCAST_WEB_PORT ?? 4200);
const API_ORIGIN = process.env.HATCAST_API_ORIGIN ?? 'http://127.0.0.1:8080';
const SSL_PEM =
  process.env.HATCAST_WEB_SSL_PEM ??
  join(__dirname, '../.angular/cache/21.2.7/web/vite/basic-ssl/_cert.pem');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};

function noCache(path) {
  return (
    path === '/ngsw.json' ||
    path.startsWith('/ngsw-worker') ||
    path === '/custom-sw.js' ||
    path === '/index.html'
  );
}

function proxyToApi(req, res) {
  const upstream = `${API_ORIGIN}${req.url}`;
  const proxyReq = httpRequest(upstream, { method: req.method, headers: req.headers }, (proxyRes) => {
    res.writeHead(proxyRes.statusCode ?? 502, proxyRes.headers);
    proxyRes.pipe(res);
  });
  proxyReq.on('error', () => {
    res.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('API injoignable (127.0.0.1:8080)');
  });
  req.pipe(proxyReq);
}

function serveStatic(req, res) {
  let path = decodeURIComponent(new URL(req.url ?? '/', 'https://local').pathname);
  if (path === '/') {
    path = '/index.html';
  }

  const filePath = join(DIST, path);
  let target = filePath;
  if (!existsSync(target) || statSync(target).isDirectory()) {
    target = join(DIST, 'index.html');
  }

  if (!target.startsWith(DIST)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  const body = readFileSync(target);
  const ext = extname(target);
  const headers = {
    'Content-Type': MIME[ext] ?? 'application/octet-stream',
  };
  if (noCache(path)) {
    headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
  }
  res.writeHead(200, headers);
  res.end(body);
}

function handler(req, res) {
  const url = req.url ?? '/';
  if (url.startsWith('/v1') || url.startsWith('/actuator')) {
    proxyToApi(req, res);
    return;
  }
  serveStatic(req, res);
}

if (!existsSync(DIST)) {
  console.error(`Erreur : ${DIST} introuvable — lancez ng build --configuration=production d’abord.`);
  process.exit(1);
}
if (!existsSync(SSL_PEM)) {
  console.error(
    `Erreur : certificat TLS introuvable (${SSL_PEM}). Lancez ng serve une fois pour générer basic-ssl.`,
  );
  process.exit(1);
}

const pem = readFileSync(SSL_PEM);
createHttpsServer({ key: pem, cert: pem }, handler).listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Front statique HTTPS : https://localhost:${PORT}  (${DIST})`);
});
