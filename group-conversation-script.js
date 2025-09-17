// Group Conversation Script for Voice Translator Pro
// كود المحادثة الجماعية لمترجم الصوت الذكي

import { groupConversationService } from './group-conversation-service.js';
import { appConfig } from './app-config.js';

class GroupConversationManager {
    constructor() {
        this.groupService = groupConversationService;
        this.appConfig = appConfig;
        this.currentGroup = null;
        this.currentUser = null;
        this.isInitialized = false;
        this.inputMode = 'text';
        
        this.init();
    }

    async init() {
        try {
            // Wait for app config to be ready
            await this.waitForAppConfig();
            
            this.setupEventListeners();
            this.setupUI();
            this.loadGroupHistory();
            
            this.isInitialized = true;
            console.log('Group conversation manager initialized successfully');
        } catch (error) {
            console.error('Failed to initialize group conversation manager:', error);
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
        // Setup tabs
        this.setupTabs();
        
        // Create group
        const createBtn = document.getElementById('create-group');
        if (createBtn) {
            createBtn.addEventListener('click', () => {
                this.createGroup();
            });
        }

        // Join group
        const joinBtn = document.getElementById('join-group');
        if (joinBtn) {
            joinBtn.addEventListener('click', () => {
                this.joinGroup();
            });
        }

        // Group controls
        const settingsBtn = document.getElementById('group-settings');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.showGroupSettings();
            });
        }

        const leaveBtn = document.getElementById('leave-group');
        if (leaveBtn) {
            leaveBtn.addEventListener('click', () => {
                this.leaveGroup();
            });
        }

        // Message input
        this.setupMessageInput();
        
        // Input mode switching
        this.setupInputModeSwitching();
        
        // Settings modal
        this.setupSettingsModal();

        // Listen for group service events
        this.setupGroupServiceListeners();
    }

    setupTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.setup-content');

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

    setupMessageInput() {
        const sendBtn = document.getElementById('send-group-message');
        const input = document.getElementById('group-message-input');

        if (sendBtn && input) {
            sendBtn.addEventListener('click', () => {
                this.sendMessage();
            });

            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }
    }

    setupInputModeSwitching() {
        const modeBtns = document.querySelectorAll('.input-mode-btn');

        modeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.dataset.mode;
                
                // Update active button
                modeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                this.inputMode = mode;
                this.updateInputMode();
            });
        });
    }

    setupSettingsModal() {
        const modal = document.getElementById('group-settings-modal');
        const closeBtn = document.getElementById('close-settings-modal');
        const cancelBtn = document.getElementById('cancel-settings');
        const saveBtn = document.getElementById('save-settings');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hideGroupSettings();
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.hideGroupSettings();
            });
        }

        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveGroupSettings();
            });
        }

        // Close modal when clicking outside
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideGroupSettings();
                }
            });
        }
    }

    setupGroupServiceListeners() {
        // Listen for group service events
        document.addEventListener('groupCreated', (event) => {
            this.handleGroupCreated(event.detail);
        });

        document.addEventListener('participantJoined', (event) => {
            this.handleParticipantJoined(event.detail);
        });

        document.addEventListener('participantLeft', (event) => {
            this.handleParticipantLeft(event.detail);
        });

        document.addEventListener('messageReceived', (event) => {
            this.handleMessageReceived(event.detail);
        });
    }

    setupUI() {
        // Initialize UI elements
        this.updateInputMode();
    }

    // Group Management
    async createGroup() {
        try {
            const groupName = document.getElementById('group-name')?.value;
            const adminLanguage = document.getElementById('admin-language')?.value;
            const maxParticipants = parseInt(document.getElementById('max-participants')?.value);

            if (!groupName || !adminLanguage) {
                this.showMessage('يرجى ملء جميع الحقول المطلوبة', 'error');
                return;
            }

            this.showLoading(true);

            // Create current user
            this.currentUser = {
                id: this.generateUserId(),
                name: 'المدير',
                language: adminLanguage,
                isAdmin: true
            };

            // Create group
            this.currentGroup = await this.groupService.createGroup(
                groupName,
                this.currentUser.id,
                adminLanguage
            );

            // Update group settings
            await this.groupService.updateGroupSettings({
                maxParticipants: maxParticipants
            });

            // Show group interface
            this.showGroupInterface();

            this.showLoading(false);

        } catch (error) {
            console.error('Error creating group:', error);
            this.showMessage('خطأ في إنشاء المجموعة: ' + error.message, 'error');
            this.showLoading(false);
        }
    }

    async joinGroup() {
        try {
            const groupId = document.getElementById('group-id')?.value;
            const participantName = document.getElementById('participant-name')?.value;
            const participantLanguage = document.getElementById('participant-language')?.value;

            if (!groupId || !participantName || !participantLanguage) {
                this.showMessage('يرجى ملء جميع الحقول المطلوبة', 'error');
                return;
            }

            this.showLoading(true);

            // Create current user
            this.currentUser = {
                id: this.generateUserId(),
                name: participantName,
                language: participantLanguage,
                isAdmin: false
            };

            // Join group
            await this.groupService.joinGroup(
                groupId,
                this.currentUser.id,
                participantName,
                participantLanguage
            );

            // Show group interface
            this.showGroupInterface();

            this.showLoading(false);

        } catch (error) {
            console.error('Error joining group:', error);
            this.showMessage('خطأ في الانضمام للمجموعة: ' + error.message, 'error');
            this.showLoading(false);
        }
    }

    async leaveGroup() {
        try {
            if (!this.currentGroup || !this.currentUser) {
                this.showMessage('لا توجد مجموعة نشطة', 'error');
                return;
            }

            await this.groupService.leaveGroup(this.currentUser.id);
            
            // Reset state
            this.currentGroup = null;
            this.currentUser = null;
            
            // Show setup interface
            this.showSetupInterface();

        } catch (error) {
            console.error('Error leaving group:', error);
            this.showMessage('خطأ في مغادرة المجموعة: ' + error.message, 'error');
        }
    }

    // Message Handling
    async sendMessage() {
        try {
            if (!this.currentGroup || !this.currentUser) {
                this.showMessage('لا توجد مجموعة نشطة', 'error');
                return;
            }

            const input = document.getElementById('group-message-input');
            const content = input?.value?.trim();

            if (!content) {
                this.showMessage('يرجى كتابة رسالة', 'error');
                return;
            }

            // Send message
            await this.groupService.sendMessage({
                senderId: this.currentUser.id,
                senderName: this.currentUser.name,
                content: content,
                type: this.inputMode,
                language: this.currentUser.language
            });

            // Clear input
            if (input) {
                input.value = '';
            }

        } catch (error) {
            console.error('Error sending message:', error);
            this.showMessage('خطأ في إرسال الرسالة: ' + error.message, 'error');
        }
    }

    // UI Management
    showSetupInterface() {
        document.getElementById('group-setup').style.display = 'block';
        document.getElementById('group-interface').style.display = 'none';
        document.getElementById('group-history').style.display = 'none';
    }

    showGroupInterface() {
        document.getElementById('group-setup').style.display = 'none';
        document.getElementById('group-interface').style.display = 'block';
        document.getElementById('group-history').style.display = 'none';
        
        // Update group info
        this.updateGroupInfo();
    }

    showGroupHistory() {
        document.getElementById('group-setup').style.display = 'none';
        document.getElementById('group-interface').style.display = 'none';
        document.getElementById('group-history').style.display = 'block';
        
        this.loadGroupHistory();
    }

    updateGroupInfo() {
        if (!this.currentGroup) return;

        const title = document.getElementById('group-title');
        const participantCount = document.getElementById('participant-count');
        const groupIdDisplay = document.getElementById('group-id-display');
        const sidebarParticipantCount = document.getElementById('sidebar-participant-count');

        if (title) title.textContent = this.currentGroup.name;
        if (participantCount) participantCount.textContent = `${this.currentGroup.participants.size} مشارك`;
        if (groupIdDisplay) groupIdDisplay.textContent = `ID: ${this.currentGroup.id}`;
        if (sidebarParticipantCount) sidebarParticipantCount.textContent = this.currentGroup.participants.size;
    }

    updateInputMode() {
        const messageInput = document.getElementById('group-message-input');
        const transcriptionArea = document.getElementById('group-transcription');

        if (this.inputMode === 'text') {
            if (messageInput) messageInput.style.display = 'block';
            if (transcriptionArea) transcriptionArea.style.display = 'none';
        } else if (this.inputMode === 'voice') {
            if (messageInput) messageInput.style.display = 'none';
            if (transcriptionArea) transcriptionArea.style.display = 'block';
        }
    }

    // Settings Management
    showGroupSettings() {
        const modal = document.getElementById('group-settings-modal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    hideGroupSettings() {
        const modal = document.getElementById('group-settings-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    async saveGroupSettings() {
        try {
            if (!this.currentGroup) {
                this.showMessage('لا توجد مجموعة نشطة', 'error');
                return;
            }

            const settings = {
                autoTranslate: document.getElementById('auto-translate')?.checked || false,
                allowVoiceMessages: document.getElementById('allow-voice-messages')?.checked || false,
                allowTextMessages: document.getElementById('allow-text-messages')?.checked || false,
                maxParticipants: parseInt(document.getElementById('max-participants-setting')?.value) || 10
            };

            await this.groupService.updateGroupSettings(settings);
            
            this.hideGroupSettings();
            this.showMessage('تم حفظ الإعدادات بنجاح', 'success');

        } catch (error) {
            console.error('Error saving group settings:', error);
            this.showMessage('خطأ في حفظ الإعدادات: ' + error.message, 'error');
        }
    }

    // History Management
    async loadGroupHistory() {
        try {
            await this.groupService.loadGroupHistory();
        } catch (error) {
            console.error('Error loading group history:', error);
        }
    }

    // Event Handlers
    handleGroupCreated(event) {
        console.log('Group created:', event);
        this.showMessage('تم إنشاء المجموعة بنجاح', 'success');
    }

    handleParticipantJoined(event) {
        console.log('Participant joined:', event);
        this.updateGroupInfo();
        this.showMessage(`${event.participantName} انضم إلى المجموعة`, 'info');
    }

    handleParticipantLeft(event) {
        console.log('Participant left:', event);
        this.updateGroupInfo();
        this.showMessage(`${event.participantName} غادر المجموعة`, 'info');
    }

    handleMessageReceived(event) {
        console.log('Message received:', event);
        // The group service will handle UI updates
    }

    // Utility Methods
    generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    showLoading(show) {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.display = show ? 'flex' : 'none';
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

// Initialize group conversation manager
let groupConversationManager;
document.addEventListener('DOMContentLoaded', async () => {
    groupConversationManager = new GroupConversationManager();
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
