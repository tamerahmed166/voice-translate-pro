// Voice Translator - Main Script
// Core functionality for the voice translation application

class VoiceTranslator {
    constructor() {
        this.isRecording = false;
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.currentMode = 'text';
        this.recentTranslations = this.loadRecentTranslations();
        this.favorites = this.loadFavorites();
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupSpeechRecognition();
        this.setupServiceWorker();
        this.updateRecentTranslations();
        this.setupPWA();
    }

    setupEventListeners() {
        // Navigation
        this.setupNavigation();
        
        // Language selection
        this.setupLanguageSelection();
        
        // Translation modes
        this.setupTranslationModes();
        
        // Text translation
        this.setupTextTranslation();
        
        // Voice translation
        this.setupVoiceTranslation();
        
        // Image translation
        this.setupImageTranslation();
        
        // Utility functions
        this.setupUtilityFunctions();
    }

    setupNavigation() {
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        
        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                hamburger.classList.toggle('active');
            });
        }

        // Close mobile menu when clicking on links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu?.classList.remove('active');
                hamburger?.classList.remove('active');
            });
        });
    }

    setupLanguageSelection() {
        const swapBtn = document.getElementById('swap-languages');
        const sourceLang = document.getElementById('source-lang');
        const targetLang = document.getElementById('target-lang');

        if (swapBtn && sourceLang && targetLang) {
            swapBtn.addEventListener('click', () => {
                const sourceValue = sourceLang.value;
                const targetValue = targetLang.value;
                
                // Don't swap if source is auto-detect
                if (sourceValue !== 'auto') {
                    sourceLang.value = targetValue;
                    targetLang.value = sourceValue;
                }
            });
        }
    }

    setupTranslationModes() {
        const modeBtns = document.querySelectorAll('.mode-btn');
        const modes = document.querySelectorAll('.translation-mode');

        modeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.dataset.mode;
                
                // Update active button
                modeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Update active mode
                modes.forEach(m => m.classList.remove('active'));
                document.getElementById(`${mode}-mode`)?.classList.add('active');
                
                this.currentMode = mode;
            });
        });
    }

    setupTextTranslation() {
        const inputText = document.getElementById('input-text');
        const translateBtn = document.getElementById('translate-text');
        const clearBtn = document.getElementById('clear-input');
        const copyInputBtn = document.getElementById('copy-input');
        const copyOutputBtn = document.getElementById('copy-output');
        const speakOutputBtn = document.getElementById('speak-output');
        const saveBtn = document.getElementById('save-translation');

        // Character count
        if (inputText) {
            inputText.addEventListener('input', () => {
                const count = inputText.value.length;
                const charCount = document.getElementById('input-char-count');
                if (charCount) {
                    charCount.textContent = `${count} / 5000`;
                    charCount.style.color = count > 4500 ? 'var(--error-color)' : 'var(--gray-500)';
                }
            });
        }

        // Translate button
        if (translateBtn) {
            translateBtn.addEventListener('click', () => {
                this.translateText();
            });
        }

        // Clear input
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (inputText) {
                    inputText.value = '';
                    inputText.dispatchEvent(new Event('input'));
                }
            });
        }

        // Copy input
        if (copyInputBtn) {
            copyInputBtn.addEventListener('click', () => {
                if (inputText && inputText.value) {
                    this.copyToClipboard(inputText.value);
                    this.showMessage('تم نسخ النص', 'success');
                }
            });
        }

        // Copy output
        if (copyOutputBtn) {
            copyOutputBtn.addEventListener('click', () => {
                const output = document.getElementById('translation-output');
                if (output && output.textContent.trim()) {
                    this.copyToClipboard(output.textContent);
                    this.showMessage('تم نسخ الترجمة', 'success');
                }
            });
        }

        // Speak output
        if (speakOutputBtn) {
            speakOutputBtn.addEventListener('click', () => {
                this.speakText();
            });
        }

        // Save translation
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveTranslation();
            });
        }
    }

    setupVoiceTranslation() {
        const startRecordingBtn = document.getElementById('start-recording');
        const recordingStatus = document.getElementById('recording-status');

        if (startRecordingBtn) {
            startRecordingBtn.addEventListener('click', () => {
                if (this.isRecording) {
                    this.stopRecording();
                } else {
                    this.startRecording();
                }
            });
        }
    }

    setupImageTranslation() {
        const uploadArea = document.getElementById('upload-area');
        const imageInput = document.getElementById('image-input');
        const imagePreview = document.getElementById('image-preview');
        const previewImg = document.getElementById('preview-img');
        const extractBtn = document.getElementById('extract-text');
        const changeImageBtn = document.getElementById('change-image');
        const translateExtractedBtn = document.getElementById('translate-extracted');

        // File input
        if (uploadArea && imageInput) {
            uploadArea.addEventListener('click', () => {
                imageInput.click();
            });

            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('dragover');
            });

            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('dragover');
            });

            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('dragover');
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.handleImageUpload(files[0]);
                }
            });
        }

        if (imageInput) {
            imageInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.handleImageUpload(e.target.files[0]);
                }
            });
        }

        // Extract text
        if (extractBtn) {
            extractBtn.addEventListener('click', () => {
                this.extractTextFromImage();
            });
        }

        // Change image
        if (changeImageBtn) {
            changeImageBtn.addEventListener('click', () => {
                imageInput?.click();
            });
        }

        // Translate extracted text
        if (translateExtractedBtn) {
            translateExtractedBtn.addEventListener('click', () => {
                this.translateExtractedText();
            });
        }
    }

    setupUtilityFunctions() {
        // Auto-save functionality
        setInterval(() => {
            this.saveRecentTranslations();
            this.saveFavorites();
        }, 30000); // Save every 30 seconds
    }

    setupSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            this.recognition.continuous = false;
            this.recognition.interimResults = true;
            this.recognition.lang = 'ar-SA';

            this.recognition.onstart = () => {
                this.isRecording = true;
                this.updateRecordingUI(true);
            };

            this.recognition.onresult = (event) => {
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

                const transcriptionText = document.getElementById('transcription-text');
                if (transcriptionText) {
                    transcriptionText.innerHTML = `
                        <div class="transcription-result">
                            <div class="final">${finalTranscript}</div>
                            <div class="interim">${interimTranscript}</div>
                        </div>
                    `;
                }

                if (finalTranscript) {
                    this.translateVoiceText(finalTranscript);
                }
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.showMessage('خطأ في التعرف على الصوت', 'error');
                this.stopRecording();
            };

            this.recognition.onend = () => {
                this.isRecording = false;
                this.updateRecordingUI(false);
            };
        } else {
            console.warn('Speech recognition not supported');
        }
    }

    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        console.log('SW registered: ', registration);
                    })
                    .catch(registrationError => {
                        console.log('SW registration failed: ', registrationError);
                    });
            });
        }
    }

    setupPWA() {
        // Install prompt
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            // Show install button
            this.showInstallPrompt();
        });

        // App installed
        window.addEventListener('appinstalled', () => {
            console.log('PWA was installed');
            this.showMessage('تم تثبيت التطبيق بنجاح!', 'success');
        });
    }

    // Translation Methods
    async translateText() {
        const inputText = document.getElementById('input-text');
        const sourceLang = document.getElementById('source-lang');
        const targetLang = document.getElementById('target-lang');
        
        if (!inputText || !inputText.value.trim()) {
            this.showMessage('يرجى إدخال نص للترجمة', 'warning');
            return;
        }

        this.showLoading(true);

        try {
            const source = sourceLang?.value || 'auto';
            const target = targetLang?.value || 'en';
            const text = inputText.value.trim();

            // Simulate API call (replace with actual translation service)
            const translation = await this.callTranslationAPI(text, source, target);
            
            this.displayTranslation(translation, text, source, target);
            this.addToRecentTranslations(text, translation, source, target);
            
        } catch (error) {
            console.error('Translation error:', error);
            this.showMessage('حدث خطأ في الترجمة', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async callTranslationAPI(text, source, target) {
        // This is a mock implementation
        // Replace with actual translation service like Google Translate API, Azure Translator, etc.
        
        return new Promise((resolve) => {
            setTimeout(() => {
                // Mock translation based on target language
                const translations = {
                    'en': 'This is a sample translation to English.',
                    'fr': 'Ceci est une traduction d\'exemple en français.',
                    'es': 'Esta es una traducción de ejemplo al español.',
                    'de': 'Dies ist eine Beispielübersetzung ins Deutsche.',
                    'ar': 'هذه ترجمة عينة إلى العربية.'
                };
                
                resolve(translations[target] || 'Translation not available for this language.');
            }, 1000);
        });
    }

    displayTranslation(translation, originalText, source, target) {
        const output = document.getElementById('translation-output');
        const info = document.getElementById('translation-info');
        
        if (output) {
            output.innerHTML = `
                <div class="translation-result">
                    ${translation}
                </div>
            `;
        }
        
        if (info) {
            const sourceName = this.getLanguageName(source);
            const targetName = this.getLanguageName(target);
            info.textContent = `ترجمة من ${sourceName} إلى ${targetName}`;
        }
    }

    async translateVoiceText(text) {
        const sourceLang = document.getElementById('source-lang');
        const targetLang = document.getElementById('target-lang');
        
        const source = sourceLang?.value || 'ar';
        const target = targetLang?.value || 'en';

        try {
            const translation = await this.callTranslationAPI(text, source, target);
            
            const output = document.getElementById('voice-translation-output');
            if (output) {
                output.innerHTML = `
                    <div class="translation-result">
                        ${translation}
                    </div>
                `;
            }
            
            this.addToRecentTranslations(text, translation, source, target);
            
        } catch (error) {
            console.error('Voice translation error:', error);
            this.showMessage('حدث خطأ في ترجمة الصوت', 'error');
        }
    }

    async extractTextFromImage() {
        const imageInput = document.getElementById('image-input');
        const extractedContent = document.getElementById('extracted-content');
        const extractedText = document.getElementById('extracted-text');
        
        if (!imageInput || !imageInput.files[0]) {
            this.showMessage('يرجى اختيار صورة أولاً', 'warning');
            return;
        }

        this.showLoading(true);

        try {
            // Mock OCR implementation
            // Replace with actual OCR service like Google Vision API, Azure Computer Vision, etc.
            const extractedTextContent = await this.performOCR(imageInput.files[0]);
            
            if (extractedContent) {
                extractedContent.textContent = extractedTextContent;
            }
            
            if (extractedText) {
                extractedText.style.display = 'block';
            }
            
        } catch (error) {
            console.error('OCR error:', error);
            this.showMessage('حدث خطأ في استخراج النص من الصورة', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async performOCR(imageFile) {
        // Mock OCR implementation
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve('هذا نص مستخرج من الصورة باستخدام تقنية OCR. يمكن ترجمة هذا النص إلى أي لغة تريدها.');
            }, 2000);
        });
    }

    async translateExtractedText() {
        const extractedContent = document.getElementById('extracted-content');
        const sourceLang = document.getElementById('source-lang');
        const targetLang = document.getElementById('target-lang');
        
        if (!extractedContent || !extractedContent.textContent.trim()) {
            this.showMessage('لا يوجد نص مستخرج للترجمة', 'warning');
            return;
        }

        const text = extractedContent.textContent.trim();
        const source = sourceLang?.value || 'auto';
        const target = targetLang?.value || 'en';

        this.showLoading(true);

        try {
            const translation = await this.callTranslationAPI(text, source, target);
            
            // Display translation in the main translation output
            this.displayTranslation(translation, text, source, target);
            this.addToRecentTranslations(text, translation, source, target);
            
            // Switch to text mode to show the result
            const textModeBtn = document.querySelector('[data-mode="text"]');
            if (textModeBtn) {
                textModeBtn.click();
            }
            
        } catch (error) {
            console.error('Translation error:', error);
            this.showMessage('حدث خطأ في الترجمة', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // Voice Methods
    startRecording() {
        if (this.recognition) {
            this.recognition.start();
        } else {
            this.showMessage('التعرف على الصوت غير مدعوم في هذا المتصفح', 'error');
        }
    }

    stopRecording() {
        if (this.recognition && this.isRecording) {
            this.recognition.stop();
        }
    }

    updateRecordingUI(isRecording) {
        const startBtn = document.getElementById('start-recording');
        const recordingStatus = document.getElementById('recording-status');
        
        if (startBtn) {
            if (isRecording) {
                startBtn.classList.add('recording');
                startBtn.innerHTML = '<i class="fas fa-stop"></i><span>إيقاف التسجيل</span>';
            } else {
                startBtn.classList.remove('recording');
                startBtn.innerHTML = '<i class="fas fa-microphone"></i><span>ابدأ التسجيل</span>';
            }
        }
        
        if (recordingStatus) {
            if (isRecording) {
                recordingStatus.classList.add('active');
            } else {
                recordingStatus.classList.remove('active');
            }
        }
    }

    speakText() {
        const output = document.getElementById('translation-output');
        const targetLang = document.getElementById('target-lang');
        
        if (!output || !output.textContent.trim()) {
            this.showMessage('لا يوجد نص للقراءة', 'warning');
            return;
        }

        const text = output.textContent.trim();
        const lang = targetLang?.value || 'en';
        
        // Cancel any ongoing speech
        this.synthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = this.getSpeechLangCode(lang);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;
        
        this.synthesis.speak(utterance);
    }

    // Utility Methods
    copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text);
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
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
        
        // Add to page
        document.body.appendChild(messageEl);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            messageEl.remove();
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

    showInstallPrompt() {
        // Create install button
        const installBtn = document.createElement('button');
        installBtn.className = 'btn btn-primary install-btn';
        installBtn.innerHTML = '<i class="fas fa-download"></i> تثبيت التطبيق';
        installBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
            box-shadow: var(--shadow-lg);
        `;
        
        installBtn.addEventListener('click', () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('User accepted the install prompt');
                    }
                    deferredPrompt = null;
                    installBtn.remove();
                });
            }
        });
        
        document.body.appendChild(installBtn);
    }

    // Data Management
    addToRecentTranslations(original, translation, source, target) {
        const translationItem = {
            id: Date.now(),
            original,
            translation,
            source,
            target,
            timestamp: new Date().toISOString()
        };
        
        this.recentTranslations.unshift(translationItem);
        
        // Keep only last 50 translations
        if (this.recentTranslations.length > 50) {
            this.recentTranslations = this.recentTranslations.slice(0, 50);
        }
        
        this.updateRecentTranslations();
    }

    updateRecentTranslations() {
        const container = document.getElementById('recent-translations-list');
        if (!container) return;
        
        if (this.recentTranslations.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-history"></i>
                    <p>لا توجد ترجمات حديثة</p>
                </div>
            `;
            return;
        }
        
        const html = this.recentTranslations.slice(0, 10).map(item => `
            <div class="translation-item">
                <div class="translation-item-header">
                    <span class="translation-languages">
                        ${this.getLanguageName(item.source)} → ${this.getLanguageName(item.target)}
                    </span>
                    <div class="translation-actions">
                        <button class="action-btn" onclick="translator.copyToClipboard('${item.translation}')" title="نسخ">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="action-btn" onclick="translator.speakTranslation('${item.translation}', '${item.target}')" title="استمع">
                            <i class="fas fa-volume-up"></i>
                        </button>
                        <button class="action-btn" onclick="translator.addToFavorites(${item.id})" title="إضافة للمفضلة">
                            <i class="fas fa-star"></i>
                        </button>
                    </div>
                </div>
                <div class="translation-content">
                    <div class="translation-source">${item.original}</div>
                    <div class="translation-target">${item.translation}</div>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = html;
    }

    saveTranslation() {
        const inputText = document.getElementById('input-text');
        const output = document.getElementById('translation-output');
        const sourceLang = document.getElementById('source-lang');
        const targetLang = document.getElementById('target-lang');
        
        if (!inputText || !output || !inputText.value.trim() || !output.textContent.trim()) {
            this.showMessage('لا يوجد ترجمة لحفظها', 'warning');
            return;
        }
        
        const translationItem = {
            id: Date.now(),
            original: inputText.value.trim(),
            translation: output.textContent.trim(),
            source: sourceLang?.value || 'auto',
            target: targetLang?.value || 'en',
            timestamp: new Date().toISOString()
        };
        
        this.favorites.push(translationItem);
        this.showMessage('تم حفظ الترجمة في المفضلة', 'success');
    }

    addToFavorites(id) {
        const item = this.recentTranslations.find(t => t.id === id);
        if (item && !this.favorites.find(f => f.id === id)) {
            this.favorites.push(item);
            this.showMessage('تم إضافة الترجمة للمفضلة', 'success');
        }
    }

    speakTranslation(text, lang) {
        this.synthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = this.getSpeechLangCode(lang);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;
        this.synthesis.speak(utterance);
    }

    // Helper Methods
    getLanguageName(code) {
        const languages = {
            'auto': 'كشف تلقائي',
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

    getSpeechLangCode(langCode) {
        // Map language codes to speech synthesis language codes
        const speechCodes = {
            'ar': 'ar-SA',
            'en': 'en-US',
            'fr': 'fr-FR',
            'es': 'es-ES',
            'de': 'de-DE',
            'it': 'it-IT',
            'pt': 'pt-PT',
            'ru': 'ru-RU',
            'zh': 'zh-CN',
            'ja': 'ja-JP',
            'ko': 'ko-KR',
            'hi': 'hi-IN',
            'tr': 'tr-TR',
            'nl': 'nl-NL',
            'sv': 'sv-SE',
            'no': 'nb-NO',
            'da': 'da-DK',
            'fi': 'fi-FI',
            'pl': 'pl-PL',
            'cs': 'cs-CZ',
            'hu': 'hu-HU',
            'ro': 'ro-RO',
            'bg': 'bg-BG',
            'hr': 'hr-HR',
            'sk': 'sk-SK',
            'sl': 'sl-SI',
            'et': 'et-EE',
            'lv': 'lv-LV',
            'lt': 'lt-LT',
            'el': 'el-GR',
            'he': 'he-IL',
            'fa': 'fa-IR',
            'ur': 'ur-PK',
            'bn': 'bn-BD',
            'ta': 'ta-IN',
            'te': 'te-IN',
            'ml': 'ml-IN',
            'kn': 'kn-IN',
            'gu': 'gu-IN',
            'pa': 'pa-IN',
            'mr': 'mr-IN',
            'ne': 'ne-NP',
            'si': 'si-LK',
            'my': 'my-MM',
            'th': 'th-TH',
            'vi': 'vi-VN',
            'id': 'id-ID',
            'ms': 'ms-MY',
            'tl': 'fil-PH',
            'sw': 'sw-KE',
            'am': 'am-ET',
            'yo': 'yo-NG',
            'ig': 'ig-NG',
            'ha': 'ha-NG',
            'zu': 'zu-ZA',
            'af': 'af-ZA',
            'sq': 'sq-AL',
            'mk': 'mk-MK',
            'sr': 'sr-RS',
            'bs': 'bs-BA',
            'mt': 'mt-MT',
            'is': 'is-IS',
            'ga': 'ga-IE',
            'cy': 'cy-GB',
            'eu': 'eu-ES',
            'ca': 'ca-ES',
            'gl': 'gl-ES'
        };
        return speechCodes[langCode] || 'en-US';
    }

    handleImageUpload(file) {
        if (!file.type.startsWith('image/')) {
            this.showMessage('يرجى اختيار ملف صورة صالح', 'error');
            return;
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB
            this.showMessage('حجم الصورة كبير جداً. الحد الأقصى 10MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const previewImg = document.getElementById('preview-img');
            const imagePreview = document.getElementById('image-preview');
            const uploadArea = document.getElementById('upload-area');
            
            if (previewImg) {
                previewImg.src = e.target.result;
            }
            
            if (imagePreview) {
                imagePreview.style.display = 'block';
            }
            
            if (uploadArea) {
                uploadArea.style.display = 'none';
            }
        };
        
        reader.readAsDataURL(file);
    }

    // Local Storage Methods
    loadRecentTranslations() {
        try {
            const stored = localStorage.getItem('voice-translator-recent');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading recent translations:', error);
            return [];
        }
    }

    saveRecentTranslations() {
        try {
            localStorage.setItem('voice-translator-recent', JSON.stringify(this.recentTranslations));
        } catch (error) {
            console.error('Error saving recent translations:', error);
        }
    }

    loadFavorites() {
        try {
            const stored = localStorage.getItem('voice-translator-favorites');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading favorites:', error);
            return [];
        }
    }

    saveFavorites() {
        try {
            localStorage.setItem('voice-translator-favorites', JSON.stringify(this.favorites));
        } catch (error) {
            console.error('Error saving favorites:', error);
        }
    }
}

// Initialize the application
let translator;
document.addEventListener('DOMContentLoaded', () => {
    translator = new VoiceTranslator();
});

// Export for use in other scripts
window.VoiceTranslator = VoiceTranslator;

