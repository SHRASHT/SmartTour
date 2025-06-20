// Firebase Configuration Test Component
import React, { useState, useEffect } from 'react';
import { checkFirebaseConnection } from '../service/firebaseConfig.jsx';
import { useAuth } from '../hooks/useAuth.js';

const FirebaseStatus = () => {
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [configStatus, setConfigStatus] = useState({});
  const { user, signIn, signOut, loading, error } = useAuth();

  useEffect(() => {
    checkConnection();
    checkConfiguration();
  }, []);

  const checkConnection = async () => {
    try {
      const isConnected = await checkFirebaseConnection();
      setConnectionStatus(isConnected ? 'connected' : 'disconnected');
    } catch (error) {
      console.error('Connection check failed:', error);
      setConnectionStatus('error');
    }
  };

  const checkConfiguration = () => {
    const config = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };

    const status = {};
    Object.keys(config).forEach(key => {
      status[key] = config[key] && !config[key].includes('your_') ? 'configured' : 'missing';
    });

    setConfigStatus(status);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
      case 'configured':
        return 'text-green-600';
      case 'disconnected':
      case 'missing':
        return 'text-red-600';
      case 'checking':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected':
      case 'configured':
        return '✅';
      case 'disconnected':
      case 'missing':
        return '❌';
      case 'checking':
        return '🔄';
      default:
        return '❓';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">🔥 Firebase Configuration Status</h2>
      
      {/* Connection Status */}
      <div className="mb-6 p-4 border rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Database Connection</h3>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getStatusIcon(connectionStatus)}</span>
          <span className={`font-medium ${getStatusColor(connectionStatus)}`}>
            {connectionStatus === 'checking' && 'Checking connection...'}
            {connectionStatus === 'connected' && 'Successfully connected to Firebase'}
            {connectionStatus === 'disconnected' && 'Unable to connect to Firebase'}
            {connectionStatus === 'error' && 'Connection check failed'}
          </span>
        </div>
      </div>

      {/* Configuration Status */}
      <div className="mb-6 p-4 border rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Environment Variables</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(configStatus).map(([key, status]) => (
            <div key={key} className="flex items-center gap-2">
              <span className="text-lg">{getStatusIcon(status)}</span>
              <span className="text-sm font-mono">{key}</span>
              <span className={`text-xs px-2 py-1 rounded ${
                status === 'configured' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Authentication Test */}
      <div className="mb-6 p-4 border rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Authentication Test</h3>
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading authentication state...</span>
          </div>
        ) : user ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img 
                src={user.photoURL} 
                alt="Profile" 
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="font-medium text-green-600">✅ Authenticated</p>
                <p className="text-sm text-gray-600">{user.displayName || user.email}</p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-gray-600">Not authenticated</p>
            <button
              onClick={signIn}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <span>🔐</span>
              Test Firebase Authentication
            </button>
          </div>
        )}
        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-red-600 text-sm">Error: {error}</p>
          </div>
        )}
      </div>

      {/* Configuration Instructions */}
      {Object.values(configStatus).includes('missing') && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">⚠️ Configuration Required</h3>
          <div className="text-sm text-yellow-700 space-y-2">
            <p>To complete Firebase setup:</p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Go to <a href="https://console.firebase.google.com" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Firebase Console</a></li>
              <li>Create a new project or select existing one</li>
              <li>Go to Project Settings → General → Your apps</li>
              <li>Click "Add app" and select Web app</li>
              <li>Copy the configuration values</li>
              <li>Update your <code className="bg-yellow-100 px-1 rounded">.env.local</code> file with actual values</li>
              <li>Enable Authentication → Sign-in method → Google</li>
              <li>Create Firestore database</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};

export default FirebaseStatus;
