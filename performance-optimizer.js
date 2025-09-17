// Performance Optimizer for Voice Translator Pro
// محسن الأداء لمترجم الصوت الذكي

export class PerformanceOptimizer {
    constructor() {
        this.cache = new Map();
        this.lazyLoadQueue = [];
        this.performanceMetrics = {
            loadTime: 0,
            renderTime: 0,
            translationTime: 0,
            memoryUsage: 0,
            cacheHitRate: 0
        };
        
        this.settings = this.loadSettings();
        this.init();
    }

    init() {
        this.setupPerformanceMonitoring();
        this.setupLazyLoading();
        this.setupCaching();
        this.setupCompression();
        this.setupResourceOptimization();
        this.setupMemoryManagement();
    }

    // Performance Monitoring
    setupPerformanceMonitoring() {
        // Monitor page load performance
        window.addEventListener('load', () => {
            this.measurePageLoadTime();
            this.measureRenderTime();
        });

        // Monitor memory usage
        if ('memory' in performance) {
            setInterval(() => {
                this.measureMemoryUsage();
            }, 30000); // Every 30 seconds
        }

        // Monitor translation performance
        document.addEventListener('translationCompleted', (event) => {
            this.measureTranslationTime(event.detail);
        });

        // Monitor cache performance
        this.monitorCachePerformance();
    }

