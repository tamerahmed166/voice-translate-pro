// Login Script for Voice Translator Pro with Firebase Authentication
// كود تسجيل الدخول لمترجم الصوت الذكي مع مصادقة Firebase

import { authService } from './auth-service.js';

class LoginManager {
    constructor() {
        this.currentTab = 'login';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupFormValidation();
        this.setupPasswordStrength();
        this.setupSocialLogin();
        this.loadSavedCredentials();
        this.setupAuthStateListener();
    }

    setupEventListeners() {
        // Tab switching
        this.setupTabSwitching();
        
        // Form submissions
        this.setupFormSubmissions();
        
        // Password toggles
        this.setupPasswordToggles();
        
        // Forgot password
        this.setupForgotPassword();
        
        // Social login
        this.setupSocialLoginButtons();
        
        // Guest access
        this.setupGuestAccess();
    }

    setupTabSwitching() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const forms = document.querySelectorAll('.login-form');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                
                // Update active tab
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Update active form
                forms.forEach(f => f.classList.remove('active'));
                document.getElementById(`${tab}-form`)?.classList.add('active');
                
                this.currentTab = tab;
                this.clearFormErrors();
            });
        });
    }

    setupFormSubmissions() {
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister();
            });
        }
    }

    setupPasswordToggles() {
        const passwordToggles = document.querySelectorAll('.password-toggle');
        
        passwordToggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                const input = toggle.parentElement.querySelector('input');
                const icon = toggle.querySelector('i');
                
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    input.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            });
        });
    }

    setupPasswordStrength() {
        const passwordInput = document.getElementById('register-password');
        const strengthBar = document.querySelector('.strength-fill');
        const strengthText = document.querySelector('.strength-text');

        if (passwordInput && strengthBar && strengthText) {
            passwordInput.addEventListener('input', () => {
                const password = passwordInput.value;
                const strength = this.calculatePasswordStrength(password);
                
                // Update strength bar
                strengthBar.className = 'strength-fill';
                strengthBar.classList.add(strength.level);
                
                // Update strength text
                strengthText.textContent = strength.text;
                strengthText.style.color = strength.color;
            });
        }
    }

    setupForgotPassword() {
        const forgotLink = document.querySelector('.forgot-password');
        const modal = document.getElementById('forgot-password-modal');
        const closeBtn = document.getElementById('close-forgot-modal');
        const form = document.getElementById('forgot-password-form');

        if (forgotLink && modal) {
            forgotLink.addEventListener('click', (e) => {
                e.preventDefault();
                modal.classList.add('active');
            });
        }

        if (closeBtn && modal) {
            closeBtn.addEventListener('click', () => {
                modal.classList.remove('active');
            });
        }

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleForgotPassword();
            });
        }

        // Close modal when clicking outside
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        }
    }

    setupSocialLoginButtons() {
        const socialBtns = document.querySelectorAll('.social-btn');
        
        socialBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const provider = btn.classList.contains('google-btn') ? 'google' :
                               btn.classList.contains('facebook-btn') ? 'facebook' :
                               btn.classList.contains('apple-btn') ? 'apple' : null;
                
                if (provider) {
                    this.handleSocialLogin(provider);
                }
            });
        });
    }

    setupGuestAccess() {
        const guestBtn = document.querySelector('.guest-access .btn');
        
        if (guestBtn) {
            guestBtn.addEventListener('click', () => {
                this.handleGuestAccess();
            });
        }
    }

    setupFormValidation() {
        // Real-time validation
        const inputs = document.querySelectorAll('input[required]');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
            
            input.addEventListener('input', () => {
                this.clearFieldError(input);
            });
        });
    }

    setupAuthStateListener() {
        authService.addAuthStateListener((user) => {
            if (user) {
                // User is signed in, redirect to main page
                this.showMessage('مرحباً بك! تم تسجيل الدخول بنجاح', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            }
        });
    }

    // Form Handlers
    async handleLogin() {
        const form = document.getElementById('login-form');
        const formData = new FormData(form);
        
        const email = formData.get('email');
        const password = formData.get('password');
        const remember = formData.get('remember');
        
        // Validate form
        if (!this.validateLoginForm(email, password)) {
            return;
        }
        
        this.showLoading(true);
        
        try {
            const result = await authService.signInWithEmail(email, password);
            
            if (result.success) {
                // Save credentials if remember me is checked
                if (remember) {
                    this.saveCredentials(email, password);
                } else {
                    this.clearCredentials();
                }
                
                // Log auth event
                await authService.logAuthEvent('login', { method: 'email' });
                
                // Show success message
                this.showMessage('تم تسجيل الدخول بنجاح!', 'success');
                
                // Redirect will be handled by auth state listener
                
            } else {
                this.showMessage(result.error, 'error');
            }
            
        } catch (error) {
            console.error('Login error:', error);
            this.showMessage('حدث خطأ في تسجيل الدخول', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async handleRegister() {
        const form = document.getElementById('register-form');
        const formData = new FormData(form);
        
        const name = formData.get('name');
        const email = formData.get('email');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');
        const agreeTerms = formData.get('agreeTerms');
        
        // Validate form
        if (!this.validateRegisterForm(name, email, password, confirmPassword, agreeTerms)) {
            return;
        }
        
        this.showLoading(true);
        
        try {
            const result = await authService.signUpWithEmail(email, password, name);
            
            if (result.success) {
                // Log auth event
                await authService.logAuthEvent('register', { method: 'email' });
                
                // Show success message
                this.showMessage('تم إنشاء الحساب بنجاح! تحقق من بريدك الإلكتروني للتفعيل', 'success');
                
                // Switch to login tab
                setTimeout(() => {
                    this.switchTab('login');
                    document.getElementById('login-email').value = email;
                }, 2000);
                
            } else {
                this.showMessage(result.error, 'error');
            }
            
        } catch (error) {
            console.error('Registration error:', error);
            this.showMessage('حدث خطأ في إنشاء الحساب', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async handleForgotPassword() {
        const form = document.getElementById('forgot-password-form');
        const formData = new FormData(form);
        const email = formData.get('email');
        
        if (!this.validateEmail(email)) {
            this.showFieldError(document.getElementById('forgot-email'), 'يرجى إدخال بريد إلكتروني صحيح');
            return;
        }
        
        this.showLoading(true);
        
        try {
            const result = await authService.resetPassword(email);
            
            if (result.success) {
                this.showMessage('تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني', 'success');
                document.getElementById('forgot-password-modal').classList.remove('active');
                form.reset();
                
                // Log auth event
                await authService.logAuthEvent('password_reset_requested', { email });
            } else {
                this.showMessage(result.error, 'error');
            }
            
        } catch (error) {
            console.error('Forgot password error:', error);
            this.showMessage('حدث خطأ في إرسال رابط الاستعادة', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async handleSocialLogin(provider) {
        this.showLoading(true);
        
        try {
            let result;
            
            switch (provider) {
                case 'google':
                    result = await authService.signInWithGoogle();
                    break;
                case 'facebook':
                    result = await authService.signInWithFacebook();
                    break;
                case 'apple':
                    // Apple Sign-In would be implemented here
                    this.showMessage('تسجيل الدخول بـ Apple غير متاح حالياً', 'warning');
                    this.showLoading(false);
                    return;
                default:
                    throw new Error('مزود المصادقة غير مدعوم');
            }
            
            if (result.success) {
                // Log auth event
                await authService.logAuthEvent('login', { method: provider });
                
                this.showMessage(`تم تسجيل الدخول بنجاح باستخدام ${provider}!`, 'success');
                
                // Redirect will be handled by auth state listener
            } else {
                this.showMessage(result.error, 'error');
            }
            
        } catch (error) {
            console.error('Social login error:', error);
            this.showMessage(`خطأ في تسجيل الدخول باستخدام ${provider}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    handleGuestAccess() {
        // Set guest session
        localStorage.setItem('user-session', JSON.stringify({
            type: 'guest',
            timestamp: Date.now()
        }));
        
        this.showMessage('مرحباً بك كضيف!', 'success');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }

    // Validation Methods
    validateLoginForm(email, password) {
        let isValid = true;
        
        if (!this.validateEmail(email)) {
            this.showFieldError(document.getElementById('login-email'), 'يرجى إدخال بريد إلكتروني صحيح');
            isValid = false;
        }
        
        if (!password || password.length < 6) {
            this.showFieldError(document.getElementById('login-password'), 'كلمة المرور يجب أن تكون 6 أحرف على الأقل');
            isValid = false;
        }
        
        return isValid;
    }

    validateRegisterForm(name, email, password, confirmPassword, agreeTerms) {
        let isValid = true;
        
        if (!name || name.trim().length < 2) {
            this.showFieldError(document.getElementById('register-name'), 'الاسم يجب أن يكون حرفين على الأقل');
            isValid = false;
        }
        
        if (!this.validateEmail(email)) {
            this.showFieldError(document.getElementById('register-email'), 'يرجى إدخال بريد إلكتروني صحيح');
            isValid = false;
        }
        
        if (!password || password.length < 8) {
            this.showFieldError(document.getElementById('register-password'), 'كلمة المرور يجب أن تكون 8 أحرف على الأقل');
            isValid = false;
        }
        
        if (password !== confirmPassword) {
            this.showFieldError(document.getElementById('confirm-password'), 'كلمة المرور غير متطابقة');
            isValid = false;
        }
        
        if (!agreeTerms) {
            this.showMessage('يجب الموافقة على شروط الاستخدام وسياسة الخصوصية', 'error');
            isValid = false;
        }
        
        return isValid;
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validateField(input) {
        const value = input.value.trim();
        const type = input.type;
        const required = input.hasAttribute('required');
        
        if (required && !value) {
            this.showFieldError(input, 'هذا الحقل مطلوب');
            return false;
        }
        
        if (type === 'email' && value && !this.validateEmail(value)) {
            this.showFieldError(input, 'يرجى إدخال بريد إلكتروني صحيح');
            return false;
        }
        
        if (input.id === 'register-password' && value && value.length < 8) {
            this.showFieldError(input, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل');
            return false;
        }
        
        if (input.id === 'confirm-password' && value) {
            const password = document.getElementById('register-password').value;
            if (value !== password) {
                this.showFieldError(input, 'كلمة المرور غير متطابقة');
                return false;
            }
        }
        
        this.clearFieldError(input);
        return true;
    }

    calculatePasswordStrength(password) {
        let score = 0;
        let feedback = [];
        
        // Length check
        if (password.length >= 8) score += 1;
        else feedback.push('8 أحرف على الأقل');
        
        // Lowercase check
        if (/[a-z]/.test(password)) score += 1;
        else feedback.push('حرف صغير');
        
        // Uppercase check
        if (/[A-Z]/.test(password)) score += 1;
        else feedback.push('حرف كبير');
        
        // Number check
        if (/\d/.test(password)) score += 1;
        else feedback.push('رقم');
        
        // Special character check
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
        else feedback.push('رمز خاص');
        
        const levels = [
            { level: 'weak', text: 'ضعيف', color: 'var(--error-color)' },
            { level: 'fair', text: 'متوسط', color: 'var(--warning-color)' },
            { level: 'good', text: 'جيد', color: 'var(--accent-color)' },
            { level: 'strong', text: 'قوي', color: 'var(--success-color)' }
        ];
        
        return levels[Math.min(score, 3)];
    }

    // Utility Methods
    showFieldError(input, message) {
        this.clearFieldError(input);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            color: var(--error-color);
            font-size: var(--font-size-xs);
            margin-top: var(--spacing-1);
            display: flex;
            align-items: center;
            gap: var(--spacing-1);
        `;
        
        input.parentElement.appendChild(errorDiv);
        input.style.borderColor = 'var(--error-color)';
    }

    clearFieldError(input) {
        const errorDiv = input.parentElement.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
        input.style.borderColor = '';
    }

    clearFormErrors() {
        const errorDivs = document.querySelectorAll('.field-error');
        errorDivs.forEach(div => div.remove());
        
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
            input.style.borderColor = '';
        });
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

    showLoading(show) {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            if (show) {
                overlay.classList.add('active');
            } else {
                overlay.classList.remove('active');
            }
        }
    }

    // Data Management
    saveCredentials(email, password) {
        const credentials = {
            email,
            password,
            timestamp: Date.now()
        };
        localStorage.setItem('saved-credentials', JSON.stringify(credentials));
    }

    clearCredentials() {
        localStorage.removeItem('saved-credentials');
    }

    loadSavedCredentials() {
        const saved = localStorage.getItem('saved-credentials');
        if (saved) {
            try {
                const credentials = JSON.parse(saved);
                const emailInput = document.getElementById('login-email');
                const passwordInput = document.getElementById('login-password');
                const rememberCheckbox = document.getElementById('remember-me');
                
                if (emailInput) emailInput.value = credentials.email;
                if (passwordInput) passwordInput.value = credentials.password;
                if (rememberCheckbox) rememberCheckbox.checked = true;
            } catch (error) {
                console.error('Error loading saved credentials:', error);
            }
        }
    }

    switchTab(tab) {
        // Update tab buttons
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tab) {
                btn.classList.add('active');
            }
        });

        // Update forms
        const forms = document.querySelectorAll('.login-form');
        forms.forEach(form => {
            form.classList.remove('active');
            if (form.id === `${tab}-form`) {
                form.classList.add('active');
            }
        });

        this.currentTab = tab;
    }
}

// Initialize login manager
document.addEventListener('DOMContentLoaded', () => {
    new LoginManager();
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