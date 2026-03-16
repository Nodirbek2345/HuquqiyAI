const http = require('http');

console.log('Sending request...');

const data = JSON.stringify({
    text: 'Test hujjat matni',
    mode: 'quick'
});

const options = {
    hostname: 'localhost',
    port: 3005,
    path: '/api/analysis',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
    }
};

const req = http.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`);
    const chunks = [];
    res.on('data', d => chunks.push(d));
    res.on('end', () => console.log('Response:', Buffer.concat(chunks).toString()));
});

req.on('error', error => {
    console.error('Error:', error);
});

req.write(data);
req.end();
