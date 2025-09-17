// Application Configuration for Voice Translator Pro
// تكوين التطبيق لمترجم الصوت الذكي

import { authService } from './auth-service.js';
import { databaseService } from './firebase-config.js';
import { notificationService } from './notification-service.js';
import { ocrService } from './ocr-service.js';
import { translationAPIsService } from './translation-apis.js';
import { performanceOptimizer } from './performance-optimizer.js';
import { conversationService } from './conversation-service.js';
import { groupConversationService } from './group-conversation-service.js';

export class AppConfig {
    constructor() {
        this.services = {
            auth: authService,
            database: databaseService,
            notifications: notificationService,
            ocr: ocrService,
            translation: translationAPIsService,
            performance: performanceOptimizer,
            conversation: conversationService,
            groupConversation: groupConversationService
        };
        
        this.settings = this.loadSettings();
        this.isInitialized = false;
        
        this.init();
    }

    async init() {
        try {
            await this.initializeServices();
            this.setupEventListeners();
            this.setupServiceIntegration();
            this.isInitialized = true;
            
            console.log('App configuration initialized successfully');
        } catch (error) {
            console.error('Failed to initialize app configuration:', error);
        }
    }

    async initializeServices() {
        // Initialize services in order
        const initOrder = [
            'performance',
            'auth',
            'database',
            'notifications',
            'ocr',
            'translation',
            'conversation',
            'groupConversation'
        ];

        for (const serviceName of initOrder) {
            const service = this.services[serviceName];
            if (service && service.init) {
                try {
                    await service.init();
                    console.log(`${serviceName} service initialized`);
                } catch (error) {
                    console.warn(`Failed to initialize ${serviceName} service:`, error);
                }
            }
        }
    }

    setupEventListeners() {
        // Global event listeners for service integration
        document.addEventListener('userSignedIn', (event) => {
            this.handleUserSignedIn(event.detail);
        });

        document.addEventListener('userSignedOut', (event) => {
            this.handleUserSignedOut(event.detail);
        });

        document.addEventListener('translationCompleted', (event) => {
            this.handleTranslationCompleted(event.detail);
        });

        document.addEventListener('ocrCompleted', (event) => {
            this.handleOCRCompleted(event.detail);
        });

        // Performance monitoring
        document.addEventListener('performanceWarning', (event) => {
            this.handlePerformanceWarning(event.detail);
        });
    }

    setupServiceIntegration() {
        // Integrate services with each other
        this.integrateAuthWithDatabase();
        this.integrateTranslationWithNotifications();
        this.integrateOCRWithTranslation();
        this.integratePerformanceWithAllServices();
    }

    integrateAuthWithDatabase() {
        // When user signs in, load their data
        authService.addAuthStateListener(async (user) => {
            if (user) {
                try {
                    // Load user settings
                    const settingsResult = await databaseService.getUserSettings(user.uid);
                    if (settingsResult.success) {
                        this.updateSettings(settingsResult.data);
                    }

                    // Load user translations
                    const translationsResult = await databaseService.getUserTranslations(user.uid);
                    if (translationsResult.success) {
                        this.cacheUserTranslations(translationsResult.data);
                    }

                    // Load user favorites
                    const favoritesResult = await databaseService.getUserFavorites(user.uid);
                    if (favoritesResult.success) {
                        this.cacheUserFavorites(favoritesResult.data);
                    }

                } catch (error) {
                    console.error('Error loading user data:', error);
                }
            }
        });
    }

    integrateTranslationWithNotifications() {
        // Show notifications for translation events
        document.addEventListener('translationCompleted', (event) => {
            const { sourceLang, targetLang, textLength } = event.detail;
            
            if (this.settings.notifications.translationCompleted) {
                notificationService.showNotification(
                    'تمت الترجمة بنجاح',
                    `تم ترجمة ${textLength} حرف من ${this.getLanguageName(sourceLang)} إلى ${this.getLanguageName(targetLang)}`,
                    { type: 'success' }
                );
            }
        });

        document.addEventListener('translationError', (event) => {
            if (this.settings.notifications.translationError) {
                notificationService.showNotification(
                    'خطأ في الترجمة',
                    event.detail.error || 'حدث خطأ غير متوقع',
                    { type: 'error' }
                );
            }
        });
    }

