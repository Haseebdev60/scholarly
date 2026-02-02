import https from 'https';

const API_URL = 'https://scholarlybackend.vercel.app/api';

const run = (path, method = 'GET', body = null) => {
    return new Promise((resolve, reject) => {
        const req = https.request({
            hostname: 'scholarlybackend.vercel.app',
            path: '/api' + path,
            method,
            headers: body ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(JSON.stringify(body)) } : {}
        }, res => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => resolve({ status: res.statusCode, data }));
        });
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
};

console.log('--- BACKEND CHECK (Correct URL) ---');
run('/health').then(h => {
    console.log('Health:', h.status, h.data);
    return run('/auth/login', 'POST', { email: 'bad@test.com', password: '123' });
}).then(l => {
    console.log('Login:', l.status, l.data);
}).catch(e => console.error(e));
