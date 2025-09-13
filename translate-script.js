// Translate Page Specific Script
// Additional functionality for the translate page

class TranslatePage {
    constructor() {
        this.init();
    }

    init() {
        this.setupTranslateSpecificFeatures();
        this.setupKeyboardShortcuts();
        this.setupAutoTranslate();
        this.setupTranslationHistory();
    }

    setupTranslateSpecificFeatures() {
        // Auto-resize textarea
        this.setupAutoResize();
        
        // Real-time character count
        this.setupCharacterCount();
        
        // Translation suggestions
        this.setupTranslationSuggestions();
        
        // Voice input for text mode
        this.setupVoiceInput();
        
        // Quick language switching
        this.setupQuickLanguageSwitch();
    }

    setupAutoResize() {
        const textarea = document.getElementById('input-text');
        if (textarea) {
            textarea.addEventListener('input', () => {
                textarea.style.height = 'auto';
                textarea.style.height = textarea.scrollHeight + 'px';
            });
        }
    }

    setupCharacterCount() {
        const textarea = document.getElementById('input-text');
        const charCount = document.getElementById('input-char-count');
        
        if (textarea && charCount) {
            textarea.addEventListener('input', () => {
                const count = textarea.value.length;
                const maxLength = 5000;
                
                charCount.textContent = `${count} / ${maxLength}`;
                
                // Change color based on character count
                if (count > maxLength * 0.9) {
                    charCount.style.color = 'var(--error-color)';
                } else if (count > maxLength * 0.7) {
                    charCount.style.color = 'var(--warning-color)';
                } else {
                    charCount.style.color = 'var(--gray-500)';
                }
                
                // Disable/enable translate button
                const translateBtn = document.getElementById('translate-text');
                if (translateBtn) {
                    translateBtn.disabled = count === 0 || count > maxLength;
                }
            });
        }
    }

    setupTranslationSuggestions() {
        const textarea = document.getElementById('input-text');
        if (textarea) {
            // Add common phrases suggestions
            const suggestions = [
                'مرحبا، كيف حالك؟',
                'شكراً لك',
                'أين الحمام؟',
                'كم الساعة؟',
                'أنا جائع',
                'أحتاج مساعدة',
                'أين أقرب محطة مترو؟',
                'كم يكلف هذا؟',
                'هل تتكلم الإنجليزية؟',
                'أنا لا أفهم'
            ];

            // Create suggestions dropdown
            this.createSuggestionsDropdown(suggestions);
        }
    }