    integrateOCRWithTranslation() {
        // When OCR completes, automatically translate if enabled
        document.addEventListener('ocrCompleted', async (event) => {
            const { text, confidence } = event.detail;
            
            if (this.settings.ocr.autoTranslate && confidence > 0.7) {
                try {
                    const translation = await translationAPIsService.translate(
                        text,
                        'auto',
                        this.settings.translation.targetLanguage || 'ar'
                    );
                    
                    // Dispatch translation completed event
                    document.dispatchEvent(new CustomEvent('translationCompleted', {
                        detail: {
                            ...translation,
                            sourceLang: 'auto',
                            targetLang: this.settings.translation.targetLanguage || 'ar',
                            textLength: text.length
                        }
                    }));
                } catch (error) {
                    console.error('Auto-translation failed:', error);
                }
            }
        });
    }

    integratePerformanceWithAllServices() {
        // Monitor performance of all services
        const services = ['auth', 'database', 'notifications', 'ocr', 'translation'];
        
        services.forEach(serviceName => {
            const service = this.services[serviceName];
            if (service) {
                // Add performance monitoring to service methods
                this.addPerformanceMonitoring(service, serviceName);
            }
        });
    }

    addPerformanceMonitoring(service, serviceName) {
        // Wrap service methods with performance monitoring
        const originalMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(service));
        
