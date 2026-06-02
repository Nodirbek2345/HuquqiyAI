const http = require('http');

// Test 1: Check what error OpenAI returns
const data = JSON.stringify({ text: 'Test shartnoma', mode: 'quick' });
const opts = {
    hostname: 'localhost', port: 5000,
    path: '/api/analysis', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
    timeout: 60000
};

console.log('Testing backend API...');
console.log('Waiting up to 60 seconds for AI response...');

const req = http.request(opts, (res) => {
    let body = '';
    res.on('data', (c) => body += c);
    res.on('end', () => {
        console.log('\n=== RESULT ===');
        console.log('HTTP Status:', res.statusCode);
        try {
            const json = JSON.parse(body);
            const d = json.data || json;
            console.log('Provider:', d.analysis_mode || 'unknown');
            console.log('Confidence:', d.confidenceReason || 'N/A');
            console.log('Document Type:', d.documentType || 'N/A');
            console.log('Risk:', d.overallRisk || 'N/A');
            console.log('Issues:', (d.issues || []).length);
            if (d.analysis_mode === 'fallback') {
                console.log('\n*** AI ISHLAMADI - faqat Regex fallback ***');
            } else {
                console.log('\n*** AI ISHLADI! ***');
            }
        } catch (e) {
            console.log('RAW:', body.substring(0, 800));
        }
    });
});
req.on('error', (e) => console.log('CONNECTION ERROR:', e.message));
req.on('timeout', () => { console.log('TIMEOUT - 60s expired'); req.destroy(); });
req.write(data);
req.end();
