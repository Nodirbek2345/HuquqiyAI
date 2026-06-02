const fs = require('fs');
const path = require('path');
const https = require('https');

// Colors for console output
const colors = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    cyan: "\x1b[36m"
};

function log(color, msg) {
    console.log(`${color}${msg}${colors.reset}`);
}

async function verifyOpenAI() {
    log(colors.cyan, "\n=== OpenAI Key Verification Tool ===");

    // 1. Scan for keys
    const envPaths = [
        path.resolve(__dirname, '.env'),
        path.resolve(__dirname, '../.env.local'),
        path.resolve(process.cwd(), '.env'),
        path.resolve(process.cwd(), '.env.local')
    ];

    const foundKeys = new Set();

    log(colors.yellow, "Scanning for keys...");

    for (const envPath of envPaths) {
        if (fs.existsSync(envPath)) {
            const content = fs.readFileSync(envPath, 'utf-8');
            content.split(/\r?\n/).forEach(line => {
                // Match OPENAI_API_KEY* and VITE_OPENAI_API_KEY*
                const match = line.match(/^((?:VITE_)?OPENAI_API_KEY(?:_\w+)?)\s*=\s*["']?([^"'\s#]+)["']?/);
                if (match) {
                    const [_, keyName, val] = match;
                    if (val && val.length > 20) {
                        foundKeys.add(val);
                        // log(colors.reset, `  Found ${keyName} in ${path.basename(envPath)}`);
                    }
                }
            });
        }
    }

    if (foundKeys.size === 0) {
        log(colors.red, "❌ No OpenAI keys found in .env files!");
        return;
    }

    log(colors.green, `✅ Found ${foundKeys.size} unique OpenAI key(s).`);

    // 2. Test Keys
    const uniqueKeys = Array.from(foundKeys);

    for (let i = 0; i < uniqueKeys.length; i++) {
        const key = uniqueKeys[i];
        const maskedKey = `...${key.slice(-6)}`;
        log(colors.cyan, `\nTesting Key ${i + 1}/${uniqueKeys.length}: ${maskedKey}`);

        try {
            const result = await testKey(key);
            if (result.success) {
                log(colors.green, `  ✅ Valid! Response: "${result.message}"`);
            } else {
                log(colors.red, `  ❌ Failed. Status: ${result.status} | Error: ${result.error}`);
            }
        } catch (e) {
            log(colors.red, `  ❌ Error: ${e.message}`);
        }
    }
}

function testKey(key) {
    return new Promise((resolve) => {
        const data = JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: "Say 'Hello' in Uzbek." }],
            max_tokens: 10
        });

        const req = https.request({
            hostname: 'api.openai.com',
            path: '/v1/chat/completions',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${key}`
            }
        }, (res) => {
            let body = '';
            res.on('data', d => body += d);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    const response = JSON.parse(body);
                    resolve({
                        success: true,
                        message: response.choices?.[0]?.message?.content?.trim() || "No content"
                    });
                } else {
                    let errMsg = body;
                    try { errMsg = JSON.parse(body).error.message } catch (e) { }
                    resolve({
                        success: false,
                        status: res.statusCode,
                        error: errMsg
                    });
                }
            });
        });

        req.on('error', (e) => resolve({ success: false, error: e.message }));
        req.write(data);
        req.end();
    });
}

verifyOpenAI();
