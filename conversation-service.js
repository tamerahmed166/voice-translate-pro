// Advanced Conversation Service for Voice Translator Pro
// خدمة المحادثة المتقدمة لمترجم الصوت الذكي

import { appConfig } from './app-config.js';
import { notificationService } from './notification-service.js';

export class ConversationService {
    constructor() {
        this.currentConversation = null;
        this.isActive = false;
        this.participants = {
            participant1: { id: 'p1', name: 'المشارك الأول', language: 'ar', isActive: false },
            participant2: { id: 'p2', name: 'المشارك الثاني', language: 'en', isActive: false }
        };
        
        this.conversationMode = 'voice'; // voice, text, mixed
        this.messages = [];
        this.voiceRecognition = null;
        this.speechSynthesis = window.speechSynthesis;
        this.recordingState = { p1: false, p2: false };
        
        this.settings = this.loadSettings();
        this.init();
    }

    async init() {
        this.setupVoiceRecognition();
        this.setupEventListeners();
        this.loadConversationHistory();
    }

    setupVoiceRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.voiceRecognition = new SpeechRecognition();
            
            this.voiceRecognition.continuous = true;
            this.voiceRecognition.interimResults = true;
            this.voiceRecognition.maxAlternatives = 1;
            
            this.voiceRecognition.onstart = () => {
                console.log('Voice recognition started');
            };
            
            this.voiceRecognition.onresult = (event) => {
                this.handleVoiceRecognitionResult(event);
            };
            
            this.voiceRecognition.onerror = (event) => {
                console.error('Voice recognition error:', event.error);
                this.handleVoiceRecognitionError(event);
            };
            
