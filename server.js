// Voice Translator Pro - Backend Server
// خادم الخلفية لمترجم الصوت الذكي

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('.'));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// API Routes

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        services: {
            translation: 'active',
            ocr: 'active',
            speech: 'active',
            database: 'active'
        }
    });
});

// Translation API
app.post('/api/translate', async (req, res) => {
    try {
        const { text, sourceLang, targetLang, mode = 'contextual' } = req.body;
        
        if (!text || !sourceLang || !targetLang) {
            return res.status(400).json({
                error: 'Missing required parameters: text, sourceLang, targetLang'
            });
        }

        // Simulate translation processing
        const translation = await simulateTranslation(text, sourceLang, targetLang, mode);
        
        res.json({
            success: true,
            originalText: text,
            translatedText: translation,
            sourceLanguage: sourceLang,
            targetLanguage: targetLang,
            mode: mode,
            confidence: 0.95,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Translation error:', error);
        res.status(500).json({
            error: 'Translation failed',
            message: error.message
        });
    }
});

// OCR API
app.post('/api/ocr', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: 'No image file provided'
            });
        }

        const imagePath = req.file.path;
        const { targetLang = 'en' } = req.body;
        
        // Simulate OCR processing
        const ocrResult = await simulateOCR(imagePath, targetLang);
        
        // Clean up uploaded file
        fs.unlinkSync(imagePath);
        
        res.json({
            success: true,
            extractedText: ocrResult.text,
            translatedText: ocrResult.translation,
            confidence: ocrResult.confidence,
            language: ocrResult.language,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('OCR error:', error);
        res.status(500).json({
            error: 'OCR processing failed',
            message: error.message
        });
    }
});

// Speech Recognition API
app.post('/api/speech-to-text', upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: 'No audio file provided'
            });
        }

        const audioPath = req.file.path;
        const { language = 'auto' } = req.body;
        
        // Simulate speech recognition
        const speechResult = await simulateSpeechRecognition(audioPath, language);
        
        // Clean up uploaded file
        fs.unlinkSync(audioPath);
        
        res.json({
            success: true,
            text: speechResult.text,
            confidence: speechResult.confidence,
            language: speechResult.language,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Speech recognition error:', error);
        res.status(500).json({
            error: 'Speech recognition failed',
            message: error.message
        });
    }
});