    createSuggestionsDropdown(suggestions) {
        const textarea = document.getElementById('input-text');
        if (!textarea) return;

        const container = textarea.parentElement;
        const dropdown = document.createElement('div');
        dropdown.className = 'suggestions-dropdown';
        dropdown.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border: 1px solid var(--gray-200);
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-lg);
            z-index: 1000;
            max-height: 200px;
            overflow-y: auto;
            display: none;
        `;

        container.style.position = 'relative';
        container.appendChild(dropdown);

        // Show suggestions when textarea is focused and empty
        textarea.addEventListener('focus', () => {
            if (textarea.value.trim() === '') {
                this.showSuggestions(suggestions, dropdown, textarea);
            }
        });

        // Hide suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!container.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });
    }

    showSuggestions(suggestions, dropdown, textarea) {
        dropdown.innerHTML = suggestions.map(suggestion => `
            <div class="suggestion-item" style="
                padding: var(--spacing-3) var(--spacing-4);
                cursor: pointer;
                border-bottom: 1px solid var(--gray-100);
                transition: background-color var(--transition-fast);
            " onmouseover="this.style.backgroundColor='var(--gray-50)'" 
               onmouseout="this.style.backgroundColor='transparent'"
               onclick="this.selectSuggestion('${suggestion}')">
                ${suggestion}
            </div>
        `).join('');

        dropdown.style.display = 'block';
    }

    selectSuggestion(suggestion) {
        const textarea = document.getElementById('input-text');
        if (textarea) {
            textarea.value = suggestion;
            textarea.dispatchEvent(new Event('input'));
            textarea.focus();
        }
        
        const dropdown = document.querySelector('.suggestions-dropdown');
        if (dropdown) {
            dropdown.style.display = 'none';
        }
    }

    setupVoiceInput() {
        const textarea = document.getElementById('input-text');
        if (!textarea) return;

        // Add voice input button to textarea
        const container = textarea.parentElement;
        const voiceBtn = document.createElement('button');
        voiceBtn.className = 'voice-input-btn';
        voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        voiceBtn.style.cssText = `
            position: absolute;
            top: var(--spacing-4);
            left: var(--spacing-4);
            background: var(--primary-color);
            color: white;
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            cursor: pointer;
            transition: all var(--transition-fast);
            z-index: 10;
        `;

        voiceBtn.addEventListener('mouseenter', () => {
            voiceBtn.style.transform = 'scale(1.1)';
        });

        voiceBtn.addEventListener('mouseleave', () => {
            voiceBtn.style.transform = 'scale(1)';
        });

        voiceBtn.addEventListener('click', () => {
            this.startVoiceInput(textarea);
        });

        container.style.position = 'relative';
        container.appendChild(voiceBtn);
    }

    startVoiceInput(textarea) {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'ar-SA';

            recognition.onstart = () => {
                const voiceBtn = document.querySelector('.voice-input-btn');
                if (voiceBtn) {
                    voiceBtn.style.background = 'var(--error-color)';
                    voiceBtn.innerHTML = '<i class="fas fa-stop"></i>';
                }
            };

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                textarea.value = transcript;
                textarea.dispatchEvent(new Event('input'));
            };

            recognition.onerror = (event) => {
                console.error('Voice input error:', event.error);
                translator?.showMessage('خطأ في التعرف على الصوت', 'error');
            };

            recognition.onend = () => {
                const voiceBtn = document.querySelector('.voice-input-btn');
                if (voiceBtn) {
                    voiceBtn.style.background = 'var(--primary-color)';
                    voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
                }
            };

            recognition.start();
        } else {
            translator?.showMessage('التعرف على الصوت غير مدعوم', 'error');
        }
    }

    setupQuickLanguageSwitch() {
        // Add quick language buttons
        const languageSelection = document.querySelector('.language-selection');
        if (!languageSelection) return;

        const quickLanguages = [
            { code: 'ar', name: 'العربية', flag: '🇸🇦' },
            { code: 'en', name: 'English', flag: '🇺🇸' },
            { code: 'fr', name: 'Français', flag: '🇫🇷' },
            { code: 'es', name: 'Español', flag: '🇪🇸' },
            { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
            { code: 'zh', name: '中文', flag: '🇨🇳' },
            { code: 'ja', name: '日本語', flag: '🇯🇵' },
            { code: 'ko', name: '한국어', flag: '🇰🇷' }
        ];

        const quickLangContainer = document.createElement('div');
        quickLangContainer.className = 'quick-languages';
        quickLangContainer.style.cssText = `
            display: flex;
            gap: var(--spacing-2);
            margin-top: var(--spacing-4);
            flex-wrap: wrap;
            justify-content: center;
        `;

        quickLanguages.forEach(lang => {
            const btn = document.createElement('button');
            btn.className = 'quick-lang-btn';
            btn.innerHTML = `${lang.flag} ${lang.name}`;
            btn.style.cssText = `
                padding: var(--spacing-2) var(--spacing-3);
                background: white;
                border: 1px solid var(--gray-200);
                border-radius: var(--radius-md);
                cursor: pointer;
                transition: all var(--transition-fast);
                font-size: var(--font-size-sm);
            `;

            btn.addEventListener('mouseenter', () => {
                btn.style.borderColor = 'var(--primary-color)';
                btn.style.color = 'var(--primary-color)';
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.borderColor = 'var(--gray-200)';
                btn.style.color = 'var(--gray-700)';
            });

            btn.addEventListener('click', () => {
                const targetLang = document.getElementById('target-lang');
                if (targetLang) {
                    targetLang.value = lang.code;
                }
            });

            quickLangContainer.appendChild(btn);
        });

        languageSelection.appendChild(quickLangContainer);
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Enter to translate
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                const translateBtn = document.getElementById('translate-text');
                if (translateBtn && !translateBtn.disabled) {
                    translateBtn.click();
                }
            }

            // Ctrl/Cmd + Shift + S to swap languages
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
                e.preventDefault();
                const swapBtn = document.getElementById('swap-languages');
                if (swapBtn) {
                    swapBtn.click();
                }
            }

            // Ctrl/Cmd + Shift + V to start voice recording
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'V') {
                e.preventDefault();
                const startRecordingBtn = document.getElementById('start-recording');
                if (startRecordingBtn) {
                    startRecordingBtn.click();
                }
            }

            // Escape to clear input
            if (e.key === 'Escape') {
                const inputText = document.getElementById('input-text');
                if (inputText && document.activeElement === inputText) {
                    inputText.value = '';
                    inputText.dispatchEvent(new Event('input'));
                }
            }
        });
    }

    setupAutoTranslate() {
        const inputText = document.getElementById('input-text');
        const sourceLang = document.getElementById('source-lang');
        const targetLang = document.getElementById('target-lang');

        if (inputText && sourceLang && targetLang) {
            let timeoutId;

            inputText.addEventListener('input', () => {
                clearTimeout(timeoutId);
                
                // Auto-translate after 2 seconds of no typing
                timeoutId = setTimeout(() => {
                    if (inputText.value.trim().length > 10) {
                        const translateBtn = document.getElementById('translate-text');
                        if (translateBtn && !translateBtn.disabled) {
                            translateBtn.click();
                        }
                    }
                }, 2000);
            });
        }
    }

    setupTranslationHistory() {
        // Add history navigation
        this.addHistoryNavigation();
        
        // Add translation statistics
        this.addTranslationStats();
    }

    addHistoryNavigation() {
        const recentSection = document.querySelector('.recent-translations');
        if (!recentSection) return;

        const header = recentSection.querySelector('h3');
        if (header) {
            const navContainer = document.createElement('div');
            navContainer.style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: var(--spacing-6);
            `;