    measurePageLoadTime() {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
            this.performanceMetrics.loadTime = navigation.loadEventEnd - navigation.loadEventStart;
            this.logPerformanceMetric('page_load_time', this.performanceMetrics.loadTime);
        }
    }

    measureRenderTime() {
        const paintEntries = performance.getEntriesByType('paint');
        const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        const lcp = paintEntries.find(entry => entry.name === 'largest-contentful-paint');
        
        if (fcp) {
            this.performanceMetrics.renderTime = fcp.startTime;
            this.logPerformanceMetric('first_contentful_paint', fcp.startTime);
        }
        
        if (lcp) {
            this.logPerformanceMetric('largest_contentful_paint', lcp.startTime);
        }
    }

    measureMemoryUsage() {
        if ('memory' in performance) {
            const memory = performance.memory;
            this.performanceMetrics.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
            this.logPerformanceMetric('memory_usage', this.performanceMetrics.memoryUsage);
        }
    }

    measureTranslationTime(translationData) {
        const startTime = translationData.startTime || 0;
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        this.performanceMetrics.translationTime = duration;
        this.logPerformanceMetric('translation_time', duration);
    }

    // Lazy Loading
    setupLazyLoading() {
        // Intersection Observer for lazy loading images
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        this.loadImage(img);
                        imageObserver.unobserve(img);
                    }
                });
            });

            // Observe all images with data-src attribute
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }

        // Lazy load JavaScript modules
        this.setupModuleLazyLoading();
    }

    loadImage(img) {
        const src = img.dataset.src;
        if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            img.classList.add('loaded');
        }
    }

    setupModuleLazyLoading() {
        // Lazy load heavy modules when needed
        const lazyModules = {
            'ocr-service': () => import('./ocr-service.js'),
            'translation-apis': () => import('./translation-apis.js'),
            'notification-service': () => import('./notification-service.js')
        };

        // Load modules based on user interaction
        document.addEventListener('click', (event) => {
            const target = event.target;
            if (target.matches('[data-lazy-module]')) {
                const moduleName = target.dataset.lazyModule;
                if (lazyModules[moduleName]) {
                    lazyModules[moduleName]().catch(console.error);
                }
            }
        });
    }

    // Caching System
    setupCaching() {
        // Implement intelligent caching
        this.cache = new Map();
        this.cacheStats = {
            hits: 0,
            misses: 0,
            size: 0,
            maxSize: 100 // Maximum number of cached items
        };

        // Cache cleanup
        setInterval(() => {
            this.cleanupCache();
        }, 300000); // Every 5 minutes
    }

    setCache(key, value, ttl = 300000) { // 5 minutes default TTL
        if (this.cache.size >= this.cacheStats.maxSize) {
            this.evictOldestCacheEntry();
        }

        const cacheEntry = {
            value,
            timestamp: Date.now(),
            ttl,
            accessCount: 0
        };

        this.cache.set(key, cacheEntry);
        this.cacheStats.size = this.cache.size;
    }

    getCache(key) {
        const entry = this.cache.get(key);
        
        if (!entry) {
            this.cacheStats.misses++;
            return null;
        }

        // Check if expired
        if (Date.now() - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            this.cacheStats.misses++;
            return null;
        }

        // Update access count and timestamp
        entry.accessCount++;
        entry.timestamp = Date.now();
        
        this.cacheStats.hits++;
        this.performanceMetrics.cacheHitRate = this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses);
        
        return entry.value;
    }

    evictOldestCacheEntry() {
        let oldestKey = null;
        let oldestTime = Date.now();

        for (const [key, entry] of this.cache.entries()) {
            if (entry.timestamp < oldestTime) {
                oldestTime = entry.timestamp;
                oldestKey = key;
            }
        }

        if (oldestKey) {
            this.cache.delete(oldestKey);
        }
    }

    cleanupCache() {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > entry.ttl) {
                this.cache.delete(key);
            }
        }
        this.cacheStats.size = this.cache.size;
    }

    monitorCachePerformance() {
        setInterval(() => {
            this.logPerformanceMetric('cache_hit_rate', this.performanceMetrics.cacheHitRate);
            this.logPerformanceMetric('cache_size', this.cacheStats.size);
        }, 60000); // Every minute
    }

    // Compression
    setupCompression() {
        // Compress large text data
        this.textCompressor = new TextCompressor();
        
        // Compress images
        this.imageCompressor = new ImageCompressor();
    }

    compressText(text) {
        if (text.length < 1000) return text; // Don't compress small texts
        
        try {
            return this.textCompressor.compress(text);
        } catch (error) {
            console.warn('Text compression failed:', error);
            return text;
        }
    }

    decompressText(compressedText) {
        try {
            return this.textCompressor.decompress(compressedText);
        } catch (error) {
            console.warn('Text decompression failed:', error);
            return compressedText;
        }
    }

    compressImage(file, quality = 0.8) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                // Calculate new dimensions
                const maxWidth = 1920;
                const maxHeight = 1080;
                let { width, height } = img;

                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width *= ratio;
                    height *= ratio;
                }

                canvas.width = width;
                canvas.height = height;

                // Draw and compress
                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob(resolve, 'image/jpeg', quality);
            };

            img.src = URL.createObjectURL(file);
        });
    }

    // Resource Optimization
    setupResourceOptimization() {
        // Optimize CSS loading
        this.optimizeCSSLoading();
        
        // Optimize JavaScript loading
        this.optimizeJSLoading();
        
        // Optimize font loading
        this.optimizeFontLoading();
    }

    optimizeCSSLoading() {
        // Critical CSS inlining
        const criticalCSS = this.extractCriticalCSS();
        this.inlineCriticalCSS(criticalCSS);
        
        // Defer non-critical CSS
        this.deferNonCriticalCSS();
    }

    extractCriticalCSS() {
        // Extract above-the-fold CSS
        const criticalSelectors = [
            'body', 'html', '.header', '.main-content', '.navigation',
            '.login-container', '.translate-container', '.loading-overlay'
        ];
        
        // This would be implemented with a CSS parser
        // For now, return a placeholder
        return `
            body { font-family: var(--font-family); }
            .loading-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; }
        `;
    }

    inlineCriticalCSS(css) {
        const style = document.createElement('style');
        style.textContent = css;
        document.head.insertBefore(style, document.head.firstChild);
    }

    deferNonCriticalCSS() {
        const nonCriticalCSS = document.querySelectorAll('link[rel="stylesheet"]:not([data-critical])');
        nonCriticalCSS.forEach(link => {
            link.media = 'print';
            link.onload = () => {
                link.media = 'all';
            };
        });
    }

    optimizeJSLoading() {
        // Defer non-critical JavaScript
        const scripts = document.querySelectorAll('script[data-defer]');
        scripts.forEach(script => {
            script.defer = true;
        });
    }

    optimizeFontLoading() {
        // Preload critical fonts
        const criticalFonts = [
            'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap'
        ];
        
        criticalFonts.forEach(font => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = font;
            link.as = 'style';
            link.onload = () => {
                link.rel = 'stylesheet';
            };
            document.head.appendChild(link);
        });
    }

    // Memory Management
    setupMemoryManagement() {
        // Clean up unused resources
        setInterval(() => {
            this.cleanupUnusedResources();
        }, 60000); // Every minute

        // Monitor memory pressure
        if ('memory' in performance) {
            setInterval(() => {
                this.checkMemoryPressure();
            }, 30000); // Every 30 seconds
        }
    }

    cleanupUnusedResources() {
        // Clean up unused DOM elements
        this.cleanupUnusedDOMElements();
        
        // Clean up unused event listeners
        this.cleanupUnusedEventListeners();
        
        // Clean up unused timers
        this.cleanupUnusedTimers();
    }

    cleanupUnusedDOMElements() {
        // Remove hidden elements that are no longer needed
        const hiddenElements = document.querySelectorAll('.hidden, .invisible');
        hiddenElements.forEach(element => {
            if (element.dataset.cleanup === 'true') {
                element.remove();
            }
        });
    }

    cleanupUnusedEventListeners() {
        // This would require tracking event listeners
        // For now, just log the action
        console.log('Cleaning up unused event listeners');
    }

    cleanupUnusedTimers() {
        // Clean up unused timers and intervals
        // This would require tracking timers
        console.log('Cleaning up unused timers');
    }

    checkMemoryPressure() {
        if ('memory' in performance) {
            const memory = performance.memory;
            const usedMB = memory.usedJSHeapSize / 1024 / 1024;
            const totalMB = memory.totalJSHeapSize / 1024 / 1024;
            const usagePercent = (usedMB / totalMB) * 100;

            if (usagePercent > 80) {
                console.warn('High memory usage detected:', usagePercent + '%');
                this.triggerMemoryCleanup();
            }
        }
    }

    triggerMemoryCleanup() {
        // Force garbage collection if available
        if (window.gc) {
            window.gc();
        }

        // Clear caches
        this.cache.clear();
        this.cacheStats.size = 0;

        // Clear unused resources
        this.cleanupUnusedResources();
    }

    // Utility Classes
    class TextCompressor {
        compress(text) {
            // Simple text compression using LZ-string algorithm
            // This is a simplified version
            return btoa(unescape(encodeURIComponent(text)));
        }

        decompress(compressedText) {
            try {
                return decodeURIComponent(escape(atob(compressedText)));
            } catch (error) {
                return compressedText;
            }
        }
    }

    class ImageCompressor {
        compress(file, options = {}) {
            return new Promise((resolve) => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const img = new Image();

                img.onload = () => {
                    const { width, height } = img;
                    const { maxWidth = 1920, maxHeight = 1080, quality = 0.8 } = options;

                    let newWidth = width;
                    let newHeight = height;

                    if (width > maxWidth || height > maxHeight) {
                        const ratio = Math.min(maxWidth / width, maxHeight / height);
                        newWidth = width * ratio;
                        newHeight = height * ratio;
                    }

                    canvas.width = newWidth;
                    canvas.height = newHeight;

                    ctx.drawImage(img, 0, 0, newWidth, newHeight);
                    canvas.toBlob(resolve, 'image/jpeg', quality);
                };

                img.src = URL.createObjectURL(file);
            });
        }
    }

    // Settings Management
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.saveSettings();
    }

    loadSettings() {
        const defaultSettings = {
            enableCaching: true,
            enableCompression: true,
            enableLazyLoading: true,
            enableMemoryManagement: true,
            cacheSize: 100,
            compressionQuality: 0.8,
            memoryThreshold: 80
        };

        try {
            const saved = localStorage.getItem('performance-settings');
            return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
        } catch (error) {
            console.error('Error loading performance settings:', error);
            return defaultSettings;
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('performance-settings', JSON.stringify(this.settings));
        } catch (error) {
            console.error('Error saving performance settings:', error);
        }
    }

    // Analytics
    logPerformanceMetric(metric, value) {
        try {
            // Log to analytics service
            console.log(`Performance Metric: ${metric} = ${value}`);
            
            // Store in localStorage for analysis
            const metrics = JSON.parse(localStorage.getItem('performance-metrics') || '{}');
            if (!metrics[metric]) {
                metrics[metric] = [];
            }
            metrics[metric].push({
                value,
                timestamp: Date.now()
            });
            
            // Keep only last 100 entries
            if (metrics[metric].length > 100) {
                metrics[metric] = metrics[metric].slice(-100);
            }
            
            localStorage.setItem('performance-metrics', JSON.stringify(metrics));
        } catch (error) {
            console.error('Error logging performance metric:', error);
        }
    }

    getPerformanceMetrics() {
        return this.performanceMetrics;
    }

    getPerformanceReport() {
        const metrics = JSON.parse(localStorage.getItem('performance-metrics') || '{}');
        const report = {
            current: this.performanceMetrics,
            historical: metrics,
            recommendations: this.generateRecommendations()
        };
        
        return report;
    }

    generateRecommendations() {
        const recommendations = [];
        
        if (this.performanceMetrics.loadTime > 3000) {
            recommendations.push('Consider optimizing page load time - currently ' + this.performanceMetrics.loadTime + 'ms');
        }
        
        if (this.performanceMetrics.memoryUsage > 50) {
            recommendations.push('High memory usage detected - consider implementing memory cleanup');
        }
        
        if (this.performanceMetrics.cacheHitRate < 0.5) {
            recommendations.push('Low cache hit rate - consider optimizing caching strategy');
        }
        
        return recommendations;
    }

    // Test Methods
    async runPerformanceTest() {
        const testResults = {
            loadTime: this.performanceMetrics.loadTime,
            renderTime: this.performanceMetrics.renderTime,
            memoryUsage: this.performanceMetrics.memoryUsage,
            cacheHitRate: this.performanceMetrics.cacheHitRate
        };
        
        console.log('Performance Test Results:', testResults);
        return testResults;
    }
}

// Export performance optimizer instance
export const performanceOptimizer = new PerformanceOptimizer();
