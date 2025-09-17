// Advanced Settings Script for Voice Translator Pro
// كود الإعدادات المتقدمة لمترجم الصوت الذكي

import { appConfig } from './app-config.js';
import { testingSuite } from './testing-suite.js';

class AdvancedSettingsManager {
    constructor() {
        this.settings = {};
        this.isInitialized = false;
        this.init();
    }

    async init() {
        try {
            await this.waitForAppConfig();
            this.loadSettings();
            this.setupEventListeners();
            this.setupUI();
            this.isInitialized = true;
            console.log('Advanced settings manager initialized successfully');
        } catch (error) {
            console.error('Failed to initialize advanced settings manager:', error);
        }
    }

    async waitForAppConfig() {
        let attempts = 0;
        const maxAttempts = 50;
        
        while (!appConfig.isInitialized && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!appConfig.isInitialized) {
            throw new Error('App config not initialized');
        }
    }

    setupEventListeners() {
        // Tab switching
        this.setupTabSwitching();
        
        // Range inputs
        this.setupRangeInputs();
        
        // Toggle switches
        this.setupToggleSwitches();
        
        // Settings actions
        this.setupSettingsActions();
        
        // Testing buttons
        this.setupTestingButtons();
    }

    setupTabSwitching() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.settings-content');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                
                // Update active tab
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Update active content
                tabContents.forEach(content => {
                    content.classList.remove('active');
                    if (content.id === `${tab}-tab`) {
                        content.classList.add('active');
                    }
                });
            });
        });
    }

    setupRangeInputs() {
        const rangeInputs = document.querySelectorAll('input[type="range"]');
        
        rangeInputs.forEach(input => {
            // Update value display
            const updateValue = () => {
                const valueSpan = input.parentElement.querySelector('.range-value');
                if (valueSpan) {
                    let value = input.value;
                    
                    // Format value based on input type
                    if (input.id === 'font-size' || input.id === 'spacing') {
                        value += 'px';
                    } else if (input.id === 'speech-rate' || input.id === 'speech-pitch') {
                        value += 'x';
                    } else if (input.id === 'speech-volume') {
                        value = Math.round(value * 100) + '%';
                    }
                    
                    valueSpan.textContent = value;
                }
            };
            
            input.addEventListener('input', updateValue);
            updateValue(); // Initial update
        });
    }

    setupToggleSwitches() {
        const toggleSwitches = document.querySelectorAll('.toggle-switch input[type="checkbox"]');
        
        toggleSwitches.forEach(toggle => {
            toggle.addEventListener('change', () => {
                this.updateSetting(toggle.id, toggle.checked);
            });
        });
    }

    setupSettingsActions() {
        // Save settings
        document.getElementById('save-settings')?.addEventListener('click', () => {
            this.saveSettings();
        });

        // Reset settings
        document.getElementById('reset-settings')?.addEventListener('click', () => {
            this.resetSettings();
        });

        // Export data
        document.getElementById('export-data')?.addEventListener('click', () => {
            this.exportData();
        });

        // Delete all data
        document.getElementById('delete-all-data')?.addEventListener('click', () => {
            this.deleteAllData();
        });
    }

    setupTestingButtons() {
        // Test Firebase
        document.getElementById('test-firebase')?.addEventListener('click', () => {
            this.runFirebaseTests();
        });

        // Test Translation
        document.getElementById('test-translation')?.addEventListener('click', () => {
            this.runTranslationTests();
        });

        // Test Voice
        document.getElementById('test-voice')?.addEventListener('click', () => {
            this.runVoiceTests();
        });

        // Run all tests
        document.getElementById('run-all-tests')?.addEventListener('click', () => {
            this.runAllTests();
        });
    }

    setupUI() {
        // Load current settings into UI
        this.loadSettingsIntoUI();
        
        // Setup real-time updates
        this.setupRealTimeUpdates();
    }

    loadSettingsIntoUI() {
        // General settings
        this.setSettingValue('default-language', this.settings.defaultLanguage || 'ar');
        this.setSettingValue('dark-mode', this.settings.darkMode || false);
        this.setSettingValue('auto-save-settings', this.settings.autoSaveSettings || true);
        this.setSettingValue('detail-level', this.settings.detailLevel || 'normal');
        this.setSettingValue('font-size', this.settings.fontSize || 16);
        this.setSettingValue('spacing', this.settings.spacing || 16);
        this.setSettingValue('animations', this.settings.animations || true);

        // Translation settings
        this.setSettingValue('preferred-translation-service', this.settings.preferredTranslationService || 'google');
        this.setSettingValue('auto-translate', this.settings.autoTranslate || true);
        this.setSettingValue('show-alternative-translations', this.settings.showAlternativeTranslations || false);
        this.setSettingValue('save-translations', this.settings.saveTranslations || true);
        this.setSettingValue('google-api-key', this.settings.googleApiKey || '');
        this.setSettingValue('microsoft-api-key', this.settings.microsoftApiKey || '');
        this.setSettingValue('deepl-api-key', this.settings.deeplApiKey || '');

        // Voice settings
        this.setSettingValue('speech-rate', this.settings.speechRate || 0.9);
        this.setSettingValue('speech-pitch', this.settings.speechPitch || 1);
        this.setSettingValue('speech-volume', this.settings.speechVolume || 1);
        this.setSettingValue('auto-speak', this.settings.autoSpeak || true);
        this.setSettingValue('recognition-accuracy', this.settings.recognitionAccuracy || 'medium');
        this.setSettingValue('continuous-recognition', this.settings.continuousRecognition || false);
        this.setSettingValue('show-interim-results', this.settings.showInterimResults || true);

        // Conversation settings
        this.setSettingValue('max-messages', this.settings.maxMessages || 100);
        this.setSettingValue('save-conversations', this.settings.saveConversations || true);
        this.setSettingValue('real-time-translation', this.settings.realTimeTranslation || true);
        this.setSettingValue('max-participants', this.settings.maxParticipants || 10);
        this.setSettingValue('auto-translate-groups', this.settings.autoTranslateGroups || true);
        this.setSettingValue('group-notifications', this.settings.groupNotifications || true);

        // Performance settings
        this.setSettingValue('lazy-loading', this.settings.lazyLoading || true);
        this.setSettingValue('data-compression', this.settings.dataCompression || true);
        this.setSettingValue('memory-management', this.settings.memoryManagement || true);
        this.setSettingValue('cache-level', this.settings.cacheLevel || 'normal');
        this.setSettingValue('performance-monitoring', this.settings.performanceMonitoring || true);
        this.setSettingValue('error-reporting', this.settings.errorReporting || true);
        this.setSettingValue('usage-statistics', this.settings.usageStatistics || true);

        // Privacy settings
        this.setSettingValue('auto-delete-data', this.settings.autoDeleteData || true);
        this.setSettingValue('data-retention-period', this.settings.dataRetentionPeriod || 30);
        this.setSettingValue('encrypt-data', this.settings.encryptData || true);
        this.setSettingValue('do-not-track', this.settings.doNotTrack || false);
    }

    setSettingValue(elementId, value) {
        const element = document.getElementById(elementId);
        if (!element) return;

        if (element.type === 'checkbox') {
            element.checked = value;
        } else if (element.type === 'range') {
            element.value = value;
            // Trigger range input update
            element.dispatchEvent(new Event('input'));
        } else {
            element.value = value;
        }
    }

    setupRealTimeUpdates() {
        // Listen for all input changes
        document.addEventListener('change', (e) => {
            if (e.target.matches('input, select, textarea')) {
                this.updateSetting(e.target.id, e.target.value);
            }
        });

        document.addEventListener('input', (e) => {
            if (e.target.matches('input[type="range"]')) {
                this.updateSetting(e.target.id, parseFloat(e.target.value));
            }
        });
    }

    updateSetting(key, value) {
        this.settings[key] = value;
        
        // Apply setting immediately if it affects the UI
        this.applySetting(key, value);
        
        // Auto-save if enabled
        if (this.settings.autoSaveSettings) {
            this.saveSettings();
        }
    }

    applySetting(key, value) {
        switch (key) {
            case 'dark-mode':
                this.applyDarkMode(value);
                break;
            case 'font-size':
                this.applyFontSize(value);
                break;
            case 'spacing':
                this.applySpacing(value);
                break;
            case 'animations':
                this.applyAnimations(value);
                break;
            case 'preferred-translation-service':
                this.applyPreferredTranslationService(value);
                break;
            case 'speech-rate':
            case 'speech-pitch':
            case 'speech-volume':
                this.applySpeechSettings();
                break;
            case 'recognition-accuracy':
                this.applyRecognitionAccuracy(value);
                break;
            case 'lazy-loading':
                this.applyLazyLoading(value);
                break;
            case 'data-compression':
                this.applyDataCompression(value);
                break;
            case 'cache-level':
                this.applyCacheLevel(value);
                break;
        }
    }

    applyDarkMode(enabled) {
        document.body.classList.toggle('dark-mode', enabled);
        localStorage.setItem('dark-mode', enabled);
    }

    applyFontSize(size) {
        document.documentElement.style.setProperty('--font-size-base', `${size}px`);
        localStorage.setItem('font-size', size);
    }

    applySpacing(spacing) {
        document.documentElement.style.setProperty('--spacing-base', `${spacing}px`);
        localStorage.setItem('spacing', spacing);
    }

    applyAnimations(enabled) {
        document.body.classList.toggle('no-animations', !enabled);
        localStorage.setItem('animations', enabled);
    }

    applyPreferredTranslationService(service) {
        const translationService = appConfig.getService('translation');
        if (translationService && translationService.setPreferredAPI) {
            translationService.setPreferredAPI(service);
        }
    }

    applySpeechSettings() {
        const speechRate = this.settings.speechRate || 0.9;
        const speechPitch = this.settings.speechPitch || 1;
        const speechVolume = this.settings.speechVolume || 1;
        
        // Apply to speech synthesis
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance();
            utterance.rate = speechRate;
            utterance.pitch = speechPitch;
            utterance.volume = speechVolume;
        }
    }

    applyRecognitionAccuracy(accuracy) {
        const conversationService = appConfig.getService('conversation');
        if (conversationService && conversationService.updateSettings) {
            conversationService.updateSettings({ recognitionAccuracy: accuracy });
        }
    }

    applyLazyLoading(enabled) {
        const performanceService = appConfig.getService('performance');
        if (performanceService && performanceService.setupLazyLoading) {
            if (enabled) {
                performanceService.setupLazyLoading();
            }
        }
    }

    applyDataCompression(enabled) {
        const performanceService = appConfig.getService('performance');
        if (performanceService && performanceService.updateSettings) {
            performanceService.updateSettings({ dataCompression: enabled });
        }
    }

    applyCacheLevel(level) {
        const performanceService = appConfig.getService('performance');
        if (performanceService && performanceService.updateSettings) {
            performanceService.updateSettings({ cacheLevel: level });
        }
    }

    // Settings Management
    loadSettings() {
        try {
            const savedSettings = localStorage.getItem('advanced-settings');
            if (savedSettings) {
                this.settings = JSON.parse(savedSettings);
            } else {
                this.settings = this.getDefaultSettings();
            }
        } catch (error) {
            console.error('Error loading settings:', error);
            this.settings = this.getDefaultSettings();
        }
    }

    getDefaultSettings() {
        return {
            // General
            defaultLanguage: 'ar',
            darkMode: false,
            autoSaveSettings: true,
            detailLevel: 'normal',
            fontSize: 16,
            spacing: 16,
            animations: true,

            // Translation
            preferredTranslationService: 'google',
            autoTranslate: true,
            showAlternativeTranslations: false,
            saveTranslations: true,
            googleApiKey: '',
            microsoftApiKey: '',
            deeplApiKey: '',

            // Voice
            speechRate: 0.9,
            speechPitch: 1,
            speechVolume: 1,
            autoSpeak: true,
            recognitionAccuracy: 'medium',
            continuousRecognition: false,
            showInterimResults: true,

            // Conversation
            maxMessages: 100,
            saveConversations: true,
            realTimeTranslation: true,
            maxParticipants: 10,
            autoTranslateGroups: true,
            groupNotifications: true,

            // Performance
            lazyLoading: true,
            dataCompression: true,
            memoryManagement: true,
            cacheLevel: 'normal',
            performanceMonitoring: true,
            errorReporting: true,
            usageStatistics: true,

            // Privacy
            autoDeleteData: true,
            dataRetentionPeriod: 30,
            encryptData: true,
            doNotTrack: false
        };
    }

    async saveSettings() {
        try {
            // Save to localStorage
            localStorage.setItem('advanced-settings', JSON.stringify(this.settings));
            
            // Save to database if user is authenticated
            const authService = appConfig.getService('auth');
            if (authService && authService.isAuthenticated()) {
                const databaseService = appConfig.getService('database');
                if (databaseService && databaseService.saveUserSettings) {
                    await databaseService.saveUserSettings(this.settings);
                }
            }
            
            this.showMessage('تم حفظ الإعدادات بنجاح', 'success');
        } catch (error) {
            console.error('Error saving settings:', error);
            this.showMessage('خطأ في حفظ الإعدادات', 'error');
        }
    }

    resetSettings() {
        if (confirm('هل أنت متأكد من إعادة تعيين جميع الإعدادات؟')) {
            this.settings = this.getDefaultSettings();
            this.loadSettingsIntoUI();
            this.saveSettings();
            this.showMessage('تم إعادة تعيين الإعدادات', 'info');
        }
    }

    async exportData() {
        try {
            const data = {
                settings: this.settings,
                conversations: this.getConversationData(),
                translations: this.getTranslationData(),
                timestamp: new Date().toISOString()
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `voice-translator-data-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showMessage('تم تصدير البيانات بنجاح', 'success');
        } catch (error) {
            console.error('Error exporting data:', error);
            this.showMessage('خطأ في تصدير البيانات', 'error');
        }
    }

    async deleteAllData() {
        if (confirm('هل أنت متأكد من حذف جميع البيانات؟ لا يمكن التراجع عن هذا الإجراء.')) {
            try {
                // Clear localStorage
                localStorage.clear();
                
                // Clear database if user is authenticated
                const authService = appConfig.getService('auth');
                if (authService && authService.isAuthenticated()) {
                    const databaseService = appConfig.getService('database');
                    if (databaseService && databaseService.deleteAllUserData) {
                        await databaseService.deleteAllUserData();
                    }
                }
                
                // Reset settings
                this.settings = this.getDefaultSettings();
                this.loadSettingsIntoUI();
                
                this.showMessage('تم حذف جميع البيانات', 'info');
            } catch (error) {
                console.error('Error deleting data:', error);
                this.showMessage('خطأ في حذف البيانات', 'error');
            }
        }
    }

    getConversationData() {
        try {
            return JSON.parse(localStorage.getItem('conversations') || '[]');
        } catch (error) {
            return [];
        }
    }

    getTranslationData() {
        try {
            return JSON.parse(localStorage.getItem('translations') || '[]');
        } catch (error) {
            return [];
        }
    }

    // Testing Methods
    async runFirebaseTests() {
        this.showTestResults('Firebase Tests', 'جاري تشغيل اختبارات Firebase...');
        
        try {
            const tests = [
                'testFirebaseConnection',
                'testFirestoreConnection',
                'testAuthService',
                'testMessagingService'
            ];
            
            const results = [];
            for (const test of tests) {
                const result = await testingSuite[test]();
                results.push({ test, result });
            }
            
            this.displayTestResults('Firebase Tests', results);
        } catch (error) {
            this.showTestResults('Firebase Tests', `خطأ في تشغيل الاختبارات: ${error.message}`, 'error');
        }
    }

    async runTranslationTests() {
        this.showTestResults('Translation Tests', 'جاري تشغيل اختبارات الترجمة...');
        
        try {
            const tests = [
                'testGoogleTranslate',
                'testMicrosoftTranslate',
                'testDeepLTranslate',
                'testLibreTranslate',
                'testMyMemoryTranslate',
                'testTranslationFallback'
            ];
            
            const results = [];
            for (const test of tests) {
                const result = await testingSuite[test]();
                results.push({ test, result });
            }
            
            this.displayTestResults('Translation Tests', results);
        } catch (error) {
            this.showTestResults('Translation Tests', `خطأ في تشغيل الاختبارات: ${error.message}`, 'error');
        }
    }

    async runVoiceTests() {
        this.showTestResults('Voice Tests', 'جاري تشغيل اختبارات الصوت...');
        
        try {
            const tests = [
                'testVoiceRecognition',
                'testSpeechSynthesis',
                'testTesseractInitialization',
                'testImagePreprocessing',
                'testTextRecognition',
                'testLanguageSupport'
            ];
            
            const results = [];
            for (const test of tests) {
                const result = await testingSuite[test]();
                results.push({ test, result });
            }
            
            this.displayTestResults('Voice Tests', results);
        } catch (error) {
            this.showTestResults('Voice Tests', `خطأ في تشغيل الاختبارات: ${error.message}`, 'error');
        }
    }

    async runAllTests() {
        this.showTestResults('All Tests', 'جاري تشغيل جميع الاختبارات...');
        
        try {
            await testingSuite.runAllTests();
            this.showTestResults('All Tests', 'تم تشغيل جميع الاختبارات بنجاح', 'success');
        } catch (error) {
            this.showTestResults('All Tests', `خطأ في تشغيل الاختبارات: ${error.message}`, 'error');
        }
    }

    showTestResults(title, message, type = 'info') {
        const resultsContainer = document.getElementById('test-results');
        if (!resultsContainer) return;
        
        resultsContainer.innerHTML = `
            <div class="test-result ${type}">
                <h4>${title}</h4>
                <p>${message}</p>
                <div class="test-time">${new Date().toLocaleTimeString()}</div>
            </div>
        `;
    }

    displayTestResults(title, results) {
        const resultsContainer = document.getElementById('test-results');
        if (!resultsContainer) return;
        
        const passedTests = results.filter(r => r.result.success).length;
        const totalTests = results.length;
        const successRate = Math.round((passedTests / totalTests) * 100);
        
        resultsContainer.innerHTML = `
            <div class="test-summary">
                <h4>${title}</h4>
                <div class="summary-stats">
                    <span class="stat">إجمالي: ${totalTests}</span>
                    <span class="stat success">نجحت: ${passedTests}</span>
                    <span class="stat error">فشلت: ${totalTests - passedTests}</span>
                    <span class="stat">نسبة النجاح: ${successRate}%</span>
                </div>
            </div>
            <div class="test-details">
                ${results.map(result => `
                    <div class="test-detail ${result.result.success ? 'success' : 'error'}">
                        <span class="test-name">${testingSuite.getTestDisplayName(result.test)}</span>
                        <span class="test-message">${result.result.message}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    showMessage(message, type = 'info') {
        const messageEl = document.createElement('div');
        messageEl.className = `message message-${type}`;
        messageEl.innerHTML = `
            <i class="fas fa-${this.getMessageIcon(type)}"></i>
            <span>${message}</span>
        `;
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            display: flex;
            align-items: center;
            gap: 10px;
            max-width: 400px;
            animation: slideInRight 0.3s ease-out;
            background: white;
            border-left: 4px solid var(--${type === 'success' ? 'success' : type === 'error' ? 'error' : type === 'warning' ? 'warning' : 'primary'}-color);
        `;
        
        document.body.appendChild(messageEl);
        
        setTimeout(() => {
            messageEl.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                messageEl.remove();
            }, 300);
        }, 5000);
    }

    getMessageIcon(type) {
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
}

// Initialize advanced settings manager
let advancedSettingsManager;
document.addEventListener('DOMContentLoaded', async () => {
    advancedSettingsManager = new AdvancedSettingsManager();
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(style);
