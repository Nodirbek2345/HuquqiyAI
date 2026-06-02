// Quick test script for AI Analysis API
const https = require('http');

const data = JSON.stringify({
    text: "Mehnat shartnomasi. 1-modda: Ish vaqti kuniga 12 soat. 2-modda: Xodim ish vaqtida dam olishdan voz kechadi.",
    mode: "quick"
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

console.log('Testing AI Analysis API...');

const req = https.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        console.log('\n=== Response Status:', res.statusCode, '===');
        try {
            const parsed = JSON.parse(body);
            console.log('\nDocument Type:', parsed.documentType);
            console.log('Risk Score:', parsed.riskScore);
            console.log('Risk Level:', parsed.overallRisk || parsed.riskLevel);
            console.log('Summary:', parsed.summary?.substring(0, 200) + '...');
            console.log('\n✅ AI Analysis SUCCESS!');
        } catch (e) {
            console.log('Raw Response:', body.substring(0, 500));
        }
    });
});

req.on('error', (e) => {
    console.error('❌ Connection error:', e.message);
});

req.write(data);
req.end();
