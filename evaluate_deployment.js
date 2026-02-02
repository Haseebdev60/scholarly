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
            res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, data }));
        });
        req.on('error', (err) => resolve({ error: err.message })); // Resolve error instead of reject to print it
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
};

console.log('--- BACKEND CHECK VERBOSE ---');
run('/health').then(h => {
    console.log('Health:', h.status, h.data);
    if (h.error) console.log('Health Error:', h.error);

    console.log('--- Testing Login ---');
    return run('/auth/login', 'POST', { email: 'bad@test.com', password: '123' });
}).then(l => {
    if (l) {
        console.log('Login Status:', l.status);
        console.log('Login Data:', l.data);
        console.log('Login Headers:', JSON.stringify(l.headers, null, 2));
        if (l.error) console.log('Login Error:', l.error);
    }
}).catch(e => console.error('Script Error:', e));
