// Authentication Service for SecurityFirst Travel App
import { 
  auth, 
  signInWithGoogle, 
  signOutUser, 
  saveUserProfile, 
  getUserProfile 
} from './firebaseConfig.jsx';
import { onAuthStateChanged } from 'firebase/auth';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.authStateListeners = [];
    this.initializeAuthListener();
  }

  // Initialize authentication state listener
  initializeAuthListener() {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in
        this.currentUser = user;
        
        // Save/update user profile in Firestore
        try {
          await saveUserProfile(user);
        } catch (error) {
          console.error('Error saving user profile:', error);
        }
        
        // Store user data in localStorage for persistence
        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified,
          lastLoginAt: new Date().toISOString()
        };
        localStorage.setItem('firebaseUser', JSON.stringify(userData));
        
        console.log('User authenticated:', user.displayName || user.email);
      } else {
        // User is signed out
        this.currentUser = null;
        localStorage.removeItem('firebaseUser');
        console.log('User signed out');
      }
      
      // Notify all listeners about auth state change
      this.notifyAuthStateListeners(user);
    });
  }

  // Add authentication state listener
  addAuthStateListener(callback) {
    this.authStateListeners.push(callback);
    // Immediately call with current state
    callback(this.currentUser);
  }

  // Remove authentication state listener
  removeAuthStateListener(callback) {
    this.authStateListeners = this.authStateListeners.filter(
      listener => listener !== callback
    );
  }

  // Notify all listeners about auth state changes
  notifyAuthStateListeners(user) {
    this.authStateListeners.forEach(callback => {
      try {
        callback(user);
      } catch (error) {
        console.error('Error in auth state listener:', error);
      }
    });
  }

  // Sign in with Google
  async signInWithGoogle() {
    try {
      const result = await signInWithGoogle();
      const user = result.user;
      
      console.log('Google sign-in successful:', user.displayName);
      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        }
      };
    } catch (error) {
      console.error('Google sign-in error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Sign out
  async signOut() {
    try {
      await signOutUser();
      console.log('User signed out successfully');
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get current user from localStorage (for immediate access)
  getCurrentUserFromStorage() {
    try {
      const userData = localStorage.getItem('firebaseUser');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user from storage:', error);
      return null;
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return this.currentUser !== null || this.getCurrentUserFromStorage() !== null;
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser || this.getCurrentUserFromStorage();
  }

  // Get user profile from Firestore
  async getUserProfile(userId = null) {
    try {
      const uid = userId || this.currentUser?.uid;
      if (!uid) return null;
      
      return await getUserProfile(uid);
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  // Wait for authentication state to be determined
  waitForAuth() {
    return new Promise((resolve) => {
      if (this.currentUser !== null) {
        resolve(this.currentUser);
      } else {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          unsubscribe();
          resolve(user);
        });
      }
    });
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService;

// Export individual methods for convenience
export const {
  signInWithGoogle: signInWithGoogleService,
  signOut: signOutService,
  isAuthenticated,
  getCurrentUser,
  addAuthStateListener,
  removeAuthStateListener,
  getUserProfile: getUserProfileService,
  waitForAuth
} = authService;
