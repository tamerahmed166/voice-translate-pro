// Firebase Configuration for Voice Translator Pro
// إعدادات Firebase لمترجم الصوت الذكي

// Firebase configuration object
const firebaseConfig = {
    apiKey: "your-api-key-here",
    authDomain: "voice-translator-pro.firebaseapp.com",
    projectId: "voice-translator-pro",
    storageBucket: "voice-translator-pro.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456",
    measurementId: "G-XXXXXXXXXX"
};

// Initialize Firebase
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

// Connect to emulators in development
if (window.location.hostname === 'localhost') {
    try {
        connectFirestoreEmulator(db, 'localhost', 8080);
        connectAuthEmulator(auth, 'http://localhost:9099');
        connectStorageEmulator(storage, 'localhost', 9199);
    } catch (error) {
        console.log('Emulators already connected or not available');
    }
}

// Database collections
export const COLLECTIONS = {
    USERS: 'users',
    TRANSLATIONS: 'translations',
    FAVORITES: 'favorites',
    CONVERSATIONS: 'conversations',
    SETTINGS: 'settings',
    ANALYTICS: 'analytics'
};

// Database service class
export class DatabaseService {
    constructor() {
        this.db = db;
        this.auth = auth;
    }

    // User management
    async createUser(userData) {
        try {
            const userRef = doc(this.db, COLLECTIONS.USERS, userData.uid);
            await setDoc(userRef, {
                ...userData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            return { success: true, data: userData };
        } catch (error) {
            console.error('Error creating user:', error);
            return { success: false, error: error.message };
        }
    }

    async getUser(uid) {
        try {
            const userRef = doc(this.db, COLLECTIONS.USERS, uid);
            const userSnap = await getDoc(userRef);
            
            if (userSnap.exists()) {
                return { success: true, data: userSnap.data() };
            } else {
                return { success: false, error: 'User not found' };
            }
        } catch (error) {
            console.error('Error getting user:', error);
            return { success: false, error: error.message };
        }
    }

    async updateUser(uid, userData) {
        try {
            const userRef = doc(this.db, COLLECTIONS.USERS, uid);
            await updateDoc(userRef, {
                ...userData,
                updatedAt: serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            console.error('Error updating user:', error);
            return { success: false, error: error.message };
        }
    }

    // Translation management
    async saveTranslation(translationData) {
        try {
            const translationRef = collection(this.db, COLLECTIONS.TRANSLATIONS);
            const docRef = await addDoc(translationRef, {
                ...translationData,
                userId: this.auth.currentUser?.uid || 'anonymous',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error('Error saving translation:', error);
            return { success: false, error: error.message };
        }
    }

    async getUserTranslations(uid, limit = 50) {
        try {
            const translationsRef = collection(this.db, COLLECTIONS.TRANSLATIONS);
            const q = query(
                translationsRef,
                where('userId', '==', uid),
                orderBy('createdAt', 'desc'),
                limit(limit)
            );
            
            const querySnapshot = await getDocs(q);
            const translations = [];
            
            querySnapshot.forEach((doc) => {
                translations.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            return { success: true, data: translations };
        } catch (error) {
            console.error('Error getting user translations:', error);
            return { success: false, error: error.message };
        }
    }

    async deleteTranslation(translationId) {
        try {
            const translationRef = doc(this.db, COLLECTIONS.TRANSLATIONS, translationId);
            await deleteDoc(translationRef);
            return { success: true };
        } catch (error) {
            console.error('Error deleting translation:', error);
            return { success: false, error: error.message };
        }
    }

    // Favorites management
    async addToFavorites(favoriteData) {
        try {
            const favoriteRef = collection(this.db, COLLECTIONS.FAVORITES);
            const docRef = await addDoc(favoriteRef, {
                ...favoriteData,
                userId: this.auth.currentUser?.uid || 'anonymous',
                createdAt: serverTimestamp()
            });
            
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error('Error adding to favorites:', error);
            return { success: false, error: error.message };
        }
    }

    async getUserFavorites(uid) {
        try {
            const favoritesRef = collection(this.db, COLLECTIONS.FAVORITES);
            const q = query(
                favoritesRef,
                where('userId', '==', uid),
                orderBy('createdAt', 'desc')
            );
            
            const querySnapshot = await getDocs(q);
            const favorites = [];
            
            querySnapshot.forEach((doc) => {
                favorites.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            return { success: true, data: favorites };
        } catch (error) {
            console.error('Error getting user favorites:', error);
            return { success: false, error: error.message };
        }
    }

    async removeFromFavorites(favoriteId) {
        try {
            const favoriteRef = doc(this.db, COLLECTIONS.FAVORITES, favoriteId);
            await deleteDoc(favoriteRef);
            return { success: true };
        } catch (error) {
            console.error('Error removing from favorites:', error);
            return { success: false, error: error.message };
        }
    }

    // Conversation management
    async saveConversation(conversationData) {
        try {
            const conversationRef = collection(this.db, COLLECTIONS.CONVERSATIONS);
            const docRef = await addDoc(conversationRef, {
                ...conversationData,
                userId: this.auth.currentUser?.uid || 'anonymous',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error('Error saving conversation:', error);
            return { success: false, error: error.message };
        }
    }

    async getUserConversations(uid) {
        try {
            const conversationsRef = collection(this.db, COLLECTIONS.CONVERSATIONS);
            const q = query(
                conversationsRef,
                where('userId', '==', uid),
                orderBy('createdAt', 'desc')
            );
            
            const querySnapshot = await getDocs(q);
            const conversations = [];
            
            querySnapshot.forEach((doc) => {
                conversations.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            return { success: true, data: conversations };
        } catch (error) {
            console.error('Error getting user conversations:', error);
            return { success: false, error: error.message };
        }
    }

    // Settings management
    async saveUserSettings(uid, settings) {
        try {
            const settingsRef = doc(this.db, COLLECTIONS.SETTINGS, uid);
            await setDoc(settingsRef, {
                ...settings,
                updatedAt: serverTimestamp()
            }, { merge: true });
            
            return { success: true };
        } catch (error) {
            console.error('Error saving user settings:', error);
            return { success: false, error: error.message };
        }
    }

    async getUserSettings(uid) {
        try {
            const settingsRef = doc(this.db, COLLECTIONS.SETTINGS, uid);
            const settingsSnap = await getDoc(settingsRef);
            
            if (settingsSnap.exists()) {
                return { success: true, data: settingsSnap.data() };
            } else {
                return { success: true, data: {} };
            }
        } catch (error) {
            console.error('Error getting user settings:', error);
            return { success: false, error: error.message };
        }
    }

    // Analytics
    async logTranslation(translationData) {
        try {
            const analyticsRef = collection(this.db, COLLECTIONS.ANALYTICS);
            await addDoc(analyticsRef, {
                ...translationData,
                userId: this.auth.currentUser?.uid || 'anonymous',
                timestamp: serverTimestamp(),
                userAgent: navigator.userAgent,
                language: navigator.language
            });
            
            return { success: true };
        } catch (error) {
            console.error('Error logging translation:', error);
            return { success: false, error: error.message };
        }
    }

    // Offline support
    enableOfflineSupport() {
        enableNetwork(this.db);
        disableNetwork(this.db);
    }

    // Real-time listeners
    onTranslationsChange(uid, callback) {
        const translationsRef = collection(this.db, COLLECTIONS.TRANSLATIONS);
        const q = query(
            translationsRef,
            where('userId', '==', uid),
            orderBy('createdAt', 'desc'),
            limit(50)
        );
        
        return onSnapshot(q, (snapshot) => {
            const translations = [];
            snapshot.forEach((doc) => {
                translations.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            callback(translations);
        });
    }

    onFavoritesChange(uid, callback) {
        const favoritesRef = collection(this.db, COLLECTIONS.FAVORITES);
        const q = query(
            favoritesRef,
            where('userId', '==', uid),
            orderBy('createdAt', 'desc')
        );
        
        return onSnapshot(q, (snapshot) => {
            const favorites = [];
            snapshot.forEach((doc) => {
                favorites.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            callback(favorites);
        });
    }
}

// Export database service instance
export const databaseService = new DatabaseService();

// Import Firebase functions
import {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    deleteDoc,
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    serverTimestamp,
    enableNetwork,
    disableNetwork
} from 'firebase/firestore';