        originalMethods.forEach(methodName => {
            if (typeof service[methodName] === 'function' && methodName !== 'constructor') {
                const originalMethod = service[methodName];
                
                service[methodName] = async function(...args) {
                    const startTime = performance.now();
                    
                    try {
                        const result = await originalMethod.apply(this, args);
                        const endTime = performance.now();
                        
                        // Log performance metric
                        performanceOptimizer.logPerformanceMetric(
                            `${serviceName}_${methodName}_time`,
                            endTime - startTime
                        );
                        
                        return result;
                    } catch (error) {
                        const endTime = performance.now();
                        
                        // Log error performance metric
                        performanceOptimizer.logPerformanceMetric(
                            `${serviceName}_${methodName}_error_time`,
                            endTime - startTime
                        );
                        
                        throw error;
                    }
                };
            }
        });
    }

    // Event Handlers
    async handleUserSignedIn(userData) {
        try {
            // Migrate anonymous data
            await authService.migrateAnonymousData();
            
            // Update user preferences
            await this.updateUserPreferences(userData);
            
            // Show welcome notification
            notificationService.showNotification(
                'مرحباً بك!',
                `مرحباً ${userData.displayName || 'مستخدم'}، تم تسجيل الدخول بنجاح`,
                { type: 'success' }
            );
            
        } catch (error) {
            console.error('Error handling user sign in:', error);
        }
    }

    async handleUserSignedOut() {
        try {
            // Clear cached data
            this.clearCachedData();
            
            // Reset settings to defaults
            this.resetToDefaultSettings();
            
            // Show goodbye notification
            notificationService.showNotification(
                'وداعاً!',
                'تم تسجيل الخروج بنجاح، شكراً لاستخدامك التطبيق',
                { type: 'info' }
            );
            
        } catch (error) {
            console.error('Error handling user sign out:', error);
        }
    }

    async handleTranslationCompleted(translationData) {
        try {
            // Save translation to database
            if (authService.isAuthenticated()) {
                await databaseService.saveTranslation({
                    ...translationData,
                    timestamp: Date.now()
                });
            }
            
            // Update translation statistics
            this.updateTranslationStats(translationData);
            
        } catch (error) {
            console.error('Error handling translation completion:', error);
        }
    }

    async handleOCRCompleted(ocrData) {
        try {
            // Save OCR result if enabled
            if (this.settings.ocr.saveResults && authService.isAuthenticated()) {
                await databaseService.saveTranslation({
                    type: 'ocr',
                    ...ocrData,
                    timestamp: Date.now()
                });
            }
            
        } catch (error) {
            console.error('Error handling OCR completion:', error);
        }
    }

    handlePerformanceWarning(warningData) {
        // Show performance warning notification
        notificationService.showNotification(
            'تحذير الأداء',
            warningData.message || 'تم اكتشاف مشكلة في الأداء',
            { type: 'warning' }
        );
    }

    // Utility Methods
    async updateUserPreferences(userData) {
        const preferences = {
            language: userData.language || 'ar',
            theme: userData.theme || 'light',
            notifications: userData.notifications || true,
            autoSave: userData.autoSave || true
        };
        
        await databaseService.saveUserSettings(userData.uid, preferences);
        this.updateSettings(preferences);
    }

    updateTranslationStats(translationData) {
        const stats = this.getTranslationStats();
        
        stats.totalTranslations++;
        stats.totalCharacters += translationData.textLength || 0;
        stats.languagePairs[`${translationData.sourceLang}-${translationData.targetLang}`] = 
            (stats.languagePairs[`${translationData.sourceLang}-${translationData.targetLang}`] || 0) + 1;
        
        this.saveTranslationStats(stats);
    }

    getTranslationStats() {
        try {
            return JSON.parse(localStorage.getItem('translation-stats') || '{}');
        } catch (error) {
            return {
                totalTranslations: 0,
                totalCharacters: 0,
                languagePairs: {}
            };
        }
    }

    saveTranslationStats(stats) {
        try {
            localStorage.setItem('translation-stats', JSON.stringify(stats));
        } catch (error) {
            console.error('Error saving translation stats:', error);
        }
    }

    cacheUserTranslations(translations) {
        // Cache user translations for offline access
        performanceOptimizer.setCache('user-translations', translations, 300000); // 5 minutes
    }

    cacheUserFavorites(favorites) {
        // Cache user favorites for offline access
        performanceOptimizer.setCache('user-favorites', favorites, 300000); // 5 minutes
    }

    clearCachedData() {
        // Clear all cached data
        performanceOptimizer.cache.clear();
        localStorage.removeItem('translation-stats');
    }

    resetToDefaultSettings() {
        // Reset to default settings
        this.settings = this.getDefaultSettings();
        this.saveSettings();
    }

    getDefaultSettings() {
        return {
            language: 'ar',
            theme: 'light',
            notifications: {
                enabled: true,
                translationCompleted: true,
                translationError: true,
                favoriteAdded: true,
                conversationStarted: true,
                conversationEnded: true
            },
            translation: {
                primaryAPI: 'google',
                targetLanguage: 'ar',
                enableFallback: true,
                autoDetectLanguage: true
            },
            ocr: {
                preferredLanguages: ['ara', 'eng'],
                enhanceContrast: true,
                removeNoise: true,
                autoTranslate: false,
                saveResults: true
            },
            performance: {
                enableCaching: true,
                enableCompression: true,
                enableLazyLoading: true,
                enableMemoryManagement: true
            }
        };
    }

    getLanguageName(code) {
        const languages = {
            'ar': 'العربية',
            'en': 'English',
            'fr': 'Français',
            'es': 'Español',
            'de': 'Deutsch',
            'it': 'Italiano',
            'pt': 'Português',
            'ru': 'Русский',
            'zh': '中文',
            'ja': '日本語',
            'ko': '한국어',
            'hi': 'हिन्दी',
            'tr': 'Türkçe',
            'nl': 'Nederlands',
            'sv': 'Svenska',
            'no': 'Norsk',
            'da': 'Dansk',
            'fi': 'Suomi',
            'pl': 'Polski',
            'cs': 'Čeština',
            'hu': 'Magyar',
            'ro': 'Română',
            'bg': 'Български',
            'hr': 'Hrvatski',
            'sk': 'Slovenčina',
            'sl': 'Slovenščina',
            'est': 'Eesti',
            'lv': 'Latviešu',
            'lt': 'Lietuvių',
            'el': 'Ελληνικά',
            'he': 'עברית',
            'fa': 'فارسی',
            'ur': 'اردو',
            'bn': 'বাংলা',
            'ta': 'தமிழ்',
            'te': 'తెలుగు',
            'ml': 'മലയാളം',
            'kn': 'ಕನ್ನಡ',
            'gu': 'ગુજરાતી',
            'pa': 'ਪੰਜਾਬੀ',
            'mr': 'मराठी',
            'ne': 'नेपाली',
            'si': 'සිංහල',
            'my': 'မြန်မာ',
            'th': 'ไทย',
            'vi': 'Tiếng Việt',
            'id': 'Bahasa Indonesia',
            'ms': 'Bahasa Melayu',
            'tl': 'Filipino',
            'sw': 'Kiswahili',
            'am': 'አማርኛ',
            'yo': 'Yorùbá',
            'ig': 'Igbo',
            'ha': 'Hausa',
            'zu': 'IsiZulu',
            'af': 'Afrikaans',
            'sq': 'Shqip',
            'mk': 'Македонски',
            'sr': 'Српски',
            'bs': 'Bosanski',
            'mt': 'Malti',
            'is': 'Íslenska',
            'ga': 'Gaeilge',
            'cy': 'Cymraeg',
            'eu': 'Euskera',
            'ca': 'Català',
            'gl': 'Galego'
        };
        return languages[code] || code;
    }

    // Settings Management
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.saveSettings();
        
        // Update service settings
        this.updateServiceSettings();
    }

    updateServiceSettings() {
        // Update notification settings
        if (this.settings.notifications) {
            notificationService.updateSettings(this.settings.notifications);
        }
        
        // Update OCR settings
        if (this.settings.ocr) {
            ocrService.updateSettings(this.settings.ocr);
        }
        
        // Update translation settings
        if (this.settings.translation) {
            translationAPIsService.updateSettings(this.settings.translation);
        }
        
        // Update performance settings
        if (this.settings.performance) {
            performanceOptimizer.updateSettings(this.settings.performance);
        }
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('app-settings');
            return saved ? { ...this.getDefaultSettings(), ...JSON.parse(saved) } : this.getDefaultSettings();
        } catch (error) {
            console.error('Error loading app settings:', error);
            return this.getDefaultSettings();
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('app-settings', JSON.stringify(this.settings));
        } catch (error) {
            console.error('Error saving app settings:', error);
        }
    }

    // Service Access
    getService(serviceName) {
        return this.services[serviceName];
    }

    isServiceAvailable(serviceName) {
        const service = this.services[serviceName];
        return service && service.isInitialized !== false;
    }

    // Health Check
    async healthCheck() {
        const health = {
            app: this.isInitialized,
            services: {}
        };
        
        for (const [name, service] of Object.entries(this.services)) {
            health.services[name] = {
                available: !!service,
                initialized: service.isInitialized !== false,
                status: service.isInitialized ? 'healthy' : 'unhealthy'
            };
        }
        
        return health;
    }

    // Cleanup
    async cleanup() {
        try {
            // Cleanup all services
            for (const [name, service] of Object.entries(this.services)) {
                if (service.cleanup) {
                    await service.cleanup();
                }
            }
            
            // Clear caches
            this.clearCachedData();
            
            console.log('App configuration cleaned up');
        } catch (error) {
            console.error('Error during cleanup:', error);
        }
    }
}

// Export app configuration instance
export const appConfig = new AppConfig();
