// Enhanced Conversation Script for Voice Translator Pro
// كود المحادثة المحسن لمترجم الصوت الذكي

import { conversationService } from './conversation-service.js';
import { appConfig } from './app-config.js';

class ConversationManager {
    constructor() {
        this.conversationService = conversationService;
        this.appConfig = appConfig;
        this.currentMode = 'voice';
        this.isInitialized = false;
        
        this.init();
    }

    async init() {
        try {
            // Wait for app config to be ready
            await this.waitForAppConfig();
            
        this.setupEventListeners();
            this.setupUI();
        this.loadConversationHistory();
            
            this.isInitialized = true;
            console.log('Conversation manager initialized successfully');
        } catch (error) {
            console.error('Failed to initialize conversation manager:', error);
        }
    }

    async waitForAppConfig() {
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds max wait
        
        while (!this.appConfig.isInitialized && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!this.appConfig.isInitialized) {
            throw new Error('App config not initialized');
        }
    }

    setupEventListeners() {
        // Start conversation
        const startBtn = document.getElementById('start-conversation');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.startConversation();
            });
        }

        // End conversation
        const endBtn = document.getElementById('end-conversation');
        if (endBtn) {
            endBtn.addEventListener('click', () => {
                this.endConversation();
            });
        }

        // Pause conversation
        const pauseBtn = document.getElementById('pause-conversation');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                this.togglePause();
            });
        }

        // Mode switching
        this.setupModeSwitching();
        
        // Voice controls
        this.setupVoiceControls();
        
        // Text conversation
        this.setupTextConversation();
        
        // Mixed conversation
        this.setupMixedConversation();

        // Listen for conversation service events
        this.setupConversationServiceListeners();
    }

    setupConversationServiceListeners() {
        // Listen for conversation events from the service
        document.addEventListener('conversationStarted', (event) => {
            this.handleConversationStarted(event.detail);
        });

        document.addEventListener('conversationEnded', (event) => {
            this.handleConversationEnded(event.detail);
        });

        document.addEventListener('translationCompleted', (event) => {
            this.handleTranslationCompleted(event.detail);
        });

        document.addEventListener('translationError', (event) => {
            this.handleTranslationError(event.detail);
        });
    }

    setupModeSwitching() {
        const modeBtns = document.querySelectorAll('.mode-btn');
        const modes = document.querySelectorAll('.conversation-mode');

        modeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.dataset.mode;
                
                // Update active button
                modeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Update active mode
                modes.forEach(m => m.classList.remove('active'));
                document.getElementById(`${mode}-mode`)?.classList.add('active');
                
                this.currentMode = mode;
                this.conversationService.switchConversationMode(mode);
            });
        });
    }

    setupVoiceControls() {
        const voiceBtn1 = document.getElementById('participant1-voice-btn');
        const voiceBtn2 = document.getElementById('participant2-voice-btn');

        if (voiceBtn1) {
            voiceBtn1.addEventListener('click', () => {
                this.toggleParticipantRecording('participant1');
            });
        }

        if (voiceBtn2) {
            voiceBtn2.addEventListener('click', () => {
                this.toggleParticipantRecording('participant2');
            });
        }
    }

    setupTextConversation() {
        const sendBtn = document.getElementById('send-message');
        const input = document.getElementById('chat-input');
        const modeBtns = document.querySelectorAll('.input-mode-btn');

        if (sendBtn && input) {
            sendBtn.addEventListener('click', () => {
                this.sendTextMessage();
            });

            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendTextMessage();
                }
            });
        }

        // Input mode switching
        modeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const participant = btn.dataset.participant;
                
                modeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                this.updateInputPlaceholder(participant);
            });
        });
    }

    setupMixedConversation() {
        const voiceBtn = document.getElementById('mixed-voice-btn');
        const sendBtn = document.getElementById('send-mixed-message');
        const textInput = document.getElementById('mixed-text-input');

        if (voiceBtn) {
            voiceBtn.addEventListener('click', () => {
                this.toggleMixedRecording();
            });
        }

        if (sendBtn && textInput) {
            sendBtn.addEventListener('click', () => {
                this.sendMixedMessage();
            });

            textInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMixedMessage();
                }
            });
        }
    }

    setupUI() {
        // Update language indicators
        this.updateLanguageIndicators();
        
        // Setup participant names
        this.setupParticipantNames();
    }

    setupParticipantNames() {
        const participant1Name = document.getElementById('participant1-name');
        const participant2Name = document.getElementById('participant2-name');
        const inputModeParticipant1 = document.getElementById('input-mode-participant1');
        const inputModeParticipant2 = document.getElementById('input-mode-participant2');

        if (participant1Name) participant1Name.textContent = 'المشارك الأول';
        if (participant2Name) participant2Name.textContent = 'المشارك الثاني';
        if (inputModeParticipant1) inputModeParticipant1.textContent = 'المشارك الأول';
        if (inputModeParticipant2) inputModeParticipant2.textContent = 'المشارك الثاني';
    }

    // Conversation Management
    async startConversation() {
        try {
        const participant1Lang = document.getElementById('participant1-lang')?.value;
        const participant2Lang = document.getElementById('participant2-lang')?.value;

        if (!participant1Lang || !participant2Lang) {
            this.showMessage('يرجى اختيار لغات للمشاركين', 'error');
            return;
        }

            if (participant1Lang === participant2Lang) {
                this.showMessage('يجب اختيار لغات مختلفة للمشاركين', 'error');
                return;
            }

            // Start conversation using the service
            await this.conversationService.startConversation(
                participant1Lang, 
                participant2Lang, 
                this.currentMode
            );

        } catch (error) {
            console.error('Error starting conversation:', error);
            this.showMessage('خطأ في بدء المحادثة: ' + error.message, 'error');
        }
    }

    async endConversation() {
        try {
            await this.conversationService.endConversation();
        } catch (error) {
            console.error('Error ending conversation:', error);
            this.showMessage('خطأ في إنهاء المحادثة: ' + error.message, 'error');
        }
    }

    async togglePause() {
        try {
        const pauseBtn = document.getElementById('pause-conversation');
            const isPaused = pauseBtn?.classList.contains('paused');
            
            if (isPaused) {
                await this.conversationService.resumeConversation();
                pauseBtn.classList.remove('paused');
                pauseBtn.innerHTML = '<i class="fas fa-pause"></i> إيقاف مؤقت';
            } else {
                await this.conversationService.pauseConversation();
                pauseBtn.classList.add('paused');
                pauseBtn.innerHTML = '<i class="fas fa-play"></i> متابعة';
            }
        } catch (error) {
            console.error('Error toggling pause:', error);
            this.showMessage('خطأ في التحكم بالمحادثة: ' + error.message, 'error');
        }
    }

    // Voice Controls
    async toggleParticipantRecording(participantId) {
        try {
            const isRecording = this.conversationService.recordingState[participantId];
            
            if (isRecording) {
                await this.stopParticipantRecording(participantId);
            } else {
                await this.startParticipantRecording(participantId);
            }
        } catch (error) {
            console.error('Error toggling recording:', error);
            this.showMessage('خطأ في التحكم بالتسجيل: ' + error.message, 'error');
        }
    }

    async startParticipantRecording(participantId) {
        // This would integrate with the conversation service
        this.updateRecordingUI(participantId, true);
        this.conversationService.recordingState[participantId] = true;
    }

    async stopParticipantRecording(participantId) {
        // This would integrate with the conversation service
        this.updateRecordingUI(participantId, false);
        this.conversationService.recordingState[participantId] = false;
    }

    // Text Conversation
    async sendTextMessage() {
        try {
        const input = document.getElementById('chat-input');
        const activeMode = document.querySelector('.input-mode-btn.active');
        
        if (!input || !input.value.trim() || !activeMode) {
            return;
        }

        const text = input.value.trim();
            const participantId = activeMode.dataset.participant === '1' ? 'participant1' : 'participant2';
            
            // Process text input using the service
            await this.conversationService.processTextInput(text, participantId);
        
        // Clear input
        input.value = '';

        } catch (error) {
            console.error('Error sending text message:', error);
            this.showMessage('خطأ في إرسال الرسالة: ' + error.message, 'error');
        }
    }

    // Mixed Conversation
    async sendMixedMessage() {
        try {
        const textInput = document.getElementById('mixed-text-input');
        
        if (!textInput || !textInput.value.trim()) {
            return;
        }

        const text = textInput.value.trim();
        
            // Process mixed message using the service
            await this.conversationService.processTextInput(text, 'participant1');
        
        // Clear input
        textInput.value = '';
            
        } catch (error) {
            console.error('Error sending mixed message:', error);
            this.showMessage('خطأ في إرسال الرسالة: ' + error.message, 'error');
        }
    }

    async toggleMixedRecording() {
        try {
        const voiceBtn = document.getElementById('mixed-voice-btn');
            const isRecording = voiceBtn?.classList.contains('recording');
        
            if (isRecording) {
                await this.stopMixedRecording();
        } else {
                await this.startMixedRecording();
            }
        } catch (error) {
            console.error('Error toggling mixed recording:', error);
            this.showMessage('خطأ في التحكم بالتسجيل: ' + error.message, 'error');
        }
    }

    async startMixedRecording() {
            const voiceBtn = document.getElementById('mixed-voice-btn');
        if (voiceBtn) {
            voiceBtn.classList.add('recording');
            voiceBtn.innerHTML = '<i class="fas fa-stop"></i><span>إيقاف التسجيل</span>';
    }

        // Start recording for participant 1
        await this.startParticipantRecording('participant1');
        }
        
    async stopMixedRecording() {
        const voiceBtn = document.getElementById('mixed-voice-btn');
        if (voiceBtn) {
        voiceBtn.classList.remove('recording');
        voiceBtn.innerHTML = '<i class="fas fa-microphone"></i><span>تسجيل صوتي</span>';
    }

        // Stop recording for participant 1
        await this.stopParticipantRecording('participant1');
    }

    // UI Updates
    updateLanguageIndicators() {
        const lang1Name = document.getElementById('lang1-name');
        const lang2Name = document.getElementById('lang2-name');
        const participant1LangBadge = document.getElementById('participant1-lang-badge');
        const participant2LangBadge = document.getElementById('participant2-lang-badge');

        const participant1Lang = document.getElementById('participant1-lang')?.value || 'ar';
        const participant2Lang = document.getElementById('participant2-lang')?.value || 'en';

        if (lang1Name) lang1Name.textContent = this.getLanguageName(participant1Lang);
        if (lang2Name) lang2Name.textContent = this.getLanguageName(participant2Lang);
        if (participant1LangBadge) participant1LangBadge.textContent = this.getLanguageName(participant1Lang);
        if (participant2LangBadge) participant2LangBadge.textContent = this.getLanguageName(participant2Lang);
    }

    updateInputPlaceholder(participant) {
        const input = document.getElementById('chat-input');
        if (input) {
            const participantLang = participant === '1' ? 
                document.getElementById('participant1-lang')?.value : 
                document.getElementById('participant2-lang')?.value;
            
            if (participantLang === 'ar') {
                input.placeholder = 'اكتب رسالتك هنا...';
            } else {
                input.placeholder = 'Type your message here...';
            }
        }
    }

    updateRecordingUI(participantId, isRecording) {
        const participant = participantId.replace('participant', '');
        const btn = document.getElementById(`participant${participant}-voice-btn`);
        const indicator = document.getElementById(`participant${participant}-indicator`);
        
        if (btn) {
            if (isRecording) {
                btn.classList.add('recording');
                btn.innerHTML = '<i class="fas fa-stop"></i><span>إيقاف</span>';
            } else {
                btn.classList.remove('recording');
                btn.innerHTML = '<i class="fas fa-microphone"></i><span>تحدث</span>';
            }
        }
        
        if (indicator) {
            if (isRecording) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        }
    }

    // Event Handlers
    handleConversationStarted(event) {
        console.log('Conversation started:', event);
        this.updateConversationUI(true);
    }

    handleConversationEnded(event) {
        console.log('Conversation ended:', event);
        this.updateConversationUI(false);
    }

    handleTranslationCompleted(event) {
        console.log('Translation completed:', event);
        // The conversation service will handle UI updates
    }

    handleTranslationError(event) {
        console.error('Translation error:', event);
        this.showMessage('خطأ في الترجمة: ' + event.error, 'error');
    }

    updateConversationUI(isActive) {
        const setupInterface = document.getElementById('conversation-setup');
        const conversationInterface = document.getElementById('conversation-interface');
        
        if (isActive) {
            setupInterface.style.display = 'none';
            conversationInterface.style.display = 'block';
        } else {
            setupInterface.style.display = 'block';
            conversationInterface.style.display = 'none';
        }
    }

    // History Management
    async loadConversationHistory() {
        try {
            await this.conversationService.loadConversationHistory();
        } catch (error) {
            console.error('Error loading conversation history:', error);
        }
    }

    // Utility Methods
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

    showMessage(message, type = 'info') {
        // Create message element
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
            padding: var(--spacing-4);
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-lg);
            display: flex;
            align-items: center;
            gap: var(--spacing-3);
            max-width: 400px;
            animation: slideInRight 0.3s ease-out;
            background: white;
            border-left: 4px solid var(--${type === 'success' ? 'success' : type === 'error' ? 'error' : type === 'warning' ? 'warning' : 'primary'}-color);
        `;
        
        // Add to page
        document.body.appendChild(messageEl);
        
        // Auto remove after 5 seconds
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

// Initialize conversation manager
let conversationManager;
document.addEventListener('DOMContentLoaded', async () => {
    conversationManager = new ConversationManager();
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