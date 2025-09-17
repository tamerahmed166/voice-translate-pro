// Authentication Service for Voice Translator Pro
// خدمة المصادقة لمترجم الصوت الذكي

import { 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    FacebookAuthProvider,
    TwitterAuthProvider,
    signOut,
    onAuthStateChanged,
    updateProfile,
    sendPasswordResetEmail,
    sendEmailVerification,
    updatePassword,
    deleteUser,
    reauthenticateWithCredential,
    EmailAuthProvider
} from 'firebase/auth';

import { auth, databaseService } from './firebase-config.js';

// Auth providers
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const twitterProvider = new TwitterAuthProvider();

// Configure providers
googleProvider.addScope('email');
googleProvider.addScope('profile');
facebookProvider.addScope('email');
twitterProvider.addScope('email');

export class AuthService {
    constructor() {
        this.auth = auth;
        this.databaseService = databaseService;
        this.currentUser = null;
        this.authStateListeners = [];
        
        // Listen to auth state changes
        this.initAuthStateListener();
    }

    // Initialize auth state listener
    initAuthStateListener() {
        onAuthStateChanged(this.auth, async (user) => {
            this.currentUser = user;
            
            if (user) {
                // User is signed in
                await this.handleUserSignIn(user);
            } else {
                // User is signed out
                this.handleUserSignOut();
            }
            
            // Notify listeners
            this.authStateListeners.forEach(listener => {
                listener(user);
            });
        });
    }

    // Handle user sign in
    async handleUserSignIn(user) {
        try {
            // Check if user exists in database
            const userResult = await this.databaseService.getUser(user.uid);
            
            if (!userResult.success) {
                // Create new user in database
                const userData = {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName || user.email.split('@')[0],
                    photoURL: user.photoURL || null,
                    emailVerified: user.emailVerified,
                    provider: user.providerData[0]?.providerId || 'email',
                    lastSignIn: new Date().toISOString(),
                    preferences: {
                        language: 'ar',
                        theme: 'light',
                        notifications: true,
                        autoSave: true
                    }
                };
                
                await this.databaseService.createUser(userData);
            } else {
                // Update last sign in
                await this.databaseService.updateUser(user.uid, {
                    lastSignIn: new Date().toISOString()
                });
            }
            
            // Load user data
            await this.loadUserData();
            
        } catch (error) {
            console.error('Error handling user sign in:', error);
        }
    }

    // Handle user sign out
    handleUserSignOut() {
        this.currentUser = null;
        // Clear any cached user data
        localStorage.removeItem('userData');
        localStorage.removeItem('userSettings');
    }

