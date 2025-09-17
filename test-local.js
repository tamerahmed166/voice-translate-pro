// Local Testing Script for Voice Translator Pro
// سكريبت اختبار محلي لمترجم الصوت الذكي

const http = require('http');
const fs = require('fs');
const path = require('path');

class LocalTester {
    constructor() {
        this.port = 8080;
        this.server = null;
        this.testResults = {
            passed: 0,
            failed: 0,
            total: 0,
            details: []
        };
    }

    async startServer() {
        return new Promise((resolve, reject) => {
            this.server = http.createServer((req, res) => {
                let filePath = '.' + req.url;
                if (filePath === './') {
                    filePath = './index.html';
                }

                const extname = String(path.extname(filePath)).toLowerCase();
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

                const contentType = mimeTypes[extname] || 'application/octet-stream';

                fs.readFile(filePath, (error, content) => {
                    if (error) {
                        if (error.code === 'ENOENT') {
                            res.writeHead(404, { 'Content-Type': 'text/html' });
                            res.end(`
                                <html>
                                    <head><title>404 - Not Found</title></head>
                                    <body>
                                        <h1>404 - File Not Found</h1>
                                        <p>The requested file ${filePath} was not found.</p>
                                    </body>
                                </html>
                            `);
                        } else {
                            res.writeHead(500);
                            res.end('Server Error: ' + error.code);
                        }
                    } else {
                        res.writeHead(200, { 'Content-Type': contentType });
                        res.end(content, 'utf-8');
                    }
                });
            });

            this.server.listen(this.port, () => {
                console.log(`🚀 Server running at http://localhost:${this.port}/`);
                resolve();
            });

            this.server.on('error', (err) => {
                if (err.code === 'EADDRINUSE') {
                    console.log(`⚠️ Port ${this.port} is in use, trying ${this.port + 1}`);
                    this.port++;
                    this.startServer().then(resolve).catch(reject);
                } else {
                    reject(err);
                }
            });
        });
    }

    async stopServer() {
        if (this.server) {
            return new Promise((resolve) => {
                this.server.close(() => {
                    console.log('🛑 Server stopped');
                    resolve();
                });
            });
        }
    }

    async testFileExists(filePath) {
        return new Promise((resolve) => {
            fs.access(filePath, fs.constants.F_OK, (err) => {
                if (err) {
                    this.addTestResult(`File: ${filePath}`, false, 'File does not exist');
                    resolve(false);
                } else {
                    this.addTestResult(`File: ${filePath}`, true, 'File exists');
                    resolve(true);
                }
            });
        });
    }

