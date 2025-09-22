# دليل البدء السريع - Quick Start Guide
## Voice Translator Pro

### 🚀 التشغيل السريع

#### 1. تشغيل الخادم الخلفي
```bash
# في Terminal/PowerShell
node server-simple.js
```

#### 2. فتح الواجهة الأمامية
```bash
# في Terminal/PowerShell آخر
python -m http.server 8000
```

#### 3. فتح التطبيق
- افتح المتصفح واذهب إلى: `http://localhost:8000`
- أو افتح `index.html` مباشرة

### ✅ التحقق من التكامل

#### مؤشر الحالة
- راقب مؤشر الحالة في الصفحة الرئيسية
- 🟢 أخضر = متصل بالكامل
- 🟡 أصفر = جزئي
- 🔴 أحمر = غير متصل

#### اختبار API
```javascript
// في وحدة التحكم (F12)
fetch('http://localhost:3000/api/health')
  .then(r => r.json())
  .then(console.log)
```

#### اختبار الترجمة
```javascript
// في وحدة التحكم
fetch('http://localhost:3000/api/translate', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    text: 'مرحبا',
    sourceLang: 'ar',
    targetLang: 'en'
  })
})
.then(r => r.json())
.then(console.log)
```

### 🔧 استكشاف الأخطاء

#### الخادم لا يعمل
```bash
# تحقق من المنفذ
netstat -an | findstr :3000
```

#### الواجهة لا تتصل
- تحقق من أن الخادم يعمل
- تحقق من مؤشر الحالة
- افتح وحدة التحكم للتفاصيل

#### مشاكل CORS
- الخادم يدعم CORS تلقائياً
- إذا كانت المشكلة مستمرة، أعد تشغيل الخادم

### 📁 الملفات المهمة

```
voice-translate-pro/
├── server-simple.js          # الخادم الرئيسي
├── index.html                # الصفحة الرئيسية
├── api-service.js           # خدمة API
├── frontend-config.js       # تكوين الواجهة
├── integration-manager.js   # مدير التكامل
├── styles.css              # الأنماط
└── INTEGRATION-REPORT.md    # تقرير التكامل
```

### 🎯 الميزات المتاحة

#### الترجمة
- ترجمة نصية فورية
- دعم 100+ لغة
- ترجمة ذكية متقدمة

#### OCR
- التعرف على النصوص من الصور
- دعم متعدد اللغات
- معالجة الصور المعقدة

#### المحادثات
- محادثة ثنائية
- ترجمة فورية
- دعم الصوت والفيديو

### 🔄 إعادة التشغيل

#### إعادة تشغيل الخادم
```bash
# أوقف الخادم (Ctrl+C)
# ثم أعد التشغيل
node server-simple.js
```

#### إعادة تحميل الواجهة
- اضغط F5 في المتصفح
- أو Ctrl+F5 لإعادة تحميل كاملة

### 📊 مراقبة الأداء

#### وحدة التحكم
```javascript
// حالة التكامل
integrationManager.getStatus()

// اختبار التكامل
integrationManager.testIntegration()

// حالة API
apiService.getConnectionStatus()
```

#### مؤشرات الأداء
- وقت الاستجابة
- معدل النجاح
- حالة الاتصال
- الأخطاء

### 🆘 الدعم السريع

#### مشاكل شائعة
1. **الخادم لا يبدأ**: تحقق من Node.js
2. **الواجهة لا تحمل**: تحقق من الملفات
3. **API لا يعمل**: تحقق من الخادم
4. **CORS خطأ**: أعد تشغيل الخادم

#### الحلول السريعة
```bash
# إعادة تثبيت Node.js
# إعادة تشغيل الخادم
# مسح cache المتصفح
# فحص وحدة التحكم
```

---
**ملاحظة**: هذا دليل سريع. للحصول على تفاصيل أكثر، راجع `INTEGRATION-REPORT.md`

**التاريخ**: 2024-09-22
**الإصدار**: 1.0.0