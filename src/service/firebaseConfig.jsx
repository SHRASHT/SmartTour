// Firebase Configuration for SecurityFirst Travel App
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// Firebase project configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Configure Google Auth provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Authentication functions
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const signOutUser = () => signOut(auth);

// Database functions for trip management
export const tripsCollection = collection(db, 'trips');
export const usersCollection = collection(db, 'users');

// Trip CRUD operations
export const saveTripToFirebase = async (tripData, userId) => {
  try {
    const tripWithMetadata = {
      ...tripData,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublic: false,
      likes: 0,
      views: 0
    };
    
    const docRef = await addDoc(tripsCollection, tripWithMetadata);
    console.log("Trip saved with ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error saving trip: ", error);
    throw error;
  }
};

export const getUserTrips = async (userId) => {
  try {
    const q = query(
      tripsCollection, 
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    const trips = [];
    querySnapshot.forEach((doc) => {
      trips.push({ id: doc.id, ...doc.data() });
    });
    return trips;
  } catch (error) {
    console.error("Error getting user trips: ", error);
    throw error;
  }
};

export const getTripById = async (tripId) => {
  try {
    const docRef = doc(db, 'trips', tripId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      console.log("No such trip found!");
      return null;
    }
  } catch (error) {
    console.error("Error getting trip: ", error);
    throw error;
  }
};

export const updateTrip = async (tripId, updateData) => {
  try {
    const tripRef = doc(db, 'trips', tripId);
    const updateWithTimestamp = {
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    await updateDoc(tripRef, updateWithTimestamp);
    console.log("Trip updated successfully");
  } catch (error) {
    console.error("Error updating trip: ", error);
    throw error;
  }
};

export const deleteTrip = async (tripId) => {
  try {
    await deleteDoc(doc(db, 'trips', tripId));
    console.log("Trip deleted successfully");
  } catch (error) {
    console.error("Error deleting trip: ", error);
    throw error;
  }
};

// User profile functions
export const saveUserProfile = async (user) => {
  try {
    const userRef = doc(db, 'users', user.uid);
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      lastLoginAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    
    // Use updateDoc to merge data if user exists, or create new document
    await updateDoc(userRef, {
      ...userData,
      lastLoginAt: new Date().toISOString()
    }).catch(async () => {
      // If document doesn't exist, create it
      await addDoc(usersCollection, userData);
    });
    
    console.log("User profile saved successfully");
  } catch (error) {
    console.error("Error saving user profile: ", error);
    throw error;
  }
};

export const getUserProfile = async (userId) => {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.log("No user profile found!");
      return null;
    }
  } catch (error) {
    console.error("Error getting user profile: ", error);
    throw error;
  }
};

// Storage functions for images
export const uploadTripImage = async (file, tripId, imageType = 'general') => {
  try {
    const fileName = `trips/${tripId}/${imageType}_${Date.now()}_${file.name}`;
    const storageRef = ref(storage, fileName);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    console.log("Image uploaded successfully: ", downloadURL);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading image: ", error);
    throw error;
  }
};

export const deleteTripImage = async (imageUrl) => {
  try {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
    console.log("Image deleted successfully");
  } catch (error) {
    console.error("Error deleting image: ", error);
    throw error;
  }
};

// Utility functions
export const checkFirebaseConnection = async () => {
  try {
    const testQuery = query(tripsCollection, orderBy("createdAt", "desc"));
    await getDocs(testQuery);
    return true;
  } catch (error) {
    console.error("Firebase connection error: ", error);
    return false;
  }
};

// Export the app instance for custom usage
export default app;