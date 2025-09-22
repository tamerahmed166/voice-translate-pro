// Enhanced Conversation Features for Voice Translator Pro
// ميزات المحادثة المحسنة لمترجم الصوت الذكي

class EnhancedConversationFeatures {
    constructor() {
        this.webrtc = null;
        this.peerConnections = new Map();
        this.localStream = null;
        this.remoteStreams = new Map();
        this.translationService = null;
        this.isInitialized = false;
        
        this.init();
    }
    
    async init() {
        try {
            await this.initializeWebRTC();
            await this.initializeTranslationService();
            this.setupEventListeners();
            this.isInitialized = true;
            console.log('Enhanced conversation features initialized');
        } catch (error) {
            console.error('Failed to initialize enhanced features:', error);
        }
    }
    
    async initializeWebRTC() {
        // Initialize WebRTC for video/audio communication
        this.webrtc = {
            configuration: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ]
            }
        };
    }
    
    async initializeTranslationService() {
        // Initialize real-time translation service
        this.translationService = {
            enabled: true,
            languages: new Map(),
            activeTranslations: new Map()
        };
    }
    
    setupEventListeners() {
        // Video conference event listeners
        this.setupVideoConferenceListeners();
        
        // Group management listeners
        this.setupGroupManagementListeners();
        
        // Real-time translation listeners
        this.setupTranslationListeners();
    }
    
    setupVideoConferenceListeners() {
        // Video toggle
        document.addEventListener('click', (e) => {
            if (e.target.closest('#toggle-video')) {
                this.toggleVideo();
            }
        });
        
        // Audio toggle
        document.addEventListener('click', (e) => {
            if (e.target.closest('#toggle-audio')) {
                this.toggleAudio();
            }
        });
        
        // Screen share toggle
        document.addEventListener('click', (e) => {
            if (e.target.closest('#toggle-screen-share')) {
                this.toggleScreenShare();
            }
        });
    }
    
    setupGroupManagementListeners() {
        // Invite participants
        document.addEventListener('click', (e) => {
            if (e.target.closest('#invite-participants')) {
                this.showInviteDialog();
            }
        });
        
        // Conference settings
        document.addEventListener('click', (e) => {
            if (e.target.closest('#conference-settings')) {
                this.showConferenceSettings();
            }
        });
    }
    
    setupTranslationListeners() {
        // Translation toggle
        document.addEventListener('click', (e) => {
            if (e.target.closest('#toggle-translation')) {
                this.toggleTranslation();
            }
        });
    }
    
    // Video Conference Methods
    
    async startVideoConference() {
        try {
            // Get user media
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            
            // Display local video
            this.displayLocalVideo();
            
            // Initialize peer connections
            await this.initializePeerConnections();
            
            console.log('Video conference started');
        } catch (error) {
            console.error('Error starting video conference:', error);
            throw error;
        }
    }
    
    displayLocalVideo() {
        const videoGrid = document.getElementById('video-grid');
        if (videoGrid) {
            const localVideoContainer = document.createElement('div');
            localVideoContainer.className = 'video-container local-video';
            localVideoContainer.innerHTML = `
                <video id="local-video" autoplay muted playsinline></video>
                <div class="video-overlay">
                    <div class="participant-name">أنت</div>
                    <div class="participant-status">
                        <div class="status-indicator"></div>
                    </div>
                </div>
            `;
            
            videoGrid.appendChild(localVideoContainer);
            
            const localVideo = document.getElementById('local-video');
            if (localVideo) {
                localVideo.srcObject = this.localStream;
            }
        }
    }
    
    async initializePeerConnections() {
        // Initialize WebRTC peer connections for each participant
        // This would typically connect to a signaling server
        console.log('Initializing peer connections...');
    }
    
    async toggleVideo() {
        if (this.localStream) {
            const videoTracks = this.localStream.getVideoTracks();
            videoTracks.forEach(track => {
                track.enabled = !track.enabled;
            });
            
            this.updateVideoButton(videoTracks[0].enabled);
        }
    }
    
    async toggleAudio() {
        if (this.localStream) {
            const audioTracks = this.localStream.getAudioTracks();
            audioTracks.forEach(track => {
                track.enabled = !track.enabled;
            });
            
            this.updateAudioButton(audioTracks[0].enabled);
        }
    }
    
    async toggleScreenShare() {
        try {
            if (this.isScreenSharing) {
                await this.stopScreenShare();
            } else {
                await this.startScreenShare();
            }
        } catch (error) {
            console.error('Error toggling screen share:', error);
        }
    }
    
    async startScreenShare() {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true
            });
            
            // Replace video track with screen share
            if (this.localStream) {
                const videoTrack = screenStream.getVideoTracks()[0];
                const sender = this.localStream.getVideoTracks()[0];
                if (sender) {
                    sender.replaceTrack(videoTrack);
                }
            }
            
            this.isScreenSharing = true;
            this.updateScreenShareButton(true);
            
            // Handle screen share end
            screenStream.getVideoTracks()[0].onended = () => {
                this.stopScreenShare();
            };
            
        } catch (error) {
            console.error('Error starting screen share:', error);
            throw error;
        }
    }
    
    async stopScreenShare() {
        if (this.localStream) {
            const videoTracks = this.localStream.getVideoTracks();
            videoTracks.forEach(track => {
                track.stop();
            });
        }
        
        this.isScreenSharing = false;
        this.updateScreenShareButton(false);
    }
    
    updateVideoButton(enabled) {
        const videoBtn = document.getElementById('toggle-video');
        if (videoBtn) {
            const icon = videoBtn.querySelector('i');
            const span = videoBtn.querySelector('span');
            
            if (enabled) {
                icon.className = 'fas fa-video';
                span.textContent = 'فيديو';
                videoBtn.classList.add('active');
            } else {
                icon.className = 'fas fa-video-slash';
                span.textContent = 'إيقاف الفيديو';
                videoBtn.classList.remove('active');
            }
        }
    }
    
    updateAudioButton(enabled) {
        const audioBtn = document.getElementById('toggle-audio');
        if (audioBtn) {
            const icon = audioBtn.querySelector('i');
            const span = audioBtn.querySelector('span');
            
            if (enabled) {
                icon.className = 'fas fa-microphone';
                span.textContent = 'صوت';
                audioBtn.classList.add('active');
            } else {
                icon.className = 'fas fa-microphone-slash';
                span.textContent = 'إيقاف الصوت';
                audioBtn.classList.remove('active');
            }
        }
    }
    
    updateScreenShareButton(enabled) {
        const screenShareBtn = document.getElementById('toggle-screen-share');
        if (screenShareBtn) {
            const icon = screenShareBtn.querySelector('i');
            const span = screenShareBtn.querySelector('span');
            
            if (enabled) {
                icon.className = 'fas fa-desktop';
                span.textContent = 'مشاركة الشاشة';
                screenShareBtn.classList.add('active');
            } else {
                icon.className = 'fas fa-desktop';
                span.textContent = 'مشاركة الشاشة';
                screenShareBtn.classList.remove('active');
            }
        }
    }
    
    // Group Management Methods
    
    showInviteDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'invite-dialog';
        dialog.innerHTML = `
            <div class="dialog-content">
                <h3>دعوة المشاركين</h3>
                <div class="invite-options">
                    <div class="invite-link">
                        <label>رابط الدعوة:</label>
                        <div class="link-container">
                            <input type="text" id="invite-link" readonly>
                            <button class="btn btn-outline" id="copy-link">
                                <i class="fas fa-copy"></i>
                            </button>
                        </div>
                    </div>
                    <div class="invite-email">
                        <label>إرسال دعوة بالبريد الإلكتروني:</label>
                        <div class="email-container">
                            <input type="email" id="invite-email" placeholder="البريد الإلكتروني">
                            <button class="btn btn-primary" id="send-invite">
                                <i class="fas fa-paper-plane"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="dialog-actions">
                    <button class="btn btn-outline" id="close-invite">إغلاق</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // Generate invite link
        const inviteLink = this.generateInviteLink();
        document.getElementById('invite-link').value = inviteLink;
        
        // Setup event listeners
        document.getElementById('copy-link').addEventListener('click', () => {
            navigator.clipboard.writeText(inviteLink);
            this.showNotification('تم النسخ', 'تم نسخ رابط الدعوة', 'success');
        });
        
        document.getElementById('send-invite').addEventListener('click', () => {
            const email = document.getElementById('invite-email').value;
            if (email) {
                this.sendEmailInvite(email, inviteLink);
            }
        });
        
        document.getElementById('close-invite').addEventListener('click', () => {
            document.body.removeChild(dialog);
        });
    }
    
    showConferenceSettings() {
        const dialog = document.createElement('div');
        dialog.className = 'settings-dialog';
        dialog.innerHTML = `
            <div class="dialog-content">
                <h3>إعدادات المحادثة</h3>
                <div class="settings-options">
                    <div class="setting-item">
                        <label>جودة الفيديو:</label>
                        <select id="video-quality">
                            <option value="low">منخفضة</option>
                            <option value="medium" selected>متوسطة</option>
                            <option value="high">عالية</option>
                        </select>
                    </div>
                    <div class="setting-item">
                        <label>جودة الصوت:</label>
                        <select id="audio-quality">
                            <option value="low">منخفضة</option>
                            <option value="medium" selected>متوسطة</option>
                            <option value="high">عالية</option>
                        </select>
                    </div>
                    <div class="setting-item">
                        <label>
                            <input type="checkbox" id="auto-translate" checked>
                            الترجمة التلقائية
                        </label>
                    </div>
                    <div class="setting-item">
                        <label>
                            <input type="checkbox" id="noise-cancellation" checked>
                            إلغاء الضوضاء
                        </label>
                    </div>
                </div>
                <div class="dialog-actions">
                    <button class="btn btn-primary" id="save-settings">حفظ</button>
                    <button class="btn btn-outline" id="close-settings">إغلاق</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // Setup event listeners
        document.getElementById('save-settings').addEventListener('click', () => {
            this.saveConferenceSettings();
            document.body.removeChild(dialog);
        });
        
        document.getElementById('close-settings').addEventListener('click', () => {
            document.body.removeChild(dialog);
        });
    }
    
    generateInviteLink() {
        const roomId = this.generateRoomId();
        return `${window.location.origin}${window.location.pathname}?join=${roomId}`;
    }
    
    generateRoomId() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
    
    async sendEmailInvite(email, link) {
        try {
            // This would typically send an email through a backend service
            console.log('Sending invite to:', email, 'Link:', link);
            this.showNotification('تم الإرسال', 'تم إرسال الدعوة بالبريد الإلكتروني', 'success');
        } catch (error) {
            console.error('Error sending email invite:', error);
            this.showNotification('خطأ', 'فشل في إرسال الدعوة', 'error');
        }
    }
    
    saveConferenceSettings() {
        const videoQuality = document.getElementById('video-quality').value;
        const audioQuality = document.getElementById('audio-quality').value;
        const autoTranslate = document.getElementById('auto-translate').checked;
        const noiseCancellation = document.getElementById('noise-cancellation').checked;
        
        const settings = {
            videoQuality,
            audioQuality,
            autoTranslate,
            noiseCancellation
        };
        
        localStorage.setItem('conference-settings', JSON.stringify(settings));
        this.showNotification('تم الحفظ', 'تم حفظ الإعدادات', 'success');
    }
    
    // Real-time Translation Methods
    
    toggleTranslation() {
        this.translationService.enabled = !this.translationService.enabled;
        this.updateTranslationButton();
        
        const message = this.translationService.enabled ? 'تم تفعيل الترجمة الفورية' : 'تم إيقاف الترجمة الفورية';
        this.showNotification('إشعار', message, 'info');
    }
    
    updateTranslationButton() {
        const translationBtn = document.getElementById('toggle-translation');
        if (translationBtn) {
            const icon = translationBtn.querySelector('i');
            const span = translationBtn.querySelector('span');
            
            if (this.translationService.enabled) {
                icon.className = 'fas fa-language';
                span.textContent = 'ترجمة';
                translationBtn.classList.add('active');
            } else {
                icon.className = 'fas fa-language';
                span.textContent = 'إيقاف الترجمة';
                translationBtn.classList.remove('active');
            }
        }
    }
    
    async processRealTimeTranslation(audioData, language) {
        if (!this.translationService.enabled) return;
        
        try {
            // Convert audio to text
            const text = await this.speechToText(audioData, language);
            
            if (text) {
                // Translate text
                const translation = await this.translateText(text, language, this.getTargetLanguage());
                
                // Display translation
                this.displayRealTimeTranslation(text, translation, language);
            }
        } catch (error) {
            console.error('Error in real-time translation:', error);
        }
    }
    
    async speechToText(audioData, language) {
        // This would typically use a speech recognition service
        // For now, return a mock result
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve('مرحبا، كيف حالك؟');
            }, 1000);
        });
    }
    
    async translateText(text, sourceLanguage, targetLanguage) {
        // This would typically use a translation service
        // For now, return a mock result
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve('Hello, how are you?');
            }, 500);
        });
    }
    
    displayRealTimeTranslation(originalText, translatedText, sourceLanguage) {
        const translationContent = document.getElementById('translation-content');
        if (translationContent) {
            const translationItem = document.createElement('div');
            translationItem.className = 'translation-item';
            translationItem.innerHTML = `
                <div class="translation-text">${translatedText}</div>
                <div class="translation-meta">
                    <span class="translation-language">${this.getLanguageName(sourceLanguage)}</span>
                    <span class="translation-timestamp">${new Date().toLocaleTimeString('ar-SA')}</span>
                </div>
            `;
            
            translationContent.appendChild(translationItem);
            
            // Keep only last 10 translations
            const items = translationContent.querySelectorAll('.translation-item');
            if (items.length > 10) {
                items[0].remove();
            }
        }
    }
    
    getLanguageName(code) {
        const languages = {
            'ar': 'العربية', 'en': 'English', 'fr': 'Français', 'es': 'Español',
            'de': 'Deutsch', 'it': 'Italiano', 'pt': 'Português', 'ru': 'Русский',
            'zh': '中文', 'ja': '日本語', 'ko': '한국어', 'hi': 'हिन्दी'
        };
        return languages[code] || code;
    }
    
    getTargetLanguage() {
        const targetSelect = document.getElementById('participant2-lang');
        return targetSelect ? targetSelect.value : 'en';
    }
    
    // Utility Methods
    
    showNotification(title, message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <div class="notification-text">
                    <h4>${title}</h4>
                    <p>${message}</p>
                </div>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }
    
    getNotificationIcon(type) {
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
}

// Initialize enhanced features
let enhancedFeatures;
document.addEventListener('DOMContentLoaded', async () => {
    enhancedFeatures = new EnhancedConversationFeatures();
});

// Export for use in other modules
window.EnhancedConversationFeatures = EnhancedConversationFeatures;
