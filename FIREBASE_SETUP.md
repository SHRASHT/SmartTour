# 🔥 Firebase Configuration Guide for SecurityFirst Travel App

## 📋 Prerequisites

1. A Google account
2. Your SecurityFirst project running locally
3. Access to [Firebase Console](https://console.firebase.google.com)

## 🚀 Step-by-Step Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project" or "Create a project"
3. Enter project name: `securityfirst-travel` (or your preferred name)
4. Choose whether to enable Google Analytics (recommended)
5. Click "Create project"

### 2. Register Your Web App

1. In your Firebase project dashboard, click the **Web** icon (`</>`)
2. Enter app nickname: `SecurityFirst Web App`
3. **Check** "Also set up Firebase Hosting" (optional)
4. Click "Register app"
5. **Copy the config object** - you'll need these values!

### 3. Update Environment Variables

Replace the placeholder values in your `.env.local` file with the actual values from Firebase:

```bash
# Google APIs (keep your existing values)
VITE_GOOGLE_PLACE_API_KEY=AIzaSyDDUfLm7pSEX634n2_zw2OvWffA8UUZS_I
VITE_GEMINI_API_KEY=AIzaSyAgUYZFY01Jz3OxTb_6PDtuwQEpvt0iP4I
VITE_GOOGLE_CLIENT_ID=751351964472-7bnqgr9atm4fludtrstqi5claps2uk9d.apps.googleusercontent.com

# Firebase Configuration (replace with your actual values)
VITE_FIREBASE_API_KEY=your_actual_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_actual_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_actual_sender_id
VITE_FIREBASE_APP_ID=your_actual_app_id
```

### 4. Enable Authentication

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Click **Google** provider
3. Click **Enable**
4. Enter your project's email (your Gmail)
5. Click **Save**

### 5. Create Firestore Database

1. Go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (for development)
4. Select a location (choose closest to your users)
5. Click **Done**

### 6. Configure Storage (Optional)

1. Go to **Storage**
2. Click **Get started**
3. Choose **Start in test mode**
4. Select the same location as Firestore
5. Click **Done**

### 7. Set Up Security Rules

#### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can read/write their own trips
    match /trips/{tripId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

#### Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /trips/{tripId}/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🧪 Test Your Configuration

1. Start your development server: `npm run dev`
2. Visit `http://localhost:5173/firebase-status`
3. Check all green checkmarks ✅
4. Test authentication by clicking "Test Firebase Authentication"

## 📱 Features Enabled

### 🔐 Authentication
- Google Sign-in integration
- User profile management
- Session persistence
- Automatic user data sync

### 💾 Database (Firestore)
- Trip data storage
- User profile storage
- Real-time sync capabilities
- Offline support

### 📁 Storage
- Trip image uploads
- Profile picture storage
- Automatic file management

### 🎯 Trip Management
- Save generated trips
- Load user's trips
- Update trip details
- Delete trips
- Image galleries

## 🚨 Troubleshooting

### Common Issues

1. **"Firebase not configured"**
   - Check all environment variables are set
   - Restart development server after updating `.env.local`

2. **"Auth domain not whitelisted"**
   - Add `localhost:5173` to authorized domains in Firebase Console
   - Go to Authentication → Settings → Authorized domains

3. **"Permission denied"**
   - Check Firestore security rules
   - Ensure user is authenticated before database operations

4. **"Storage bucket not found"**
   - Enable Firebase Storage in console
   - Check storage bucket name in environment variables

### Environment Variable Format

Make sure your `.env.local` file uses the exact format:
```bash
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=project-id
VITE_FIREBASE_STORAGE_BUCKET=project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123def456
```

## 🎉 You're All Set!

Once configured, your app will have:
- ✅ Secure user authentication
- ✅ Trip data persistence
- ✅ Image upload capabilities
- ✅ Real-time data sync
- ✅ Offline support
- ✅ User profile management

Visit `/firebase-status` to verify everything is working correctly!

## 🔗 Helpful Links

- [Firebase Console](https://console.firebase.google.com)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/rules-conditions)
- [Firebase Storage Rules](https://firebase.google.com/docs/storage/security)
