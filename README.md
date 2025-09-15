# 🌍 SecurityFirst - AI Travel Planner

<div align="center">

![Travel](https://img.shields.io/badge/Travel-Planning-blue)
![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)
![Firebase](https://img.shields.io/badge/Firebase-9.x-FFCA28?logo=firebase)
![AI](https://img.shields.io/badge/AI-Gemini-4285F4?logo=google)
![License](https://img.shields.io/badge/License-MIT-green)

**An intelligent travel planning application powered by AI that creates personalized itineraries in minutes.**

[🚀 Live Demo](http://localhost:5173) · [📝 Report Bug](https://github.com/Shrasht/SecurityFirst1/issues) · [💡 Request Feature](https://github.com/Shrasht/SecurityFirst1/issues)

</div>

## ✨ Features

-  **AI-Powered Planning** - Generate custom itineraries using Gemini AI
- **Secure Authentication** - Google OAuth integration for user management
- **Responsive Design** - Seamless experience across all devices
- **Smart Recommendations** - Google Places API for location data and suggestions
-  **Trip Management** - Save, edit, search, and organize your travel plans
-  **Personalized Experience** - Budget-based recommendations and group size optimization
-  **Real-time Updates** - Firebase integration for instant data synchronization

## 🛠️ Tech Stack

| Frontend     | Backend       | APIs          | Styling           |
| ------------ | ------------- | ------------- | ----------------- |
| React.js     | Firebase      | Gemini AI     | Tailwind CSS      |
| React Router | Firestore     | Google Places | CSS3              |
| Vite         | Firebase Auth | Google OAuth  | Responsive Design |

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase account
- Google Cloud Platform account

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Shrasht/SecurityFirst1.git
   cd SecurityFirst1
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   Create a `.env.local` file in the root directory:

   ```env
   VITE_GOOGLE_PLACE_API_KEY=your_google_places_api_key
   VITE_GOOGLE_AUTH_CLIENT_ID=your_google_oauth_client_id
   VITE_GOOGLE_GEMINI_AI_API_KEY=your_gemini_api_key

   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:5173](http://localhost:5173)

## 📋 Project Structure

```
SecurityFirst/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── custom/          # Custom components (Header, Hero)
│   │   └── ui/              # UI library components
│   ├── create-trip/         # Trip creation workflow
│   ├── my-trips/            # Trip management dashboard
│   ├── view-trip/           # Trip viewing interface
│   ├── service/             # API services and utilities
│   ├── hooks/               # Custom React hooks
│   └── constants/           # App constants and configurations
├── public/                  # Static assets
├── .env.local              # Environment variables
└── package.json            # Dependencies and scripts
```

## 🎯 Usage

### Creating a Trip

1. **Sign in** with your Google account
2. **Click "Get Started"** on the homepage
3. **Fill in trip details**:
   - Destination
   - Number of days
   - Budget preference
   - Travel group size
4. **Let AI generate** your personalized itinerary
5. **Review and save** your trip

### Managing Trips

- **View all trips** in the "My Trips" dashboard
- **Search and filter** trips by various criteria
- **Switch between** personal trips and all trips
- **Delete trips** you no longer need
- **View detailed itineraries** with hotels and activities

## 🔧 API Configuration

### Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Google provider)
3. Create a Firestore database
4. Add your domain to authorized origins

### Google APIs Setup

1. Enable Places API and Gemini AI API in [Google Cloud Console](https://console.cloud.google.com/)
2. Create credentials and add to environment variables
3. Configure OAuth consent screen

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request



## 👨‍💻 Author

**Shrasht**

- GitHub: [@Shrasht](https://github.com/Shrasht)
- Project Link: [SmartTour](https://github.com/Shrasht/SmartTour)

## 🙏 Acknowledgments

- [React.js](https://reactjs.org/) for the amazing frontend framework
- [Firebase](https://firebase.google.com/) for backend services
- [Google AI](https://ai.google.dev/) for Gemini AI integration
- [Tailwind CSS](https://tailwindcss.com/) for styling utilities
- [Vite](https://vitejs.dev/) for fast development experience

---

<div align="center">

**Made with ❤️  by [Shrasht](https://github.com/Shrasht)**

</div>
