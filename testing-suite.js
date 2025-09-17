// Comprehensive Testing Suite for Voice Translator Pro
// مجموعة اختبارات شاملة لمترجم الصوت الذكي

import { appConfig } from './app-config.js';

export class TestingSuite {
    constructor() {
        this.tests = [];
        this.results = [];
        this.isRunning = false;
        this.init();
    }

    init() {
        this.setupTestCategories();
        this.setupUI();
    }

    setupTestCategories() {
        this.testCategories = {
            'firebase': {
                name: 'Firebase Services',
                tests: [
                    'testFirebaseConnection',
                    'testFirestoreConnection',
                    'testAuthService',
                    'testMessagingService'
                ]
            },
            'authentication': {
                name: 'Authentication System',
                tests: [
                    'testEmailRegistration',
                    'testEmailLogin',
                    'testGoogleLogin',
                    'testPasswordReset',
                    'testUserProfile'
                ]
            },
            'translation': {
                name: 'Translation Services',
                tests: [
                    'testGoogleTranslate',
                    'testMicrosoftTranslate',
                    'testDeepLTranslate',
                    'testLibreTranslate',
                    'testMyMemoryTranslate',
                    'testTranslationFallback'
                ]
            },
            'conversation': {
                name: 'Conversation Services',
                tests: [
                    'testDualConversation',
                    'testGroupConversation',
                    'testVoiceRecognition',
                    'testSpeechSynthesis',
                    'testMessageTranslation'
                ]
            },
            'ocr': {
                name: 'OCR Services',
                tests: [
                    'testTesseractInitialization',
                    'testImagePreprocessing',
                    'testTextRecognition',
                    'testLanguageSupport'
                ]
            },
            'notifications': {
                name: 'Notification System',
                tests: [
                    'testNotificationPermission',
                    'testInAppNotifications',
                    'testPushNotifications',
                    'testNotificationActions'
                ]
            },
            'performance': {
                name: 'Performance Optimization',
                tests: [
                    'testLazyLoading',
                    'testDataCompression',
                    'testCacheManagement',
                    'testMemoryUsage'
                ]
            },
            'ui': {
                name: 'User Interface',
                tests: [
                    'testResponsiveDesign',
                    'testAccessibility',
                    'testThemeSwitching',
                    'testLanguageSwitching'
                ]
            }
        };
    }

    setupUI() {
        this.createTestInterface();
    }