// Text-to-Speech API
app.post('/api/text-to-speech', async (req, res) => {
    try {
        const { text, language = 'en', voice = 'default' } = req.body;
        
        if (!text) {
            return res.status(400).json({
                error: 'No text provided'
            });
        }

        // Simulate TTS processing
        const ttsResult = await simulateTTS(text, language, voice);
        
        res.json({
            success: true,
            audioUrl: ttsResult.audioUrl,
            duration: ttsResult.duration,
            language: language,
            voice: voice,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('TTS error:', error);
        res.status(500).json({
            error: 'Text-to-speech failed',
            message: error.message
        });
    }
});

// Conversation API
app.post('/api/conversation', async (req, res) => {
    try {
        const { message, participantId, language, sessionId } = req.body;
        
        if (!message || !participantId) {
            return res.status(400).json({
                error: 'Missing required parameters: message, participantId'
            });
        }

        // Simulate conversation processing
        const conversationResult = await simulateConversation(message, participantId, language, sessionId);
        
        res.json({
            success: true,
            message: conversationResult.message,
            translation: conversationResult.translation,
            participantId: participantId,
            sessionId: sessionId,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Conversation error:', error);
        res.status(500).json({
            error: 'Conversation processing failed',
            message: error.message
        });
    }
});

// Smart Translation API
app.post('/api/smart-translate', async (req, res) => {
    try {
        const { text, sourceLang, targetLang, mode, contentType, context } = req.body;
        
        if (!text || !sourceLang || !targetLang) {
            return res.status(400).json({
                error: 'Missing required parameters'
            });
        }

        // Simulate smart translation
        const smartResult = await simulateSmartTranslation(text, sourceLang, targetLang, mode, contentType, context);
        
        res.json({
            success: true,
            originalText: text,
            translatedText: smartResult.translation,
            alternatives: smartResult.alternatives,
            confidence: smartResult.confidence,
            mode: mode,
            contentType: contentType,
            insights: smartResult.insights,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Smart translation error:', error);
        res.status(500).json({
            error: 'Smart translation failed',
            message: error.message
        });
    }
});

// Database operations
app.get('/api/translations', async (req, res) => {
    try {
        const { userId, limit = 50, offset = 0 } = req.query;
        
        // Simulate database query
        const translations = await simulateGetTranslations(userId, limit, offset);
        
        res.json({
            success: true,
            translations: translations,
            total: translations.length,
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
        
    } catch (error) {
        console.error('Get translations error:', error);
        res.status(500).json({
            error: 'Failed to retrieve translations',
            message: error.message
        });
    }
});

app.post('/api/translations', async (req, res) => {
    try {
        const { originalText, translatedText, sourceLang, targetLang, userId } = req.body;
        
        if (!originalText || !translatedText || !sourceLang || !targetLang) {
            return res.status(400).json({
                error: 'Missing required parameters'
            });
        }

        // Simulate saving translation
        const savedTranslation = await simulateSaveTranslation({
            originalText,
            translatedText,
            sourceLang,
            targetLang,
            userId,
            timestamp: new Date().toISOString()
        });
        
        res.json({
            success: true,
            translation: savedTranslation
        });
        
    } catch (error) {
        console.error('Save translation error:', error);
        res.status(500).json({
            error: 'Failed to save translation',
            message: error.message
        });
    }
});

// Serve static files
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Simulation functions (replace with real implementations)

async function simulateTranslation(text, sourceLang, targetLang, mode) {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock translation based on language pair
    const translations = {
        'ar-en': 'Hello, how are you?',
        'en-ar': 'مرحبا، كيف حالك؟',
        'ar-fr': 'Bonjour, comment allez-vous?',
        'fr-ar': 'مرحبا، كيف حالك؟',
        'en-fr': 'Bonjour, comment allez-vous?',
        'fr-en': 'Hello, how are you?'
    };
    
    const key = `${sourceLang}-${targetLang}`;
    return translations[key] || `[Translated: ${text}]`;
}

async function simulateOCR(imagePath, targetLang) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
        text: 'Sample extracted text from image',
        translation: 'نص عينة مستخرج من الصورة',
        confidence: 0.92,
        language: 'ar'
    };
}

async function simulateSpeechRecognition(audioPath, language) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
        text: 'مرحبا، كيف حالك؟',
        confidence: 0.88,
        language: 'ar'
    };
}

async function simulateTTS(text, language, voice) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
        audioUrl: `/api/audio/${uuidv4()}.mp3`,
        duration: 3.5,
        language: language,
        voice: voice
    };
}

async function simulateConversation(message, participantId, language, sessionId) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
        message: message,
        translation: `[Translated: ${message}]`,
        participantId: participantId,
        sessionId: sessionId || uuidv4()
    };
}

async function simulateSmartTranslation(text, sourceLang, targetLang, mode, contentType, context) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
        translation: `[Smart Translation: ${text}]`,
        alternatives: [
            `[Alternative 1: ${text}]`,
            `[Alternative 2: ${text}]`
        ],
        confidence: 0.96,
        insights: {
            complexity: 'medium',
            sentiment: 'positive',
            domain: 'general'
        }
    };
}

async function simulateGetTranslations(userId, limit, offset) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return [
        {
            id: uuidv4(),
            originalText: 'مرحبا',
            translatedText: 'Hello',
            sourceLang: 'ar',
            targetLang: 'en',
            timestamp: new Date().toISOString()
        }
    ];
}

async function simulateSaveTranslation(translation) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return {
        id: uuidv4(),
        ...translation
    };
}

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({
        error: 'Internal server error',
        message: error.message
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Voice Translator Pro Server running on port ${PORT}`);
    console.log(`📱 Frontend: http://localhost:${PORT}`);
    console.log(`🔧 API: http://localhost:${PORT}/api`);
    console.log(`💚 Health: http://localhost:${PORT}/api/health`);
});

module.exports = app;