    // Load user data
    async loadUserData() {
        if (!this.currentUser) return;
        
        try {
            // Load user settings
            const settingsResult = await this.databaseService.getUserSettings(this.currentUser.uid);
            if (settingsResult.success) {
                localStorage.setItem('userSettings', JSON.stringify(settingsResult.data));
            }
            
            // Load user translations
            const translationsResult = await this.databaseService.getUserTranslations(this.currentUser.uid);
            if (translationsResult.success) {
                localStorage.setItem('userTranslations', JSON.stringify(translationsResult.data));
            }
            
            // Load user favorites
            const favoritesResult = await this.databaseService.getUserFavorites(this.currentUser.uid);
            if (favoritesResult.success) {
                localStorage.setItem('userFavorites', JSON.stringify(favoritesResult.data));
            }
            
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    // Email/Password Authentication
    async signInWithEmail(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
            return { success: true, user: userCredential.user };
        } catch (error) {
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    }

    async signUpWithEmail(email, password, displayName) {
        try {
            const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
            
            // Update profile
            await updateProfile(userCredential.user, {
                displayName: displayName
            });
            
            // Send email verification
            await sendEmailVerification(userCredential.user);
            
            return { success: true, user: userCredential.user };
        } catch (error) {
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    }

    // Social Authentication
    async signInWithGoogle() {
        try {
            const result = await signInWithPopup(this.auth, googleProvider);
            return { success: true, user: result.user };
        } catch (error) {
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    }

    async signInWithFacebook() {
        try {
            const result = await signInWithPopup(this.auth, facebookProvider);
            return { success: true, user: result.user };
        } catch (error) {
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    }

    async signInWithTwitter() {
        try {
            const result = await signInWithPopup(this.auth, twitterProvider);
            return { success: true, user: result.user };
        } catch (error) {
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    }

    // Sign out
    async signOut() {
        try {
            await signOut(this.auth);
            return { success: true };
        } catch (error) {
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    }

    // Password management
    async resetPassword(email) {
        try {
            await sendPasswordResetEmail(this.auth, email);
            return { success: true };
        } catch (error) {
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    }

    async updateUserPassword(currentPassword, newPassword) {
        try {
            const user = this.auth.currentUser;
            if (!user) {
                return { success: false, error: 'No user signed in' };
            }

            // Re-authenticate user
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);

            // Update password
            await updatePassword(user, newPassword);
            return { success: true };
        } catch (error) {
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    }

    // Profile management
    async updateUserProfile(profileData) {
        try {
            const user = this.auth.currentUser;
            if (!user) {
                return { success: false, error: 'No user signed in' };
            }

            await updateProfile(user, profileData);
            
            // Update in database
            await this.databaseService.updateUser(user.uid, profileData);
            
            return { success: true };
        } catch (error) {
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    }

    // Account management
    async deleteAccount(password) {
        try {
            const user = this.auth.currentUser;
            if (!user) {
                return { success: false, error: 'No user signed in' };
            }

            // Re-authenticate user
            const credential = EmailAuthProvider.credential(user.email, password);
            await reauthenticateWithCredential(user, credential);

            // Delete user data from database
            await this.databaseService.deleteUser(user.uid);

            // Delete user account
            await deleteUser(user);
            
            return { success: true };
        } catch (error) {
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    }

    // Auth state management
    addAuthStateListener(callback) {
        this.authStateListeners.push(callback);
        
        // Return unsubscribe function
        return () => {
            const index = this.authStateListeners.indexOf(callback);
            if (index > -1) {
                this.authStateListeners.splice(index, 1);
            }
        };
    }

    // User data management
    async saveTranslation(translationData) {
        if (!this.currentUser) {
            // Save to localStorage for anonymous users
            const translations = JSON.parse(localStorage.getItem('anonymousTranslations') || '[]');
            translations.unshift({
                ...translationData,
                id: Date.now(),
                timestamp: new Date().toISOString()
            });
            localStorage.setItem('anonymousTranslations', JSON.stringify(translations.slice(0, 50)));
            return { success: true };
        }

        return await this.databaseService.saveTranslation(translationData);
    }

    async saveToFavorites(favoriteData) {
        if (!this.currentUser) {
            // Save to localStorage for anonymous users
            const favorites = JSON.parse(localStorage.getItem('anonymousFavorites') || '[]');
            favorites.unshift({
                ...favoriteData,
                id: Date.now(),
                timestamp: new Date().toISOString()
            });
            localStorage.setItem('anonymousFavorites', JSON.stringify(favorites.slice(0, 100)));
            return { success: true };
        }

        return await this.databaseService.addToFavorites(favoriteData);
    }

    async saveUserSettings(settings) {
        if (!this.currentUser) {
            localStorage.setItem('anonymousSettings', JSON.stringify(settings));
            return { success: true };
        }

        return await this.databaseService.saveUserSettings(this.currentUser.uid, settings);
    }

    // Data migration (anonymous to authenticated)
    async migrateAnonymousData() {
        if (!this.currentUser) return { success: false, error: 'No user signed in' };

        try {
            // Migrate translations
            const anonymousTranslations = JSON.parse(localStorage.getItem('anonymousTranslations') || '[]');
            for (const translation of anonymousTranslations) {
                await this.databaseService.saveTranslation(translation);
            }

            // Migrate favorites
            const anonymousFavorites = JSON.parse(localStorage.getItem('anonymousFavorites') || '[]');
            for (const favorite of anonymousFavorites) {
                await this.databaseService.addToFavorites(favorite);
            }

            // Migrate settings
            const anonymousSettings = JSON.parse(localStorage.getItem('anonymousSettings') || '{}');
            if (Object.keys(anonymousSettings).length > 0) {
                await this.databaseService.saveUserSettings(this.currentUser.uid, anonymousSettings);
            }

            // Clear anonymous data
            localStorage.removeItem('anonymousTranslations');
            localStorage.removeItem('anonymousFavorites');
            localStorage.removeItem('anonymousSettings');

            return { success: true };
        } catch (error) {
            console.error('Error migrating anonymous data:', error);
            return { success: false, error: error.message };
        }
    }

    // Utility methods
    getCurrentUser() {
        return this.currentUser;
    }

    isAuthenticated() {
        return !!this.currentUser;
    }

    getErrorMessage(errorCode) {
        const errorMessages = {
            'auth/user-not-found': 'المستخدم غير موجود',
            'auth/wrong-password': 'كلمة المرور غير صحيحة',
            'auth/email-already-in-use': 'البريد الإلكتروني مستخدم بالفعل',
            'auth/weak-password': 'كلمة المرور ضعيفة جداً',
            'auth/invalid-email': 'البريد الإلكتروني غير صحيح',
            'auth/user-disabled': 'تم تعطيل هذا الحساب',
            'auth/too-many-requests': 'محاولات كثيرة جداً، حاول مرة أخرى لاحقاً',
            'auth/network-request-failed': 'خطأ في الشبكة، تحقق من اتصالك',
            'auth/popup-closed-by-user': 'تم إغلاق نافذة المصادقة',
            'auth/cancelled-popup-request': 'تم إلغاء طلب المصادقة',
            'auth/account-exists-with-different-credential': 'يوجد حساب بنفس البريد الإلكتروني مع طريقة مصادقة مختلفة'
        };

        return errorMessages[errorCode] || 'حدث خطأ غير متوقع';
    }

    // Analytics
    async logAuthEvent(eventType, additionalData = {}) {
        try {
            await this.databaseService.logTranslation({
                type: 'auth_event',
                event: eventType,
                userId: this.currentUser?.uid || 'anonymous',
                ...additionalData
            });
        } catch (error) {
            console.error('Error logging auth event:', error);
        }
    }
}

// Export auth service instance
export const authService = new AuthService();

// Export auth utilities
export const authUtils = {
    // Check if user is authenticated
    isAuthenticated: () => authService.isAuthenticated(),
    
    // Get current user
    getCurrentUser: () => authService.getCurrentUser(),
    
    // Add auth state listener
    onAuthStateChange: (callback) => authService.addAuthStateListener(callback),
    
    // Get user display name
    getUserDisplayName: () => {
        const user = authService.getCurrentUser();
        return user?.displayName || user?.email?.split('@')[0] || 'مستخدم';
    },
    
    // Get user photo URL
    getUserPhotoURL: () => {
        const user = authService.getCurrentUser();
        return user?.photoURL || null;
    },
    
    // Check if email is verified
    isEmailVerified: () => {
        const user = authService.getCurrentUser();
        return user?.emailVerified || false;
    }
};
