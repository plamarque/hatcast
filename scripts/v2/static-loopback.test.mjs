import { mkdtemp, mkdir, copyFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { get } from 'node:https';
import { createServer } from 'node:http';
import { spawn, spawnSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const tmp = await mkdtemp(join(tmpdir(), 'hatcast-static-loopback-'));
let child;
const upstream = createServer((req, res) => res.end('assigned-api:' + req.url));
try {
  await mkdir(join(tmp, 'scripts'), { recursive: true });
  await mkdir(join(tmp, 'dist/web/browser'), { recursive: true });
  await copyFile(join(root, 'apps/web/scripts/serve-dist-https.mjs'), join(tmp, 'scripts/server.mjs'));
  await writeFile(join(tmp, 'dist/web/browser/index.html'), 'loopback test');
  const cert = join(tmp, 'cert.pem'), key = join(tmp, 'key.pem');
  const openssl = spawnSync('openssl', ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', key,
    '-out', cert, '-days', '1', '-subj', '/CN=localhost'], { stdio: 'ignore' });
  if (openssl.status !== 0) throw new Error('cannot create test certificate');
  await new Promise((resolve, reject) => upstream.once('error', reject).listen(0, '127.0.0.1', resolve));
  const apiPort = upstream.address().port;
  child = spawn(process.execPath, [join(tmp, 'scripts/server.mjs')], {
    env: { ...process.env, HATCAST_WEB_PORT: '0', HATCAST_API_ORIGIN: `http://127.0.0.1:${apiPort}`, HATCAST_WEB_SSL_CERT: cert, HATCAST_WEB_SSL_KEY: key },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('static server timeout')), 5000);
    child.stdout.on('data', () => { clearTimeout(timeout); resolve(); });
    child.once('exit', code => { clearTimeout(timeout); reject(new Error(`static server exited ${code}`)); });
  });
  const sockets = spawnSync('lsof', ['-nP', '-a', '-p', String(child.pid), '-iTCP', '-sTCP:LISTEN', '-Fn'], { encoding: 'utf8' });
  if (sockets.status !== 0) throw new Error(`cannot inspect static server socket: ${sockets.stderr}`);
  const addresses = sockets.stdout.split('\n').filter(line => line.startsWith('n')).map(line => line.slice(1));
  if (addresses.length !== 1 || !/^127\.0\.0\.1:[0-9]+$/.test(addresses[0])) {
    throw new Error(`static server is not listening only on IPv4 loopback: ${addresses.join(', ')}`);
  }
  const port = Number(addresses[0].split(':')[1]);
  const body = await new Promise((resolve, reject) => get({ host: '127.0.0.1', port, rejectUnauthorized: false }, res => {
    let data = ''; res.on('data', chunk => { data += chunk; }); res.on('end', () => resolve(data));
  }).on('error', reject));
  if (body !== 'loopback test') throw new Error('unexpected static content');
  for (const path of ['/v1/auth/me', '/actuator/health']) {
    const proxied = await new Promise((resolve, reject) => get({ host: '127.0.0.1', port, path, rejectUnauthorized: false }, res => {
      let data = ''; res.on('data', chunk => { data += chunk; }); res.on('end', () => resolve(data));
    }).on('error', reject));
    if (proxied !== `assigned-api:${path}`) throw new Error(`wrong proxy destination for ${path}`);
  }
  console.log('PASS: static HTTPS uses loopback and the assigned API port');
} finally {
  if (child && child.exitCode === null) { child.kill('SIGTERM'); await new Promise(resolve => child.once('exit', resolve)); }
  if (upstream.listening) await new Promise(resolve => upstream.close(resolve));
  await rm(tmp, { recursive: true, force: true });
}
