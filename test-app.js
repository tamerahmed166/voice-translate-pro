// Voice Translator Pro - Application Test Suite
// اختبار شامل للتطبيق للتأكد من عمله على GitHub

class AppTester {
    constructor() {
        this.testResults = {
            passed: 0,
            failed: 0,
            total: 0,
            details: []
        };
        this.isRunning = false;
    }

    async runAllTests() {
        console.log('🚀 بدء اختبار التطبيق...');
        this.isRunning = true;
        this.testResults = { passed: 0, failed: 0, total: 0, details: [] };

        try {
            // Basic functionality tests
            await this.testBasicFunctionality();
            
            // File loading tests
            await this.testFileLoading();
            
            // Service worker tests
            await this.testServiceWorker();
            
            // PWA tests
            await this.testPWAFeatures();
            
            // Translation tests
            await this.testTranslationFeatures();
            
            // Performance tests
            await this.testPerformance();
            
            // Browser compatibility tests
            await this.testBrowserCompatibility();
            
            // Display results
            this.displayResults();
            
        } catch (error) {
            console.error('❌ خطأ في الاختبار:', error);
            this.addTestResult('General Test', false, `خطأ عام: ${error.message}`);
        } finally {
            this.isRunning = false;
        }
    }

    async testBasicFunctionality() {
        console.log('📋 اختبار الوظائف الأساسية...');
        
        // Test DOM elements
        this.addTest('DOM Elements', () => {
            const requiredElements = [
                'nav', '.navbar', '.nav-container',
                'main', '.hero', '.features'
            ];
            
            for (const selector of requiredElements) {
                const element = document.querySelector(selector);
                if (!element) {
                    throw new Error(`عنصر مطلوب غير موجود: ${selector}`);
                }
            }
            return true;
        });

        // Test navigation
        this.addTest('Navigation', () => {
            const navLinks = document.querySelectorAll('.nav-link');
            if (navLinks.length < 5) {
                throw new Error('عدد روابط التنقل غير كافي');
            }
            return true;
        });

        // Test responsive design
        this.addTest('Responsive Design', () => {
            const viewport = document.querySelector('meta[name="viewport"]');
            if (!viewport) {
                throw new Error('meta viewport غير موجود');
            }
            return true;
        });
    }

    async testFileLoading() {
        console.log('📁 اختبار تحميل الملفات...');
        
        // Test CSS files
        this.addTest('CSS Files', async () => {
            const cssFiles = [
                'styles.css',
                'translate-styles.css',
                'conversation-styles.css',
                'login-styles.css'
            ];
            
            for (const file of cssFiles) {
                try {
                    const response = await fetch(file);
                    if (!response.ok) {
                        throw new Error(`فشل تحميل ${file}: ${response.status}`);
                    }
                } catch (error) {
                    throw new Error(`خطأ في تحميل ${file}: ${error.message}`);
                }
            }
            return true;
        });

        // Test JavaScript files
        this.addTest('JavaScript Files', async () => {
            const jsFiles = [
                'script.js',
                'translate-script.js',
                'conversation-script.js',
                'login-script.js'
            ];
            
            for (const file of jsFiles) {
                try {
                    const response = await fetch(file);
                    if (!response.ok) {
                        throw new Error(`فشل تحميل ${file}: ${response.status}`);
                    }
                } catch (error) {
                    throw new Error(`خطأ في تحميل ${file}: ${error.message}`);
                }
            }
            return true;
        });

        // Test manifest
        this.addTest('Manifest File', async () => {
            try {
                const response = await fetch('manifest.json');
                if (!response.ok) {
                    throw new Error(`فشل تحميل manifest.json: ${response.status}`);
                }
                
                const manifest = await response.json();
                if (!manifest.name || !manifest.short_name) {
                    throw new Error('manifest.json غير صالح');
                }
                return true;
            } catch (error) {
                throw new Error(`خطأ في manifest.json: ${error.message}`);
            }
        });
    }

    async testServiceWorker() {
        console.log('⚙️ اختبار Service Worker...');
        
        this.addTest('Service Worker Registration', async () => {
            if (!('serviceWorker' in navigator)) {
                throw new Error('Service Worker غير مدعوم في هذا المتصفح');
            }
            
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                if (!registration) {
                    throw new Error('فشل تسجيل Service Worker');
                }
                return true;
            } catch (error) {
                throw new Error(`خطأ في Service Worker: ${error.message}`);
            }
        });