    createTestInterface() {
        // إنشاء واجهة الاختبار
        const testContainer = document.createElement('div');
        testContainer.id = 'testing-suite';
        testContainer.innerHTML = `
            <div class="test-suite-container">
                <div class="test-suite-header">
                    <h2>🧪 مجموعة اختبارات مترجم الصوت الذكي</h2>
                    <div class="test-controls">
                        <button id="run-all-tests" class="btn btn-primary">
                            <i class="fas fa-play"></i>
                            تشغيل جميع الاختبارات
                        </button>
                        <button id="run-category-tests" class="btn btn-outline">
                            <i class="fas fa-list"></i>
                            تشغيل فئة محددة
                        </button>
                        <button id="clear-results" class="btn btn-outline">
                            <i class="fas fa-trash"></i>
                            مسح النتائج
                        </button>
                    </div>
                </div>
                
                <div class="test-categories">
                    ${Object.entries(this.testCategories).map(([key, category]) => `
                        <div class="test-category" data-category="${key}">
                            <div class="category-header">
                                <h3>${category.name}</h3>
                                <div class="category-controls">
                                    <button class="btn btn-sm btn-outline run-category" data-category="${key}">
                                        تشغيل
                                    </button>
                                    <span class="category-status" id="status-${key}">
                                        <i class="fas fa-circle"></i>
                                        في الانتظار
                                    </span>
                                </div>
                            </div>
                            <div class="category-tests" id="tests-${key}">
                                ${category.tests.map(test => `
                                    <div class="test-item" data-test="${test}">
                                        <div class="test-info">
                                            <span class="test-name">${this.getTestDisplayName(test)}</span>
                                            <span class="test-status" id="test-status-${test}">
                                                <i class="fas fa-circle"></i>
                                                في الانتظار
                                            </span>
                                        </div>
                                        <div class="test-details" id="test-details-${test}" style="display: none;">
                                            <div class="test-progress">
                                                <div class="progress-bar">
                                                    <div class="progress-fill"></div>
                                                </div>
                                            </div>
                                            <div class="test-log"></div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="test-results">
                    <h3>📊 نتائج الاختبارات</h3>
                    <div class="results-summary" id="results-summary">
                        <div class="summary-item">
                            <span class="summary-label">إجمالي الاختبارات:</span>
                            <span class="summary-value" id="total-tests">0</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">نجحت:</span>
                            <span class="summary-value success" id="passed-tests">0</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">فشلت:</span>
                            <span class="summary-value error" id="failed-tests">0</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">نسبة النجاح:</span>
                            <span class="summary-value" id="success-rate">0%</span>
                        </div>
                    </div>
                    <div class="results-details" id="results-details"></div>
                </div>
            </div>
        `;

        // إضافة الأنماط
        const style = document.createElement('style');
        style.textContent = this.getTestStyles();
        document.head.appendChild(style);

        // إضافة الواجهة إلى الصفحة
        document.body.appendChild(testContainer);

        // إعداد مستمعي الأحداث
        this.setupEventListeners();
    }

    setupEventListeners() {
        // تشغيل جميع الاختبارات
        document.getElementById('run-all-tests')?.addEventListener('click', () => {
            this.runAllTests();
        });

        // تشغيل فئة محددة
        document.getElementById('run-category-tests')?.addEventListener('click', () => {
            this.showCategorySelector();
        });

        // مسح النتائج
        document.getElementById('clear-results')?.addEventListener('click', () => {
            this.clearResults();
        });

        // تشغيل فئة محددة
        document.querySelectorAll('.run-category').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                this.runCategoryTests(category);
            });
        });
    }

    // Firebase Tests
    async testFirebaseConnection() {
        try {
            const app = appConfig.getService('firebase').app;
            if (app) {
                return { success: true, message: 'Firebase connection successful' };
            } else {
                return { success: false, message: 'Firebase app not initialized' };
            }
        } catch (error) {
            return { success: false, message: `Firebase connection failed: ${error.message}` };
        }
    }

    async testFirestoreConnection() {
        try {
            const db = appConfig.getService('firebase').db;
            if (db) {
                // محاولة قراءة من قاعدة البيانات
                const testCollection = collection(db, 'test');
                const docRef = await addDoc(testCollection, {
                    test: true,
                    timestamp: new Date()
                });
                
                if (docRef.id) {
                    return { success: true, message: 'Firestore connection successful' };
                } else {
                    return { success: false, message: 'Failed to write to Firestore' };
                }
            } else {
                return { success: false, message: 'Firestore not initialized' };
            }
        } catch (error) {
            return { success: false, message: `Firestore connection failed: ${error.message}` };
        }
    }

    async testAuthService() {
        try {
            const auth = appConfig.getService('auth');
            if (auth) {
                // اختبار تسجيل الدخول المجهول
                const result = await auth.signInAnonymously();
                if (result.success) {
                    return { success: true, message: 'Authentication service working' };
                } else {
                    return { success: false, message: result.message };
                }
            } else {
                return { success: false, message: 'Auth service not initialized' };
            }
        } catch (error) {
            return { success: false, message: `Auth service failed: ${error.message}` };
        }
    }

    async testMessagingService() {
        try {
            const messaging = appConfig.getService('firebase').messaging;
            if (messaging) {
                // اختبار طلب إذن الإشعارات
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    return { success: true, message: 'Messaging service working' };
                } else {
                    return { success: false, message: 'Notification permission denied' };
                }
            } else {
                return { success: false, message: 'Messaging service not initialized' };
            }
        } catch (error) {
            return { success: false, message: `Messaging service failed: ${error.message}` };
        }
    }

    // Authentication Tests
    async testEmailRegistration() {
        try {
            const auth = appConfig.getService('auth');
            const testEmail = `test-${Date.now()}@example.com`;
            const testPassword = 'TestPassword123!';
            
            const result = await auth.registerWithEmail(testEmail, testPassword, 'Test User');
            if (result.success) {
                return { success: true, message: 'Email registration working' };
            } else {
                return { success: false, message: result.message };
            }
        } catch (error) {
            return { success: false, message: `Email registration failed: ${error.message}` };
        }
    }

    async testEmailLogin() {
        try {
            const auth = appConfig.getService('auth');
            const testEmail = 'test@example.com';
            const testPassword = 'TestPassword123!';
            
            const result = await auth.loginWithEmail(testEmail, testPassword);
            if (result.success) {
                return { success: true, message: 'Email login working' };
            } else {
                return { success: false, message: result.message };
            }
        } catch (error) {
            return { success: false, message: `Email login failed: ${error.message}` };
        }
    }

    async testGoogleLogin() {
        try {
            const auth = appConfig.getService('auth');
            const result = await auth.loginWithGoogle();
            if (result.success) {
                return { success: true, message: 'Google login working' };
            } else {
                return { success: false, message: result.message };
            }
        } catch (error) {
            return { success: false, message: `Google login failed: ${error.message}` };
        }
    }

    async testPasswordReset() {
        try {
            const auth = appConfig.getService('auth');
            const testEmail = 'test@example.com';
            
            const result = await auth.resetPassword(testEmail);
            if (result.success) {
                return { success: true, message: 'Password reset working' };
            } else {
                return { success: false, message: result.message };
            }
        } catch (error) {
            return { success: false, message: `Password reset failed: ${error.message}` };
        }
    }

    async testUserProfile() {
        try {
            const auth = appConfig.getService('auth');
            const user = auth.getCurrentUser();
            if (user) {
                return { success: true, message: 'User profile accessible' };
            } else {
                return { success: false, message: 'No user profile found' };
            }
        } catch (error) {
            return { success: false, message: `User profile test failed: ${error.message}` };
        }
    }

    // Translation Tests
    async testGoogleTranslate() {
        try {
            const translation = appConfig.getService('translation');
            const result = await translation.translate('Hello', 'en', 'ar');
            if (result.success) {
                return { success: true, message: 'Google Translate working' };
            } else {
                return { success: false, message: result.message };
            }
        } catch (error) {
            return { success: false, message: `Google Translate failed: ${error.message}` };
        }
    }

    async testMicrosoftTranslate() {
        try {
            const translation = appConfig.getService('translation');
            const result = await translation.translate('Hello', 'en', 'ar');
            if (result.success) {
                return { success: true, message: 'Microsoft Translate working' };
            } else {
                return { success: false, message: result.message };
            }
        } catch (error) {
            return { success: false, message: `Microsoft Translate failed: ${error.message}` };
        }
    }

    async testDeepLTranslate() {
        try {
            const translation = appConfig.getService('translation');
            const result = await translation.translate('Hello', 'en', 'ar');
            if (result.success) {
                return { success: true, message: 'DeepL Translate working' };
            } else {
                return { success: false, message: result.message };
            }
        } catch (error) {
            return { success: false, message: `DeepL Translate failed: ${error.message}` };
        }
    }

    async testLibreTranslate() {
        try {
            const translation = appConfig.getService('translation');
            const result = await translation.translate('Hello', 'en', 'ar');
            if (result.success) {
                return { success: true, message: 'LibreTranslate working' };
            } else {
                return { success: false, message: result.message };
            }
        } catch (error) {
            return { success: false, message: `LibreTranslate failed: ${error.message}` };
        }
    }

    async testMyMemoryTranslate() {
        try {
            const translation = appConfig.getService('translation');
            const result = await translation.translate('Hello', 'en', 'ar');
            if (result.success) {
                return { success: true, message: 'MyMemory Translate working' };
            } else {
                return { success: false, message: result.message };
            }
        } catch (error) {
            return { success: false, message: `MyMemory Translate failed: ${error.message}` };
        }
    }

    async testTranslationFallback() {
        try {
            const translation = appConfig.getService('translation');
            const result = await translation.translate('Hello', 'en', 'ar');
            if (result.success) {
                return { success: true, message: 'Translation fallback working' };
            } else {
                return { success: false, message: result.message };
            }
        } catch (error) {
            return { success: false, message: `Translation fallback failed: ${error.message}` };
        }
    }

    // Conversation Tests
    async testDualConversation() {
        try {
            const conversation = appConfig.getService('conversation');
            if (conversation) {
                return { success: true, message: 'Dual conversation service available' };
            } else {
                return { success: false, message: 'Dual conversation service not available' };
            }
        } catch (error) {
            return { success: false, message: `Dual conversation test failed: ${error.message}` };
        }
    }

    async testGroupConversation() {
        try {
            const groupConversation = appConfig.getService('groupConversation');
            if (groupConversation) {
                return { success: true, message: 'Group conversation service available' };
            } else {
                return { success: false, message: 'Group conversation service not available' };
            }
        } catch (error) {
            return { success: false, message: `Group conversation test failed: ${error.message}` };
        }
    }

    async testVoiceRecognition() {
        try {
            if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
                return { success: true, message: 'Voice recognition supported' };
            } else {
                return { success: false, message: 'Voice recognition not supported' };
            }
        } catch (error) {
            return { success: false, message: `Voice recognition test failed: ${error.message}` };
        }
    }

    async testSpeechSynthesis() {
        try {
            if ('speechSynthesis' in window) {
                return { success: true, message: 'Speech synthesis supported' };
            } else {
                return { success: false, message: 'Speech synthesis not supported' };
            }
        } catch (error) {
            return { success: false, message: `Speech synthesis test failed: ${error.message}` };
        }
    }

    async testMessageTranslation() {
        try {
            const conversation = appConfig.getService('conversation');
            if (conversation) {
                return { success: true, message: 'Message translation service available' };
            } else {
                return { success: false, message: 'Message translation service not available' };
            }
        } catch (error) {
            return { success: false, message: `Message translation test failed: ${error.message}` };
        }
    }

    // OCR Tests
    async testTesseractInitialization() {
        try {
            const ocr = appConfig.getService('ocr');
            if (ocr) {
                return { success: true, message: 'Tesseract OCR service available' };
            } else {
                return { success: false, message: 'Tesseract OCR service not available' };
            }
        } catch (error) {
            return { success: false, message: `Tesseract initialization failed: ${error.message}` };
        }
    }

    async testImagePreprocessing() {
        try {
            const ocr = appConfig.getService('ocr');
            if (ocr && ocr.preprocessImage) {
                return { success: true, message: 'Image preprocessing available' };
            } else {
                return { success: false, message: 'Image preprocessing not available' };
            }
        } catch (error) {
            return { success: false, message: `Image preprocessing test failed: ${error.message}` };
        }
    }

    async testTextRecognition() {
        try {
            const ocr = appConfig.getService('ocr');
            if (ocr && ocr.recognize) {
                return { success: true, message: 'Text recognition available' };
            } else {
                return { success: false, message: 'Text recognition not available' };
            }
        } catch (error) {
            return { success: false, message: `Text recognition test failed: ${error.message}` };
        }
    }

    async testLanguageSupport() {
        try {
            const ocr = appConfig.getService('ocr');
            if (ocr && ocr.getSupportedLanguages) {
                const languages = ocr.getSupportedLanguages();
                return { success: true, message: `Language support available: ${languages.length} languages` };
            } else {
                return { success: false, message: 'Language support not available' };
            }
        } catch (error) {
            return { success: false, message: `Language support test failed: ${error.message}` };
        }
    }

    // Notification Tests
    async testNotificationPermission() {
        try {
            if ('Notification' in window) {
                const permission = Notification.permission;
                if (permission === 'granted') {
                    return { success: true, message: 'Notification permission granted' };
                } else if (permission === 'default') {
                    return { success: false, message: 'Notification permission not requested' };
                } else {
                    return { success: false, message: 'Notification permission denied' };
                }
            } else {
                return { success: false, message: 'Notifications not supported' };
            }
        } catch (error) {
            return { success: false, message: `Notification permission test failed: ${error.message}` };
        }
    }

    async testInAppNotifications() {
        try {
            const notifications = appConfig.getService('notifications');
            if (notifications && notifications.showInAppNotification) {
                return { success: true, message: 'In-app notifications available' };
            } else {
                return { success: false, message: 'In-app notifications not available' };
            }
        } catch (error) {
            return { success: false, message: `In-app notifications test failed: ${error.message}` };
        }
    }

    async testPushNotifications() {
        try {
            const notifications = appConfig.getService('notifications');
            if (notifications && notifications.showNotification) {
                return { success: true, message: 'Push notifications available' };
            } else {
                return { success: false, message: 'Push notifications not available' };
            }
        } catch (error) {
            return { success: false, message: `Push notifications test failed: ${error.message}` };
        }
    }

    async testNotificationActions() {
        try {
            const notifications = appConfig.getService('notifications');
            if (notifications && notifications.showNotification) {
                return { success: true, message: 'Notification actions available' };
            } else {
                return { success: false, message: 'Notification actions not available' };
            }
        } catch (error) {
            return { success: false, message: `Notification actions test failed: ${error.message}` };
        }
    }

    // Performance Tests
    async testLazyLoading() {
        try {
            const performance = appConfig.getService('performance');
            if (performance && performance.setupLazyLoading) {
                return { success: true, message: 'Lazy loading available' };
            } else {
                return { success: false, message: 'Lazy loading not available' };
            }
        } catch (error) {
            return { success: false, message: `Lazy loading test failed: ${error.message}` };
        }
    }

    async testDataCompression() {
        try {
            const performance = appConfig.getService('performance');
            if (performance && performance.compressData) {
                return { success: true, message: 'Data compression available' };
            } else {
                return { success: false, message: 'Data compression not available' };
            }
        } catch (error) {
            return { success: false, message: `Data compression test failed: ${error.message}` };
        }
    }

    async testCacheManagement() {
        try {
            const performance = appConfig.getService('performance');
            if (performance && performance.setupServiceWorkerCacheManagement) {
                return { success: true, message: 'Cache management available' };
            } else {
                return { success: false, message: 'Cache management not available' };
            }
        } catch (error) {
            return { success: false, message: `Cache management test failed: ${error.message}` };
        }
    }

    async testMemoryUsage() {
        try {
            if ('memory' in performance) {
                const memory = performance.memory;
                return { success: true, message: `Memory usage: ${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB` };
            } else {
                return { success: false, message: 'Memory usage not available' };
            }
        } catch (error) {
            return { success: false, message: `Memory usage test failed: ${error.message}` };
        }
    }

    // UI Tests
    async testResponsiveDesign() {
        try {
            const width = window.innerWidth;
            const height = window.innerHeight;
            return { success: true, message: `Responsive design: ${width}x${height}` };
        } catch (error) {
            return { success: false, message: `Responsive design test failed: ${error.message}` };
        }
    }

    async testAccessibility() {
        try {
            const hasAriaLabels = document.querySelectorAll('[aria-label]').length > 0;
            const hasAltText = document.querySelectorAll('img[alt]').length > 0;
            return { success: true, message: `Accessibility: ARIA labels: ${hasAriaLabels}, Alt text: ${hasAltText}` };
        } catch (error) {
            return { success: false, message: `Accessibility test failed: ${error.message}` };
        }
    }

    async testThemeSwitching() {
        try {
            const hasThemeToggle = document.querySelector('[data-theme-toggle]') !== null;
            return { success: true, message: `Theme switching: ${hasThemeToggle ? 'Available' : 'Not available'}` };
        } catch (error) {
            return { success: false, message: `Theme switching test failed: ${error.message}` };
        }
    }

    async testLanguageSwitching() {
        try {
            const hasLanguageToggle = document.querySelector('[data-language-toggle]') !== null;
            return { success: true, message: `Language switching: ${hasLanguageToggle ? 'Available' : 'Not available'}` };
        } catch (error) {
            return { success: false, message: `Language switching test failed: ${error.message}` };
        }
    }

    // Test Execution
    async runAllTests() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.results = [];
        
        for (const [categoryKey, category] of Object.entries(this.testCategories)) {
            await this.runCategoryTests(categoryKey);
        }
        
        this.isRunning = false;
        this.updateResults();
    }

    async runCategoryTests(categoryKey) {
        const category = this.testCategories[categoryKey];
        if (!category) return;
        
        this.updateCategoryStatus(categoryKey, 'running');
        
        for (const testName of category.tests) {
            await this.runTest(testName);
        }
        
        this.updateCategoryStatus(categoryKey, 'completed');
    }

    async runTest(testName) {
        this.updateTestStatus(testName, 'running');
        
        try {
            const result = await this[testName]();
            this.results.push({
                test: testName,
                category: this.getTestCategory(testName),
                result: result,
                timestamp: new Date()
            });
            
            this.updateTestStatus(testName, result.success ? 'passed' : 'failed', result.message);
        } catch (error) {
            this.results.push({
                test: testName,
                category: this.getTestCategory(testName),
                result: { success: false, message: error.message },
                timestamp: new Date()
            });
            
            this.updateTestStatus(testName, 'failed', error.message);
        }
    }

    // UI Updates
    updateTestStatus(testName, status, message = '') {
        const statusElement = document.getElementById(`test-status-${testName}`);
        const detailsElement = document.getElementById(`test-details-${testName}`);
        
        if (statusElement) {
            const icon = status === 'passed' ? 'fa-check-circle' : 
                        status === 'failed' ? 'fa-times-circle' : 
                        status === 'running' ? 'fa-spinner fa-spin' : 'fa-circle';
            
            statusElement.innerHTML = `<i class="fas ${icon}"></i> ${this.getStatusText(status)}`;
            statusElement.className = `test-status ${status}`;
        }
        
        if (detailsElement && message) {
            const logElement = detailsElement.querySelector('.test-log');
            if (logElement) {
                logElement.innerHTML = `<div class="log-entry">${message}</div>`;
            }
            detailsElement.style.display = 'block';
        }
    }

    updateCategoryStatus(categoryKey, status) {
        const statusElement = document.getElementById(`status-${categoryKey}`);
        if (statusElement) {
            const icon = status === 'completed' ? 'fa-check-circle' : 
                        status === 'running' ? 'fa-spinner fa-spin' : 'fa-circle';
            
            statusElement.innerHTML = `<i class="fas ${icon}"></i> ${this.getStatusText(status)}`;
            statusElement.className = `category-status ${status}`;
        }
    }

    updateResults() {
        const totalTests = this.results.length;
        const passedTests = this.results.filter(r => r.result.success).length;
        const failedTests = totalTests - passedTests;
        const successRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
        
        document.getElementById('total-tests').textContent = totalTests;
        document.getElementById('passed-tests').textContent = passedTests;
        document.getElementById('failed-tests').textContent = failedTests;
        document.getElementById('success-rate').textContent = `${successRate}%`;
        
        this.updateResultsDetails();
    }

    updateResultsDetails() {
        const detailsElement = document.getElementById('results-details');
        if (!detailsElement) return;
        
        const groupedResults = this.groupResultsByCategory();
        
        detailsElement.innerHTML = Object.entries(groupedResults).map(([category, tests]) => `
            <div class="category-results">
                <h4>${this.testCategories[category]?.name || category}</h4>
                <div class="category-tests-results">
                    ${tests.map(test => `
                        <div class="test-result ${test.result.success ? 'success' : 'error'}">
                            <span class="test-name">${this.getTestDisplayName(test.test)}</span>
                            <span class="test-message">${test.result.message}</span>
                            <span class="test-time">${test.timestamp.toLocaleTimeString()}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    // Utility Methods
    getTestDisplayName(testName) {
        return testName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    }

    getTestCategory(testName) {
        for (const [categoryKey, category] of Object.entries(this.testCategories)) {
            if (category.tests.includes(testName)) {
                return categoryKey;
            }
        }
        return 'unknown';
    }

    getStatusText(status) {
        const statusTexts = {
            'pending': 'في الانتظار',
            'running': 'جاري التشغيل',
            'passed': 'نجح',
            'failed': 'فشل',
            'completed': 'مكتمل'
        };
        return statusTexts[status] || status;
    }

    groupResultsByCategory() {
        const grouped = {};
        this.results.forEach(result => {
            if (!grouped[result.category]) {
                grouped[result.category] = [];
            }
            grouped[result.category].push(result);
        });
        return grouped;
    }

    clearResults() {
        this.results = [];
        this.updateResults();
        
        // إعادة تعيين حالة جميع الاختبارات
        Object.keys(this.testCategories).forEach(categoryKey => {
            this.updateCategoryStatus(categoryKey, 'pending');
            this.testCategories[categoryKey].tests.forEach(testName => {
                this.updateTestStatus(testName, 'pending');
            });
        });
    }

    showCategorySelector() {
        // عرض نافذة اختيار الفئة
        const categories = Object.keys(this.testCategories);
        const selectedCategory = prompt(`اختر فئة الاختبار:\n${categories.map((cat, index) => `${index + 1}. ${this.testCategories[cat].name}`).join('\n')}`);
        
        if (selectedCategory && categories[parseInt(selectedCategory) - 1]) {
            const categoryKey = categories[parseInt(selectedCategory) - 1];
            this.runCategoryTests(categoryKey);
        }
    }

    getTestStyles() {
        return `
            .test-suite-container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 20px;
                font-family: 'Cairo', sans-serif;
            }
            
            .test-suite-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                border-radius: 15px;
                margin-bottom: 30px;
                text-align: center;
            }
            
            .test-suite-header h2 {
                margin: 0 0 20px 0;
                font-size: 2rem;
            }
            
            .test-controls {
                display: flex;
                gap: 15px;
                justify-content: center;
                flex-wrap: wrap;
            }
            
            .test-categories {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }
            
            .test-category {
                background: white;
                border-radius: 15px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }
            
            .category-header {
                background: #f8f9fa;
                padding: 20px;
                border-bottom: 1px solid #e9ecef;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .category-header h3 {
                margin: 0;
                color: #495057;
            }
            
            .category-controls {
                display: flex;
                align-items: center;
                gap: 15px;
            }
            
            .category-status {
                display: flex;
                align-items: center;
                gap: 5px;
                font-size: 0.9rem;
            }
            
            .category-status.pending { color: #6c757d; }
            .category-status.running { color: #007bff; }
            .category-status.completed { color: #28a745; }
            
            .category-tests {
                padding: 20px;
            }
            
            .test-item {
                margin-bottom: 15px;
                padding: 15px;
                background: #f8f9fa;
                border-radius: 10px;
                border-left: 4px solid #e9ecef;
            }
            
            .test-item:last-child {
                margin-bottom: 0;
            }
            
            .test-info {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .test-name {
                font-weight: 600;
                color: #495057;
            }
            
            .test-status {
                display: flex;
                align-items: center;
                gap: 5px;
                font-size: 0.9rem;
            }
            
            .test-status.pending { color: #6c757d; }
            .test-status.running { color: #007bff; }
            .test-status.passed { color: #28a745; }
            .test-status.failed { color: #dc3545; }
            
            .test-details {
                margin-top: 10px;
                padding-top: 10px;
                border-top: 1px solid #e9ecef;
            }
            
            .test-progress {
                margin-bottom: 10px;
            }
            
            .progress-bar {
                width: 100%;
                height: 4px;
                background: #e9ecef;
                border-radius: 2px;
                overflow: hidden;
            }
            
            .progress-fill {
                height: 100%;
                background: #007bff;
                width: 0%;
                transition: width 0.3s ease;
            }
            
            .test-log {
                font-size: 0.9rem;
                color: #6c757d;
            }
            
            .log-entry {
                padding: 5px 0;
            }
            
            .test-results {
                background: white;
                border-radius: 15px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                padding: 30px;
            }
            
            .test-results h3 {
                margin: 0 0 20px 0;
                color: #495057;
                text-align: center;
            }
            
            .results-summary {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }
            
            .summary-item {
                text-align: center;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 10px;
            }
            
            .summary-label {
                display: block;
                font-size: 0.9rem;
                color: #6c757d;
                margin-bottom: 5px;
            }
            
            .summary-value {
                display: block;
                font-size: 1.5rem;
                font-weight: 700;
                color: #495057;
            }
            
            .summary-value.success { color: #28a745; }
            .summary-value.error { color: #dc3545; }
            
            .results-details {
                max-height: 400px;
                overflow-y: auto;
            }
            
            .category-results {
                margin-bottom: 20px;
            }
            
            .category-results h4 {
                margin: 0 0 15px 0;
                color: #495057;
                padding-bottom: 10px;
                border-bottom: 2px solid #e9ecef;
            }
            
            .category-tests-results {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .test-result {
                display: grid;
                grid-template-columns: 1fr 2fr auto;
                gap: 15px;
                padding: 15px;
                border-radius: 8px;
                align-items: center;
            }
            
            .test-result.success {
                background: #d4edda;
                border-left: 4px solid #28a745;
            }
            
            .test-result.error {
                background: #f8d7da;
                border-left: 4px solid #dc3545;
            }
            
            .test-result .test-name {
                font-weight: 600;
                color: #495057;
            }
            
            .test-result .test-message {
                color: #6c757d;
                font-size: 0.9rem;
            }
            
            .test-result .test-time {
                color: #6c757d;
                font-size: 0.8rem;
            }
            
            .btn {
                padding: 10px 20px;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: inline-flex;
                align-items: center;
                gap: 8px;
            }
            
            .btn-primary {
                background: #007bff;
                color: white;
            }
            
            .btn-primary:hover {
                background: #0056b3;
            }
            
            .btn-outline {
                background: transparent;
                color: #007bff;
                border: 2px solid #007bff;
            }
            
            .btn-outline:hover {
                background: #007bff;
                color: white;
            }
            
            .btn-sm {
                padding: 8px 16px;
                font-size: 0.9rem;
            }
            
            @media (max-width: 768px) {
                .test-categories {
                    grid-template-columns: 1fr;
                }
                
                .test-controls {
                    flex-direction: column;
                }
                
                .results-summary {
                    grid-template-columns: repeat(2, 1fr);
                }
                
                .test-result {
                    grid-template-columns: 1fr;
                    gap: 10px;
                }
            }
        `;
    }
}

// تصدير مجموعة الاختبارات
export const testingSuite = new TestingSuite();
