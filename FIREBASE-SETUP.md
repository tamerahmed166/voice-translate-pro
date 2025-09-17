# 🔥 دليل إعداد Firebase - مترجم الصوت الذكي

## نظرة عامة

هذا الدليل يوضح كيفية إعداد Firebase لمشروع مترجم الصوت الذكي مع جميع الخدمات المطلوبة.

## 📋 المتطلبات

- حساب Google
- Node.js (إصدار 14 أو أحدث)
- Firebase CLI
- متصفح حديث

## 🚀 الخطوة 1: إنشاء مشروع Firebase

### 1.1 الوصول إلى Firebase Console
1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. اضغط "إنشاء مشروع" أو "Add project"
3. أدخل اسم المشروع: `voice-translator-pro`
4. اختر "تمكين Google Analytics" (اختياري)
5. اضغط "إنشاء المشروع"

### 1.2 إعداد المشروع
1. اختر خطة "Spark" (مجانية) أو "Blaze" (مدفوعة)
2. قم بتفعيل Google Analytics إذا كنت تريده
3. اضغط "إنشاء المشروع"

## 🔧 الخطوة 2: إضافة تطبيق ويب

### 2.1 إضافة تطبيق ويب
1. في لوحة التحكم، اضغط على أيقونة الويب `</>`
2. أدخل اسم التطبيق: `Voice Translator Pro`
3. اختر "إعداد Firebase Hosting" (اختياري)
4. اضغط "تسجيل التطبيق"

### 2.2 الحصول على التكوين
```javascript
// سيتم عرض كود التكوين مثل هذا:
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "voice-translator-pro.firebaseapp.com",
  projectId: "voice-translator-pro",
  storageBucket: "voice-translator-pro.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890abcdef"
};
```

## 🔐 الخطوة 3: إعداد Authentication

### 3.1 تفعيل Authentication
1. في القائمة الجانبية، اختر "Authentication"
2. اضغط "Get started"
3. اذهب إلى تبويب "Sign-in method"

### 3.2 تفعيل طرق تسجيل الدخول
1. **البريد الإلكتروني/كلمة المرور**:
   - اضغط "البريد الإلكتروني/كلمة المرور"
   - فعّل "البريد الإلكتروني/كلمة المرور"
   - اضغط "حفظ"

2. **Google**:
   - اضغط "Google"
   - فعّل "Google"
   - اختر "Project support email"
   - اضغط "حفظ"

3. **Facebook** (اختياري):
   - اضغط "Facebook"
   - فعّل "Facebook"
   - أدخل App ID و App Secret من Facebook Developer
   - اضغط "حفظ"

4. **Twitter** (اختياري):
   - اضغط "Twitter"
   - فعّل "Twitter"
   - أدخل API Key و API Secret من Twitter Developer
   - اضغط "حفظ"

### 3.3 إعداد Authorized Domains
1. في تبويب "Settings"
2. أضف النطاقات المسموحة:
   - `localhost` (للاختبار المحلي)
   - `your-domain.com` (للموقع الإنتاجي)
   - `your-username.github.io` (لـ GitHub Pages)

## 🗄️ الخطوة 4: إعداد Firestore Database

### 4.1 إنشاء قاعدة البيانات
1. في القائمة الجانبية، اختر "Firestore Database"
2. اضغط "Create database"
3. اختر "Start in test mode" (للاختبار)
4. اختر موقع قاعدة البيانات (الأقرب للمستخدمين)

### 4.2 إعداد قواعد الأمان
```javascript
// قواعد Firestore للأمان
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // قاعدة بيانات المستخدمين
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // قاعدة بيانات المحادثات
    match /conversations/{conversationId} {
      allow read, write: if request.auth != null && 
        (resource.data.participants[request.auth.uid] != null || 
         request.auth.uid == resource.data.createdBy);
    }
    
    // قاعدة بيانات المجموعات
    match /groups/{groupId} {
      allow read, write: if request.auth != null && 
        (resource.data.participants[request.auth.uid] != null || 
         request.auth.uid == resource.data.adminId);
    }
    
    // قاعدة بيانات الترجمات
    match /translations/{translationId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

### 4.3 إنشاء الفهارس
```javascript
// فهارس Firestore المطلوبة
// 1. فهرس للمحادثات حسب المستخدم
// Collection: conversations
// Fields: participants (array), createdAt (timestamp)

// 2. فهرس للمجموعات حسب المدير
// Collection: groups
// Fields: adminId (string), createdAt (timestamp)

// 3. فهرس للترجمات حسب المستخدم
// Collection: translations
// Fields: userId (string), createdAt (timestamp)
```

## 📱 الخطوة 5: إعداد Cloud Messaging

### 5.1 تفعيل Cloud Messaging
1. في القائمة الجانبية، اختر "Cloud Messaging"
2. اضغط "Get started"

### 5.2 إعداد Service Worker
```javascript
// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  // إدراج التكوين هنا
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/assets/icon-192x192.png',
    badge: '/assets/badge.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