        this.addTest('Service Worker File', async () => {
            try {
                const response = await fetch('/sw.js');
                if (!response.ok) {
                    throw new Error(`فشل تحميل sw.js: ${response.status}`);
                }
                return true;
            } catch (error) {
                throw new Error(`خطأ في sw.js: ${error.message}`);
            }
        });
    }

    async testPWAFeatures() {
        console.log('📱 اختبار ميزات PWA...');
        
        this.addTest('PWA Manifest', () => {
            const manifest = document.querySelector('link[rel="manifest"]');
            if (!manifest) {
                throw new Error('رابط manifest غير موجود');
            }
            return true;
        });

        this.addTest('PWA Icons', () => {
            const appleIcon = document.querySelector('link[rel="apple-touch-icon"]');
            if (!appleIcon) {
                throw new Error('أيقونة Apple غير موجودة');
            }
            return true;
        });

        this.addTest('PWA Meta Tags', () => {
            const requiredMetaTags = [
                'apple-mobile-web-app-capable',
                'apple-mobile-web-app-status-bar-style',
                'apple-mobile-web-app-title'
            ];
            
            for (const name of requiredMetaTags) {
                const meta = document.querySelector(`meta[name="${name}"]`);
                if (!meta) {
                    throw new Error(`meta tag مطلوب غير موجود: ${name}`);
                }
            }
            return true;
        });
    }

    async testTranslationFeatures() {
        console.log('🌐 اختبار ميزات الترجمة...');
        
        this.addTest('Translation API', async () => {
            try {
                // Test Google Translate API
                const testText = 'Hello';
                const response = await fetch(
                    `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ar&dt=t&q=${encodeURIComponent(testText)}`
                );
                
                if (!response.ok) {
                    throw new Error(`فشل في API الترجمة: ${response.status}`);
                }
                
                const data = await response.json();
                if (!data || !data[0] || !data[0][0]) {
                    throw new Error('استجابة API غير صالحة');
                }
                
                return true;
            } catch (error) {
                throw new Error(`خطأ في API الترجمة: ${error.message}`);
            }
        });

        this.addTest('Speech Recognition', () => {
            if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
                throw new Error('Speech Recognition غير مدعوم');
            }
            return true;
        });

        this.addTest('Speech Synthesis', () => {
            if (!('speechSynthesis' in window)) {
                throw new Error('Speech Synthesis غير مدعوم');
            }
            return true;
        });
    }

    async testPerformance() {
        console.log('⚡ اختبار الأداء...');
        
        this.addTest('Page Load Time', () => {
            const loadTime = performance.now();
            if (loadTime > 5000) {
                throw new Error(`وقت التحميل بطيء جداً: ${loadTime}ms`);
            }
            return true;
        });

        this.addTest('Memory Usage', () => {
            if ('memory' in performance) {
                const memory = performance.memory;
                const usedMB = memory.usedJSHeapSize / 1024 / 1024;
                if (usedMB > 100) {
                    throw new Error(`استخدام الذاكرة عالي جداً: ${usedMB.toFixed(2)}MB`);
                }
            }
            return true;
        });

        this.addTest('Local Storage', () => {
            try {
                const testKey = 'test-storage';
                const testValue = 'test-value';
                localStorage.setItem(testKey, testValue);
                const retrieved = localStorage.getItem(testKey);
                localStorage.removeItem(testKey);
                
                if (retrieved !== testValue) {
                    throw new Error('Local Storage لا يعمل بشكل صحيح');
                }
                return true;
            } catch (error) {
                throw new Error(`خطأ في Local Storage: ${error.message}`);
            }
        });
    }

    async testBrowserCompatibility() {
        console.log('🌍 اختبار توافق المتصفح...');
        
        this.addTest('ES6 Support', () => {
            try {
                // Test arrow functions
                const arrow = () => true;
                if (!arrow()) {
                    throw new Error('Arrow functions غير مدعومة');
                }
                
                // Test template literals
                const template = `test ${1 + 1}`;
                if (template !== 'test 2') {
                    throw new Error('Template literals غير مدعومة');
                }
                
                // Test destructuring
                const { a, b } = { a: 1, b: 2 };
                if (a !== 1 || b !== 2) {
                    throw new Error('Destructuring غير مدعوم');
                }
                
                return true;
            } catch (error) {
                throw new Error(`ES6 غير مدعوم: ${error.message}`);
            }
        });

        this.addTest('Fetch API', () => {
            if (!('fetch' in window)) {
                throw new Error('Fetch API غير مدعوم');
            }
            return true;
        });

        this.addTest('Promise Support', () => {
            if (!('Promise' in window)) {
                throw new Error('Promises غير مدعومة');
            }
            return true;
        });
    }

    addTest(name, testFunction) {
        this.testResults.total++;
        
        try {
            const result = testFunction();
            if (result instanceof Promise) {
                result.then(() => {
                    this.testResults.passed++;
                    this.testResults.details.push({
                        name,
                        status: 'passed',
                        message: 'نجح الاختبار'
                    });
                    console.log(`✅ ${name}: نجح`);
                }).catch(error => {
                    this.testResults.failed++;
                    this.testResults.details.push({
                        name,
                        status: 'failed',
                        message: error.message
                    });
                    console.log(`❌ ${name}: فشل - ${error.message}`);
                });
            } else {
                this.testResults.passed++;
                this.testResults.details.push({
                    name,
                    status: 'passed',
                    message: 'نجح الاختبار'
                });
                console.log(`✅ ${name}: نجح`);
            }
        } catch (error) {
            this.testResults.failed++;
            this.testResults.details.push({
                name,
                status: 'failed',
                message: error.message
            });
            console.log(`❌ ${name}: فشل - ${error.message}`);
        }
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
    }

    displayResults() {
        console.log('\n📊 نتائج الاختبار:');
        console.log(`✅ نجح: ${this.testResults.passed}`);
        console.log(`❌ فشل: ${this.testResults.failed}`);
        console.log(`📈 المجموع: ${this.testResults.total}`);
        console.log(`📊 النسبة: ${((this.testResults.passed / this.testResults.total) * 100).toFixed(1)}%`);
        
        // Display detailed results
        console.log('\n📋 التفاصيل:');
        this.testResults.details.forEach(test => {
            const icon = test.status === 'passed' ? '✅' : '❌';
            console.log(`${icon} ${test.name}: ${test.message}`);
        });
        
        // Create visual results in DOM
        this.createResultsDisplay();
    }

    createResultsDisplay() {
        // Remove existing results
        const existingResults = document.getElementById('test-results');
        if (existingResults) {
            existingResults.remove();
        }
        
        // Create results container
        const resultsContainer = document.createElement('div');
        resultsContainer.id = 'test-results';
        resultsContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border: 2px solid #4F46E5;
            border-radius: 10px;
            padding: 20px;
            max-width: 400px;
            max-height: 500px;
            overflow-y: auto;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            z-index: 10000;
            font-family: 'Cairo', sans-serif;
        `;
        
        const successRate = ((this.testResults.passed / this.testResults.total) * 100).toFixed(1);
        const statusColor = successRate >= 80 ? '#10B981' : successRate >= 60 ? '#F59E0B' : '#EF4444';
        
        resultsContainer.innerHTML = `
            <div style="text-align: center; margin-bottom: 15px;">
                <h3 style="margin: 0; color: #4F46E5;">نتائج اختبار التطبيق</h3>
                <div style="font-size: 24px; font-weight: bold; color: ${statusColor}; margin: 10px 0;">
                    ${successRate}%
                </div>
                <div style="font-size: 14px; color: #6B7280;">
                    ${this.testResults.passed}/${this.testResults.total} اختبار نجح
                </div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span>✅ نجح:</span>
                    <span style="color: #10B981; font-weight: bold;">${this.testResults.passed}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span>❌ فشل:</span>
                    <span style="color: #EF4444; font-weight: bold;">${this.testResults.failed}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span>📊 المجموع:</span>
                    <span style="font-weight: bold;">${this.testResults.total}</span>
                </div>
            </div>
            
            <div style="max-height: 200px; overflow-y: auto;">
                ${this.testResults.details.map(test => `
                    <div style="display: flex; align-items: center; margin-bottom: 8px; padding: 5px; border-radius: 5px; background: ${test.status === 'passed' ? '#F0FDF4' : '#FEF2F2'};">
                        <span style="margin-left: 8px;">${test.status === 'passed' ? '✅' : '❌'}</span>
                        <div>
                            <div style="font-weight: bold; font-size: 12px;">${test.name}</div>
                            <div style="font-size: 11px; color: #6B7280;">${test.message}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div style="text-align: center; margin-top: 15px;">
                <button onclick="this.parentElement.parentElement.remove()" style="
                    background: #4F46E5;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-family: 'Cairo', sans-serif;
                ">إغلاق</button>
            </div>
        `;
        
        document.body.appendChild(resultsContainer);
    }
}

// Initialize and run tests when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Add test button to page
    const testButton = document.createElement('button');
    testButton.innerHTML = '🧪 اختبار التطبيق';
    testButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: #4F46E5;
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 25px;
        cursor: pointer;
        font-family: 'Cairo', sans-serif;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
        z-index: 1000;
        transition: all 0.3s ease;
    `;
    
    testButton.addEventListener('mouseenter', () => {
        testButton.style.transform = 'translateY(-2px)';
        testButton.style.boxShadow = '0 6px 16px rgba(79, 70, 229, 0.4)';
    });
    
    testButton.addEventListener('mouseleave', () => {
        testButton.style.transform = 'translateY(0)';
        testButton.style.boxShadow = '0 4px 12px rgba(79, 70, 229, 0.3)';
    });
    
    testButton.addEventListener('click', () => {
        const tester = new AppTester();
        tester.runAllTests();
    });
    
    document.body.appendChild(testButton);
    
    // Auto-run basic tests
    setTimeout(() => {
        console.log('🔍 تشغيل اختبارات أساسية تلقائياً...');
        const tester = new AppTester();
        tester.runAllTests();
    }, 2000);
});

// Export for manual testing
window.AppTester = AppTester;