            const title = header.cloneNode(true);
            header.remove();

            const navButtons = document.createElement('div');
            navButtons.style.cssText = `
                display: flex;
                gap: var(--spacing-2);
            `;

            const clearBtn = document.createElement('button');
            clearBtn.className = 'btn btn-outline btn-small';
            clearBtn.innerHTML = '<i class="fas fa-trash"></i> مسح التاريخ';
            clearBtn.addEventListener('click', () => {
                if (confirm('هل أنت متأكد من مسح جميع الترجمات الحديثة؟')) {
                    translator.recentTranslations = [];
                    translator.updateRecentTranslations();
                    translator.showMessage('تم مسح التاريخ', 'success');
                }
            });

            const exportBtn = document.createElement('button');
            exportBtn.className = 'btn btn-outline btn-small';
            exportBtn.innerHTML = '<i class="fas fa-download"></i> تصدير';
            exportBtn.addEventListener('click', () => {
                this.exportTranslations();
            });

            navButtons.appendChild(clearBtn);
            navButtons.appendChild(exportBtn);

            navContainer.appendChild(title);
            navContainer.appendChild(navButtons);
            recentSection.insertBefore(navContainer, recentSection.firstChild);
        }
    }

    addTranslationStats() {
        const recentSection = document.querySelector('.recent-translations');
        if (!recentSection) return;

        const statsContainer = document.createElement('div');
        statsContainer.className = 'translation-stats';
        statsContainer.style.cssText = `
            background: var(--gray-50);
            border-radius: var(--radius-lg);
            padding: var(--spacing-4);
            margin-bottom: var(--spacing-6);
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: var(--spacing-4);
        `;

        const totalTranslations = translator?.recentTranslations.length || 0;
        const todayTranslations = this.getTodayTranslations();
        const favoriteTranslations = translator?.favorites.length || 0;

        statsContainer.innerHTML = `
            <div class="stat-item" style="text-align: center;">
                <div style="font-size: var(--font-size-2xl); font-weight: 700; color: var(--primary-color);">${totalTranslations}</div>
                <div style="font-size: var(--font-size-sm); color: var(--gray-600);">إجمالي الترجمات</div>
            </div>
            <div class="stat-item" style="text-align: center;">
                <div style="font-size: var(--font-size-2xl); font-weight: 700; color: var(--success-color);">${todayTranslations}</div>
                <div style="font-size: var(--font-size-sm); color: var(--gray-600);">ترجمات اليوم</div>
            </div>
            <div class="stat-item" style="text-align: center;">
                <div style="font-size: var(--font-size-2xl); font-weight: 700; color: var(--accent-color);">${favoriteTranslations}</div>
                <div style="font-size: var(--font-size-sm); color: var(--gray-600);">المفضلة</div>
            </div>
        `;

        recentSection.insertBefore(statsContainer, recentSection.querySelector('.translations-list'));
    }

    getTodayTranslations() {
        if (!translator?.recentTranslations) return 0;
        
        const today = new Date().toDateString();
        return translator.recentTranslations.filter(translation => {
            const translationDate = new Date(translation.timestamp).toDateString();
            return translationDate === today;
        }).length;
    }

    exportTranslations() {
        if (!translator?.recentTranslations || translator.recentTranslations.length === 0) {
            translator?.showMessage('لا توجد ترجمات للتصدير', 'warning');
            return;
        }

        const data = translator.recentTranslations.map(item => ({
            'النص الأصلي': item.original,
            'الترجمة': item.translation,
            'اللغة المصدر': translator.getLanguageName(item.source),
            'اللغة الهدف': translator.getLanguageName(item.target),
            'التاريخ': new Date(item.timestamp).toLocaleString('ar-SA')
        }));

        const csv = this.convertToCSV(data);
        this.downloadCSV(csv, 'translations.csv');
        translator?.showMessage('تم تصدير الترجمات بنجاح', 'success');
    }

    convertToCSV(data) {
        if (data.length === 0) return '';

        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => 
                headers.map(header => 
                    `"${(row[header] || '').toString().replace(/"/g, '""')}"`
                ).join(',')
            )
        ].join('\n');

        return '\uFEFF' + csvContent; // Add BOM for UTF-8
    }

    downloadCSV(csv, filename) {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}

// Initialize translate page features
document.addEventListener('DOMContentLoaded', () => {
    new TranslatePage();
});

// Add global functions for inline event handlers
window.selectSuggestion = function(suggestion) {
    const textarea = document.getElementById('input-text');
    if (textarea) {
        textarea.value = suggestion;
        textarea.dispatchEvent(new Event('input'));
        textarea.focus();
    }
    
    const dropdown = document.querySelector('.suggestions-dropdown');
    if (dropdown) {
        dropdown.style.display = 'none';
    }
};

