

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

function loadEnv() {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        try {
            const content = fs.readFileSync(envPath, 'utf8');
            content.split('\n').forEach(line => {
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith('#')) return;
                const eqIdx = trimmed.indexOf('=');
                if (eqIdx !== -1) {
                    const key = trimmed.substring(0, eqIdx).trim();
                    const val = trimmed.substring(eqIdx + 1).trim();
                    if (!process.env[key]) {
                        process.env[key] = val;
                    }
                }
            });
            console.log('[ENV] Loaded configuration from .env file successfully.');
        } catch (e) {
            console.warn('[ENV] Warning loading .env:', e.message);
        }
    }
}
loadEnv();

const PORT = parseInt(process.env.PORT || '8085', 10);
const handler = require('./api/send-email');

const MIME_TYPES = {
    '.html': 'text/html; charset=UTF-8',
    '.css': 'text/css; charset=UTF-8',
    '.js': 'application/javascript; charset=UTF-8',
    '.json': 'application/json; charset=UTF-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.webp': 'image/webp',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.txt': 'text/plain; charset=UTF-8'
};

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    let pathname = decodeURIComponent(parsedUrl.pathname);

    if (pathname === '/api/send-email' || pathname === '/api/send-email.js' || pathname === '/api/send-email.php') {
        let bodyChunks = [];
        req.on('data', chunk => bodyChunks.push(chunk));
        req.on('end', () => {
            req.body = Buffer.concat(bodyChunks).toString();
            handler(req, res);
        });
        return;
    }

    if (pathname === '/api/health') {
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(200);
        res.end(JSON.stringify({
            status: 'online',
            service: 'Safe Journeys Web & Email Server',
            timestamp: new Date().toISOString(),
            brevoConfigured: Boolean(process.env.BREVO_API_KEY)
        }));
        return;
    }

    if (pathname === '/' || pathname === '') {
        pathname = '/index.html';
    }

    const safePath = path.normalize(path.join(__dirname, pathname));
    if (!safePath.startsWith(__dirname)) {
        res.writeHead(403);
        res.end('Access Denied');
        return;
    }

    fs.stat(safePath, (err, stats) => {
        if (err || !stats.isFile()) {
            
            const fallbackIndex = path.join(safePath, 'index.html');
            if (fs.existsSync(fallbackIndex)) {
                serveStaticFile(fallbackIndex, res);
                return;
            }
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404 Not Found</h1><p>The requested file does not exist.</p><p><a href="/">Return to Home</a></p>');
            return;
        }

        serveStaticFile(safePath, res);
    });
});

function serveStaticFile(filePath, res) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    const isAsset = filePath.includes(path.join(__dirname, 'assets'));
    const headers = { 'Content-Type': contentType };
    if (isAsset) {
        headers['Cache-Control'] = 'public, max-age=86400'; 
    } else {
        headers['Cache-Control'] = 'no-cache';
    }

    res.writeHead(200, headers);
    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
}

server.listen(PORT, '0.0.0.0', () => {
    console.log('===============================================================');
    console.log('  SAFE JOURNEYS HAPPY MEMORIES - SERVER ACTIVE');
    console.log('===============================================================');
    console.log(`  Local Website URL : http://localhost:${PORT}/`);
    console.log(`  Admin Dashboard   : http://localhost:${PORT}/admin.html`);
    console.log(`  Email API Endpoint: http://localhost:${PORT}/api/send-email`);
    console.log(`  Brevo API Status  : ${process.env.BREVO_API_KEY ? 'CONFIGURED & READY' : 'KEY MISSING'}`);
    console.log('===============================================================');
});
