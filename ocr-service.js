// Enhanced OCR Service for Voice Translator Pro
// خدمة OCR المحسنة لمترجم الصوت الذكي

import { notificationService } from './notification-service.js';

export class OCRService {
    constructor() {
        this.worker = null;
        this.isInitialized = false;
        this.supportedLanguages = [
            'ara', 'eng', 'fra', 'spa', 'deu', 'ita', 'por', 'rus', 
            'chi_sim', 'chi_tra', 'jpn', 'kor', 'hin', 'tur', 'nld',
            'swe', 'nor', 'dan', 'fin', 'pol', 'ces', 'hun', 'ron',
            'bul', 'hrv', 'slk', 'slv', 'est', 'lav', 'lit', 'ell',
            'heb', 'fas', 'urd', 'ben', 'tam', 'tel', 'mal', 'kan',
            'guj', 'pan', 'mar', 'nep', 'sin', 'mya', 'tha', 'vie',
            'ind', 'msa', 'tgl', 'swa', 'amh', 'yor', 'ibo', 'hau',
            'zul', 'afr', 'sqi', 'mkd', 'srp', 'bos', 'mlt', 'isl',
            'gle', 'cym', 'eus', 'cat', 'glg'
        ];
        this.settings = this.loadSettings();
        
        this.init();
    }

    async init() {
        try {
            await this.initializeWorker();
            this.isInitialized = true;
            console.log('OCR Service initialized successfully');
        } catch (error) {
            console.error('Failed to initialize OCR service:', error);
            this.isInitialized = false;
        }
    }

    async initializeWorker() {
        if (typeof Tesseract === 'undefined') {
            throw new Error('Tesseract.js not loaded');
        }

        this.worker = await Tesseract.createWorker({
            logger: m => {
                if (m.status === 'recognizing text') {
                    this.updateProgress(m.progress);
                }
            }
        });

        // Load multiple languages for better accuracy
        const languages = this.getOptimalLanguages();
        await this.worker.loadLanguage(languages.join('+'));
        await this.worker.initialize(languages.join('+'));
        
        // Set OCR parameters for better accuracy
        await this.worker.setParameters({
            tessedit_char_whitelist: '',
            tessedit_pageseg_mode: Tesseract.PSM.AUTO,
            tessedit_ocr_engine_mode: Tesseract.OEM.LSTM_ONLY,
            preserve_interword_spaces: '1',
            tessedit_create_hocr: '1',
            tessedit_create_tsv: '1'
        });
    }

    getOptimalLanguages() {
        // Return languages based on user settings and common usage
        const defaultLanguages = ['ara', 'eng'];
        
        if (this.settings.preferredLanguages && this.settings.preferredLanguages.length > 0) {
            return [...this.settings.preferredLanguages, ...defaultLanguages];
        }
        
        return defaultLanguages;
    }

    async extractTextFromImage(imageFile, options = {}) {
        if (!this.isInitialized) {
            throw new Error('OCR service not initialized');
        }

        if (!imageFile || !imageFile.type.startsWith('image/')) {
            throw new Error('Invalid image file');
        }

        try {
            // Preprocess image for better OCR results
            const processedImage = await this.preprocessImage(imageFile, options);
            
            // Perform OCR with enhanced settings
            const result = await this.worker.recognize(processedImage, {
                rectangle: options.region || null,
                language: options.language || this.getOptimalLanguages().join('+')
            });

            // Post-process the extracted text
            const processedText = this.postProcessText(result.data.text, options);
            
            // Log OCR event
            await this.logOCREvent('text_extracted', {
                textLength: processedText.length,
                confidence: result.data.confidence,
                language: options.language || 'auto'
            });

            return {
                text: processedText,
                confidence: result.data.confidence,
                words: result.data.words,
                lines: result.data.lines,
                blocks: result.data.blocks,
                hocr: result.data.hocr,
                tsv: result.data.tsv
            };

        } catch (error) {
            console.error('OCR extraction error:', error);
            await this.logOCREvent('extraction_error', { error: error.message });
            throw error;
        }
    }

