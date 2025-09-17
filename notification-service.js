// Notification Service for Voice Translator Pro
// خدمة الإشعارات لمترجم الصوت الذكي

import { authService } from './auth-service.js';

export class NotificationService {
    constructor() {
        this.permission = 'default';
        this.isSupported = 'Notification' in window;
        this.notifications = new Map();
        this.settings = this.loadSettings();
        
        this.init();
    }

    async init() {
        if (this.isSupported) {
            this.permission = Notification.permission;
            await this.requestPermission();
        }
        
        this.setupEventListeners();
        this.setupServiceWorkerNotifications();
    }

    async requestPermission() {
        if (!this.isSupported) {
            console.warn('Notifications not supported');
            return false;
        }

        if (this.permission === 'default') {
            try {
                this.permission = await Notification.requestPermission();
                return this.permission === 'granted';
            } catch (error) {
                console.error('Error requesting notification permission:', error);
                return false;
            }
        }

        return this.permission === 'granted';
    }

    setupEventListeners() {
        // Listen for visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.handleAppHidden();
            } else {
                this.handleAppVisible();
            }
        });

        // Listen for online/offline events
        window.addEventListener('online', () => {
            this.showNotification('تم استعادة الاتصال بالإنترنت', 'success');
        });

        window.addEventListener('offline', () => {
            this.showNotification('تم فقدان الاتصال بالإنترنت', 'warning');
        });

        // Listen for translation events
        document.addEventListener('translationCompleted', (event) => {
            this.handleTranslationCompleted(event.detail);
        });

        document.addEventListener('translationError', (event) => {
            this.handleTranslationError(event.detail);
        });

        // Listen for favorite events
        document.addEventListener('favoriteAdded', (event) => {
            this.handleFavoriteAdded(event.detail);
        });

        // Listen for conversation events
        document.addEventListener('conversationStarted', (event) => {
            this.handleConversationStarted(event.detail);
        });

        document.addEventListener('conversationEnded', (event) => {
            this.handleConversationEnded(event.detail);
        });
    }

    setupServiceWorkerNotifications() {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            navigator.serviceWorker.ready.then(registration => {
                // Listen for push events
                navigator.serviceWorker.addEventListener('message', (event) => {
                    if (event.data.type === 'NOTIFICATION_RECEIVED') {
                        this.handlePushNotification(event.data);
                    }
                });
            });
        }
    }

    // Notification Methods
    async showNotification(title, body, options = {}) {
        if (!this.settings.enabled) return;

        const defaultOptions = {
            icon: '/assets/icon-192x192.png',
            badge: '/assets/icon-72x72.png',
            tag: 'voice-translator',
            requireInteraction: false,
            silent: false,
            vibrate: [100, 50, 100],
            data: {
                timestamp: Date.now(),
                source: 'voice-translator'
            }
        };

        const notificationOptions = { ...defaultOptions, ...options };

        try {
            if (this.isSupported && this.permission === 'granted') {
                const notification = new Notification(title, notificationOptions);
                
                // Store notification reference
                this.notifications.set(notificationOptions.tag, notification);
                
                // Auto close after 5 seconds unless requireInteraction is true
                if (!notificationOptions.requireInteraction) {
                    setTimeout(() => {
                        notification.close();
                    }, 5000);
                }

                // Handle notification click
                notification.onclick = (event) => {
                    event.preventDefault();
                    this.handleNotificationClick(notificationOptions);
                    notification.close();
                };

                // Handle notification close
                notification.onclose = () => {
                    this.notifications.delete(notificationOptions.tag);
                };

                return notification;
            } else {
                // Fallback to in-app notification
                this.showInAppNotification(title, body, options.type || 'info');
            }
        } catch (error) {
            console.error('Error showing notification:', error);
            // Fallback to in-app notification
            this.showInAppNotification(title, body, options.type || 'info');
        }
    }

    showInAppNotification(title, body, type = 'info') {
        const notificationEl = document.createElement('div');
        notificationEl.className = `in-app-notification notification-${type}`;
        notificationEl.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">
                    <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                </div>
                <div class="notification-text">
                    <div class="notification-title">${title}</div>
                    <div class="notification-body">${body}</div>
                </div>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // Add styles
        notificationEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            max-width: 400px;
            background: white;
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-xl);
            border-left: 4px solid var(--${type === 'success' ? 'success' : type === 'error' ? 'error' : type === 'warning' ? 'warning' : 'primary'}-color);
            animation: slideInRight 0.3s ease-out;
            font-family: var(--font-family);
        `;

        document.body.appendChild(notificationEl);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notificationEl.parentElement) {
                notificationEl.style.animation = 'slideOutRight 0.3s ease-out';
                setTimeout(() => {
                    notificationEl.remove();
                }, 300);
            }
        }, 5000);
    }

    // Event Handlers
    handleTranslationCompleted(translationData) {
        if (!this.settings.translationCompleted) return;

        const { sourceLang, targetLang, textLength } = translationData;
        const title = 'تمت الترجمة بنجاح';
        const body = `تم ترجمة ${textLength} حرف من ${this.getLanguageName(sourceLang)} إلى ${this.getLanguageName(targetLang)}`;

        this.showNotification(title, body, {
            type: 'success',
            tag: 'translation-completed',
            actions: [
                {
                    action: 'view',
                    title: 'عرض الترجمة',
                    icon: '/assets/icon-72x72.png'
                },
                {
                    action: 'save',
                    title: 'حفظ في المفضلة',
                    icon: '/assets/icon-72x72.png'
                }
            ]
        });
    }

    handleTranslationError(errorData) {
        if (!this.settings.translationError) return;

        const title = 'خطأ في الترجمة';
        const body = errorData.message || 'حدث خطأ غير متوقع أثناء الترجمة';

        this.showNotification(title, body, {
            type: 'error',
            tag: 'translation-error',
            requireInteraction: true,
            actions: [
                {
                    action: 'retry',
                    title: 'إعادة المحاولة',
                    icon: '/assets/icon-72x72.png'
                }
            ]
        });
    }

    handleFavoriteAdded(favoriteData) {
        if (!this.settings.favoriteAdded) return;

        const title = 'تم إضافة للمفضلة';
        const body = 'تم حفظ الترجمة في المفضلة بنجاح';

        this.showNotification(title, body, {
            type: 'success',
            tag: 'favorite-added'
        });
    }

    handleConversationStarted(conversationData) {
        if (!this.settings.conversationStarted) return;

        const { participant1Lang, participant2Lang } = conversationData;
        const title = 'بدأت المحادثة';
        const body = `محادثة بين ${this.getLanguageName(participant1Lang)} و ${this.getLanguageName(participant2Lang)}`;

        this.showNotification(title, body, {
            type: 'info',
            tag: 'conversation-started'
        });
    }

    handleConversationEnded(conversationData) {
        if (!this.settings.conversationEnded) return;

        const { duration, messageCount } = conversationData;
        const title = 'انتهت المحادثة';
        const body = `مدة المحادثة: ${duration} دقيقة، عدد الرسائل: ${messageCount}`;

        this.showNotification(title, body, {
            type: 'info',
            tag: 'conversation-ended'
        });
    }

    handleAppHidden() {
        // App is hidden, enable more notifications
        this.settings.showWhenHidden = true;
    }

    handleAppVisible() {
        // App is visible, reduce notifications
        this.settings.showWhenHidden = false;
        
        // Clear any pending notifications
        this.clearAllNotifications();
    }

    handleNotificationClick(options) {
        // Focus the app window
        window.focus();
        
        // Handle specific actions
        if (options.actions) {
            // Handle action buttons
            return;
        }

        // Default behavior - focus on relevant section
        if (options.tag === 'translation-completed') {
            // Scroll to translation result
            const translationOutput = document.getElementById('translation-output');
            if (translationOutput) {
                translationOutput.scrollIntoView({ behavior: 'smooth' });
            }
        } else if (options.tag === 'conversation-started') {
            // Navigate to conversation page
            window.location.href = 'dual-conversation.html';
        }
    }

    handlePushNotification(data) {
        const { title, body, options } = data;
        this.showNotification(title, body, options);
    }

    // Scheduled Notifications
    scheduleNotification(title, body, delay, options = {}) {
        return setTimeout(() => {
            this.showNotification(title, body, options);
        }, delay);
    }

    scheduleRecurringNotification(title, body, interval, options = {}) {
        return setInterval(() => {
            this.showNotification(title, body, options);
        }, interval);
    }

    // Notification Management
    clearNotification(tag) {
        const notification = this.notifications.get(tag);
        if (notification) {
            notification.close();
            this.notifications.delete(tag);
        }
    }

    clearAllNotifications() {
        this.notifications.forEach(notification => {
            notification.close();
        });
        this.notifications.clear();
    }

    // Settings Management
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.saveSettings();
    }

    loadSettings() {
        const defaultSettings = {
            enabled: true,
            translationCompleted: true,
            translationError: true,
            favoriteAdded: true,
            conversationStarted: true,
            conversationEnded: true,
            showWhenHidden: true,
            sound: true,
            vibration: true
        };

        try {
            const saved = localStorage.getItem('notification-settings');
            return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
        } catch (error) {
            console.error('Error loading notification settings:', error);
            return defaultSettings;
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('notification-settings', JSON.stringify(this.settings));
        } catch (error) {
            console.error('Error saving notification settings:', error);
        }
    }

    // Utility Methods
    getNotificationIcon(type) {
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
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
            'et': 'Eesti',
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

    // Analytics
    async logNotificationEvent(eventType, data = {}) {
        try {
            await authService.logAuthEvent('notification_event', {
                type: eventType,
                ...data
            });
        } catch (error) {
            console.error('Error logging notification event:', error);
        }
    }

    // Test Methods
    testNotification() {
        this.showNotification('اختبار الإشعارات', 'هذا إشعار تجريبي للتأكد من عمل النظام', {
            type: 'info',
            tag: 'test-notification'
        });
    }

    testInAppNotification() {
        this.showInAppNotification('اختبار الإشعارات الداخلية', 'هذا إشعار تجريبي للتأكد من عمل النظام', 'info');
    }
}

// Export notification service instance
export const notificationService = new NotificationService();

// Add CSS for in-app notifications
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

    .in-app-notification {
        font-family: var(--font-family);
    }

    .notification-content {
        display: flex;
        align-items: center;
        padding: var(--spacing-4);
        gap: var(--spacing-3);
    }

    .notification-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: var(--font-size-lg);
    }

    .notification-success .notification-icon {
        background: var(--success-color);
    }

    .notification-error .notification-icon {
        background: var(--error-color);
    }

    .notification-warning .notification-icon {
        background: var(--warning-color);
    }

    .notification-info .notification-icon {
        background: var(--primary-color);
    }

    .notification-text {
        flex: 1;
    }

    .notification-title {
        font-weight: 600;
        font-size: var(--font-size-base);
        color: var(--gray-800);
        margin-bottom: var(--spacing-1);
    }

    .notification-body {
        font-size: var(--font-size-sm);
        color: var(--gray-600);
        line-height: 1.4;
    }

    .notification-close {
        background: none;
        border: none;
        color: var(--gray-400);
        cursor: pointer;
        padding: var(--spacing-1);
        border-radius: var(--radius-sm);
        transition: all var(--transition-fast);
    }

    .notification-close:hover {
        color: var(--gray-600);
        background: var(--gray-100);
    }
`;
document.head.appendChild(style);