            this.voiceRecognition.onend = () => {
                console.log('Voice recognition ended');
            };
        }
    }

    setupEventListeners() {
        // Listen for conversation events
        document.addEventListener('conversationStarted', (event) => {
            this.handleConversationStarted(event.detail);
        });

        document.addEventListener('conversationEnded', (event) => {
            this.handleConversationEnded(event.detail);
        });

        // Listen for translation events
        document.addEventListener('translationCompleted', (event) => {
            this.handleTranslationCompleted(event.detail);
        });

        // Listen for voice events
        document.addEventListener('voiceInput', (event) => {
            this.handleVoiceInput(event.detail);
        });
    }

    // Conversation Management
    async startConversation(participant1Lang, participant2Lang, mode = 'voice') {
        try {
            this.showLoading(true);
            
            // Set up participants
            this.participants.participant1.language = participant1Lang;
            this.participants.participant2.language = participant2Lang;
            this.conversationMode = mode;
            
            // Create new conversation
            this.currentConversation = {
                id: this.generateConversationId(),
                participants: { ...this.participants },
                mode: mode,
                startTime: Date.now(),
                messages: [],
                status: 'active'
            };
            
            this.isActive = true;
            this.messages = [];
            
            // Initialize voice recognition for both languages
            await this.initializeVoiceRecognition();
            
            // Show conversation interface
            this.showConversationInterface();
            
            // Dispatch event
            document.dispatchEvent(new CustomEvent('conversationStarted', {
                detail: {
                    conversationId: this.currentConversation.id,
                    participants: this.participants,
                    mode: mode
                }
            }));
            
            // Show notification
            notificationService.showNotification(
                'بدأت المحادثة',
                `محادثة ${this.getLanguageName(participant1Lang)} - ${this.getLanguageName(participant2Lang)}`,
                { type: 'success' }
            );
            
            this.showLoading(false);
            
        } catch (error) {
            console.error('Error starting conversation:', error);
            this.showLoading(false);
            throw error;
        }
    }

    async endConversation() {
        if (!this.currentConversation) return;
        
        try {
            // Stop voice recognition
            if (this.voiceRecognition && this.voiceRecognition.state === 'running') {
                this.voiceRecognition.stop();
            }
            
            // Update conversation end time
            this.currentConversation.endTime = Date.now();
            this.currentConversation.status = 'ended';
            this.currentConversation.duration = this.currentConversation.endTime - this.currentConversation.startTime;
            this.currentConversation.messageCount = this.messages.length;
            
            // Save conversation
            await this.saveConversation();
            
            // Reset state
            this.isActive = false;
            this.currentConversation = null;
            this.messages = [];
            this.recordingState = { p1: false, p2: false };
            
            // Show setup interface
            this.showSetupInterface();
            
            // Dispatch event
            document.dispatchEvent(new CustomEvent('conversationEnded', {
                detail: {
                    conversationId: this.currentConversation?.id,
                    duration: this.currentConversation?.duration,
                    messageCount: this.currentConversation?.messageCount
                }
            }));
            
            // Show notification
            notificationService.showNotification(
                'انتهت المحادثة',
                `مدة المحادثة: ${Math.round(this.currentConversation?.duration / 60000)} دقيقة`,
                { type: 'info' }
            );
            
        } catch (error) {
            console.error('Error ending conversation:', error);
        }
    }

    async pauseConversation() {
        if (!this.isActive) return;
        
        // Stop voice recognition
        if (this.voiceRecognition && this.voiceRecognition.state === 'running') {
            this.voiceRecognition.stop();
        }
        
        // Update UI
        this.updateConversationStatus('paused');
        
        notificationService.showNotification('تم إيقاف المحادثة مؤقتاً', '', { type: 'info' });
    }

    async resumeConversation() {
        if (!this.isActive) return;
        
        // Resume voice recognition
        await this.initializeVoiceRecognition();
        
        // Update UI
        this.updateConversationStatus('active');
        
        notificationService.showNotification('تم استئناف المحادثة', '', { type: 'success' });
    }

    // Voice Recognition
    async initializeVoiceRecognition() {
        if (!this.voiceRecognition) return;
        
        // Set language based on current speaker
        const currentSpeaker = this.getCurrentSpeaker();
        this.voiceRecognition.lang = this.getLanguageCode(currentSpeaker.language);
        
        try {
            this.voiceRecognition.start();
        } catch (error) {
            console.error('Error starting voice recognition:', error);
        }
    }

    handleVoiceRecognitionResult(event) {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript;
            } else {
                interimTranscript += transcript;
            }
        }
        
        // Update transcription display
        this.updateTranscriptionDisplay(finalTranscript, interimTranscript);
        
        // If we have final transcript, process it
        if (finalTranscript.trim()) {
            this.processVoiceInput(finalTranscript.trim());
        }
    }

    handleVoiceRecognitionError(event) {
        console.error('Voice recognition error:', event.error);
        
        let errorMessage = 'خطأ في التعرف على الصوت';
        switch (event.error) {
            case 'no-speech':
                errorMessage = 'لم يتم اكتشاف كلام';
                break;
            case 'audio-capture':
                errorMessage = 'خطأ في التقاط الصوت';
                break;
            case 'not-allowed':
                errorMessage = 'لم يتم السماح بالوصول للميكروفون';
                break;
            case 'network':
                errorMessage = 'خطأ في الشبكة';
                break;
        }
        
        notificationService.showNotification('خطأ في التعرف على الصوت', errorMessage, { type: 'error' });
    }

    // Voice Input Processing
    async processVoiceInput(text) {
        if (!text.trim()) return;
        
        const currentSpeaker = this.getCurrentSpeaker();
        const targetLanguage = this.getTargetLanguage(currentSpeaker.language);
        
        try {
            // Add message to conversation
            const message = {
                id: this.generateMessageId(),
                speaker: currentSpeaker.id,
                originalText: text,
                originalLanguage: currentSpeaker.language,
                timestamp: Date.now(),
                type: 'voice'
            };
            
            this.messages.push(message);
            this.updateMessagesDisplay();
            
            // Translate the text
            const translationResult = await appConfig.getService('translation').translate(
                text,
                currentSpeaker.language,
                targetLanguage
            );
            
            if (translationResult.success) {
                // Update message with translation
                message.translatedText = translationResult.translation;
                message.translatedLanguage = targetLanguage;
                message.confidence = translationResult.confidence;
                
                // Update display
                this.updateMessagesDisplay();
                
                // Speak the translation
                await this.speakText(translationResult.translation, targetLanguage);
                
                // Switch to other participant
                this.switchSpeaker();
                
            } else {
                throw new Error(translationResult.error);
            }
            
        } catch (error) {
            console.error('Error processing voice input:', error);
            notificationService.showNotification('خطأ في الترجمة', error.message, { type: 'error' });
        }
    }

    // Text Input Processing
    async processTextInput(text, participantId) {
        if (!text.trim()) return;
        
        const participant = this.participants[participantId];
        const targetLanguage = this.getTargetLanguage(participant.language);
        
        try {
            // Add message to conversation
            const message = {
                id: this.generateMessageId(),
                speaker: participantId,
                originalText: text,
                originalLanguage: participant.language,
                timestamp: Date.now(),
                type: 'text'
            };
            
            this.messages.push(message);
            this.updateMessagesDisplay();
            
            // Translate the text
            const translationResult = await appConfig.getService('translation').translate(
                text,
                participant.language,
                targetLanguage
            );
            
            if (translationResult.success) {
                // Update message with translation
                message.translatedText = translationResult.translation;
                message.translatedLanguage = targetLanguage;
                message.confidence = translationResult.confidence;
                
                // Update display
                this.updateMessagesDisplay();
                
                // Speak the translation if in voice or mixed mode
                if (this.conversationMode === 'voice' || this.conversationMode === 'mixed') {
                    await this.speakText(translationResult.translation, targetLanguage);
                }
                
            } else {
                throw new Error(translationResult.error);
            }
            
        } catch (error) {
            console.error('Error processing text input:', error);
            notificationService.showNotification('خطأ في الترجمة', error.message, { type: 'error' });
        }
    }

    // Speech Synthesis
    async speakText(text, language) {
        if (!this.speechSynthesis) return;
        
        return new Promise((resolve) => {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = this.getLanguageCode(language);
            utterance.rate = 0.9;
            utterance.pitch = 1;
            utterance.volume = 1;
            
            utterance.onend = () => resolve();
            utterance.onerror = (event) => {
                console.error('Speech synthesis error:', event.error);
                resolve();
            };
            
            this.speechSynthesis.speak(utterance);
        });
    }

    // UI Management
    showSetupInterface() {
        document.getElementById('conversation-setup').style.display = 'block';
        document.getElementById('conversation-interface').style.display = 'none';
        document.getElementById('conversation-history').style.display = 'none';
    }

    showConversationInterface() {
        document.getElementById('conversation-setup').style.display = 'none';
        document.getElementById('conversation-interface').style.display = 'block';
        document.getElementById('conversation-history').style.display = 'none';
        
        // Update conversation info
        this.updateConversationInfo();
    }

    showConversationHistory() {
        document.getElementById('conversation-setup').style.display = 'none';
        document.getElementById('conversation-interface').style.display = 'none';
        document.getElementById('conversation-history').style.display = 'block';
        
        this.loadConversationHistory();
    }

    updateConversationInfo() {
        const title = document.getElementById('conversation-title');
        const lang1Indicator = document.getElementById('lang1-indicator');
        const lang2Indicator = document.getElementById('lang2-indicator');
        
        if (title) {
            title.textContent = `محادثة ${this.getLanguageName(this.participants.participant1.language)} - ${this.getLanguageName(this.participants.participant2.language)}`;
        }
        
        if (lang1Indicator) {
            lang1Indicator.querySelector('span').textContent = this.getLanguageName(this.participants.participant1.language);
        }
        
        if (lang2Indicator) {
            lang2Indicator.querySelector('span').textContent = this.getLanguageName(this.participants.participant2.language);
        }
    }

    updateTranscriptionDisplay(finalText, interimText) {
        const currentSpeaker = this.getCurrentSpeaker();
        const transcriptionElement = document.getElementById(`${currentSpeaker.id}-transcription`);
        
        if (transcriptionElement) {
            if (finalText) {
                transcriptionElement.innerHTML = `
                    <div class="transcription-final">${finalText}</div>
                `;
            } else if (interimText) {
                transcriptionElement.innerHTML = `
                    <div class="transcription-interim">${interimText}</div>
                `;
            }
        }
    }

    updateMessagesDisplay() {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;
        
        // Clear existing messages
        messagesContainer.innerHTML = '';
        
        // Add messages
        this.messages.forEach(message => {
            const messageElement = this.createMessageElement(message);
            messagesContainer.appendChild(messageElement);
        });
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    createMessageElement(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.speaker === 'participant1' ? 'message-p1' : 'message-p2'}`;
        
        const participant = this.participants[message.speaker];
        const timestamp = new Date(message.timestamp).toLocaleTimeString('ar-SA', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        messageDiv.innerHTML = `
            <div class="message-header">
                <span class="message-speaker">${participant.name}</span>
                <span class="message-time">${timestamp}</span>
            </div>
            <div class="message-content">
                <div class="message-original">
                    <span class="language-badge">${this.getLanguageName(message.originalLanguage)}</span>
                    <p>${message.originalText}</p>
                </div>
                ${message.translatedText ? `
                    <div class="message-translation">
                        <span class="language-badge">${this.getLanguageName(message.translatedLanguage)}</span>
                        <p>${message.translatedText}</p>
                    </div>
                ` : `
                    <div class="message-translating">
                        <i class="fas fa-spinner fa-spin"></i>
                        <span>جاري الترجمة...</span>
                    </div>
                `}
            </div>
        `;
        
        return messageDiv;
    }

    updateConversationStatus(status) {
        const statusElement = document.getElementById('conversation-status');
        if (statusElement) {
            statusElement.textContent = status === 'active' ? 'نشط' : 'متوقف مؤقتاً';
            statusElement.className = `status-${status}`;
        }
    }

    // Conversation Mode Management
    switchConversationMode(mode) {
        this.conversationMode = mode;
        
        // Update mode buttons
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.mode === mode) {
                btn.classList.add('active');
            }
        });
        
        // Show/hide mode interfaces
        document.querySelectorAll('.conversation-mode').forEach(modeEl => {
            modeEl.classList.remove('active');
        });
        
        const activeMode = document.getElementById(`${mode}-mode`);
        if (activeMode) {
            activeMode.classList.add('active');
        }
        
        // Stop voice recognition if switching away from voice mode
        if (mode !== 'voice' && this.voiceRecognition && this.voiceRecognition.state === 'running') {
            this.voiceRecognition.stop();
        }
    }

    // Participant Management
    getCurrentSpeaker() {
        // Simple round-robin for now
        return this.messages.length % 2 === 0 ? this.participants.participant1 : this.participants.participant2;
    }

    getTargetLanguage(sourceLanguage) {
        return sourceLanguage === this.participants.participant1.language 
            ? this.participants.participant2.language 
            : this.participants.participant1.language;
    }

    switchSpeaker() {
        // This could be more sophisticated in the future
        // For now, it's handled by the round-robin in getCurrentSpeaker
    }

    // Data Management
    async saveConversation() {
        if (!this.currentConversation) return;
        
        try {
            // Save to database if user is authenticated
            if (appConfig.getService('auth').isAuthenticated()) {
                await appConfig.getService('database').saveConversation({
                    ...this.currentConversation,
                    messages: this.messages
                });
            }
            
            // Save to localStorage
            const conversations = this.getStoredConversations();
            conversations.push(this.currentConversation);
            
            // Keep only last 50 conversations
            if (conversations.length > 50) {
                conversations.splice(0, conversations.length - 50);
            }
            
            localStorage.setItem('conversations', JSON.stringify(conversations));
            
        } catch (error) {
            console.error('Error saving conversation:', error);
        }
    }

    async loadConversationHistory() {
        try {
            const conversations = this.getStoredConversations();
            const historyList = document.getElementById('history-list');
            
            if (!historyList) return;
            
            if (conversations.length === 0) {
                historyList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-history"></i>
                        <p>لا توجد محادثات سابقة</p>
                    </div>
                `;
                return;
            }
            
            historyList.innerHTML = '';
            
            conversations.reverse().forEach(conversation => {
                const conversationElement = this.createConversationHistoryElement(conversation);
                historyList.appendChild(conversationElement);
            });
            
        } catch (error) {
            console.error('Error loading conversation history:', error);
        }
    }

    createConversationHistoryElement(conversation) {
        const conversationDiv = document.createElement('div');
        conversationDiv.className = 'conversation-item';
        
        const startTime = new Date(conversation.startTime).toLocaleDateString('ar-SA');
        const duration = Math.round((conversation.endTime - conversation.startTime) / 60000);
        
        conversationDiv.innerHTML = `
            <div class="conversation-info">
                <h4>محادثة ${this.getLanguageName(conversation.participants.participant1.language)} - ${this.getLanguageName(conversation.participants.participant2.language)}</h4>
                <p>${startTime} • ${duration} دقيقة • ${conversation.messageCount} رسالة</p>
            </div>
            <div class="conversation-actions">
                <button class="btn btn-outline btn-sm" onclick="conversationService.loadConversation('${conversation.id}')">
                    <i class="fas fa-eye"></i>
                    عرض
                </button>
                <button class="btn btn-outline btn-sm" onclick="conversationService.deleteConversation('${conversation.id}')">
                    <i class="fas fa-trash"></i>
                    حذف
                </button>
            </div>
        `;
        
        return conversationDiv;
    }

    getStoredConversations() {
        try {
            return JSON.parse(localStorage.getItem('conversations') || '[]');
        } catch (error) {
            console.error('Error loading stored conversations:', error);
            return [];
        }
    }

    // Utility Methods
    generateConversationId() {
        return 'conv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateMessageId() {
        return 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getLanguageName(code) {
        const languages = {
            'ar': 'العربية', 'en': 'English', 'fr': 'Français', 'es': 'Español',
            'de': 'Deutsch', 'it': 'Italiano', 'pt': 'Português', 'ru': 'Русский',
            'zh': '中文', 'ja': '日本語', 'ko': '한국어', 'hi': 'हिन्दी',
            'tr': 'Türkçe', 'nl': 'Nederlands', 'sv': 'Svenska', 'no': 'Norsk',
            'da': 'Dansk', 'fi': 'Suomi', 'pl': 'Polski', 'cs': 'Čeština',
            'hu': 'Magyar', 'ro': 'Română', 'bg': 'Български', 'hr': 'Hrvatski',
            'sk': 'Slovenčina', 'sl': 'Slovenščina', 'et': 'Eesti', 'lv': 'Latviešu',
            'lt': 'Lietuvių', 'el': 'Ελληνικά', 'he': 'עברית', 'fa': 'فارسی',
            'ur': 'اردو', 'bn': 'বাংলা', 'ta': 'தமிழ்', 'te': 'తెలుగు',
            'ml': 'മലയാളം', 'kn': 'ಕನ್ನಡ', 'gu': 'ગુજરાતી', 'pa': 'ਪੰਜਾਬੀ',
            'mr': 'मराठी', 'ne': 'नेपाली', 'si': 'සිංහල', 'my': 'မြန်မာ',
            'th': 'ไทย', 'vi': 'Tiếng Việt', 'id': 'Bahasa Indonesia', 'ms': 'Bahasa Melayu',
            'tl': 'Filipino', 'sw': 'Kiswahili', 'am': 'አማርኛ', 'yo': 'Yorùbá',
            'ig': 'Igbo', 'ha': 'Hausa', 'zu': 'IsiZulu', 'af': 'Afrikaans',
            'sq': 'Shqip', 'mk': 'Македонски', 'sr': 'Српски', 'bs': 'Bosanski',
            'mt': 'Malti', 'is': 'Íslenska', 'ga': 'Gaeilge', 'cy': 'Cymraeg',
            'eu': 'Euskera', 'ca': 'Català', 'gl': 'Galego'
        };
        return languages[code] || code;
    }

    getLanguageCode(language) {
        // Convert language name to code if needed
        return language;
    }

    showLoading(show) {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.display = show ? 'flex' : 'none';
        }
    }

    // Settings Management
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.saveSettings();
    }

    loadSettings() {
        const defaultSettings = {
            autoSpeak: true,
            voiceSpeed: 0.9,
            voicePitch: 1,
            voiceVolume: 1,
            autoSave: true,
            maxMessages: 100
        };

        try {
            const saved = localStorage.getItem('conversation-settings');
            return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
        } catch (error) {
            console.error('Error loading conversation settings:', error);
            return defaultSettings;
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('conversation-settings', JSON.stringify(this.settings));
        } catch (error) {
            console.error('Error saving conversation settings:', error);
        }
    }

    // Event Handlers
    handleConversationStarted(event) {
        console.log('Conversation started:', event);
    }

    handleConversationEnded(event) {
        console.log('Conversation ended:', event);
    }

    handleTranslationCompleted(event) {
        console.log('Translation completed:', event);
    }

    handleVoiceInput(event) {
        console.log('Voice input:', event);
    }

    // Public Methods
    async loadConversation(conversationId) {
        // Implementation for loading a specific conversation
        console.log('Loading conversation:', conversationId);
    }

    async deleteConversation(conversationId) {
        // Implementation for deleting a conversation
        console.log('Deleting conversation:', conversationId);
    }
}

// Export conversation service instance
export const conversationService = new ConversationService();
