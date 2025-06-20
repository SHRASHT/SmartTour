// Custom React Hook for Firebase Authentication
import { useState, useEffect } from 'react';
import authService from '../service/authService.js';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    
    // Add auth state listener
    const handleAuthStateChange = (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      setError(null);
    };

    // Get initial user state
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setLoading(false);
    }

    // Listen for auth state changes
    authService.addAuthStateListener(handleAuthStateChange);

    // Cleanup listener on unmount
    return () => {
      authService.removeAuthStateListener(handleAuthStateChange);
    };
  }, []);

  const signIn = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authService.signInWithGoogle();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const signOut = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authService.signOut();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  return {
    user,
    loading,
    error,
    signIn,
    signOut,
    isAuthenticated: !!user
  };
};

// Custom hook for trip management
import tripService from '../service/tripService.js';

export const useTrips = () => {
  const [trips, setTrips] = useState([]);
  const [currentTrip, setCurrentTrip] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const saveTrip = async (tripData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await tripService.saveTrip(tripData);
      if (result.success) {
        await loadUserTrips(); // Refresh the trips list
      }
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const loadUserTrips = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await tripService.getUserTrips();
      if (result.success) {
        setTrips(result.trips);
      } else {
        setError(result.error);
      }
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const loadTrip = async (tripId) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await tripService.getTrip(tripId);
      if (result.success) {
        setCurrentTrip(result.trip);
      } else {
        setError(result.error);
      }
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const updateTrip = async (tripId, updateData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await tripService.updateTrip(tripId, updateData);
      if (result.success) {
        await loadUserTrips(); // Refresh the trips list
        if (currentTrip && currentTrip.id === tripId) {
          await loadTrip(tripId); // Refresh current trip
        }
      }
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const deleteTrip = async (tripId) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await tripService.deleteTrip(tripId);
      if (result.success) {
        await loadUserTrips(); // Refresh the trips list
        if (currentTrip && currentTrip.id === tripId) {
          setCurrentTrip(null);
        }
      }
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  return {
    trips,
    currentTrip,
    loading,
    error,
    saveTrip,
    loadUserTrips,
    loadTrip,
    updateTrip,
    deleteTrip
  };
};
