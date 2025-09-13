// Voice Translator Pro - Configuration File
// إعدادات التطبيق المتقدمة

const AppConfig = {
    // إعدادات الترجمة
    translation: {
        // API endpoints
        googleTranslateAPI: 'https://translate.googleapis.com/translate_a/single',
        // Fallback APIs
        fallbackAPIs: [
            'https://api.mymemory.translated.net/get',
            'https://libretranslate.de/translate'
        ],
        // إعدادات الترجمة
        maxTextLength: 5000,
        maxImageSize: 10 * 1024 * 1024, // 10MB
        supportedImageFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        // إعدادات الترجمة الصوتية
        speechRecognition: {
            continuous: false,
            interimResults: true,
            maxAlternatives: 1,
            timeout: 10000
        },
        // إعدادات النطق
        speechSynthesis: {
            rate: 0.9,
            pitch: 1,
            volume: 1
        }
    },

    // إعدادات PWA
    pwa: {
        name: 'مترجم الصوت الذكي',
        shortName: 'Voice Translator',
        description: 'تطبيق ويب متقدم للترجمة الصوتية والنصية',
        themeColor: '#4F46E5',
        backgroundColor: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        startUrl: '/',
        scope: '/',
        // إعدادات التثبيت
        installPrompt: {
            showAfter: 30000, // 30 seconds
            showOnPages: ['index.html', 'translate.html']
        }
    },

    // إعدادات التخزين
    storage: {
        // إعدادات localStorage
        localStorage: {
            recentTranslations: 'voice-translator-recent',
            favorites: 'voice-translator-favorites',
            settings: 'voice-translator-settings',
            history: 'voice-translator-history'
        },
        // حدود التخزين
        limits: {
            maxRecentTranslations: 50,
            maxFavorites: 100,
            maxHistory: 200
        }
    },

    // إعدادات الواجهة
    ui: {
        // إعدادات الرسائل
        notifications: {
            duration: 3000,
            position: 'top-right',
            types: {
                success: { color: '#4CAF50', icon: 'check-circle' },
                error: { color: '#f44336', icon: 'exclamation-circle' },
                warning: { color: '#ff9800', icon: 'exclamation-triangle' },
                info: { color: '#2196F3', icon: 'info-circle' }
            }
        },
        // إعدادات التحميل
        loading: {
            spinner: 'default',
            message: 'جاري الترجمة...',
            timeout: 30000
        },
        // إعدادات اللغة
        language: {
            default: 'ar',
            fallback: 'en',
            rtl: ['ar', 'he', 'fa', 'ur']
        }
    },

    // إعدادات الأمان
    security: {
        // إعدادات CORS
        cors: {
            allowedOrigins: ['*'],
            allowedMethods: ['GET', 'POST', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization']
        },
        // إعدادات التشفير
        encryption: {
            algorithm: 'AES-256-GCM',
            keyLength: 32
        }
    },

    // إعدادات الأداء
    performance: {
        // إعدادات التخزين المؤقت
        cache: {
            maxAge: 86400, // 24 hours
            maxSize: 50 * 1024 * 1024 // 50MB
        },
        // إعدادات الضغط
        compression: {
            gzip: true,
            brotli: true
        },
        // إعدادات التحميل المتقدم
        lazyLoading: {
            images: true,
            scripts: true,
            styles: true
        }
    },

    // إعدادات التطوير
    development: {
        // إعدادات التصحيح
        debug: {
            enabled: false,
            level: 'info',
            console: true
        },
        // إعدادات الاختبار
        testing: {
            mockAPI: false,
            mockOCR: false,
            mockSpeech: false
        }
    },

    // إعدادات التكامل
    integrations: {
        // Google Services
        google: {
            translateAPI: {
                enabled: true,
                quota: 1000000, // 1M characters per day
                rateLimit: 100 // requests per minute
            },
            speechAPI: {
                enabled: true,
                quota: 60000, // 60 minutes per month
                rateLimit: 10 // requests per minute
            }
        },
        // Microsoft Services
        microsoft: {
            translatorAPI: {
                enabled: false,
                endpoint: 'https://api.cognitive.microsofttranslator.com/translate',
                quota: 2000000 // 2M characters per month
            }
        },
        // Amazon Services
        amazon: {
            pollyAPI: {
                enabled: false,
                endpoint: 'https://polly.us-east-1.amazonaws.com',
                quota: 5000000 // 5M characters per month
            }
        }
    },

    // إعدادات الإحصائيات
    analytics: {
        // Google Analytics
        googleAnalytics: {
            enabled: false,
            trackingId: 'GA_TRACKING_ID'
        },
        // إحصائيات التطبيق
        appAnalytics: {
            enabled: true,
            trackTranslations: true,
            trackErrors: true,
            trackPerformance: true
        }
    },

    // إعدادات الإشعارات
    notifications: {
        // Push Notifications
        push: {
            enabled: false,
            vapidKey: 'VAPID_PUBLIC_KEY',
            endpoint: 'https://fcm.googleapis.com/fcm/send'
        },
        // Browser Notifications
        browser: {
            enabled: true,
            permission: 'default'
        }
    },

    // إعدادات النسخ الاحتياطي
    backup: {
        // النسخ الاحتياطي المحلي
        local: {
            enabled: true,
            frequency: 'daily',
            maxBackups: 7
        },
        // النسخ الاحتياطي السحابي
        cloud: {
            enabled: false,
            provider: 'google-drive',
            frequency: 'weekly'
        }
    }
};

// إعدادات البيئة
const EnvironmentConfig = {
    development: {
        ...AppConfig,
        development: {
            ...AppConfig.development,
            debug: {
                ...AppConfig.development.debug,
                enabled: true
            }
        }
    },
    production: {
        ...AppConfig,
        development: {
            ...AppConfig.development,
            debug: {
                ...AppConfig.development.debug,
                enabled: false
            }
        }
    }
};

// تحديد البيئة الحالية
const currentEnvironment = window.location.hostname === 'localhost' ? 'development' : 'production';

// تصدير الإعدادات
window.AppConfig = EnvironmentConfig[currentEnvironment];

// تصدير للاستخدام في الوحدات
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppConfig;
}
