// Enhanced Translation APIs Service for Voice Translator Pro
// خدمة APIs الترجمة المحسنة لمترجم الصوت الذكي

import { notificationService } from './notification-service.js';
import { authService } from './auth-service.js';

export class TranslationAPIsService {
    constructor() {
        this.apis = {
            google: new GoogleTranslateAPI(),
            microsoft: new MicrosoftTranslateAPI(),
            deepl: new DeepLTranslateAPI(),
            amazon: new AmazonTranslateAPI(),
            libretranslate: new LibreTranslateAPI(),
            mymemory: new MyMemoryTranslateAPI()
        };
        
        this.settings = this.loadSettings();
        this.usageStats = this.loadUsageStats();
        this.fallbackChain = ['google', 'microsoft', 'deepl', 'libretranslate', 'mymemory'];
        
        this.init();
    }

    async init() {
        await this.initializeAPIs();
        this.setupEventListeners();
    }

    async initializeAPIs() {
        // Initialize each API with their configurations
        for (const [name, api] of Object.entries(this.apis)) {
            try {
                await api.initialize(this.settings[name] || {});
            } catch (error) {
                console.warn(`Failed to initialize ${name} API:`, error);
            }
        }
    }

    setupEventListeners() {
        // Listen for translation requests
        document.addEventListener('translationRequest', (event) => {
            this.handleTranslationRequest(event.detail);
        });
    }

    async translate(text, sourceLang, targetLang, options = {}) {
        if (!text || !text.trim()) {
            throw new Error('Text is required for translation');
        }

        const translationRequest = {
            text: text.trim(),
            sourceLang,
            targetLang,
            options,
            timestamp: Date.now(),
            userId: authService.getCurrentUser()?.uid || 'anonymous'
        };

        try {
            // Try primary API first
            const primaryAPI = this.settings.primaryAPI || 'google';
            let result = await this.tryAPI(primaryAPI, translationRequest);

            // If primary API fails, try fallback chain
            if (!result.success && this.settings.enableFallback) {
                result = await this.tryFallbackChain(translationRequest);
            }

            if (result.success) {
                // Log successful translation
                await this.logTranslationEvent('translation_success', {
                    api: result.api,
                    textLength: text.length,
                    sourceLang,
                    targetLang,
                    confidence: result.confidence
                });

                // Dispatch success event
                document.dispatchEvent(new CustomEvent('translationCompleted', {
                    detail: {
                        ...result,
                        sourceLang,
                        targetLang,
                        textLength: text.length
                    }
                }));

                return result;
            } else {
                throw new Error(result.error || 'Translation failed');
            }

        } catch (error) {
            // Log failed translation
            await this.logTranslationEvent('translation_error', {
                error: error.message,
                textLength: text.length,
                sourceLang,
                targetLang
            });

            // Dispatch error event
            document.dispatchEvent(new CustomEvent('translationError', {
                detail: {
                    error: error.message,
                    sourceLang,
                    targetLang
                }
            }));

            throw error;
        }
    }

    async tryAPI(apiName, request) {
        const api = this.apis[apiName];
        if (!api || !api.isAvailable()) {
            return { success: false, error: `API ${apiName} not available` };
        }

        try {
            const result = await api.translate(request.text, request.sourceLang, request.targetLang, request.options);
            return {
                success: true,
                translation: result.translation,
                confidence: result.confidence || 0,
                api: apiName,
                detectedLanguage: result.detectedLanguage,
                alternatives: result.alternatives || []
            };
        } catch (error) {
            return { success: false, error: error.message, api: apiName };
        }
    }

    async tryFallbackChain(request) {
        for (const apiName of this.fallbackChain) {
            if (apiName === this.settings.primaryAPI) continue; // Skip primary API
            
            const result = await this.tryAPI(apiName, request);
            if (result.success) {
                return result;
            }
        }
        
        return { success: false, error: 'All translation APIs failed' };
    }

