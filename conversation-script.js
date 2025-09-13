// Conversation Page Specific Script
// Handles dual conversation functionality

class ConversationManager {
    constructor() {
        this.isActive = false;
        this.currentMode = 'voice';
        this.participant1Lang = 'ar';
        this.participant2Lang = 'en';
        this.conversationHistory = [];
        this.recognition1 = null;
        this.recognition2 = null;
        this.isRecording1 = false;
        this.isRecording2 = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupSpeechRecognition();
        this.loadConversationHistory();
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
            });
        });
    }

    setupVoiceControls() {
        const voiceBtn1 = document.getElementById('participant1-voice-btn');
        const voiceBtn2 = document.getElementById('participant2-voice-btn');

        if (voiceBtn1) {
            voiceBtn1.addEventListener('click', () => {
                this.toggleRecording(1);
            });
        }

        if (voiceBtn2) {
            voiceBtn2.addEventListener('click', () => {
                this.toggleRecording(2);
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
                
                const input = document.getElementById('chat-input');
                if (input) {
                    input.placeholder = participant === '1' ? 
                        'اكتب رسالتك هنا...' : 
                        'Type your message here...';
                }
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

    setupSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            
            // Participant 1 recognition
            this.recognition1 = new SpeechRecognition();
            this.recognition1.continuous = false;
            this.recognition1.interimResults = true;
            this.recognition1.lang = this.getSpeechLangCode(this.participant1Lang);

            this.recognition1.onstart = () => {
                this.isRecording1 = true;
                this.updateRecordingUI(1, true);
            };

            this.recognition1.onresult = (event) => {
                this.handleSpeechResult(event, 1);
            };

            this.recognition1.onerror = (event) => {
                console.error('Speech recognition error (P1):', event.error);
                this.stopRecording(1);
            };

            this.recognition1.onend = () => {
                this.isRecording1 = false;
                this.updateRecordingUI(1, false);
            };

            // Participant 2 recognition
            this.recognition2 = new SpeechRecognition();
            this.recognition2.continuous = false;
            this.recognition2.interimResults = true;
            this.recognition2.lang = this.getSpeechLangCode(this.participant2Lang);

            this.recognition2.onstart = () => {
                this.isRecording2 = true;
                this.updateRecordingUI(2, true);
            };

            this.recognition2.onresult = (event) => {
                this.handleSpeechResult(event, 2);
            };

            this.recognition2.onerror = (event) => {
                console.error('Speech recognition error (P2):', event.error);
                this.stopRecording(2);
            };

            this.recognition2.onend = () => {
                this.isRecording2 = false;
                this.updateRecordingUI(2, false);
            };
        }
    }

    startConversation() {
        const participant1Lang = document.getElementById('participant1-lang')?.value;
        const participant2Lang = document.getElementById('participant2-lang')?.value;

        if (!participant1Lang || !participant2Lang) {
            this.showMessage('يرجى اختيار لغات للمشاركين', 'error');
            return;
        }

        this.participant1Lang = participant1Lang;
        this.participant2Lang = participant2Lang;

        // Update UI
        document.getElementById('conversation-setup').style.display = 'none';
        document.getElementById('conversation-interface').style.display = 'block';
        document.getElementById('conversation-history').style.display = 'block';

        // Update language indicators
        this.updateLanguageIndicators();

        // Update speech recognition languages
        if (this.recognition1) {
            this.recognition1.lang = this.getSpeechLangCode(this.participant1Lang);
        }
        if (this.recognition2) {
            this.recognition2.lang = this.getSpeechLangCode(this.participant2Lang);
        }

        this.isActive = true;
        this.showMessage('تم بدء المحادثة بنجاح', 'success');
    }

    endConversation() {
        this.isActive = false;
        
        // Stop any ongoing recordings
        this.stopRecording(1);
        this.stopRecording(2);

        // Save conversation to history
        this.saveConversationToHistory();

        // Reset UI
        document.getElementById('conversation-setup').style.display = 'block';
        document.getElementById('conversation-interface').style.display = 'none';

        // Clear conversation data
        this.conversationHistory = [];
        this.clearConversationUI();

        this.showMessage('تم إنهاء المحادثة', 'info');
    }

    togglePause() {
        const pauseBtn = document.getElementById('pause-conversation');
        if (pauseBtn) {
            const isPaused = pauseBtn.classList.contains('paused');
            
            if (isPaused) {
                pauseBtn.classList.remove('paused');
                pauseBtn.innerHTML = '<i class="fas fa-pause"></i> إيقاف مؤقت';
                this.isActive = true;
            } else {
                pauseBtn.classList.add('paused');
                pauseBtn.innerHTML = '<i class="fas fa-play"></i> متابعة';
                this.isActive = false;
                
                // Stop any ongoing recordings
                this.stopRecording(1);
                this.stopRecording(2);
            }
        }
    }

    toggleRecording(participant) {
        if (!this.isActive) {
            this.showMessage('المحادثة غير نشطة', 'warning');
            return;
        }

        if (participant === 1) {
            if (this.isRecording1) {
                this.stopRecording(1);
            } else {
                this.startRecording(1);
            }
        } else {
            if (this.isRecording2) {
                this.stopRecording(2);
            } else {
                this.startRecording(2);
            }
        }
    }

    startRecording(participant) {
        const recognition = participant === 1 ? this.recognition1 : this.recognition2;
        
        if (recognition) {
            recognition.start();
        } else {
            this.showMessage('التعرف على الصوت غير مدعوم', 'error');
        }
    }

    stopRecording(participant) {
        const recognition = participant === 1 ? this.recognition1 : this.recognition2;
        
        if (recognition && (participant === 1 ? this.isRecording1 : this.isRecording2)) {
            recognition.stop();
        }
    }

    handleSpeechResult(event, participant) {
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
        const transcriptionEl = document.getElementById(`participant${participant}-transcription`);
        if (transcriptionEl) {
            transcriptionEl.innerHTML = `
                <div class="transcription-result">
                    <div class="final">${finalTranscript}</div>
                    <div class="interim">${interimTranscript}</div>
                </div>
            `;
        }

        // If we have final transcript, translate it
        if (finalTranscript) {
            this.translateAndDisplay(finalTranscript, participant);
        }
    }

    async translateAndDisplay(text, participant) {
        const sourceLang = participant === 1 ? this.participant1Lang : this.participant2Lang;
        const targetLang = participant === 1 ? this.participant2Lang : this.participant1Lang;

        try {
            // Simulate translation API call
            const translation = await this.callTranslationAPI(text, sourceLang, targetLang);
            
            // Display translation
            const targetTranscriptionEl = document.getElementById(
                `participant${participant === 1 ? 2 : 1}-transcription`
            );
            
            if (targetTranscriptionEl) {
                targetTranscriptionEl.innerHTML = `
                    <div class="translation-result">
                        ${translation}
                    </div>
                `;
            }

            // Add to conversation history
            this.addToConversationHistory({
                participant,
                original: text,
                translation,
                sourceLang,
                targetLang,
                timestamp: new Date().toISOString(),
                type: 'voice'
            });

            // Speak translation
            this.speakText(translation, targetLang);

        } catch (error) {
            console.error('Translation error:', error);
            this.showMessage('خطأ في الترجمة', 'error');
        }
    }

    sendTextMessage() {
        const input = document.getElementById('chat-input');
        const activeMode = document.querySelector('.input-mode-btn.active');
        
        if (!input || !input.value.trim() || !activeMode) {
            return;
        }

        const text = input.value.trim();
        const participant = parseInt(activeMode.dataset.participant);
        
        // Add message to chat
        this.addMessageToChat(text, participant);
        
        // Translate and add response
        this.translateAndAddResponse(text, participant);
        
        // Clear input
        input.value = '';
    }

    addMessageToChat(text, participant) {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;

        // Remove welcome message if exists
        const welcomeMsg = messagesContainer.querySelector('.welcome-message');
        if (welcomeMsg) {
            welcomeMsg.remove();
        }

        const messageEl = document.createElement('div');
        messageEl.className = `chat-message participant${participant}`;
        
        const bubbleEl = document.createElement('div');
        bubbleEl.className = `message-bubble participant${participant}`;
        
        const contentEl = document.createElement('div');
        contentEl.className = 'message-content';
        contentEl.textContent = text;
        
        const timeEl = document.createElement('div');
        timeEl.className = 'message-time';
        timeEl.textContent = new Date().toLocaleTimeString('ar-SA');
        
        bubbleEl.appendChild(contentEl);
        bubbleEl.appendChild(timeEl);
        messageEl.appendChild(bubbleEl);
        messagesContainer.appendChild(bubbleEl);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    async translateAndAddResponse(text, participant) {
        const sourceLang = participant === 1 ? this.participant1Lang : this.participant2Lang;
        const targetLang = participant === 1 ? this.participant2Lang : this.participant1Lang;

        try {
            const translation = await this.callTranslationAPI(text, sourceLang, targetLang);
            
            // Add translated message
            this.addMessageToChat(translation, participant === 1 ? 2 : 1);
            
            // Add to conversation history
            this.addToConversationHistory({
                participant,
                original: text,
                translation,
                sourceLang,
                targetLang,
                timestamp: new Date().toISOString(),
                type: 'text'
            });

        } catch (error) {
            console.error('Translation error:', error);
            this.showMessage('خطأ في الترجمة', 'error');
        }
    }

    sendMixedMessage() {
        const textInput = document.getElementById('mixed-text-input');
        
        if (!textInput || !textInput.value.trim()) {
            return;
        }

        const text = textInput.value.trim();
        
        // Add to timeline
        this.addToTimeline(text, 'text');
        
        // Translate and add response
        this.translateAndAddTimelineResponse(text);
        
        // Clear input
        textInput.value = '';
    }

    toggleMixedRecording() {
        const voiceBtn = document.getElementById('mixed-voice-btn');
        
        if (voiceBtn.classList.contains('recording')) {
            this.stopMixedRecording();
        } else {
            this.startMixedRecording();
        }
    }

    startMixedRecording() {
        // Use participant 1 recognition for mixed mode
        if (this.recognition1) {
            this.recognition1.start();
            
            const voiceBtn = document.getElementById('mixed-voice-btn');
            voiceBtn.classList.add('recording');
            voiceBtn.innerHTML = '<i class="fas fa-stop"></i><span>إيقاف التسجيل</span>';
        }
    }

    stopMixedRecording() {
        if (this.recognition1 && this.isRecording1) {
            this.recognition1.stop();
        }
        
        const voiceBtn = document.getElementById('mixed-voice-btn');
        voiceBtn.classList.remove('recording');
        voiceBtn.innerHTML = '<i class="fas fa-microphone"></i><span>تسجيل صوتي</span>';
    }

    addToTimeline(content, type) {
        const timeline = document.getElementById('conversation-timeline');
        if (!timeline) return;

        const itemEl = document.createElement('div');
        itemEl.className = 'timeline-item';
        
        const contentEl = document.createElement('div');
        contentEl.className = 'timeline-content';
        contentEl.innerHTML = `
            <i class="fas fa-${type === 'text' ? 'keyboard' : 'microphone'}"></i>
            <p>${content}</p>
        `;
        
        itemEl.appendChild(contentEl);
        timeline.appendChild(itemEl);
        
        // Scroll to bottom
        timeline.scrollTop = timeline.scrollHeight;
    }

    async translateAndAddTimelineResponse(text) {
        try {
            const translation = await this.callTranslationAPI(text, this.participant1Lang, this.participant2Lang);
            this.addToTimeline(translation, 'translation');
        } catch (error) {
            console.error('Translation error:', error);
        }
    }

    addToConversationHistory(item) {
        this.conversationHistory.push(item);
    }

    saveConversationToHistory() {
        if (this.conversationHistory.length === 0) return;

        const conversation = {
            id: Date.now(),
            participant1Lang: this.participant1Lang,
            participant2Lang: this.participant2Lang,
            messages: this.conversationHistory,
            timestamp: new Date().toISOString(),
            duration: this.getConversationDuration()
        };

        const history = this.getConversationHistory();
        history.unshift(conversation);
        
        // Keep only last 50 conversations
        if (history.length > 50) {
            history.splice(50);
        }
        
        localStorage.setItem('conversation-history', JSON.stringify(history));
        this.updateHistoryDisplay();
    }

    getConversationDuration() {
        if (this.conversationHistory.length === 0) return 0;
        
        const start = new Date(this.conversationHistory[0].timestamp);
        const end = new Date(this.conversationHistory[this.conversationHistory.length - 1].timestamp);
        
        return Math.round((end - start) / 1000); // in seconds
    }

    loadConversationHistory() {
        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        const historyList = document.getElementById('history-list');
        if (!historyList) return;

        const history = this.getConversationHistory();
        
        if (history.length === 0) {
            historyList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-history"></i>
                    <p>لا توجد محادثات سابقة</p>
                </div>
            `;
            return;
        }

        const html = history.slice(0, 10).map(conversation => `
            <div class="history-item" onclick="conversationManager.loadConversation(${conversation.id})">
                <div class="history-item-header">
                    <div class="history-meta">
                        <span class="history-languages">
                            ${this.getLanguageName(conversation.participant1Lang)} → ${this.getLanguageName(conversation.participant2Lang)}
                        </span>
                        <span class="history-mode">${conversation.messages.length} رسالة</span>
                    </div>
                    <span class="history-date">${new Date(conversation.timestamp).toLocaleDateString('ar-SA')}</span>
                </div>
                <div class="history-preview">
                    ${conversation.messages[0]?.original || 'محادثة فارغة'}
                </div>
            </div>
        `).join('');

        historyList.innerHTML = html;
    }

    loadConversation(id) {
        const history = this.getConversationHistory();
        const conversation = history.find(c => c.id === id);
        
        if (conversation) {
            // Load conversation data
            this.participant1Lang = conversation.participant1Lang;
            this.participant2Lang = conversation.participant2Lang;
            this.conversationHistory = conversation.messages;
            
            // Update UI
            this.updateLanguageIndicators();
            this.displayConversationMessages();
            
            this.showMessage('تم تحميل المحادثة', 'success');
        }
    }

    displayConversationMessages() {
        // Display messages in appropriate mode
        if (this.currentMode === 'text') {
            const messagesContainer = document.getElementById('chat-messages');
            if (messagesContainer) {
                messagesContainer.innerHTML = '';
                
                this.conversationHistory.forEach(msg => {
                    this.addMessageToChat(msg.original, msg.participant);
                    this.addMessageToChat(msg.translation, msg.participant === 1 ? 2 : 1);
                });
            }
        }
    }

    updateLanguageIndicators() {
        const lang1Name = document.getElementById('lang1-name');
        const lang2Name = document.getElementById('lang2-name');
        const participant1Name = document.getElementById('participant1-name');
        const participant2Name = document.getElementById('participant2-name');
        const participant1LangBadge = document.getElementById('participant1-lang-badge');
        const participant2LangBadge = document.getElementById('participant2-lang-badge');

        if (lang1Name) lang1Name.textContent = this.getLanguageName(this.participant1Lang);
        if (lang2Name) lang2Name.textContent = this.getLanguageName(this.participant2Lang);
        if (participant1LangBadge) participant1LangBadge.textContent = this.getLanguageName(this.participant1Lang);
        if (participant2LangBadge) participant2LangBadge.textContent = this.getLanguageName(this.participant2Lang);
    }

    updateRecordingUI(participant, isRecording) {
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

    clearConversationUI() {
        // Clear transcriptions
        const transcription1 = document.getElementById('participant1-transcription');
        const transcription2 = document.getElementById('participant2-transcription');
        
        if (transcription1) {
            transcription1.innerHTML = `
                <div class="placeholder">
                    <i class="fas fa-microphone-slash"></i>
                    <p>اضغط على زر التحدث وابدأ بالحديث</p>
                </div>
            `;
        }
        
        if (transcription2) {
            transcription2.innerHTML = `
                <div class="placeholder">
                    <i class="fas fa-microphone-slash"></i>
                    <p>Press the speak button and start talking</p>
                </div>
            `;
        }

        // Clear chat messages
        const chatMessages = document.getElementById('chat-messages');
        if (chatMessages) {
            chatMessages.innerHTML = `
                <div class="welcome-message">
                    <i class="fas fa-comments"></i>
                    <p>ابدأ المحادثة النصية</p>
                </div>
            `;
        }

        // Clear timeline
        const timeline = document.getElementById('conversation-timeline');
        if (timeline) {
            timeline.innerHTML = `
                <div class="timeline-item">
                    <div class="timeline-content">
                        <i class="fas fa-info-circle"></i>
                        <p>يمكنك استخدام الصوت والنص معاً في هذا الوضع</p>
                    </div>
                </div>
            `;
        }
    }

    // API Methods
    async callTranslationAPI(text, source, target) {
        // Simulate API call
        return new Promise((resolve) => {
            setTimeout(() => {
                const translations = {
                    'en': 'This is a sample translation to English.',
                    'ar': 'هذه ترجمة عينة إلى العربية.',
                    'fr': 'Ceci est une traduction d\'exemple en français.',
                    'es': 'Esta es una traducción de ejemplo al español.',
                    'de': 'Dies ist eine Beispielübersetzung ins Deutsche.'
                };
                
                resolve(translations[target] || 'Translation not available for this language.');
            }, 1000);
        });
    }

    speakText(text, lang) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = this.getSpeechLangCode(lang);
            utterance.rate = 0.9;
            utterance.pitch = 1;
            utterance.volume = 1;
            
            window.speechSynthesis.speak(utterance);
        }
    }

    // Utility Methods
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
            'ko': '한국어'
        };
        return languages[code] || code;
    }

    getSpeechLangCode(langCode) {
        const speechCodes = {
            'ar': 'ar-SA',
            'en': 'en-US',
            'fr': 'fr-FR',
            'es': 'es-ES',
            'de': 'de-DE',
            'it': 'it-IT',
            'pt': 'pt-PT',
            'ru': 'ru-RU',
            'zh': 'zh-CN',
            'ja': 'ja-JP',
            'ko': 'ko-KR'
        };
        return speechCodes[langCode] || 'en-US';
    }

    getConversationHistory() {
        try {
            const stored = localStorage.getItem('conversation-history');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading conversation history:', error);
            return [];
        }
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

// Initialize conversation manager
let conversationManager;
document.addEventListener('DOMContentLoaded', () => {
    conversationManager = new ConversationManager();
});