    async testFileContent(filePath, expectedContent) {
        return new Promise((resolve) => {
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    this.addTestResult(`Content: ${filePath}`, false, `Cannot read file: ${err.message}`);
                    resolve(false);
                } else if (data.includes(expectedContent)) {
                    this.addTestResult(`Content: ${filePath}`, true, `Contains expected content: ${expectedContent}`);
                    resolve(true);
                } else {
                    this.addTestResult(`Content: ${filePath}`, false, `Does not contain expected content: ${expectedContent}`);
                    resolve(false);
                }
            });
        });
    }

    async testJSONFile(filePath) {
        return new Promise((resolve) => {
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    this.addTestResult(`JSON: ${filePath}`, false, `Cannot read file: ${err.message}`);
                    resolve(false);
                } else {
                    try {
                        JSON.parse(data);
                        this.addTestResult(`JSON: ${filePath}`, true, 'Valid JSON format');
                        resolve(true);
                    } catch (parseErr) {
                        this.addTestResult(`JSON: ${filePath}`, false, `Invalid JSON: ${parseErr.message}`);
                        resolve(false);
                    }
                }
            });
        });
    }

    async testHTTPResponse(url, expectedStatus = 200) {
        return new Promise((resolve) => {
            const options = {
                hostname: 'localhost',
                port: this.port,
                path: url,
                method: 'GET'
            };

            const req = http.request(options, (res) => {
                if (res.statusCode === expectedStatus) {
                    this.addTestResult(`HTTP: ${url}`, true, `Status ${res.statusCode}`);
                    resolve(true);
                } else {
                    this.addTestResult(`HTTP: ${url}`, false, `Expected ${expectedStatus}, got ${res.statusCode}`);
                    resolve(false);
                }
            });

            req.on('error', (err) => {
                this.addTestResult(`HTTP: ${url}`, false, `Request failed: ${err.message}`);
                resolve(false);
            });

            req.setTimeout(5000, () => {
                this.addTestResult(`HTTP: ${url}`, false, 'Request timeout');
                resolve(false);
            });

            req.end();
        });
    }

    addTestResult(name, passed, message) {
        this.testResults.total++;
        if (passed) {
            this.testResults.passed++;
        } else {
            this.testResults.failed++;
        }
        
        this.testResults.details.push({
            name,
            status: passed ? 'passed' : 'failed',
            message
        });
        
        const icon = passed ? '✅' : '❌';
        console.log(`${icon} ${name}: ${message}`);
    }

    async runAllTests() {
        console.log('🧪 بدء اختبار التطبيق محلياً...\n');
        
        try {
            // Start server
            await this.startServer();
            
            // Test required files
            console.log('📁 اختبار الملفات المطلوبة...');
            const requiredFiles = [
                'index.html',
                'manifest.json',
                'sw.js',
                'styles.css',
                'script.js',
                'translate.html',
                'dual-conversation.html',
                'smart-translate.html',
                'settings.html',
                'login.html'
            ];
            
            for (const file of requiredFiles) {
                await this.testFileExists(file);
            }
            
            // Test JSON files
            console.log('\n📄 اختبار ملفات JSON...');
            await this.testJSONFile('manifest.json');
            await this.testJSONFile('package.json');
            
            // Test HTML content
            console.log('\n🌐 اختبار محتوى HTML...');
            await this.testFileContent('index.html', '<!DOCTYPE html>');
            await this.testFileContent('index.html', 'مترجم الصوت الذكي');
            await this.testFileContent('manifest.json', '"name"');
            await this.testFileContent('manifest.json', '"short_name"');
            
            // Test HTTP responses
            console.log('\n🌍 اختبار استجابات HTTP...');
            await this.testHTTPResponse('/');
            await this.testHTTPResponse('/index.html');
            await this.testHTTPResponse('/manifest.json');
            await this.testHTTPResponse('/sw.js');
            await this.testHTTPResponse('/styles.css');
            await this.testHTTPResponse('/script.js');
            
            // Test 404 handling
            await this.testHTTPResponse('/nonexistent.html', 404);
            
            // Display results
            this.displayResults();
            
        } catch (error) {
            console.error('❌ خطأ في الاختبار:', error);
        } finally {
            await this.stopServer();
        }
    }

    displayResults() {
        console.log('\n📊 نتائج الاختبار:');
        console.log(`✅ نجح: ${this.testResults.passed}`);
        console.log(`❌ فشل: ${this.testResults.failed}`);
        console.log(`📈 المجموع: ${this.testResults.total}`);
        
        const successRate = ((this.testResults.passed / this.testResults.total) * 100).toFixed(1);
        console.log(`📊 النسبة: ${successRate}%`);
        
        if (successRate >= 80) {
            console.log('🎉 ممتاز! التطبيق جاهز للنشر');
        } else if (successRate >= 60) {
            console.log('⚠️ جيد، لكن يحتاج تحسينات');
        } else {
            console.log('❌ يحتاج إصلاحات قبل النشر');
        }
        
        // Save results to file
        const resultsFile = 'test-results.json';
        fs.writeFileSync(resultsFile, JSON.stringify(this.testResults, null, 2));
        console.log(`\n💾 النتائج محفوظة في: ${resultsFile}`);
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    const tester = new LocalTester();
    tester.runAllTests().catch(console.error);
}

module.exports = LocalTester;