    async getMultipleTranslations(text, sourceLang, targetLang, options = {}) {
        const translations = [];
        const promises = [];

        // Get translations from multiple APIs in parallel
        for (const [apiName, api] of Object.entries(this.apis)) {
            if (api.isAvailable()) {
                promises.push(
                    this.tryAPI(apiName, { text, sourceLang, targetLang, options })
                        .then(result => ({ api: apiName, ...result }))
                        .catch(error => ({ api: apiName, success: false, error: error.message }))
                );
            }
        }

        const results = await Promise.all(promises);
        
        // Filter successful translations
        results.forEach(result => {
            if (result.success) {
                translations.push({
                    api: result.api,
                    translation: result.translation,
                    confidence: result.confidence,
                    detectedLanguage: result.detectedLanguage
                });
            }
        });

        return translations;
    }

    async detectLanguage(text) {
        const detectionPromises = [];

        // Try language detection from multiple APIs
        for (const [apiName, api] of Object.entries(this.apis)) {
            if (api.isAvailable() && api.detectLanguage) {
                detectionPromises.push(
                    api.detectLanguage(text)
                        .then(result => ({ api: apiName, ...result }))
                        .catch(error => ({ api: apiName, success: false, error: error.message }))
                );
            }
        }

        const results = await Promise.all(detectionPromises);
        const successfulDetections = results.filter(r => r.success);

        if (successfulDetections.length === 0) {
            throw new Error('Language detection failed');
        }

        // Return the detection with highest confidence
        return successfulDetections.reduce((best, current) => 
            current.confidence > best.confidence ? current : best
        );
    }

    // API Classes
    class GoogleTranslateAPI {
        constructor() {
            this.name = 'google';
            this.baseURL = 'https://translate.googleapis.com/translate_a/single';
            this.isAvailableFlag = true;
        }

        async initialize(config) {
            this.apiKey = config.apiKey;
            this.isAvailableFlag = !!this.apiKey || true; // Google's free API doesn't require key
        }

        isAvailable() {
            return this.isAvailableFlag;
        }

        async translate(text, sourceLang, targetLang, options = {}) {
            const params = new URLSearchParams({
                client: 'gtx',
                sl: sourceLang === 'auto' ? '' : sourceLang,
                tl: targetLang,
                dt: 't',
                q: text
            });

            const response = await fetch(`${this.baseURL}?${params}`);
            
            if (!response.ok) {
                throw new Error(`Google Translate API error: ${response.status}`);
            }

            const data = await response.json();
            
            return {
                translation: data[0][0][0],
                confidence: 0.9, // Google doesn't provide confidence scores
                detectedLanguage: data[2] || sourceLang
            };
        }

        async detectLanguage(text) {
            const params = new URLSearchParams({
                client: 'gtx',
                sl: 'auto',
                tl: 'en',
                dt: 't',
                q: text
            });

            const response = await fetch(`${this.baseURL}?${params}`);
            const data = await response.json();
            
            return {
                language: data[2] || 'unknown',
                confidence: 0.8
            };
        }
    }

    class MicrosoftTranslateAPI {
        constructor() {
            this.name = 'microsoft';
            this.baseURL = 'https://api.cognitive.microsofttranslator.com/translate';
            this.isAvailableFlag = false;
        }

        async initialize(config) {
            this.apiKey = config.apiKey;
            this.region = config.region;
            this.isAvailableFlag = !!this.apiKey;
        }

        isAvailable() {
            return this.isAvailableFlag;
        }

