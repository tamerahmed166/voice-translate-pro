// Smart Translation Script for Voice Translator Pro
// كود الترجمة الذكية لمترجم الصوت الذكي

import { appConfig } from './app-config.js';
import { notificationService } from './notification-service.js';

class SmartTranslationManager {
    constructor() {
        this.currentMode = 'contextual';
        this.currentContentType = 'general';
        this.translationHistory = [];
        this.isAnalyzing = false;
        this.isTranslating = false;
        this.aiInsights = {};
        
        this.init();
    }

    async init() {
        try {
            await this.waitForAppConfig();
            this.setupEventListeners();
            this.loadTranslationHistory();
            this.setupTextAnalysis();
            this.setupAIInsights();
            console.log('Smart translation manager initialized successfully');
        } catch (error) {
            console.error('Failed to initialize smart translation manager:', error);
        }
    }

    async waitForAppConfig() {
        let attempts = 0;
        const maxAttempts = 50;
        
        while (!appConfig.isInitialized && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!appConfig.isInitialized) {
            throw new Error('App config not initialized');
        }
    }

    setupEventListeners() {
        // Translation modes
        this.setupTranslationModes();
        
        // Content types
        this.setupContentTypes();
        
        // Language selection
        this.setupLanguageSelection();
        
        // Translation actions
        this.setupTranslationActions();
        
        // Panel actions
        this.setupPanelActions();
        
        // Text analysis
        this.setupTextAnalysisEvents();
    }