    async preprocessImage(imageFile, options = {}) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                // Set canvas dimensions
                canvas.width = img.width;
                canvas.height = img.height;

                // Draw image
                ctx.drawImage(img, 0, 0);

                // Apply preprocessing based on options
                if (options.enhanceContrast) {
                    this.enhanceContrast(ctx, canvas.width, canvas.height);
                }

                if (options.removeNoise) {
                    this.removeNoise(ctx, canvas.width, canvas.height);
                }

                if (options.deskew) {
                    this.deskewImage(ctx, canvas.width, canvas.height);
                }

                if (options.binarize) {
                    this.binarizeImage(ctx, canvas.width, canvas.height);
                }

                // Convert to blob
                canvas.toBlob((blob) => {
                    resolve(blob);
                }, 'image/png');
            };

            img.src = URL.createObjectURL(imageFile);
        });
    }

    enhanceContrast(ctx, width, height) {
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        // Apply contrast enhancement
        const factor = 1.2;
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, data[i] * factor);     // Red
            data[i + 1] = Math.min(255, data[i + 1] * factor); // Green
            data[i + 2] = Math.min(255, data[i + 2] * factor); // Blue
        }

        ctx.putImageData(imageData, 0, 0);
    }

    removeNoise(ctx, width, height) {
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        // Simple noise reduction using median filter
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = (y * width + x) * 4;
                
                // Get surrounding pixels
                const neighbors = [];
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        const nIdx = ((y + dy) * width + (x + dx)) * 4;
                        neighbors.push(data[nIdx]); // Use red channel for simplicity
                    }
                }
                
                // Apply median filter
                neighbors.sort((a, b) => a - b);
                const median = neighbors[4]; // Middle value
                
                data[idx] = median;     // Red
                data[idx + 1] = median; // Green
                data[idx + 2] = median; // Blue
            }
        }

        ctx.putImageData(imageData, 0, 0);
    }

    deskewImage(ctx, width, height) {
        // Simple deskewing implementation
        // This is a basic version - more sophisticated algorithms can be implemented
        const imageData = ctx.getImageData(0, 0, width, height);
        
        // Apply slight rotation correction (this is simplified)
        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.rotate(0.02); // Small rotation correction
        ctx.translate(-width / 2, -height / 2);
        ctx.putImageData(imageData, 0, 0);
        ctx.restore();
    }

    binarizeImage(ctx, width, height) {
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        // Convert to grayscale and binarize
        for (let i = 0; i < data.length; i += 4) {
            const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
            const binary = gray > 128 ? 255 : 0;
            
            data[i] = binary;     // Red
            data[i + 1] = binary; // Green
            data[i + 2] = binary; // Blue
        }

        ctx.putImageData(imageData, 0, 0);
    }

    postProcessText(text, options = {}) {
        if (!text) return '';

        let processedText = text;

        // Remove extra whitespace
        processedText = processedText.replace(/\s+/g, ' ').trim();

        // Fix common OCR errors
        if (options.fixCommonErrors) {
            processedText = this.fixCommonOCRErrors(processedText);
        }

        // Remove unwanted characters
        if (options.cleanText) {
            processedText = this.cleanText(processedText);
        }

        // Apply language-specific corrections
        if (options.language) {
            processedText = this.applyLanguageCorrections(processedText, options.language);
        }

        return processedText;
    }

    fixCommonOCRErrors(text) {
        const corrections = {
            // Arabic corrections
            '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
            '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
            
            // English corrections
            '0': 'O', '1': 'I', '5': 'S', '8': 'B',
            
            // Common character confusions
            'rn': 'm', 'cl': 'd', 'li': 'h'
        };

        let correctedText = text;
        for (const [wrong, correct] of Object.entries(corrections)) {
            correctedText = correctedText.replace(new RegExp(wrong, 'g'), correct);
        }

        return correctedText;
    }

    cleanText(text) {
        // Remove unwanted characters but preserve text structure
        return text
            .replace(/[^\w\s\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g, '')
            .replace(/\n\s*\n/g, '\n')
            .trim();
    }

    applyLanguageCorrections(text, language) {
        // Language-specific text corrections
        switch (language) {
            case 'ara':
                return this.correctArabicText(text);
            case 'eng':
                return this.correctEnglishText(text);
            default:
                return text;
        }
    }

    correctArabicText(text) {
        // Arabic-specific corrections
        const arabicCorrections = {
            'ا': 'ا', 'أ': 'أ', 'إ': 'إ', 'آ': 'آ',
            'ة': 'ة', 'ه': 'ه',
            'ي': 'ي', 'ى': 'ى'
        };

        let correctedText = text;
        for (const [wrong, correct] of Object.entries(arabicCorrections)) {
            correctedText = correctedText.replace(new RegExp(wrong, 'g'), correct);
        }

        return correctedText;
    }

    correctEnglishText(text) {
        // English-specific corrections
        const englishCorrections = {
            'rn': 'm',
            'cl': 'd',
            'li': 'h',
            'vv': 'w',
            'nn': 'm'
        };

        let correctedText = text;
        for (const [wrong, correct] of Object.entries(englishCorrections)) {
            correctedText = correctedText.replace(new RegExp(wrong, 'g'), correct);
        }

        return correctedText;
    }

    async extractTextFromMultipleImages(imageFiles, options = {}) {
        const results = [];
        
        for (let i = 0; i < imageFiles.length; i++) {
            try {
                const result = await this.extractTextFromImage(imageFiles[i], options);
                results.push({
                    file: imageFiles[i].name,
                    text: result.text,
                    confidence: result.confidence,
                    success: true
                });
                
                // Update progress
                this.updateProgress((i + 1) / imageFiles.length);
                
            } catch (error) {
                results.push({
                    file: imageFiles[i].name,
                    text: '',
                    confidence: 0,
                    success: false,
                    error: error.message
                });
            }
        }
        
        return results;
    }

    async detectTextRegions(imageFile) {
        if (!this.isInitialized) {
            throw new Error('OCR service not initialized');
        }

        try {
            const result = await this.worker.detect(imageFile);
            return result.data.words.map(word => ({
                text: word.text,
                confidence: word.confidence,
                bbox: word.bbox,
                x0: word.bbox.x0,
                y0: word.bbox.y0,
                x1: word.bbox.x1,
                y1: word.bbox.y1
            }));
        } catch (error) {
            console.error('Text region detection error:', error);
            throw error;
        }
    }

    async extractTextFromRegion(imageFile, region, options = {}) {
        if (!this.isInitialized) {
            throw new Error('OCR service not initialized');
        }

        try {
            const result = await this.worker.recognize(imageFile, {
                rectangle: region,
                language: options.language || this.getOptimalLanguages().join('+')
            });

            return {
                text: this.postProcessText(result.data.text, options),
                confidence: result.data.confidence,
                region: region
            };
        } catch (error) {
            console.error('Region OCR error:', error);
            throw error;
        }
    }

    updateProgress(progress) {
        // Dispatch progress event
        const event = new CustomEvent('ocrProgress', {
            detail: { progress: Math.round(progress * 100) }
        });
        document.dispatchEvent(event);
    }

    // Settings Management
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.saveSettings();
    }

    loadSettings() {
        const defaultSettings = {
            preferredLanguages: ['ara', 'eng'],
            enhanceContrast: true,
            removeNoise: true,
            deskew: false,
            binarize: false,
            fixCommonErrors: true,
            cleanText: true,
            autoDetectLanguage: true,
            confidenceThreshold: 60
        };

        try {
            const saved = localStorage.getItem('ocr-settings');
            return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
        } catch (error) {
            console.error('Error loading OCR settings:', error);
            return defaultSettings;
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('ocr-settings', JSON.stringify(this.settings));
        } catch (error) {
            console.error('Error saving OCR settings:', error);
        }
    }

    // Analytics
    async logOCREvent(eventType, data = {}) {
        try {
            // This would integrate with your analytics service
            console.log('OCR Event:', eventType, data);
        } catch (error) {
            console.error('Error logging OCR event:', error);
        }
    }

    // Utility Methods
    getSupportedLanguages() {
        return this.supportedLanguages;
    }

    isLanguageSupported(language) {
        return this.supportedLanguages.includes(language);
    }

    getLanguageDisplayName(code) {
        const languageNames = {
            'ara': 'العربية',
            'eng': 'English',
            'fra': 'Français',
            'spa': 'Español',
            'deu': 'Deutsch',
            'ita': 'Italiano',
            'por': 'Português',
            'rus': 'Русский',
            'chi_sim': '中文 (简体)',
            'chi_tra': '中文 (繁體)',
            'jpn': '日本語',
            'kor': '한국어',
            'hin': 'हिन्दी',
            'tur': 'Türkçe',
            'nld': 'Nederlands',
            'swe': 'Svenska',
            'nor': 'Norsk',
            'dan': 'Dansk',
            'fin': 'Suomi',
            'pol': 'Polski',
            'ces': 'Čeština',
            'hun': 'Magyar',
            'ron': 'Română',
            'bul': 'Български',
            'hrv': 'Hrvatski',
            'slk': 'Slovenčina',
            'slv': 'Slovenščina',
            'est': 'Eesti',
            'lav': 'Latviešu',
            'lit': 'Lietuvių',
            'ell': 'Ελληνικά',
            'heb': 'עברית',
            'fas': 'فارسی',
            'urd': 'اردو',
            'ben': 'বাংলা',
            'tam': 'தமிழ்',
            'tel': 'తెలుగు',
            'mal': 'മലയാളം',
            'kan': 'ಕನ್ನಡ',
            'guj': 'ગુજરાતી',
            'pan': 'ਪੰਜਾਬੀ',
            'mar': 'मराठी',
            'nep': 'नेपाली',
            'sin': 'සිංහල',
            'mya': 'မြန်မာ',
            'tha': 'ไทย',
            'vie': 'Tiếng Việt',
            'ind': 'Bahasa Indonesia',
            'msa': 'Bahasa Melayu',
            'tgl': 'Filipino',
            'swa': 'Kiswahili',
            'amh': 'አማርኛ',
            'yor': 'Yorùbá',
            'ibo': 'Igbo',
            'hau': 'Hausa',
            'zul': 'IsiZulu',
            'afr': 'Afrikaans',
            'sqi': 'Shqip',
            'mkd': 'Македонски',
            'srp': 'Српски',
            'bos': 'Bosanski',
            'mlt': 'Malti',
            'isl': 'Íslenska',
            'gle': 'Gaeilge',
            'cym': 'Cymraeg',
            'eus': 'Euskera',
            'cat': 'Català',
            'glg': 'Galego'
        };
        return languageNames[code] || code;
    }

    // Cleanup
    async terminate() {
        if (this.worker) {
            await this.worker.terminate();
            this.worker = null;
            this.isInitialized = false;
        }
    }

    // Test Methods
    async testOCR(imageFile) {
        try {
            const result = await this.extractTextFromImage(imageFile, {
                enhanceContrast: true,
                removeNoise: true,
                fixCommonErrors: true,
                cleanText: true
            });
            
            console.log('OCR Test Result:', result);
            return result;
        } catch (error) {
            console.error('OCR Test Error:', error);
            throw error;
        }
    }
}

// Export OCR service instance
export const ocrService = new OCRService();