        async translate(text, sourceLang, targetLang, options = {}) {
            const params = new URLSearchParams({
                'api-version': '3.0',
                from: sourceLang === 'auto' ? '' : sourceLang,
                to: targetLang
            });

            const response = await fetch(`${this.baseURL}?${params}`, {
                method: 'POST',
                headers: {
                    'Ocp-Apim-Subscription-Key': this.apiKey,
                    'Ocp-Apim-Subscription-Region': this.region,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify([{ text }])
            });

            if (!response.ok) {
                throw new Error(`Microsoft Translate API error: ${response.status}`);
            }

            const data = await response.json();
            
            return {
                translation: data[0].translations[0].text,
                confidence: data[0].translations[0].confidence || 0.8,
                detectedLanguage: data[0].detectedLanguage?.language || sourceLang
            };
        }

        async detectLanguage(text) {
            const response = await fetch('https://api.cognitive.microsofttranslator.com/detect?api-version=3.0', {
                method: 'POST',
                headers: {
                    'Ocp-Apim-Subscription-Key': this.apiKey,
                    'Ocp-Apim-Subscription-Region': this.region,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify([{ text }])
            });

            const data = await response.json();
            
            return {
                language: data[0].language,
                confidence: data[0].score
            };
        }
    }

    class DeepLTranslateAPI {
        constructor() {
            this.name = 'deepl';
            this.baseURL = 'https://api-free.deepl.com/v2/translate';
            this.isAvailableFlag = false;
        }

        async initialize(config) {
            this.apiKey = config.apiKey;
            this.isAvailableFlag = !!this.apiKey;
        }

        isAvailable() {
            return this.isAvailableFlag;
        }

        async translate(text, sourceLang, targetLang, options = {}) {
            const params = new URLSearchParams({
                auth_key: this.apiKey,
                text: text,
                source_lang: sourceLang === 'auto' ? '' : sourceLang.toUpperCase(),
                target_lang: targetLang.toUpperCase()
            });

            const response = await fetch(this.baseURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: params
            });

            if (!response.ok) {
                throw new Error(`DeepL API error: ${response.status}`);
            }

            const data = await response.json();
            
            return {
                translation: data.translations[0].text,
                confidence: 0.95, // DeepL is known for high quality
                detectedLanguage: data.translations[0].detected_source_language?.toLowerCase() || sourceLang
            };
        }
    }

    class AmazonTranslateAPI {
        constructor() {
            this.name = 'amazon';
            this.baseURL = 'https://translate.us-east-1.amazonaws.com/';
            this.isAvailableFlag = false;
        }

        async initialize(config) {
            this.accessKeyId = config.accessKeyId;
            this.secretAccessKey = config.secretAccessKey;
            this.region = config.region || 'us-east-1';
            this.isAvailableFlag = !!(this.accessKeyId && this.secretAccessKey);
        }

        isAvailable() {
            return this.isAvailableFlag;
        }

        async translate(text, sourceLang, targetLang, options = {}) {
            // This would require AWS SDK implementation
            // For now, return a placeholder
            throw new Error('Amazon Translate API not implemented yet');
        }
    }

    class LibreTranslateAPI {
        constructor() {
            this.name = 'libretranslate';
            this.baseURL = 'https://libretranslate.de/translate';
            this.isAvailableFlag = true;
        }

        async initialize(config) {
            this.apiKey = config.apiKey;
            this.isAvailableFlag = true; // LibreTranslate is generally available
        }

        isAvailable() {
            return this.isAvailableFlag;
        }

        async translate(text, sourceLang, targetLang, options = {}) {
            const body = {
                q: text,
                source: sourceLang === 'auto' ? 'auto' : sourceLang,
                target: targetLang,
                format: 'text'
            };

            if (this.apiKey) {
                body.api_key = this.apiKey;
            }

            const response = await fetch(this.baseURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                throw new Error(`LibreTranslate API error: ${response.status}`);
            }

            const data = await response.json();
            
            return {
                translation: data.translatedText,
                confidence: 0.7,
                detectedLanguage: data.detectedLanguage || sourceLang
            };
        }
    }

    class MyMemoryTranslateAPI {
        constructor() {
            this.name = 'mymemory';
            this.baseURL = 'https://api.mymemory.translated.net/get';
            this.isAvailableFlag = true;
        }

        async initialize(config) {
            this.apiKey = config.apiKey;
            this.isAvailableFlag = true; // MyMemory is generally available
        }

        isAvailable() {
            return this.isAvailableFlag;
        }

        async translate(text, sourceLang, targetLang, options = {}) {
            const params = new URLSearchParams({
                q: text,
                langpair: `${sourceLang}|${targetLang}`
            });

            if (this.apiKey) {
                params.append('key', this.apiKey);
            }

            const response = await fetch(`${this.baseURL}?${params}`);
            
            if (!response.ok) {
                throw new Error(`MyMemory API error: ${response.status}`);
            }

            const data = await response.json();
            
            return {
                translation: data.responseData.translatedText,
                confidence: data.responseData.match || 0.6,
                detectedLanguage: sourceLang
            };
        }
    }

