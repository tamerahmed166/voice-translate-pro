// Simple Server for Voice Translator Pro
// خادم بسيط لمترجم الصوت الذكي

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;

// MIME types
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
};

// Create server
const server = http.createServer((req, res) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    
    // Parse URL
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;
    
    // Handle API routes
    if (pathname.startsWith('/api/')) {
        handleAPI(req, res, pathname);
        return;
    }
    
    // Serve static files
    serveStaticFile(req, res, pathname);
});

// Handle API routes
function handleAPI(req, res, pathname) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    let body = '';
    
    req.on('data', chunk => {
        body += chunk.toString();
    });
    
    req.on('end', () => {
        try {
            const data = body ? JSON.parse(body) : {};
            
            switch (pathname) {
                case '/api/health':
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        status: 'OK',
                        timestamp: new Date().toISOString(),
                        uptime: process.uptime(),
                        version: '1.0.0'
                    }));
                    break;
                    
                case '/api/translate':
                    handleTranslate(req, res, data);
                    break;
                    
                case '/api/ocr':
                    handleOCR(req, res, data);
                    break;
                    
                case '/api/smart-translate':
                    handleSmartTranslate(req, res, data);
                    break;
                    
                case '/api/conversation':
                    handleConversation(req, res, data);
                    break;
                    
                default:
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'API endpoint not found' }));
            }
        } catch (error) {
            console.error('API Error:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal server error' }));
        }
    });
}

// Handle translation API
function handleTranslate(req, res, data) {
    const { text, sourceLang, targetLang, mode } = data;
    
    // Simulate translation
    const mockTranslations = {
        'ar-en': 'Hello, how are you?',
        'en-ar': 'مرحبا، كيف حالك؟',
        'ar-fr': 'Bonjour, comment allez-vous?',
        'fr-ar': 'مرحبا، كيف حالك؟'
    };
    
    const key = `${sourceLang}-${targetLang}`;
    const translatedText = mockTranslations[key] || `[Translated: ${text}]`;
    
    const response = {
        success: true,
        originalText: text,
        translatedText: translatedText,
        sourceLanguage: sourceLang,
        targetLanguage: targetLang,
        mode: mode || 'contextual',
        confidence: 0.9,
        timestamp: new Date().toISOString()
    };
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response));
}

// Handle OCR API
function handleOCR(req, res, data) {
    const response = {
        success: true,
        extractedText: 'Sample extracted text from image',
        translatedText: 'نص عينة مستخرج من الصورة',
        confidence: 0.8,
        language: 'ar',
        timestamp: new Date().toISOString()
    };
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response));
}

// Handle smart translation API
function handleSmartTranslate(req, res, data) {
    const { text, sourceLang, targetLang, mode, contentType, context } = data;
    
    const response = {
        success: true,
        originalText: text,
        translatedText: `[Smart Translation - ${mode} ${contentType}]: ${text}`,
        alternatives: [
            `[Alternative 1: ${text}]`,
            `[Alternative 2: ${text}]`
        ],
        confidence: 0.95,
        mode: mode || 'contextual',
        contentType: contentType || 'general',
        insights: {
            complexity: 'medium',
            sentiment: 'neutral',
            domain: 'general'
        },
        timestamp: new Date().toISOString()
    };
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response));
}

// Handle conversation API
function handleConversation(req, res, data) {
    const { message, participantId, language, sessionId } = data;
    
    const response = {
        success: true,
        message: message,
        translation: `[Translated: ${message}]`,
        participantId: participantId,
        sessionId: sessionId || Date.now().toString(),
        timestamp: new Date().toISOString()
    };
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response));
}

// Serve static files
function serveStaticFile(req, res, pathname) {
    // Default to index.html for root
    if (pathname === '/') {
        pathname = '/index.html';
    }
    
    // Security: prevent directory traversal
    if (pathname.includes('..')) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }
    
    const filePath = path.join(__dirname, pathname);
    const extname = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';
    
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                // File not found, serve 404.html if exists
                const notFoundPath = path.join(__dirname, '404.html');
                fs.readFile(notFoundPath, (err, notFoundContent) => {
                    if (err) {
                        res.writeHead(404, { 'Content-Type': 'text/html' });
                        res.end(`
                            <!DOCTYPE html>
                            <html>
                            <head>
                                <title>404 - Page Not Found</title>
                                <meta charset="utf-8">
                            </head>
                            <body>
                                <h1>404 - Page Not Found</h1>
                                <p>The requested file was not found.</p>
                                <a href="/">Go to Home</a>
                            </body>
                            </html>
                        `);
                    } else {
                        res.writeHead(404, { 'Content-Type': 'text/html' });
                        res.end(notFoundContent);
                    }
                });
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${error.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
}

// Start server
server.listen(PORT, () => {
    console.log(`🚀 Voice Translator Pro Server running on port ${PORT}`);
    console.log(`📱 Frontend: http://localhost:${PORT}`);
    console.log(`🔧 API: http://localhost:${PORT}/api`);
    console.log(`💡 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`⏰ Started at: ${new Date().toISOString()}`);
});

// Handle server errors
server.on('error', (error) => {
    console.error('❌ Server Error:', error);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});