    setupTranslationModes() {
        const modeBtns = document.querySelectorAll('.mode-btn');
        
        modeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.dataset.mode;
                
                // Update active mode
                modeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                this.currentMode = mode;
                this.updateTranslationMode(mode);
            });
        });
    }

    setupContentTypes() {
        const contentTypeBtns = document.querySelectorAll('.content-type-btn');
        
        contentTypeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.dataset.type;
                
                // Update active type
                contentTypeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                this.currentContentType = type;
                this.updateContentType(type);
            });
        });
    }

    setupLanguageSelection() {
        // Swap languages
        document.getElementById('smart-swap-languages')?.addEventListener('click', () => {
            this.swapLanguages();
        });

        // Language change events
        document.getElementById('smart-source-lang')?.addEventListener('change', () => {
            this.updateLanguageSettings();
        });

        document.getElementById('smart-target-lang')?.addEventListener('change', () => {
            this.updateLanguageSettings();
        });
    }

    setupTranslationActions() {
        // Smart translate button
        document.getElementById('smart-translate')?.addEventListener('click', () => {
            this.performSmartTranslation();
        });

        // Improve translation
        document.getElementById('smart-improve-translation')?.addEventListener('click', () => {
            this.improveTranslation();
        });
    }

    setupPanelActions() {
        // Clear input
        document.getElementById('smart-clear-input')?.addEventListener('click', () => {
            this.clearInput();
        });

        // Copy input
        document.getElementById('smart-copy-input')?.addEventListener('click', () => {
            this.copyInput();
        });

        // Analyze text
        document.getElementById('smart-analyze-text')?.addEventListener('click', () => {
            this.analyzeText();
        });

        // Speak output
        document.getElementById('smart-speak-output')?.addEventListener('click', () => {
            this.speakOutput();
        });

        // Copy output
        document.getElementById('smart-copy-output')?.addEventListener('click', () => {
            this.copyOutput();
        });

        // Save translation
        document.getElementById('smart-save-translation')?.addEventListener('click', () => {
            this.saveTranslation();
        });
    }

    setupTextAnalysisEvents() {
        const inputTextarea = document.getElementById('smart-input-text');
        
        if (inputTextarea) {
            // Real-time text analysis
            inputTextarea.addEventListener('input', () => {
                this.performRealTimeAnalysis();
            });

            // Auto-detect language
            inputTextarea.addEventListener('blur', () => {
                this.autoDetectLanguage();
            });
        }
    }

    setupTextAnalysis() {
        // Initialize text analysis components
        this.updateWordCount();
        this.updateReadingTime();
        this.updateContentTone();
    }

    setupAIInsights() {
        // Initialize AI insights system
        this.aiInsights = {
            improvementSuggestions: [],
            contextInfo: {},
            textAnalysisDetails: {}
        };
    }

    // Translation Modes
    updateTranslationMode(mode) {
        this.currentMode = mode;
        
        // Update UI based on mode
        const inputTextarea = document.getElementById('smart-input-text');
        if (inputTextarea) {
            const placeholders = {
                'contextual': 'اكتب النص المراد ترجمته هنا... سيتم تحليله وترجمته بذكاء',
                'creative': 'اكتب النص الإبداعي هنا... سيتم ترجمته بأسلوب إبداعي',
                'formal': 'اكتب النص الرسمي هنا... سيتم ترجمته بأسلوب رسمي',
                'casual': 'اكتب النص غير الرسمي هنا... سيتم ترجمته بأسلوب ودود'
            };
            
            inputTextarea.placeholder = placeholders[mode] || placeholders['contextual'];
        }
        
        // Update translation button text
        const translateBtn = document.getElementById('smart-translate');
        if (translateBtn) {
            const buttonTexts = {
                'contextual': 'ترجمة سياقية',
                'creative': 'ترجمة إبداعية',
                'formal': 'ترجمة رسمية',
                'casual': 'ترجمة ودودة'
            };
            
            translateBtn.innerHTML = `<i class="fas fa-magic"></i> ${buttonTexts[mode] || buttonTexts['contextual']}`;
        }
    }

    updateContentType(type) {
        this.currentContentType = type;
        
        // Update AI insights based on content type
        this.updateAIInsightsForContentType(type);
    }

    // Language Management
    swapLanguages() {
        const sourceSelect = document.getElementById('smart-source-lang');
        const targetSelect = document.getElementById('smart-target-lang');
        
        if (sourceSelect && targetSelect) {
            const sourceValue = sourceSelect.value;
            const targetValue = targetSelect.value;
            
            // Don't swap if source is auto-detect
            if (sourceValue !== 'auto') {
                sourceSelect.value = targetValue;
                targetSelect.value = sourceValue;
                
                // Clear current translation
                this.clearOutput();
                
                // Show notification
                notificationService.showNotification(
                    'تم تبديل اللغات',
                    `الآن: ${this.getLanguageName(targetValue)} → ${this.getLanguageName(sourceValue)}`,
                    { type: 'info' }
                );
            }
        }
    }

    updateLanguageSettings() {
        const sourceLang = document.getElementById('smart-source-lang')?.value;
        const targetLang = document.getElementById('smart-target-lang')?.value;
        
        // Update AI insights based on language pair
        this.updateAIInsightsForLanguages(sourceLang, targetLang);
    }

    // Text Analysis
    performRealTimeAnalysis() {
        const inputText = document.getElementById('smart-input-text')?.value || '';
        
        if (inputText.trim()) {
            this.updateWordCount();
            this.updateReadingTime();
            this.updateContentTone();
            this.analyzeTextComplexity(inputText);
        } else {
            this.resetTextAnalysis();
        }
    }

    updateWordCount() {
        const inputText = document.getElementById('smart-input-text')?.value || '';
        const wordCount = inputText.trim().split(/\s+/).filter(word => word.length > 0).length;
        
        const wordCountElement = document.getElementById('word-count');
        if (wordCountElement) {
            wordCountElement.textContent = `${wordCount} كلمة`;
        }
    }

    updateReadingTime() {
        const inputText = document.getElementById('smart-input-text')?.value || '';
        const wordCount = inputText.trim().split(/\s+/).filter(word => word.length > 0).length;
        const readingTime = Math.ceil(wordCount / 200); // 200 words per minute
        
        const readingTimeElement = document.getElementById('reading-time');
        if (readingTimeElement) {
            readingTimeElement.textContent = `${readingTime} دقيقة قراءة`;
        }
    }

    updateContentTone() {
        const inputText = document.getElementById('smart-input-text')?.value || '';
        const tone = this.analyzeTextTone(inputText);
        
        const toneElement = document.getElementById('content-tone');
        if (toneElement) {
            toneElement.textContent = tone;
        }
    }

    analyzeTextTone(text) {
        if (!text.trim()) return 'محايد';
        
        const positiveWords = ['ممتاز', 'رائع', 'جميل', 'مفيد', 'مهم', 'جيد', 'ممتاز'];
        const negativeWords = ['سيء', 'مشكلة', 'خطأ', 'فشل', 'صعب', 'مؤلم', 'مخيف'];
        const formalWords = ['يرجى', 'نشكركم', 'نعتذر', 'نؤكد', 'نشير', 'نلاحظ'];
        
        const words = text.toLowerCase().split(/\s+/);
        let positiveCount = 0;
        let negativeCount = 0;
        let formalCount = 0;
        
        words.forEach(word => {
            if (positiveWords.some(pw => word.includes(pw))) positiveCount++;
            if (negativeWords.some(nw => word.includes(nw))) negativeCount++;
            if (formalWords.some(fw => word.includes(fw))) formalCount++;
        });
        
        if (formalCount > 2) return 'رسمي';
        if (positiveCount > negativeCount) return 'إيجابي';
        if (negativeCount > positiveCount) return 'سلبي';
        return 'محايد';
    }

    analyzeTextComplexity(text) {
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const words = text.split(/\s+/).filter(w => w.length > 0);
        const avgWordsPerSentence = words.length / sentences.length;
        
        let complexity = 'بسيط';
        if (avgWordsPerSentence > 15) complexity = 'معقد';
        else if (avgWordsPerSentence > 10) complexity = 'متوسط';
        
        // Update AI insights
        this.aiInsights.textAnalysisDetails = {
            complexity,
            avgWordsPerSentence: Math.round(avgWordsPerSentence),
            sentenceCount: sentences.length,
            wordCount: words.length
        };
    }

    resetTextAnalysis() {
        document.getElementById('word-count').textContent = '0 كلمة';
        document.getElementById('reading-time').textContent = '0 دقيقة قراءة';
        document.getElementById('content-tone').textContent = 'محايد';
    }

    async autoDetectLanguage() {
        const inputText = document.getElementById('smart-input-text')?.value || '';
        const sourceSelect = document.getElementById('smart-source-lang');
        
        if (inputText.trim() && sourceSelect && sourceSelect.value === 'auto') {
            try {
                const detectedLang = await this.detectLanguage(inputText);
                if (detectedLang && detectedLang !== 'auto') {
                    // Update source language
                    sourceSelect.value = detectedLang;
                    this.updateLanguageSettings();
                    
                    notificationService.showNotification(
                        'تم كشف اللغة',
                        `اللغة المكتشفة: ${this.getLanguageName(detectedLang)}`,
                        { type: 'success' }
                    );
                }
            } catch (error) {
                console.error('Language detection failed:', error);
            }
        }
    }

    async detectLanguage(text) {
        // Simple language detection based on character patterns
        const arabicPattern = /[\u0600-\u06FF]/;
        const englishPattern = /[a-zA-Z]/;
        const chinesePattern = /[\u4e00-\u9fff]/;
        const russianPattern = /[\u0400-\u04ff]/;
        
        if (arabicPattern.test(text)) return 'ar';
        if (englishPattern.test(text)) return 'en';
        if (chinesePattern.test(text)) return 'zh';
        if (russianPattern.test(text)) return 'ru';
        
        return 'en'; // Default to English
    }

    // Smart Translation
    async performSmartTranslation() {
        const inputText = document.getElementById('smart-input-text')?.value?.trim();
        
        if (!inputText) {
            notificationService.showNotification('خطأ', 'يرجى إدخال نص للترجمة', { type: 'error' });
            return;
        }
        
        try {
            this.showLoading(true);
            this.isTranslating = true;
            
            // Perform smart translation based on mode and content type
            const translationResult = await this.executeSmartTranslation(inputText);
            
            if (translationResult.success) {
                this.displayTranslation(translationResult);
                this.generateAlternativeTranslations(inputText, translationResult);
                this.generateAIInsights(inputText, translationResult);
                this.saveToHistory(inputText, translationResult);
            } else {
                throw new Error(translationResult.error);
            }
            
        } catch (error) {
            console.error('Smart translation failed:', error);
            notificationService.showNotification('خطأ في الترجمة', error.message, { type: 'error' });
        } finally {
            this.showLoading(false);
            this.isTranslating = false;
        }
    }

    async executeSmartTranslation(text) {
        const sourceLang = document.getElementById('smart-source-lang')?.value || 'auto';
        const targetLang = document.getElementById('smart-target-lang')?.value || 'en';
        
        // Get translation service
        const translationService = appConfig.getService('translation');
        
        // Prepare translation parameters based on mode and content type
        const translationParams = {
            text,
            sourceLang: sourceLang === 'auto' ? await this.detectLanguage(text) : sourceLang,
            targetLang,
            mode: this.currentMode,
            contentType: this.currentContentType,
            context: this.getTranslationContext()
        };
        
        // Perform translation with smart parameters
        const result = await translationService.translateWithContext(translationParams);
        
        return {
            success: true,
            originalText: text,
            translatedText: result.translation,
            sourceLanguage: translationParams.sourceLang,
            targetLanguage: targetLang,
            mode: this.currentMode,
            contentType: this.currentContentType,
            confidence: result.confidence || 0.95,
            alternatives: result.alternatives || [],
            context: result.context || {}
        };
    }

    getTranslationContext() {
        return {
            mode: this.currentMode,
            contentType: this.currentContentType,
            userPreferences: this.getUserPreferences(),
            previousTranslations: this.getRecentTranslations()
        };
    }

    getUserPreferences() {
        // Get user preferences from settings
        return {
            formality: this.currentMode === 'formal' ? 'high' : this.currentMode === 'casual' ? 'low' : 'medium',
            creativity: this.currentMode === 'creative' ? 'high' : 'medium',
            contextAwareness: true
        };
    }

    getRecentTranslations() {
        // Get recent translations for context
        return this.translationHistory.slice(0, 5).map(t => ({
            original: t.originalText,
            translated: t.translatedText,
            mode: t.mode
        }));
    }

    displayTranslation(result) {
        const outputPanel = document.getElementById('smart-translation-output');
        if (!outputPanel) return;
        
        outputPanel.innerHTML = `
            <div class="translation-result">
                <div class="translation-text">${result.translatedText}</div>
                <div class="translation-meta">
                    <span class="translation-mode">${this.getModeDisplayName(result.mode)}</span>
                    <span class="translation-confidence">ثقة: ${Math.round(result.confidence * 100)}%</span>
                </div>
            </div>
        `;
        
        // Update translation quality
        this.updateTranslationQuality(result.confidence);
        
        // Show alternative translations section
        document.getElementById('alternative-translations').style.display = 'block';
        
        // Show AI insights
        document.getElementById('ai-insights').style.display = 'block';
    }

    updateTranslationQuality(confidence) {
        const stars = document.querySelectorAll('.quality-stars i');
        const starCount = Math.round(confidence * 5);
        
        stars.forEach((star, index) => {
            if (index < starCount) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }

    async generateAlternativeTranslations(originalText, mainResult) {
        const alternativesList = document.getElementById('alternatives-list');
        if (!alternativesList) return;
        
        try {
            // Generate alternative translations with different approaches
            const alternatives = await this.generateAlternatives(originalText, mainResult);
            
            alternativesList.innerHTML = alternatives.map((alt, index) => `
                <div class="alternative-item" data-index="${index}">
                    <div class="alternative-text">${alt.text}</div>
                    <div class="alternative-meta">
                        <span class="alternative-style">${alt.style}</span>
                        <span class="alternative-confidence">ثقة: ${Math.round(alt.confidence * 100)}%</span>
                    </div>
                    <div class="alternative-actions">
                        <button class="btn btn-sm btn-outline" onclick="smartTranslationManager.useAlternative(${index})">
                            استخدام
                        </button>
                    </div>
                </div>
            `).join('');
            
        } catch (error) {
            console.error('Failed to generate alternatives:', error);
        }
    }

    async generateAlternatives(originalText, mainResult) {
        const alternatives = [];
        
        // Generate different style alternatives
        const styles = ['formal', 'casual', 'creative', 'technical'];
        
        for (const style of styles) {
            if (style !== mainResult.mode) {
                try {
                    const altResult = await this.executeSmartTranslation(originalText, style);
                    if (altResult.success) {
                        alternatives.push({
                            text: altResult.translatedText,
                            style: this.getModeDisplayName(style),
                            confidence: altResult.confidence
                        });
                    }
                } catch (error) {
                    console.error(`Failed to generate ${style} alternative:`, error);
                }
            }
        }
        
        return alternatives;
    }

    generateAIInsights(originalText, result) {
        // Generate improvement suggestions
        this.generateImprovementSuggestions(originalText, result);
        
        // Generate context information
        this.generateContextInfo(originalText, result);
        
        // Generate text analysis details
        this.generateTextAnalysisDetails(originalText, result);
    }

    generateImprovementSuggestions(originalText, result) {
        const suggestions = [];
        
        // Analyze translation quality
        if (result.confidence < 0.8) {
            suggestions.push('يمكن تحسين الترجمة بإضافة المزيد من السياق');
        }
        
        // Check for cultural adaptation
        if (this.needsCulturalAdaptation(originalText, result)) {
            suggestions.push('يُنصح بتكييف الترجمة ثقافياً للجمهور المستهدف');
        }
        
        // Check for terminology consistency
        if (this.needsTerminologyConsistency(originalText, result)) {
            suggestions.push('يُنصح بمراجعة المصطلحات المتخصصة');
        }
        
        // Update UI
        const suggestionsElement = document.getElementById('improvement-suggestions');
        if (suggestionsElement) {
            suggestionsElement.innerHTML = suggestions.map(suggestion => 
                `<div class="suggestion-item"><i class="fas fa-lightbulb"></i> ${suggestion}</div>`
            ).join('');
        }
    }

    generateContextInfo(originalText, result) {
        const contextInfo = {
            domain: this.detectDomain(originalText),
            sentiment: this.analyzeSentiment(originalText),
            complexity: this.analyzeComplexity(originalText),
            culturalElements: this.detectCulturalElements(originalText)
        };
        
        // Update UI
        const contextElement = document.getElementById('context-info');
        if (contextElement) {
            contextElement.innerHTML = `
                <div class="context-item">
                    <strong>المجال:</strong> ${contextInfo.domain}
                </div>
                <div class="context-item">
                    <strong>المشاعر:</strong> ${contextInfo.sentiment}
                </div>
                <div class="context-item">
                    <strong>التعقيد:</strong> ${contextInfo.complexity}
                </div>
                <div class="context-item">
                    <strong>العناصر الثقافية:</strong> ${contextInfo.culturalElements ? 'موجودة' : 'غير موجودة'}
                </div>
            `;
        }
    }

    generateTextAnalysisDetails(originalText, result) {
        const analysis = {
            readability: this.calculateReadability(originalText),
            keywords: this.extractKeywords(originalText),
            entities: this.extractEntities(originalText),
            topics: this.extractTopics(originalText)
        };
        
        // Update UI
        const analysisElement = document.getElementById('text-analysis-details');
        if (analysisElement) {
            analysisElement.innerHTML = `
                <div class="analysis-item">
                    <strong>سهولة القراءة:</strong> ${analysis.readability}
                </div>
                <div class="analysis-item">
                    <strong>الكلمات المفتاحية:</strong> ${analysis.keywords.join(', ')}
                </div>
                <div class="analysis-item">
                    <strong>المواضيع:</strong> ${analysis.topics.join(', ')}
                </div>
            `;
        }
    }

    // Utility Methods
    getModeDisplayName(mode) {
        const names = {
            'contextual': 'سياقية',
            'creative': 'إبداعية',
            'formal': 'رسمية',
            'casual': 'ودودة'
        };
        return names[mode] || mode;
    }

    getLanguageName(code) {
        const languages = {
            'ar': 'العربية', 'en': 'English', 'fr': 'Français', 'es': 'Español',
            'de': 'Deutsch', 'it': 'Italiano', 'pt': 'Português', 'ru': 'Русский',
            'zh': '中文', 'ja': '日本語', 'ko': '한국어', 'hi': 'हिन्दी'
        };
        return languages[code] || code;
    }

    // Action Methods
    clearInput() {
        document.getElementById('smart-input-text').value = '';
        this.resetTextAnalysis();
        this.clearOutput();
    }

    clearOutput() {
        const outputPanel = document.getElementById('smart-translation-output');
        if (outputPanel) {
            outputPanel.innerHTML = `
                <div class="placeholder">
                    <i class="fas fa-brain"></i>
                    <p>ستظهر الترجمة الذكية هنا</p>
                </div>
            `;
        }
        
        // Hide alternative translations and AI insights
        document.getElementById('alternative-translations').style.display = 'none';
        document.getElementById('ai-insights').style.display = 'none';
    }

    copyInput() {
        const inputText = document.getElementById('smart-input-text')?.value;
        if (inputText) {
            navigator.clipboard.writeText(inputText);
            notificationService.showNotification('تم النسخ', 'تم نسخ النص إلى الحافظة', { type: 'success' });
        }
    }

    copyOutput() {
        const outputText = document.querySelector('.translation-text')?.textContent;
        if (outputText) {
            navigator.clipboard.writeText(outputText);
            notificationService.showNotification('تم النسخ', 'تم نسخ الترجمة إلى الحافظة', { type: 'success' });
        }
    }

    async speakOutput() {
        const outputText = document.querySelector('.translation-text')?.textContent;
        if (outputText) {
            const targetLang = document.getElementById('smart-target-lang')?.value || 'en';
            await this.speakText(outputText, targetLang);
        }
    }

    async speakText(text, language) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = this.getLanguageCode(language);
            utterance.rate = 0.9;
            utterance.pitch = 1;
            utterance.volume = 1;
            
            window.speechSynthesis.speak(utterance);
        }
    }

    getLanguageCode(language) {
        const codes = {
            'ar': 'ar-SA', 'en': 'en-US', 'fr': 'fr-FR', 'es': 'es-ES',
            'de': 'de-DE', 'it': 'it-IT', 'pt': 'pt-PT', 'ru': 'ru-RU',
            'zh': 'zh-CN', 'ja': 'ja-JP', 'ko': 'ko-KR', 'hi': 'hi-IN'
        };
        return codes[language] || 'en-US';
    }

    async saveTranslation() {
        const originalText = document.getElementById('smart-input-text')?.value;
        const translatedText = document.querySelector('.translation-text')?.textContent;
        
        if (originalText && translatedText) {
            try {
                // Save to favorites
                const translation = {
                    id: Date.now(),
                    originalText,
                    translatedText,
                    sourceLanguage: document.getElementById('smart-source-lang')?.value,
                    targetLanguage: document.getElementById('smart-target-lang')?.value,
                    mode: this.currentMode,
                    contentType: this.currentContentType,
                    timestamp: new Date().toISOString()
                };
                
                // Save to localStorage
                const favorites = JSON.parse(localStorage.getItem('favorite-translations') || '[]');
                favorites.push(translation);
                localStorage.setItem('favorite-translations', JSON.stringify(favorites));
                
                notificationService.showNotification('تم الحفظ', 'تم حفظ الترجمة في المفضلة', { type: 'success' });
            } catch (error) {
                console.error('Failed to save translation:', error);
                notificationService.showNotification('خطأ', 'فشل في حفظ الترجمة', { type: 'error' });
            }
        }
    }

    async improveTranslation() {
        const currentTranslation = document.querySelector('.translation-text')?.textContent;
        if (currentTranslation) {
            try {
                this.showLoading(true);
                
                // Use AI to improve the translation
                const improvedResult = await this.improveTranslationWithAI(currentTranslation);
                
                if (improvedResult.success) {
                    this.displayTranslation(improvedResult);
                    notificationService.showNotification('تم التحسين', 'تم تحسين الترجمة بنجاح', { type: 'success' });
                } else {
                    throw new Error(improvedResult.error);
                }
            } catch (error) {
                console.error('Translation improvement failed:', error);
                notificationService.showNotification('خطأ', 'فشل في تحسين الترجمة', { type: 'error' });
            } finally {
                this.showLoading(false);
            }
        }
    }

    async improveTranslationWithAI(translation) {
        // Simulate AI improvement
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    translatedText: translation + ' [محسن بالذكاء الاصطناعي]',
                    confidence: 0.98,
                    mode: this.currentMode,
                    contentType: this.currentContentType
                });
            }, 2000);
        });
    }

    useAlternative(index) {
        const alternativeItem = document.querySelector(`[data-index="${index}"]`);
        if (alternativeItem) {
            const alternativeText = alternativeItem.querySelector('.alternative-text').textContent;
            
            // Update main translation
            const translationText = document.querySelector('.translation-text');
            if (translationText) {
                translationText.textContent = alternativeText;
            }
            
            notificationService.showNotification('تم التطبيق', 'تم استخدام الترجمة البديلة', { type: 'success' });
        }
    }

    // History Management
    saveToHistory(originalText, result) {
        const translation = {
            id: Date.now(),
            originalText,
            translatedText: result.translatedText,
            sourceLanguage: result.sourceLanguage,
            targetLanguage: result.targetLanguage,
            mode: result.mode,
            contentType: result.contentType,
            confidence: result.confidence,
            timestamp: new Date().toISOString()
        };
        
        this.translationHistory.unshift(translation);
        
        // Keep only last 50 translations
        if (this.translationHistory.length > 50) {
            this.translationHistory = this.translationHistory.slice(0, 50);
        }
        
        // Save to localStorage
        localStorage.setItem('smart-translation-history', JSON.stringify(this.translationHistory));
        
        // Update history display
        this.updateHistoryDisplay();
    }

    loadTranslationHistory() {
        try {
            const saved = localStorage.getItem('smart-translation-history');
            this.translationHistory = saved ? JSON.parse(saved) : [];
            this.updateHistoryDisplay();
        } catch (error) {
            console.error('Failed to load translation history:', error);
            this.translationHistory = [];
        }
    }

    updateHistoryDisplay() {
        const historyList = document.getElementById('smart-history-list');
        if (!historyList) return;
        
        if (this.translationHistory.length === 0) {
            historyList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-history"></i>
                    <p>لا توجد ترجمات ذكية حديثة</p>
                </div>
            `;
            return;
        }
        
        historyList.innerHTML = this.translationHistory.slice(0, 10).map(translation => `
            <div class="history-item" onclick="smartTranslationManager.loadFromHistory('${translation.id}')">
                <div class="history-content">
                    <div class="history-original">${translation.originalText.substring(0, 100)}${translation.originalText.length > 100 ? '...' : ''}</div>
                    <div class="history-translated">${translation.translatedText.substring(0, 100)}${translation.translatedText.length > 100 ? '...' : ''}</div>
                </div>
                <div class="history-meta">
                    <span class="history-mode">${this.getModeDisplayName(translation.mode)}</span>
                    <span class="history-time">${new Date(translation.timestamp).toLocaleDateString('ar-SA')}</span>
                </div>
            </div>
        `).join('');
    }

    loadFromHistory(translationId) {
        const translation = this.translationHistory.find(t => t.id == translationId);
        if (translation) {
            // Load translation into interface
            document.getElementById('smart-input-text').value = translation.originalText;
            document.getElementById('smart-source-lang').value = translation.sourceLanguage;
            document.getElementById('smart-target-lang').value = translation.targetLanguage;
            
            // Update mode and content type
            this.currentMode = translation.mode;
            this.currentContentType = translation.contentType;
            
            // Update UI
            this.updateTranslationMode(translation.mode);
            this.updateContentType(translation.contentType);
            
            // Display translation
            this.displayTranslation(translation);
            
            notificationService.showNotification('تم التحميل', 'تم تحميل الترجمة من التاريخ', { type: 'success' });
        }
    }

    // Analysis Methods
    detectDomain(text) {
        const domains = {
            'medical': ['طبيب', 'مرض', 'علاج', 'دواء', 'جراحة'],
            'technical': ['برمجة', 'كمبيوتر', 'تقنية', 'نظام', 'برنامج'],
            'business': ['شركة', 'مبيعات', 'استثمار', 'سوق', 'عمل'],
            'academic': ['بحث', 'دراسة', 'جامعة', 'علم', 'نظرية'],
            'legal': ['قانون', 'محكمة', 'عقد', 'حق', 'عدالة']
        };
        
        for (const [domain, keywords] of Object.entries(domains)) {
            if (keywords.some(keyword => text.includes(keyword))) {
                return domain;
            }
        }
        
        return 'عام';
    }

    analyzeSentiment(text) {
        const positiveWords = ['ممتاز', 'رائع', 'جميل', 'مفيد', 'مهم', 'جيد'];
        const negativeWords = ['سيء', 'مشكلة', 'خطأ', 'فشل', 'صعب', 'مؤلم'];
        
        const words = text.toLowerCase().split(/\s+/);
        let positiveCount = 0;
        let negativeCount = 0;
        
        words.forEach(word => {
            if (positiveWords.some(pw => word.includes(pw))) positiveCount++;
            if (negativeWords.some(nw => word.includes(nw))) negativeCount++;
        });
        
        if (positiveCount > negativeCount) return 'إيجابي';
        if (negativeCount > positiveCount) return 'سلبي';
        return 'محايد';
    }

    analyzeComplexity(text) {
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const words = text.split(/\s+/).filter(w => w.length > 0);
        const avgWordsPerSentence = words.length / sentences.length;
        
        if (avgWordsPerSentence > 15) return 'معقد';
        if (avgWordsPerSentence > 10) return 'متوسط';
        return 'بسيط';
    }

    detectCulturalElements(text) {
        const culturalWords = ['عيد', 'احتفال', 'تقليد', 'ثقافة', 'تراث', 'عادات'];
        return culturalWords.some(word => text.includes(word));
    }

    calculateReadability(text) {
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const words = text.split(/\s+/).filter(w => w.length > 0);
        const syllables = words.reduce((total, word) => total + this.countSyllables(word), 0);
        
        const avgWordsPerSentence = words.length / sentences.length;
        const avgSyllablesPerWord = syllables / words.length;
        
        const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
        
        if (score >= 90) return 'سهل جداً';
        if (score >= 80) return 'سهل';
        if (score >= 70) return 'متوسط';
        if (score >= 60) return 'صعب';
        return 'صعب جداً';
    }

    countSyllables(word) {
        const vowels = 'aeiouAEIOU';
        let count = 0;
        let previousWasVowel = false;
        
        for (let i = 0; i < word.length; i++) {
            const isVowel = vowels.includes(word[i]);
            if (isVowel && !previousWasVowel) {
                count++;
            }
            previousWasVowel = isVowel;
        }
        
        return Math.max(1, count);
    }

    extractKeywords(text) {
        const words = text.toLowerCase().split(/\s+/);
        const stopWords = ['في', 'من', 'إلى', 'على', 'هذا', 'هذه', 'التي', 'الذي', 'كان', 'كانت'];
        const wordFreq = {};
        
        words.forEach(word => {
            if (word.length > 3 && !stopWords.includes(word)) {
                wordFreq[word] = (wordFreq[word] || 0) + 1;
            }
        });
        
        return Object.entries(wordFreq)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([word]) => word);
    }

    extractEntities(text) {
        // Simple entity extraction
        const entities = [];
        
        // Email addresses
        const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
        const emails = text.match(emailRegex);
        if (emails) entities.push(...emails);
        
        // Phone numbers
        const phoneRegex = /(\+?966|0)?[5-9][0-9]{8}/g;
        const phones = text.match(phoneRegex);
        if (phones) entities.push(...phones);
        
        return entities;
    }

    extractTopics(text) {
        const topics = [];
        
        if (text.includes('طبيب') || text.includes('مرض')) topics.push('طب');
        if (text.includes('كمبيوتر') || text.includes('برمجة')) topics.push('تقنية');
        if (text.includes('شركة') || text.includes('عمل')) topics.push('أعمال');
        if (text.includes('جامعة') || text.includes('دراسة')) topics.push('تعليم');
        
        return topics.length > 0 ? topics : ['عام'];
    }

    needsCulturalAdaptation(originalText, result) {
        // Check if translation needs cultural adaptation
        return this.detectCulturalElements(originalText) || this.detectCulturalElements(result.translatedText);
    }

    needsTerminologyConsistency(originalText, result) {
        // Check if translation needs terminology consistency
        const technicalTerms = ['API', 'URL', 'HTTP', 'HTML', 'CSS', 'JavaScript'];
        return technicalTerms.some(term => originalText.includes(term));
    }

    updateAIInsightsForContentType(type) {
        // Update AI insights based on content type
        const insights = {
            'business': 'سيتم التركيز على المصطلحات التجارية والمهنية',
            'academic': 'سيتم التركيز على الدقة الأكاديمية والمصطلحات العلمية',
            'creative': 'سيتم التركيز على الإبداع والتعبير الفني',
            'technical': 'سيتم التركيز على المصطلحات التقنية والدقة',
            'medical': 'سيتم التركيز على المصطلحات الطبية والدقة العلمية',
            'legal': 'سيتم التركيز على المصطلحات القانونية والدقة',
            'marketing': 'سيتم التركيز على الإقناع والتأثير',
            'general': 'سيتم استخدام النهج العام المتوازن'
        };
        
        // Update UI with content type insights
        console.log(`Content type changed to: ${type} - ${insights[type]}`);
    }

    updateAIInsightsForLanguages(sourceLang, targetLang) {
        // Update AI insights based on language pair
        console.log(`Language pair: ${sourceLang} → ${targetLang}`);
    }

    showLoading(show) {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.display = show ? 'flex' : 'none';
        }
    }
}

// Initialize smart translation manager
let smartTranslationManager;
document.addEventListener('DOMContentLoaded', async () => {
    smartTranslationManager = new SmartTranslationManager();
});