```

## 🏗️ الخطوة 6: إعداد Firebase Hosting

### 6.1 تثبيت Firebase CLI
```bash
npm install -g firebase-tools
```

### 6.2 تسجيل الدخول
```bash
firebase login
```

### 6.3 تهيئة المشروع
```bash
firebase init
```

### 6.4 إعداد firebase.json
```json
{
  "hosting": {
    "public": ".",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

## 🔧 الخطوة 7: تحديث ملفات التطبيق

### 7.1 تحديث firebase-config.js
```javascript
// firebase-config.js
import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getMessaging, getToken } from 'firebase/messaging';

// تكوين Firebase الخاص بك
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const messaging = getMessaging(app);

// تفعيل الاستمرارية المحلية
enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code == 'failed-precondition') {
      console.warn('Multiple tabs open, persistence might not work as expected.');
    } else if (err.code == 'unimplemented') {
      console.warn('The current browser does not support offline persistence.');
    }
  });

// إعداد الإشعارات
const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: 'YOUR_VAPID_KEY'
      });
      console.log('FCM Token:', token);
      return token;
    }
  } catch (error) {
    console.error('Error getting notification permission:', error);
  }
};

export { app, db, auth, messaging, requestNotificationPermission };
```

### 7.2 تحديث manifest.json
```json
{
  "name": "Voice Translator Pro",
  "short_name": "VoiceTranslator",
  "description": "تطبيق ويب متقدم للترجمة الصوتية والنصية",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#4F46E5",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "assets/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "assets/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "assets/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png"
    },
    {
      "src": "assets/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png"
    },
    {
      "src": "assets/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png"
    },
    {
      "src": "assets/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "assets/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png"
    },
    {
      "src": "assets/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

## 🧪 الخطوة 8: اختبار التكوين

### 8.1 اختبار الاتصال
```javascript
// test-firebase.js
import { app, db, auth } from './firebase-config.js';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';

// اختبار الاتصال بقاعدة البيانات
const testFirestore = async () => {
  try {
    const testCollection = collection(db, 'test');
    const docRef = await addDoc(testCollection, {
      message: 'Hello Firebase!',
      timestamp: new Date()
    });
    console.log('Document written with ID: ', docRef.id);
    
    const querySnapshot = await getDocs(testCollection);
    querySnapshot.forEach((doc) => {
      console.log('Document data:', doc.data());
    });
  } catch (error) {
    console.error('Error testing Firestore:', error);
  }
};

// اختبار المصادقة
const testAuth = async () => {
  try {
    const userCredential = await signInAnonymously(auth);
    console.log('User signed in:', userCredential.user);
  } catch (error) {
    console.error('Error testing Auth:', error);
  }
};

// تشغيل الاختبارات
testFirestore();
testAuth();
```

### 8.2 اختبار الإشعارات
```javascript
// test-notifications.js
import { messaging, requestNotificationPermission } from './firebase-config.js';

const testNotifications = async () => {
  try {
    const token = await requestNotificationPermission();
    if (token) {
      console.log('Notification permission granted');
      console.log('FCM Token:', token);
    } else {
      console.log('Notification permission denied');
    }
  } catch (error) {
    console.error('Error testing notifications:', error);
  }
};

testNotifications();
```

## 🚀 الخطوة 9: النشر

### 9.1 بناء المشروع
```bash
# إذا كنت تستخدم bundler
npm run build

# أو نسخ الملفات للدليل العام
cp -r src/* public/
```

### 9.2 النشر على Firebase Hosting
```bash
firebase deploy
```

### 9.3 النشر على GitHub Pages
```bash
# إضافة الملفات
git add .
git commit -m "Add Firebase configuration"
git push origin main

# تفعيل GitHub Pages في إعدادات المستودع
```

## 🔒 الخطوة 10: الأمان والإنتاج

### 10.1 تحديث قواعد الأمان
```javascript
// قواعد Firestore للإنتاج
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // قاعدة بيانات المستخدمين
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // قاعدة بيانات المحادثات
    match /conversations/{conversationId} {
      allow read, write: if request.auth != null && 
        (resource.data.participants[request.auth.uid] != null || 
         request.auth.uid == resource.data.createdBy);
    }
    
    // قاعدة بيانات المجموعات
    match /groups/{groupId} {
      allow read, write: if request.auth != null && 
        (resource.data.participants[request.auth.uid] != null || 
         request.auth.uid == resource.data.adminId);
    }
    
    // قاعدة بيانات الترجمات
    match /translations/{translationId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

### 10.2 إعداد متغيرات البيئة
```javascript
// .env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_VAPID_KEY=your_vapid_key
```

## 📊 الخطوة 11: المراقبة والتحليل

### 11.1 إعداد Google Analytics
1. في Firebase Console، اختر "Analytics"
2. اتبع التعليمات لإعداد Google Analytics
3. أضف كود التتبع إلى التطبيق

### 11.2 مراقبة الأداء
1. في Firebase Console، اختر "Performance"
2. أضف Firebase Performance SDK
3. راقب مقاييس الأداء

### 11.3 مراقبة الأخطاء
1. في Firebase Console، اختر "Crashlytics"
2. أضف Firebase Crashlytics SDK
3. راقب الأخطاء والتطبيقات المحطمة

## ✅ قائمة التحقق

- [ ] إنشاء مشروع Firebase
- [ ] إضافة تطبيق ويب
- [ ] إعداد Authentication
- [ ] إعداد Firestore Database
- [ ] إعداد Cloud Messaging
- [ ] إعداد Firebase Hosting
- [ ] تحديث ملفات التطبيق
- [ ] اختبار التكوين
- [ ] النشر
- [ ] إعداد الأمان
- [ ] إعداد المراقبة

## 🆘 استكشاف الأخطاء

### مشاكل شائعة:
1. **خطأ في التكوين**: تأكد من صحة مفاتيح API
2. **مشاكل الأمان**: راجع قواعد Firestore
3. **مشاكل الإشعارات**: تأكد من إعداد Service Worker
4. **مشاكل النشر**: راجع إعدادات Hosting

### مصادر المساعدة:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Support](https://firebase.google.com/support)
- [Firebase Community](https://firebase.community/)

---

**تم إعداد Firebase بنجاح! 🎉**

الآن يمكنك استخدام جميع خدمات Firebase في تطبيق مترجم الصوت الذكي.
