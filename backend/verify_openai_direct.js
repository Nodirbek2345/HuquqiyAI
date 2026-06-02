const https = require('https');

// Load keys from environment variables
const keys = [
    process.env.OPENAI_API_KEY,
    process.env.OPENAI_API_KEY_2,
    process.env.OPENAI_API_KEY_3
].filter(Boolean);

async function testKey(key) {
    return new Promise((resolve) => {
        const data = JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: "Hello" }],
            max_tokens: 5
        });

        const options = {
            hostname: 'api.openai.com',
            path: '/v1/chat/completions',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${key}`,
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
                else if (res.statusCode === 401) status = '❌ 401 Invalid Key';
                else status = `❌ ${res.statusCode}`;

                console.log(`Key: ...${key.slice(-6)} | Status: ${status}`);
                resolve();
            });
        });

        req.on('error', (e) => {
            console.error(`Key: ...${key.slice(-6)} | Error: ${e.message}`);
            resolve();
        });

        req.write(data);
        req.end();
    });
}

async function run() {
    console.log('--- Testing OpenAI Keys Direct HTTP ---');
    for (const key of keys) {
        await testKey(key);
    }
}

run();
