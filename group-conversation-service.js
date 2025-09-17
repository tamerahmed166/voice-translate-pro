// Group Conversation Service for Voice Translator Pro
// خدمة المحادثة الجماعية لمترجم الصوت الذكي

import { appConfig } from './app-config.js';
import { notificationService } from './notification-service.js';

export class GroupConversationService {
    constructor() {
        this.currentGroup = null;
        this.isActive = false;
        this.participants = new Map();
        this.messages = [];
        this.voiceRecognition = null;
        this.speechSynthesis = window.speechSynthesis;
        this.recordingState = new Map();
        
        this.settings = this.loadSettings();
        this.init();
    }

    async init() {
        this.setupVoiceRecognition();
        this.setupEventListeners();
        this.loadGroupHistory();
    }

    setupVoiceRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.voiceRecognition = new SpeechRecognition();
            
            this.voiceRecognition.continuous = true;
            this.voiceRecognition.interimResults = true;
            this.voiceRecognition.maxAlternatives = 1;
            
            this.voiceRecognition.onstart = () => {
                console.log('Group voice recognition started');
            };
            
            this.voiceRecognition.onresult = (event) => {
                this.handleVoiceRecognitionResult(event);
            };
            
            this.voiceRecognition.onerror = (event) => {
                console.error('Group voice recognition error:', event.error);
                this.handleVoiceRecognitionError(event);
            };
            
