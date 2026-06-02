const https = require('https');

// Load keys from environment variables
const keys = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3
].filter(Boolean);

const models = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-pro'];

async function testKey(key, model) {
    return new Promise((resolve) => {
        const data = JSON.stringify({
            contents: [{ parts: [{ text: "Hello" }] }]
        });

        const options = {
            hostname: 'generativelanguage.googleapis.com',
            path: `/v1beta/models/${model}:generateContent?key=${key}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (d) => body += d);
            res.on('end', () => {
                let status = 'UNKNOWN';
                if (res.statusCode === 200) status = '✅ OK';
                else if (res.statusCode === 429) status = '❌ 429 Quota';
                else if (res.statusCode === 404) status = '❌ 404 Not Found';
                else status = `❌ ${res.statusCode}`;

                console.log(`Key: ...${key.slice(-6)} | Model: ${model.padEnd(18)} | ${status}`);
                resolve();
            });
        });

        req.on('error', (e) => {
            console.error(`Key: ...${key.slice(-6)} | Model: ${model} | Error: ${e.message}`);
            resolve();
        });

        req.write(data);
        req.end();
    });
}

async function run() {
    console.log('--- Testing Gemini Keys Direct HTTP (No SDK) ---');
    if (keys.length === 0) {
        console.log('No keys found in environment variables.');
        return;
    }
    for (const key of keys) {
        for (const model of models) {
            await testKey(key, model);
        }
    }
}

run();
