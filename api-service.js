// API Service for Voice Translator Pro
// خدمة API لمترجم الصوت الذكي

class APIService {
    constructor() {
        this.baseURL = 'http://localhost:3000/api';
        this.isConnected = false;
        this.retryCount = 0;
        this.maxRetries = 3;
        
        this.init();
    }
    
    async init() {
        try {
            await this.checkConnection();
            this.isConnected = true;
            console.log('✅ API Service connected successfully');
        } catch (error) {
            console.warn('⚠️ API Service connection failed, using fallback mode');
            this.isConnected = false;
        }
    }
    
    async checkConnection() {
        try {
            const response = await fetch(`${this.baseURL}/health`);
            if (response.ok) {
                const data = await response.json();
                console.log('API Health:', data);
                return true;
            }
            throw new Error('Health check failed');
        } catch (error) {
            throw new Error(`API connection failed: ${error.message}`);
        }
    }
    
    async makeRequest(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };
        
        const requestOptions = { ...defaultOptions, ...options };
        
        try {
            const response = await fetch(url, requestOptions);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`API request failed for ${endpoint}:`, error);
            
            // Retry logic
            if (this.retryCount < this.maxRetries) {
                this.retryCount++;
                console.log(`Retrying request (${this.retryCount}/${this.maxRetries})...`);
                await new Promise(resolve => setTimeout(resolve, 1000 * this.retryCount));
                return this.makeRequest(endpoint, options);
            }
            