            this.voiceRecognition.onend = () => {
                console.log('Group voice recognition ended');
            };
        }
    }

    setupEventListeners() {
        // Listen for group conversation events
        document.addEventListener('groupConversationStarted', (event) => {
            this.handleGroupConversationStarted(event.detail);
        });

        document.addEventListener('groupConversationEnded', (event) => {
            this.handleGroupConversationEnded(event.detail);
        });

        // Listen for participant events
        document.addEventListener('participantJoined', (event) => {
            this.handleParticipantJoined(event.detail);
        });

        document.addEventListener('participantLeft', (event) => {
            this.handleParticipantLeft(event.detail);
        });
    }

    // Group Management
    async createGroup(groupName, adminId, adminLanguage = 'ar') {
        try {
            const groupId = this.generateGroupId();
            
            this.currentGroup = {
                id: groupId,
                name: groupName,
                adminId: adminId,
                participants: new Map(),
                messages: [],
                startTime: Date.now(),
                status: 'active',
                settings: {
                    allowVoiceMessages: true,
                    allowTextMessages: true,
                    autoTranslate: true,
                    maxParticipants: 10
                }
            };

            // Add admin as first participant
            await this.addParticipant(adminId, 'المدير', adminLanguage, true);

            // Save group
            await this.saveGroup();

            // Dispatch event
            document.dispatchEvent(new CustomEvent('groupCreated', {
                detail: {
                    groupId: groupId,
                    groupName: groupName,
                    adminId: adminId
                }
            }));

            return this.currentGroup;

        } catch (error) {
            console.error('Error creating group:', error);
            throw error;
        }
    }

    async joinGroup(groupId, participantId, participantName, participantLanguage) {
        try {
            // Load group if not current
            if (!this.currentGroup || this.currentGroup.id !== groupId) {
                await this.loadGroup(groupId);
            }

            if (!this.currentGroup) {
                throw new Error('Group not found');
            }

            if (this.currentGroup.participants.size >= this.currentGroup.settings.maxParticipants) {
                throw new Error('Group is full');
            }

            // Add participant
            await this.addParticipant(participantId, participantName, participantLanguage, false);

            // Save group
            await this.saveGroup();

            // Notify other participants
            this.broadcastMessage({
                type: 'system',
                content: `${participantName} انضم إلى المجموعة`,
                timestamp: Date.now()
            });

            // Dispatch event
            document.dispatchEvent(new CustomEvent('participantJoined', {
                detail: {
                    groupId: groupId,
                    participantId: participantId,
                    participantName: participantName,
                    participantLanguage: participantLanguage
                }
            }));

        } catch (error) {
            console.error('Error joining group:', error);
            throw error;
        }
    }

    async leaveGroup(participantId) {
        try {
            if (!this.currentGroup) {
                throw new Error('No active group');
            }

            const participant = this.currentGroup.participants.get(participantId);
            if (!participant) {
                throw new Error('Participant not found');
            }

            // Remove participant
            this.currentGroup.participants.delete(participantId);
            this.recordingState.delete(participantId);

            // If admin left, transfer admin to another participant
            if (participant.isAdmin && this.currentGroup.participants.size > 0) {
                const newAdmin = this.currentGroup.participants.values().next().value;
                newAdmin.isAdmin = true;
                this.currentGroup.adminId = newAdmin.id;
            }

            // Save group
            await this.saveGroup();

            // Notify other participants
            this.broadcastMessage({
                type: 'system',
                content: `${participant.name} غادر المجموعة`,
                timestamp: Date.now()
            });

            // Dispatch event
            document.dispatchEvent(new CustomEvent('participantLeft', {
                detail: {
                    groupId: this.currentGroup.id,
                    participantId: participantId,
                    participantName: participant.name
                }
            }));

        } catch (error) {
            console.error('Error leaving group:', error);
            throw error;
        }
    }

    async addParticipant(participantId, participantName, participantLanguage, isAdmin = false) {
        const participant = {
            id: participantId,
            name: participantName,
            language: participantLanguage,
            isAdmin: isAdmin,
            joinedAt: Date.now(),
            isActive: true,
            messageCount: 0
        };

        this.currentGroup.participants.set(participantId, participant);
        this.recordingState.set(participantId, false);
    }

    // Message Handling
    async sendMessage(messageData) {
        try {
            if (!this.currentGroup) {
                throw new Error('No active group');
            }

            const message = {
                id: this.generateMessageId(),
                senderId: messageData.senderId,
                senderName: messageData.senderName,
                content: messageData.content,
                type: messageData.type || 'text', // text, voice, image
                language: messageData.language,
                timestamp: Date.now(),
                translations: new Map()
            };

            // Add original message
            this.currentGroup.messages.push(message);
            this.messages.push(message);

            // Update participant message count
            const participant = this.currentGroup.participants.get(messageData.senderId);
            if (participant) {
                participant.messageCount++;
            }

            // Translate message for other participants
            if (this.currentGroup.settings.autoTranslate) {
                await this.translateMessageForAll(message);
            }

            // Save group
            await this.saveGroup();

            // Update UI
            this.updateMessagesDisplay();

            // Dispatch event
            document.dispatchEvent(new CustomEvent('messageReceived', {
                detail: message
            }));

        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    }

    async translateMessageForAll(message) {
        const senderLanguage = message.language;
        
        for (const [participantId, participant] of this.currentGroup.participants) {
            if (participantId !== message.senderId && participant.language !== senderLanguage) {
                try {
                    const translation = await appConfig.getService('translation').translate(
                        message.content,
                        senderLanguage,
                        participant.language
                    );

                    if (translation.success) {
                        message.translations.set(participant.language, {
                            text: translation.translation,
                            confidence: translation.confidence,
                            timestamp: Date.now()
                        });
                    }
                } catch (error) {
                    console.error(`Error translating message for ${participant.language}:`, error);
                }
            }
        }
    }

    async processVoiceInput(audioData, participantId) {
        try {
            const participant = this.currentGroup.participants.get(participantId);
            if (!participant) {
                throw new Error('Participant not found');
            }

            // Convert audio to text (this would use speech recognition)
            const text = await this.convertAudioToText(audioData, participant.language);

            if (text.trim()) {
                await this.sendMessage({
                    senderId: participantId,
                    senderName: participant.name,
                    content: text,
                    type: 'voice',
                    language: participant.language
                });
            }

        } catch (error) {
            console.error('Error processing voice input:', error);
            throw error;
        }
    }

    async convertAudioToText(audioData, language) {
        // This would integrate with speech recognition
        // For now, return a placeholder
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve('Voice message converted to text');
            }, 1000);
        });
    }

    // Voice Recognition
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
            this.processGroupVoiceInput(finalTranscript.trim());
        }
    }

    handleVoiceRecognitionError(event) {
        console.error('Group voice recognition error:', event.error);
        
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

    async processGroupVoiceInput(text) {
        // This would determine which participant is speaking
        // For now, use the first active participant
        const activeParticipant = Array.from(this.currentGroup.participants.values())
            .find(p => p.isActive);
        
        if (activeParticipant) {
            await this.sendMessage({
                senderId: activeParticipant.id,
                senderName: activeParticipant.name,
                content: text,
                type: 'voice',
                language: activeParticipant.language
            });
        }
    }

    // UI Management
    updateMessagesDisplay() {
        const messagesContainer = document.getElementById('group-messages');
        if (!messagesContainer) return;
        
        // Clear existing messages
        messagesContainer.innerHTML = '';
        
        // Add messages
        this.messages.forEach(message => {
            const messageElement = this.createGroupMessageElement(message);
            messagesContainer.appendChild(messageElement);
        });
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    createGroupMessageElement(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `group-message ${message.senderId === this.getCurrentUserId() ? 'own-message' : 'other-message'}`;
        
        const timestamp = new Date(message.timestamp).toLocaleTimeString('ar-SA', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        let translationsHtml = '';
        if (message.translations.size > 0) {
            translationsHtml = '<div class="message-translations">';
            for (const [language, translation] of message.translations) {
                translationsHtml += `
                    <div class="translation" data-lang="${language}">
                        <span class="language-badge">${this.getLanguageName(language)}</span>
                        <p>${translation.text}</p>
                    </div>
                `;
            }
            translationsHtml += '</div>';
        }
        
        messageDiv.innerHTML = `
            <div class="message-header">
                <span class="sender-name">${message.senderName}</span>
                <span class="message-time">${timestamp}</span>
            </div>
            <div class="message-content">
                <div class="message-original">
                    <span class="language-badge">${this.getLanguageName(message.language)}</span>
                    <p>${message.content}</p>
                </div>
                ${translationsHtml}
            </div>
        `;
        
        return messageDiv;
    }

    updateTranscriptionDisplay(finalText, interimText) {
        const transcriptionElement = document.getElementById('group-transcription');
        
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

    updateParticipantsDisplay() {
        const participantsContainer = document.getElementById('group-participants');
        if (!participantsContainer) return;
        
        participantsContainer.innerHTML = '';
        
        for (const [participantId, participant] of this.currentGroup.participants) {
            const participantElement = this.createParticipantElement(participant);
            participantsContainer.appendChild(participantElement);
        }
    }

    createParticipantElement(participant) {
        const participantDiv = document.createElement('div');
        participantDiv.className = `participant-item ${participant.isAdmin ? 'admin' : ''}`;
        
        participantDiv.innerHTML = `
            <div class="participant-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="participant-info">
                <span class="participant-name">${participant.name}</span>
                <span class="participant-language">${this.getLanguageName(participant.language)}</span>
            </div>
            <div class="participant-status">
                <span class="status-indicator ${participant.isActive ? 'active' : 'inactive'}"></span>
                <span class="message-count">${participant.messageCount}</span>
            </div>
        `;
        
        return participantDiv;
    }

    // Group Settings
    async updateGroupSettings(settings) {
        try {
            if (!this.currentGroup) {
                throw new Error('No active group');
            }

            this.currentGroup.settings = { ...this.currentGroup.settings, ...settings };
            await this.saveGroup();

            // Notify participants of settings change
            this.broadcastMessage({
                type: 'system',
                content: 'تم تحديث إعدادات المجموعة',
                timestamp: Date.now()
            });

        } catch (error) {
            console.error('Error updating group settings:', error);
            throw error;
        }
    }

    // Data Management
    async saveGroup() {
        if (!this.currentGroup) return;
        
        try {
            // Save to database if user is authenticated
            if (appConfig.getService('auth').isAuthenticated()) {
                await appConfig.getService('database').saveConversation({
                    type: 'group',
                    ...this.currentGroup,
                    messages: this.messages
                });
            }
            
            // Save to localStorage
            const groups = this.getStoredGroups();
            const existingIndex = groups.findIndex(g => g.id === this.currentGroup.id);
            
            if (existingIndex >= 0) {
                groups[existingIndex] = this.currentGroup;
            } else {
                groups.push(this.currentGroup);
            }
            
            // Keep only last 20 groups
            if (groups.length > 20) {
                groups.splice(0, groups.length - 20);
            }
            
            localStorage.setItem('group-conversations', JSON.stringify(groups));
            
        } catch (error) {
            console.error('Error saving group:', error);
        }
    }

    async loadGroup(groupId) {
        try {
            const groups = this.getStoredGroups();
            const group = groups.find(g => g.id === groupId);
            
            if (group) {
                this.currentGroup = group;
                this.messages = group.messages || [];
                this.participants = new Map(group.participants || []);
                return group;
            } else {
                throw new Error('Group not found');
            }
        } catch (error) {
            console.error('Error loading group:', error);
            throw error;
        }
    }

    async loadGroupHistory() {
        try {
            const groups = this.getStoredGroups();
            const historyList = document.getElementById('group-history-list');
            
            if (!historyList) return;
            
            if (groups.length === 0) {
                historyList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-users"></i>
                        <p>لا توجد مجموعات سابقة</p>
                    </div>
                `;
                return;
            }
            
            historyList.innerHTML = '';
            
            groups.reverse().forEach(group => {
                const groupElement = this.createGroupHistoryElement(group);
                historyList.appendChild(groupElement);
            });
            
        } catch (error) {
            console.error('Error loading group history:', error);
        }
    }

    createGroupHistoryElement(group) {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'group-item';
        
        const startTime = new Date(group.startTime).toLocaleDateString('ar-SA');
        const participantCount = group.participants ? Object.keys(group.participants).length : 0;
        
        groupDiv.innerHTML = `
            <div class="group-info">
                <h4>${group.name}</h4>
                <p>${startTime} • ${participantCount} مشارك • ${group.messages?.length || 0} رسالة</p>
            </div>
            <div class="group-actions">
                <button class="btn btn-outline btn-sm" onclick="groupConversationService.joinGroup('${group.id}', 'user1', 'مستخدم', 'ar')">
                    <i class="fas fa-sign-in-alt"></i>
                    انضمام
                </button>
                <button class="btn btn-outline btn-sm" onclick="groupConversationService.deleteGroup('${group.id}')">
                    <i class="fas fa-trash"></i>
                    حذف
                </button>
            </div>
        `;
        
        return groupDiv;
    }

    getStoredGroups() {
        try {
            return JSON.parse(localStorage.getItem('group-conversations') || '[]');
        } catch (error) {
            console.error('Error loading stored groups:', error);
            return [];
        }
    }

    // Utility Methods
    generateGroupId() {
        return 'group_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateMessageId() {
        return 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getCurrentUserId() {
        // This would get the current user ID from auth service
        return 'user1';
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

    broadcastMessage(message) {
        // This would broadcast to all participants
        console.log('Broadcasting message:', message);
    }

    // Event Handlers
    handleGroupConversationStarted(event) {
        console.log('Group conversation started:', event);
    }

    handleGroupConversationEnded(event) {
        console.log('Group conversation ended:', event);
    }

    handleParticipantJoined(event) {
        console.log('Participant joined:', event);
        this.updateParticipantsDisplay();
    }

    handleParticipantLeft(event) {
        console.log('Participant left:', event);
        this.updateParticipantsDisplay();
    }

    // Settings Management
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.saveSettings();
    }

    loadSettings() {
        const defaultSettings = {
            autoTranslate: true,
            allowVoiceMessages: true,
            allowTextMessages: true,
            maxParticipants: 10,
            messageHistoryLimit: 1000
        };

        try {
            const saved = localStorage.getItem('group-conversation-settings');
            return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
        } catch (error) {
            console.error('Error loading group conversation settings:', error);
            return defaultSettings;
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('group-conversation-settings', JSON.stringify(this.settings));
        } catch (error) {
            console.error('Error saving group conversation settings:', error);
        }
    }

    // Public Methods
    async deleteGroup(groupId) {
        try {
            const groups = this.getStoredGroups();
            const filteredGroups = groups.filter(g => g.id !== groupId);
            localStorage.setItem('group-conversations', JSON.stringify(filteredGroups));
            
            if (this.currentGroup && this.currentGroup.id === groupId) {
                this.currentGroup = null;
                this.messages = [];
                this.participants.clear();
            }
            
            this.loadGroupHistory();
        } catch (error) {
            console.error('Error deleting group:', error);
        }
    }
}

// Export group conversation service instance
export const groupConversationService = new GroupConversationService();