    // Settings Management
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.saveSettings();
        this.initializeAPIs(); // Reinitialize with new settings
    }

    loadSettings() {
        const defaultSettings = {
            primaryAPI: 'google',
            enableFallback: true,
            google: { apiKey: null },
            microsoft: { apiKey: null, region: null },
            deepl: { apiKey: null },
            amazon: { accessKeyId: null, secretAccessKey: null, region: 'us-east-1' },
            libretranslate: { apiKey: null },
            mymemory: { apiKey: null }
        };

        try {
            const saved = localStorage.getItem('translation-api-settings');
            return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
        } catch (error) {
            console.error('Error loading translation API settings:', error);
            return defaultSettings;
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('translation-api-settings', JSON.stringify(this.settings));
        } catch (error) {
            console.error('Error saving translation API settings:', error);
        }
    }

    loadUsageStats() {
        try {
            const saved = localStorage.getItem('translation-usage-stats');
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            console.error('Error loading usage stats:', error);
            return {};
        }
    }

    saveUsageStats() {
        try {
            localStorage.setItem('translation-usage-stats', JSON.stringify(this.usageStats));
        } catch (error) {
            console.error('Error saving usage stats:', error);
        }
    }

    // Analytics
    async logTranslationEvent(eventType, data = {}) {
        try {
            // Update usage stats
            if (!this.usageStats[eventType]) {
                this.usageStats[eventType] = 0;
            }
            this.usageStats[eventType]++;

            this.saveUsageStats();

            // Log to analytics service
            await authService.logAuthEvent('translation_api_event', {
                type: eventType,
                ...data
            });
        } catch (error) {
            console.error('Error logging translation event:', error);
        }
    }

    // Utility Methods
    getAvailableAPIs() {
        return Object.entries(this.apis)
            .filter(([name, api]) => api.isAvailable())
            .map(([name, api]) => ({ name, displayName: this.getAPIDisplayName(name) }));
    }

    getAPIDisplayName(apiName) {
        const names = {
            'google': 'Google Translate',
            'microsoft': 'Microsoft Translator',
            'deepl': 'DeepL',
            'amazon': 'Amazon Translate',
            'libretranslate': 'LibreTranslate',
            'mymemory': 'MyMemory'
        };
        return names[apiName] || apiName;
    }

    getUsageStats() {
        return this.usageStats;
    }

    async handleTranslationRequest(request) {
        try {
            const result = await this.translate(
                request.text,
                request.sourceLang,
                request.targetLang,
                request.options
            );
            
            // Dispatch result event
            document.dispatchEvent(new CustomEvent('translationResult', {
                detail: result
            }));
        } catch (error) {
            // Dispatch error event
            document.dispatchEvent(new CustomEvent('translationError', {
                detail: { error: error.message }
            }));
        }
    }

    // Test Methods
    async testAPI(apiName, text = 'Hello, world!') {
        const api = this.apis[apiName];
        if (!api) {
            throw new Error(`API ${apiName} not found`);
        }

        if (!api.isAvailable()) {
            throw new Error(`API ${apiName} not available`);
        }

        try {
            const result = await api.translate(text, 'en', 'ar');
            console.log(`${apiName} test result:`, result);
            return result;
        } catch (error) {
            console.error(`${apiName} test error:`, error);
            throw error;
        }
    }

    async testAllAPIs(text = 'Hello, world!') {
        const results = {};
        
        for (const [apiName, api] of Object.entries(this.apis)) {
            if (api.isAvailable()) {
                try {
                    results[apiName] = await this.testAPI(apiName, text);
                } catch (error) {
                    results[apiName] = { error: error.message };
                }
            } else {
                results[apiName] = { error: 'Not available' };
            }
        }
        
        return results;
    }
}

// Export translation APIs service instance
export const translationAPIsService = new TranslationAPIsService();
