// Settings Page Specific Script
// Handles settings management and configuration

class SettingsManager {
    constructor() {
        this.settings = this.loadSettings();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupTabSwitching();
        this.setupFormValidation();
        this.loadCurrentSettings();
    }

    setupEventListeners() {
        // Save settings
        const saveBtn = document.getElementById('save-settings');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveSettings();
            });
        }

        // Cancel settings
        const cancelBtn = document.getElementById('cancel-settings');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.cancelSettings();
            });
        }

        // Reset settings
        const resetBtn = document.getElementById('reset-settings');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetSettings();
            });
        }

        // App info
        const appInfoBtn = document.getElementById('app-info');
        if (appInfoBtn) {
            appInfoBtn.addEventListener('click', () => {
                this.showAppInfo();
            });
        }

        // Clear all data
        const clearDataBtn = document.getElementById('clear-all-data');
        if (clearDataBtn) {
            clearDataBtn.addEventListener('click', () => {
                this.clearAllData();
            });
        }

        // Export data
        const exportBtn = document.getElementById('export-data');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportData();
            });
        }

        // Test speech
        const testSpeechBtn = document.getElementById('test-speech');
        if (testSpeechBtn) {
            testSpeechBtn.addEventListener('click', () => {
                this.testSpeech();
            });
        }

        // Range sliders
        this.setupRangeSliders();
        
        // Theme selection
        this.setupThemeSelection();
        
        // Font size selection
        this.setupFontSizeSelection();
        
        // Quality selection
        this.setupQualitySelection();
    }

    setupTabSwitching() {
        const tabs = document.querySelectorAll('.nav-tab');
        const tabContents = document.querySelectorAll('.settings-tab');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.dataset.tab;
                
                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Update active content
                tabContents.forEach(content => {
                    content.classList.remove('active');
                });
                document.getElementById(`${targetTab}-tab`)?.classList.add('active');
            });
        });
    }

    setupFormValidation() {
        // Real-time validation for inputs
        const inputs = document.querySelectorAll('input[type="email"], input[type="url"], input[type="number"]');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateInput(input);
            });
            
            input.addEventListener('input', () => {
                this.clearInputError(input);
            });
        });
    }

    setupRangeSliders() {
        const rateSlider = document.getElementById('speech-rate');
        const pitchSlider = document.getElementById('speech-pitch');
        const timeoutInput = document.getElementById('request-timeout');

        if (rateSlider) {
            rateSlider.addEventListener('input', (e) => {
                const value = e.target.value;
                const speedValue = document.getElementById('speed-value');
                if (speedValue) {
                    speedValue.textContent = value;
                }
            });
        }

        if (pitchSlider) {
            pitchSlider.addEventListener('input', (e) => {
                const value = e.target.value;
                const pitchValue = document.getElementById('pitch-value');
                if (pitchValue) {
                    pitchValue.textContent = value;
                }
            });
        }

        if (timeoutInput) {
            timeoutInput.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                if (value < 5) e.target.value = 5;
                if (value > 120) e.target.value = 120;
            });
        }
    }

    setupThemeSelection() {
        const themeBtns = document.querySelectorAll('.theme-btn');
        
        themeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.dataset.theme;
                
                // Update active button
                themeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Apply theme
                this.applyTheme(theme);
            });
        });
    }

    setupFontSizeSelection() {
        const fontBtns = document.querySelectorAll('.font-size-btn');
        
        fontBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const size = btn.dataset.size;
                
                // Update active button
                fontBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Apply font size
                this.applyFontSize(size);
            });
        });
    }

    setupQualitySelection() {
        const qualityBtns = document.querySelectorAll('.quality-btn');
        
        qualityBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const quality = btn.dataset.quality;
                
                // Update active button
                qualityBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Update quality setting
                this.settings.translationQuality = quality;
            });
        });
    }

    loadCurrentSettings() {
        // Load all current settings into the form
        Object.keys(this.settings).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = this.settings[key];
                } else if (element.type === 'range') {
                    element.value = this.settings[key];
                    // Trigger input event to update display
                    element.dispatchEvent(new Event('input'));
                } else {
                    element.value = this.settings[key];
                }
            }
        });

        // Set active states for buttons
        this.setActiveStates();
    }

    setActiveStates() {
        // Theme buttons
        const themeBtn = document.querySelector(`[data-theme="${this.settings.theme}"]`);
        if (themeBtn) {
            document.querySelectorAll('.theme-btn').forEach(btn => btn.classList.remove('active'));
            themeBtn.classList.add('active');
        }

        // Font size buttons
        const fontBtn = document.querySelector(`[data-size="${this.settings.fontSize}"]`);
        if (fontBtn) {
            document.querySelectorAll('.font-size-btn').forEach(btn => btn.classList.remove('active'));
            fontBtn.classList.add('active');
        }

        // Quality buttons
        const qualityBtn = document.querySelector(`[data-quality="${this.settings.translationQuality}"]`);
        if (qualityBtn) {
            document.querySelectorAll('.quality-btn').forEach(btn => btn.classList.remove('active'));
            qualityBtn.classList.add('active');
        }
    }

    saveSettings() {
        // Collect all settings from the form
        const newSettings = {};
        
        // Get all form elements
        const inputs = document.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            if (input.id && input.id !== 'save-settings' && input.id !== 'cancel-settings') {
                if (input.type === 'checkbox') {
                    newSettings[input.id] = input.checked;
                } else {
                    newSettings[input.id] = input.value;
                }
            }
        });

        // Validate settings
        if (!this.validateSettings(newSettings)) {
            return;
        }

        // Save settings
        this.settings = { ...this.settings, ...newSettings };
        localStorage.setItem('app-settings', JSON.stringify(this.settings));
        
        // Apply settings
        this.applySettings();
        
        this.showMessage('تم حفظ الإعدادات بنجاح', 'success');
    }

    cancelSettings() {
        // Reload current settings
        this.loadCurrentSettings();
        this.showMessage('تم إلغاء التغييرات', 'info');
    }

    resetSettings() {
        if (confirm('هل أنت متأكد من إعادة تعيين جميع الإعدادات إلى القيم الافتراضية؟')) {
            this.settings = this.getDefaultSettings();
            localStorage.setItem('app-settings', JSON.stringify(this.settings));
            this.loadCurrentSettings();
            this.applySettings();
            this.showMessage('تم إعادة تعيين الإعدادات', 'success');
        }
    }

    clearAllData() {
        if (confirm('هل أنت متأكد من حذف جميع البيانات؟ لا يمكن التراجع عن هذا الإجراء.')) {
            // Clear all stored data
            localStorage.removeItem('voice-translator-recent');
            localStorage.removeItem('voice-translator-favorites');
            localStorage.removeItem('conversation-history');
            localStorage.removeItem('user-session');
            localStorage.removeItem('registered-users');
            localStorage.removeItem('saved-credentials');
            
            this.showMessage('تم حذف جميع البيانات', 'success');
        }
    }

    exportData() {
        try {
            const data = {
                settings: this.settings,
                recentTranslations: JSON.parse(localStorage.getItem('voice-translator-recent') || '[]'),
                favorites: JSON.parse(localStorage.getItem('voice-translator-favorites') || '[]'),
                conversationHistory: JSON.parse(localStorage.getItem('conversation-history') || '[]'),
                exportDate: new Date().toISOString(),
                version: '1.0.0'
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `voice-translator-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showMessage('تم تصدير البيانات بنجاح', 'success');
        } catch (error) {
            console.error('Export error:', error);
            this.showMessage('خطأ في تصدير البيانات', 'error');
        }
    }

    testSpeech() {
        const testText = 'هذا اختبار للنطق الصوتي';
        const rate = parseFloat(document.getElementById('speech-rate')?.value || '1');
        const pitch = parseFloat(document.getElementById('speech-pitch')?.value || '1');
        const lang = document.getElementById('speech-language')?.value || 'ar-SA';

        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(testText);
            utterance.lang = lang;
            utterance.rate = rate;
            utterance.pitch = pitch;
            utterance.volume = 1;
            
            window.speechSynthesis.speak(utterance);
            this.showMessage('جاري تشغيل اختبار الصوت', 'info');
        } else {
            this.showMessage('النطق الصوتي غير مدعوم في هذا المتصفح', 'error');
        }
    }

    showAppInfo() {
        const modal = document.getElementById('app-info-modal');
        if (modal) {
            // Update dynamic info
            this.updateAppInfo();
            modal.classList.add('active');
        }
    }

    updateAppInfo() {
        const browserInfo = document.getElementById('browser-info');
        const osInfo = document.getElementById('os-info');
        const memoryInfo = document.getElementById('memory-info');

        if (browserInfo) {
            browserInfo.textContent = this.getBrowserInfo();
        }

        if (osInfo) {
            osInfo.textContent = this.getOSInfo();
        }

        if (memoryInfo) {
            memoryInfo.textContent = this.getMemoryInfo();
        }
    }

    validateSettings(settings) {
        // Validate email
        if (settings.customApiKey && !this.validateEmail(settings.customApiKey)) {
            this.showMessage('مفتاح API غير صحيح', 'error');
            return false;
        }

        // Validate URL
        if (settings.customServer && !this.validateURL(settings.customServer)) {
            this.showMessage('رابط الخادم غير صحيح', 'error');
            return false;
        }

        // Validate timeout
        if (settings.requestTimeout && (settings.requestTimeout < 5 || settings.requestTimeout > 120)) {
            this.showMessage('مهلة الطلب يجب أن تكون بين 5 و 120 ثانية', 'error');
            return false;
        }

        return true;
    }

    validateInput(input) {
        const value = input.value.trim();
        const type = input.type;

        if (type === 'email' && value && !this.validateEmail(value)) {
            this.showInputError(input, 'يرجى إدخال بريد إلكتروني صحيح');
            return false;
        }

        if (type === 'url' && value && !this.validateURL(value)) {
            this.showInputError(input, 'يرجى إدخال رابط صحيح');
            return false;
        }

        if (type === 'number' && value) {
            const num = parseInt(value);
            const min = parseInt(input.min);
            const max = parseInt(input.max);
            
            if (num < min || num > max) {
                this.showInputError(input, `القيمة يجب أن تكون بين ${min} و ${max}`);
                return false;
            }
        }

        this.clearInputError(input);
        return true;
    }

    showInputError(input, message) {
        this.clearInputError(input);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'input-error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            color: var(--error-color);
            font-size: var(--font-size-xs);
            margin-top: var(--spacing-1);
        `;
        
        input.parentElement.appendChild(errorDiv);
        input.style.borderColor = 'var(--error-color)';
    }

    clearInputError(input) {
        const errorDiv = input.parentElement.querySelector('.input-error');
        if (errorDiv) {
            errorDiv.remove();
        }
        input.style.borderColor = '';
    }

    applySettings() {
        // Apply theme
        this.applyTheme(this.settings.theme);
        
        // Apply font size
        this.applyFontSize(this.settings.fontSize);
        
        // Apply other settings
        if (this.settings.autoDarkMode) {
            this.setupAutoDarkMode();
        }
    }

    applyTheme(theme) {
        document.body.className = document.body.className.replace(/theme-\w+/g, '');
        
        if (theme === 'dark') {
            document.body.classList.add('theme-dark');
        } else if (theme === 'auto') {
            this.setupAutoTheme();
        }
    }

    applyFontSize(size) {
        const sizes = {
            'small': '14px',
            'medium': '16px',
            'large': '18px'
        };
        
        document.documentElement.style.fontSize = sizes[size] || sizes.medium;
    }

    setupAutoTheme() {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
        
        const updateTheme = (e) => {
            if (e.matches) {
                document.body.classList.add('theme-dark');
            } else {
                document.body.classList.remove('theme-dark');
            }
        };
        
        updateTheme(prefersDark);
        prefersDark.addEventListener('change', updateTheme);
    }

    setupAutoDarkMode() {
        if (this.settings.autoDarkMode) {
            const now = new Date();
            const hour = now.getHours();
            
            if (hour >= 18 || hour <= 6) {
                document.body.classList.add('theme-dark');
            } else {
                document.body.classList.remove('theme-dark');
            }
        }
    }

    // Utility Methods
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validateURL(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    getBrowserInfo() {
        const ua = navigator.userAgent;
        if (ua.includes('Chrome')) return 'Google Chrome';
        if (ua.includes('Firefox')) return 'Mozilla Firefox';
        if (ua.includes('Safari')) return 'Safari';
        if (ua.includes('Edge')) return 'Microsoft Edge';
        return 'Unknown Browser';
    }

    getOSInfo() {
        const ua = navigator.userAgent;
        if (ua.includes('Windows')) return 'Windows';
        if (ua.includes('Mac')) return 'macOS';
        if (ua.includes('Linux')) return 'Linux';
        if (ua.includes('Android')) return 'Android';
        if (ua.includes('iOS')) return 'iOS';
        return 'Unknown OS';
    }

    getMemoryInfo() {
        if ('memory' in performance) {
            const memory = performance.memory;
            const used = Math.round(memory.usedJSHeapSize / 1024 / 1024);
            const total = Math.round(memory.totalJSHeapSize / 1024 / 1024);
            return `${used}MB / ${total}MB`;
        }
        return 'غير متاح';
    }

    loadSettings() {
        try {
            const stored = localStorage.getItem('app-settings');
            return stored ? JSON.parse(stored) : this.getDefaultSettings();
        } catch (error) {
            console.error('Error loading settings:', error);
            return this.getDefaultSettings();
        }
    }

    getDefaultSettings() {
        return {
            // General
            defaultLanguage: 'ar',
            theme: 'light',
            fontSize: 'medium',
            notifications: true,
            autoDarkMode: false,
            
            // Translation
            translationProvider: 'google',
            autoTranslate: false,
            showAlternatives: true,
            autoSave: true,
            textLimit: '5000',
            translationQuality: 'balanced',
            
            // Voice
            speechLanguage: 'ar-SA',
            speechRate: '1',
            speechPitch: '1',
            autoSpeechRecognition: false,
            autoSpeak: false,
            
            // Privacy
            localStorage: true,
            dataSharing: false,
            dataRetention: '30',
            
            // Advanced
            developerMode: false,
            customApiKey: '',
            customServer: '',
            requestTimeout: '30'
        };
    }

    showMessage(message, type = 'info') {
        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = `message message-${type}`;
        messageEl.innerHTML = `
            <i class="fas fa-${this.getMessageIcon(type)}"></i>
            <span>${message}</span>
        `;
        
        // Add to page
        document.body.appendChild(messageEl);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            messageEl.remove();
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

// Initialize settings manager
document.addEventListener('DOMContentLoaded', () => {
    new SettingsManager();
});

