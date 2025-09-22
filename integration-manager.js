// Integration Manager for Voice Translator Pro
// مدير التكامل لمترجم الصوت الذكي

class IntegrationManager {
    constructor() {
        this.backendStatus = 'unknown';
        this.frontendStatus = 'ready';
        this.integrationStatus = 'disconnected';
        this.lastHealthCheck = null;
        
        this.init();
    }
    
    async init() {
        console.log('🔧 Initializing Integration Manager...');
        
        // Check backend connection
        await this.checkBackendHealth();
        
        // Setup periodic health checks
        this.setupHealthChecks();
        
        // Setup integration monitoring
        this.setupIntegrationMonitoring();
        
        console.log('✅ Integration Manager initialized');
    }
    
    async checkBackendHealth() {
        try {
            const response = await fetch('http://localhost:3000/api/health');
            if (response.ok) {
                const data = await response.json();
                this.backendStatus = 'connected';
                this.integrationStatus = 'connected';
                this.lastHealthCheck = new Date();
                
                console.log('✅ Backend is healthy:', data);
                this.showStatusNotification('Backend Connected', 'Server is running properly', 'success');
                
                return true;
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            this.backendStatus = 'disconnected';
            this.integrationStatus = 'disconnected';
            
            console.warn('⚠️ Backend health check failed:', error.message);
            this.showStatusNotification('Backend Disconnected', 'Using fallback mode', 'warning');
            
            return false;
        }
    }
    
    setupHealthChecks() {
        // Check backend health every 30 seconds
        setInterval(async () => {
            await this.checkBackendHealth();
        }, 30000);
        
        // Check frontend status every 10 seconds
        setInterval(() => {
            this.checkFrontendStatus();
        }, 10000);
    }
    
    setupIntegrationMonitoring() {
        // Monitor API service status
        if (window.apiService) {
            const originalMakeRequest = window.apiService.makeRequest.bind(window.apiService);
            
            window.apiService.makeRequest = async (endpoint, options) => {
                try {
                    const result = await originalMakeRequest(endpoint, options);
                    this.updateIntegrationStatus('api_working');
                    return result;
                } catch (error) {
                    this.updateIntegrationStatus('api_error');
                    throw error;
                }
            };
        }
        
        // Monitor translation services
        this.monitorTranslationServices();
    }
    
    checkFrontendStatus() {
        // Check if frontend components are working
        const components = {
            'translation-service': !!window.translationService,
            'ocr-service': !!window.ocrService,
            'notification-service': !!window.notificationService,
            'api-service': !!window.apiService
        };
        
        const workingComponents = Object.values(components).filter(Boolean).length;
        const totalComponents = Object.keys(components).length;
        
        if (workingComponents === totalComponents) {
            this.frontendStatus = 'ready';
        } else {
            this.frontendStatus = 'partial';
        }
        
        this.updateIntegrationStatus();
    }
    
    updateIntegrationStatus(status) {
        if (status) {
            this.integrationStatus = status;
        } else {
            // Determine overall integration status
            if (this.backendStatus === 'connected' && this.frontendStatus === 'ready') {
                this.integrationStatus = 'fully_connected';
            } else if (this.backendStatus === 'disconnected' && this.frontendStatus === 'ready') {
                this.integrationStatus = 'frontend_only';
            } else if (this.backendStatus === 'connected' && this.frontendStatus === 'partial') {
                this.integrationStatus = 'backend_only';
            } else {
                this.integrationStatus = 'disconnected';
            }
        }
        
        this.updateStatusDisplay();
    }
    
    updateStatusDisplay() {
        const statusElement = document.getElementById('integration-status');
        if (statusElement) {
            const statusConfig = {
                'fully_connected': { text: 'متصل بالكامل', class: 'status-connected', icon: '✅' },
                'frontend_only': { text: 'الواجهة الأمامية فقط', class: 'status-partial', icon: '⚠️' },
                'backend_only': { text: 'الخادم فقط', class: 'status-partial', icon: '⚠️' },
                'disconnected': { text: 'غير متصل', class: 'status-disconnected', icon: '❌' },
                'api_working': { text: 'API يعمل', class: 'status-connected', icon: '✅' },
                'api_error': { text: 'خطأ في API', class: 'status-error', icon: '❌' }
            };
            
            const config = statusConfig[this.integrationStatus] || statusConfig['disconnected'];
            
            statusElement.innerHTML = `
                <span class="status-icon">${config.icon}</span>
                <span class="status-text">${config.text}</span>
            `;
            statusElement.className = `integration-status ${config.class}`;
        }
    }
    
    monitorTranslationServices() {
        // Monitor translation service health
        if (window.translationService) {
            const originalTranslate = window.translationService.translate.bind(window.translationService);
            
            window.translationService.translate = async (...args) => {
                try {
                    const result = await originalTranslate(...args);
                    this.updateIntegrationStatus('translation_working');
                    return result;
                } catch (error) {
                    this.updateIntegrationStatus('translation_error');
                    throw error;
                }
            };
        }
    }
    
    showStatusNotification(title, message, type) {
        if (window.notificationService) {
            window.notificationService.showNotification(title, message, { type });
        } else {
            console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
        }
    }
    
    // Public methods for external use
    getStatus() {
        return {
            backend: this.backendStatus,
            frontend: this.frontendStatus,
            integration: this.integrationStatus,
            lastHealthCheck: this.lastHealthCheck,
            timestamp: new Date().toISOString()
        };
    }
    
    async reconnect() {
        console.log('🔄 Attempting to reconnect...');
        await this.checkBackendHealth();
        this.checkFrontendStatus();
    }
    
    async testIntegration() {
        console.log('🧪 Testing integration...');
        
        const tests = {
            backend: await this.testBackend(),
            frontend: this.testFrontend(),
            api: await this.testAPI()
        };
        
        const results = {
            passed: Object.values(tests).filter(Boolean).length,
            total: Object.keys(tests).length,
            details: tests
        };
        
        console.log('🧪 Integration test results:', results);
        return results;
    }
    
    async testBackend() {
        try {
            const response = await fetch('http://localhost:3000/api/health');
            return response.ok;
        } catch (error) {
            return false;
        }
    }
    
    testFrontend() {
        const components = [
            'translationService',
            'ocrService', 
            'notificationService',
            'apiService'
        ];
        
        return components.every(component => window[component] !== undefined);
    }
    
    async testAPI() {
        try {
            if (window.apiService) {
                const response = await window.apiService.makeRequest('/health');
                return response.status === 'OK';
            }
            return false;
        } catch (error) {
            return false;
        }
    }
}

// Initialize integration manager
let integrationManager;
document.addEventListener('DOMContentLoaded', () => {
    integrationManager = new IntegrationManager();
    window.integrationManager = integrationManager;
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IntegrationManager;
}
