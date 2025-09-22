// Frontend Configuration for Voice Translator Pro
// تكوين الواجهة الأمامية لمترجم الصوت الذكي

class FrontendConfig {
    constructor() {
        this.apiBaseURL = 'http://localhost:3000/api';
        this.isBackendConnected = false;
        this.fallbackMode = true;
        
        this.init();
    }
    
    async init() {
        try {
            await this.checkBackendConnection();
            this.isBackendConnected = true;
            this.fallbackMode = false;
            console.log('✅ Backend connected successfully');
        } catch (error) {
            console.warn('⚠️ Backend not available, using fallback mode');
            this.isBackendConnected = false;
            this.fallbackMode = true;
        }
    }
    
    async checkBackendConnection() {
        try {
            const response = await fetch(`${this.apiBaseURL}/health`);
            if (response.ok) {
                const data = await response.json();
                console.log('Backend Health:', data);
                return true;
            }
            throw new Error('Health check failed');
        } catch (error) {
            throw new Error(`Backend connection failed: ${error.message}`);
        }
    }
    
    getConnectionStatus() {
        return {
            isConnected: this.isBackendConnected,
            fallbackMode: this.fallbackMode,
            apiBaseURL: this.apiBaseURL
        };
    }
    
    async reconnect() {
        await this.init();
    }
}

// Create global instance
window.frontendConfig = new FrontendConfig();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FrontendConfig;
}
