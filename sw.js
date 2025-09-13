// Voice Translator Service Worker
// Provides offline functionality and caching for the PWA

const CACHE_NAME = 'voice-translator-v1.0.0';
const STATIC_CACHE_NAME = 'voice-translator-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'voice-translator-dynamic-v1.0.0';

// Files to cache for offline functionality
const STATIC_FILES = [
    '/',
    '/index.html',
    '/translate.html',
    '/dual-conversation.html',
    '/smart-translate.html',
    '/settings.html',
    '/welcome.html',
    '/login.html',
    '/styles.css',
    '/translate-styles.css',
    '/conversation-styles.css',
    '/login-styles.css',
    '/script.js',
    '/translate-script.js',
    '/conversation-script.js',
    '/login-script.js',
    '/manifest.json',
    '/assets/icon-192x192.png',
    '/assets/icon-512x512.png',
    'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// API endpoints that should be cached
const API_CACHE_PATTERNS = [
    /^https:\/\/api\.google\.com\/translate/,
    /^https:\/\/api\.microsoft\.com\/translator/,
    /^https:\/\/api\.amazon\.com\/translate/,
    /^https:\/\/api\.deepl\.com\/v2\/translate/
];

// Install event - cache static files
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('Service Worker: Static files cached successfully');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Service Worker: Error caching static files:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE_NAME && 
                            cacheName !== DYNAMIC_CACHE_NAME &&
                            cacheName.startsWith('voice-translator-')) {
                            console.log('Service Worker: Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Activated successfully');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Handle different types of requests
    if (isStaticFile(request.url)) {
        // Static files - cache first strategy
        event.respondWith(cacheFirst(request));
    } else if (isAPIRequest(request.url)) {
        // API requests - network first strategy
        event.respondWith(networkFirst(request));
    } else if (isPageRequest(request.url)) {
        // Page requests - network first with fallback
        event.respondWith(networkFirstWithFallback(request));
    } else {
        // Other requests - network first
        event.respondWith(networkFirst(request));
    }
});

// Cache first strategy for static files
async function cacheFirst(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.error('Cache first strategy failed:', error);
        return new Response('Offline content not available', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Network first strategy for API requests
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.log('Network failed, trying cache:', error);
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return offline response for API requests
        return new Response(JSON.stringify({
            error: 'Offline',
            message: 'Translation service is currently unavailable. Please check your internet connection.'
        }), {
            status: 503,
            statusText: 'Service Unavailable',
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}

// Network first with fallback for page requests
async function networkFirstWithFallback(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.log('Network failed, trying cache:', error);
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Fallback to index.html for SPA routing
        if (request.destination === 'document') {
            const fallbackResponse = await caches.match('/index.html');
            if (fallbackResponse) {
                return fallbackResponse;
            }
        }
        
        return new Response('Page not available offline', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Helper functions
function isStaticFile(url) {
    return STATIC_FILES.includes(url) || 
           url.includes('/assets/') ||
           url.includes('.css') ||
           url.includes('.js') ||
           url.includes('.png') ||
           url.includes('.jpg') ||
           url.includes('.jpeg') ||
           url.includes('.gif') ||
           url.includes('.svg') ||
           url.includes('.woff') ||
           url.includes('.woff2') ||
           url.includes('.ttf') ||
           url.includes('.eot');
}

function isAPIRequest(url) {
    return API_CACHE_PATTERNS.some(pattern => pattern.test(url)) ||
           url.includes('/api/') ||
           url.includes('translate') ||
           url.includes('speech') ||
           url.includes('ocr');
}

function isPageRequest(url) {
    return url.endsWith('.html') || 
           url.endsWith('/') ||
           !url.includes('.');
}

// Background sync for offline translations
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync-translations') {
        event.waitUntil(doBackgroundSync());
    }
});

async function doBackgroundSync() {
    try {
        // Get pending translations from IndexedDB
        const pendingTranslations = await getPendingTranslations();
        
        for (const translation of pendingTranslations) {
            try {
                const response = await fetch('/api/translate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(translation)
                });
                
                if (response.ok) {
                    // Remove from pending queue
                    await removePendingTranslation(translation.id);
                    // Notify client of successful sync
                    await notifyClient('translation-synced', translation);
                }
            } catch (error) {
                console.error('Failed to sync translation:', error);
            }
        }
    } catch (error) {
        console.error('Background sync failed:', error);
    }
}

// Push notifications for translation updates
self.addEventListener('push', event => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/assets/icon-192x192.png',
            badge: '/assets/icon-72x72.png',
            vibrate: [100, 50, 100],
            data: data.data,
            actions: [
                {
                    action: 'open',
                    title: 'فتح التطبيق',
                    icon: '/assets/icon-72x72.png'
                },
                {
                    action: 'close',
                    title: 'إغلاق',
                    icon: '/assets/icon-72x72.png'
                }
            ]
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    if (event.action === 'open') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Message handling from main thread
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CACHE_TRANSLATION') {
        cacheTranslation(event.data.translation);
    }
    
    if (event.data && event.data.type === 'GET_CACHE_SIZE') {
        getCacheSize().then(size => {
            event.ports[0].postMessage({ size });
        });
    }
});

// Cache management functions
async function cacheTranslation(translation) {
    try {
        const cache = await caches.open(DYNAMIC_CACHE_NAME);
        const response = new Response(JSON.stringify(translation), {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        await cache.put(`/api/translation/${translation.id}`, response);
    } catch (error) {
        console.error('Failed to cache translation:', error);
    }
}

async function getCacheSize() {
    try {
        const cacheNames = await caches.keys();
        let totalSize = 0;
        
        for (const cacheName of cacheNames) {
            const cache = await caches.open(cacheName);
            const keys = await cache.keys();
            totalSize += keys.length;
        }
        
        return totalSize;
    } catch (error) {
        console.error('Failed to get cache size:', error);
        return 0;
    }
}

// IndexedDB helpers for offline storage
async function getPendingTranslations() {
    // Implementation would use IndexedDB
    // This is a placeholder for the actual implementation
    return [];
}

async function removePendingTranslation(id) {
    // Implementation would use IndexedDB
    // This is a placeholder for the actual implementation
}

async function notifyClient(type, data) {
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
        client.postMessage({ type, data });
    });
}

// Periodic background sync (if supported)
if ('periodicSync' in self.registration) {
    self.addEventListener('periodicsync', event => {
        if (event.tag === 'translation-sync') {
            event.waitUntil(doBackgroundSync());
        }
    });
}

console.log('Service Worker: Loaded successfully');

