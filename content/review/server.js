const http = require('http');
const { parse } = require('querystring');

const username = 'admin';
const password = 'cat';

http.createServer((req, res) => {
    console.log(`${req.method} ${req.url}`);
    if (req.url === '/' && req.method === 'POST') {
        let body = '';
        res.setHeader('Content-Type', 'application/json');
        req.on('data', dataChunk => (body += dataChunk.toString()));
        req.on('end', () => {
            let bodyObject = JSON.parse(body);
            if (username == bodyObject.username && password == bodyObject.password)
                res.end(JSON.stringify({ success: true, msg: 'Signed In successfully!' }));
            else res.end(JSON.stringify({ success: false, msg: 'Authentication failed' }));
        });
    } else {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, msg: 'Server working' }));
    }
}).listen(9090);
console.log(`Server running in port 9090`);