            throw error;
        }
    }
    
    // Translation API
    async translate(text, sourceLang, targetLang, mode = 'contextual') {
        try {
            const response = await this.makeRequest('/translate', {
                method: 'POST',
                body: JSON.stringify({
                    text,
                    sourceLang,
                    targetLang,
                    mode
                })
            });
            
            return response;
        } catch (error) {
            console.error('Translation API error:', error);
            return this.fallbackTranslation(text, sourceLang, targetLang);
        }
    }
    
    // OCR API
    async processOCR(imageFile, targetLang = 'en') {
        try {
            const formData = new FormData();
            formData.append('image', imageFile);
            formData.append('targetLang', targetLang);
            
            const response = await fetch(`${this.baseURL}/ocr`, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`OCR API error: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('OCR API error:', error);
            return this.fallbackOCR(imageFile);
        }
    }
    
    // Speech Recognition API
    async speechToText(audioFile, language = 'auto') {
        try {
            const formData = new FormData();
            formData.append('audio', audioFile);
            formData.append('language', language);
            
            const response = await fetch(`${this.baseURL}/speech-to-text`, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`Speech API error: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Speech API error:', error);
            return this.fallbackSpeechRecognition(audioFile);
        }
    }
    
    // Text-to-Speech API
    async textToSpeech(text, language = 'en', voice = 'default') {
        try {
            const response = await this.makeRequest('/text-to-speech', {
                method: 'POST',
                body: JSON.stringify({
                    text,
                    language,
                    voice
                })
            });
            
            return response;
        } catch (error) {
            console.error('TTS API error:', error);
            return this.fallbackTTS(text, language);
        }
    }
    
    // Smart Translation API
    async smartTranslate(text, sourceLang, targetLang, mode, contentType, context) {
        try {
            const response = await this.makeRequest('/smart-translate', {
                method: 'POST',
                body: JSON.stringify({
                    text,
                    sourceLang,
                    targetLang,
                    mode,
                    contentType,
                    context
                })
            });
            
            return response;
        } catch (error) {
            console.error('Smart translation API error:', error);
            return this.fallbackSmartTranslation(text, sourceLang, targetLang);
        }
    }
    
    // Conversation API
    async processConversation(message, participantId, language, sessionId) {
        try {
            const response = await this.makeRequest('/conversation', {
                method: 'POST',
                body: JSON.stringify({
                    message,
                    participantId,
                    language,
                    sessionId
                })
            });
            
            return response;
        } catch (error) {
            console.error('Conversation API error:', error);
            return this.fallbackConversation(message, participantId);
        }
    }
    
    // Database operations
    async getTranslations(userId, limit = 50, offset = 0) {
        try {
            const response = await this.makeRequest(`/translations?userId=${userId}&limit=${limit}&offset=${offset}`);
            return response;
        } catch (error) {
            console.error('Get translations API error:', error);
            return this.fallbackGetTranslations();
        }
    }
    
    async saveTranslation(translation) {
        try {
            const response = await this.makeRequest('/translations', {
                method: 'POST',
                body: JSON.stringify(translation)
            });
            
            return response;
        } catch (error) {
            console.error('Save translation API error:', error);
            return this.fallbackSaveTranslation(translation);
        }
    }
    
    // Fallback methods (when API is not available)
    
    fallbackTranslation(text, sourceLang, targetLang) {
        console.log('Using fallback translation');
        
        // Simple mock translation
        const mockTranslations = {
            'ar-en': 'Hello, how are you?',
            'en-ar': 'مرحبا، كيف حالك؟',
            'ar-fr': 'Bonjour, comment allez-vous?',
            'fr-ar': 'مرحبا، كيف حالك؟'
        };
        
        const key = `${sourceLang}-${targetLang}`;
        const translatedText = mockTranslations[key] || `[Translated: ${text}]`;
        
        return {
            success: true,
            originalText: text,
            translatedText: translatedText,
            sourceLanguage: sourceLang,
            targetLanguage: targetLang,
            confidence: 0.8,
            timestamp: new Date().toISOString(),
            fallback: true
        };
    }
    
    fallbackOCR(imageFile) {
        console.log('Using fallback OCR');
        
        return {
            success: true,
            extractedText: 'Sample extracted text from image',
            translatedText: 'نص عينة مستخرج من الصورة',
            confidence: 0.7,
            language: 'ar',
            timestamp: new Date().toISOString(),
            fallback: true
        };
    }
    
    fallbackSpeechRecognition(audioFile) {
        console.log('Using fallback speech recognition');
        
        return {
            success: true,
            text: 'مرحبا، كيف حالك؟',
            confidence: 0.6,
            language: 'ar',
            timestamp: new Date().toISOString(),
            fallback: true
        };
    }
    
    fallbackTTS(text, language) {
        console.log('Using fallback TTS');
        
        return {
            success: true,
            audioUrl: null, // Browser TTS will be used
            duration: text.length * 0.1,
            language: language,
            voice: 'default',
            timestamp: new Date().toISOString(),
            fallback: true
        };
    }
    
    fallbackSmartTranslation(text, sourceLang, targetLang) {
        console.log('Using fallback smart translation');
        
        return {
            success: true,
            originalText: text,
            translatedText: `[Smart Translation: ${text}]`,
            alternatives: [
                `[Alternative 1: ${text}]`,
                `[Alternative 2: ${text}]`
            ],
            confidence: 0.8,
            mode: 'contextual',
            contentType: 'general',
            insights: {
                complexity: 'medium',
                sentiment: 'neutral',
                domain: 'general'
            },
            timestamp: new Date().toISOString(),
            fallback: true
        };
    }
    
    fallbackConversation(message, participantId) {
        console.log('Using fallback conversation');
        
        return {
            success: true,
            message: message,
            translation: `[Translated: ${message}]`,
            participantId: participantId,
            sessionId: Date.now().toString(),
            timestamp: new Date().toISOString(),
            fallback: true
        };
    }
    
    fallbackGetTranslations() {
        console.log('Using fallback get translations');
        
        return {
            success: true,
            translations: [],
            total: 0,
            limit: 50,
            offset: 0,
            fallback: true
        };
    }
    
    fallbackSaveTranslation(translation) {
        console.log('Using fallback save translation');
        
        // Save to localStorage as fallback
        try {
            const saved = JSON.parse(localStorage.getItem('fallback-translations') || '[]');
            const newTranslation = {
                id: Date.now().toString(),
                ...translation,
                timestamp: new Date().toISOString()
            };
            saved.push(newTranslation);
            localStorage.setItem('fallback-translations', JSON.stringify(saved));
            
            return {
                success: true,
                translation: newTranslation,
                fallback: true
            };
        } catch (error) {
            console.error('Fallback save failed:', error);
            return {
                success: false,
                error: 'Failed to save translation',
                fallback: true
            };
        }
    }
    
    // Utility methods
    getConnectionStatus() {
        return this.isConnected;
    }
    
    async reconnect() {
        this.retryCount = 0;
        await this.init();
    }
    
    getBaseURL() {
        return this.baseURL;
    }
}

// Create global instance
window.apiService = new APIService();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIService;
}

