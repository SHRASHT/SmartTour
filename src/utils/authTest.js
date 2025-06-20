// Test authentication functionality
// This file helps verify the Google OAuth setup

console.log("🔧 Testing Authentication Setup");
console.log("================================");

// Check environment variables
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const placesApiKey = import.meta.env.VITE_GOOGLE_PLACE_API_KEY;
const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;

console.log("Environment Variables:");
console.log("- Google Client ID:", clientId ? "✅ Present" : "❌ Missing");
console.log("- Places API Key:", placesApiKey ? "✅ Present" : "❌ Missing");
console.log("- Gemini API Key:", geminiApiKey ? "✅ Present" : "❌ Missing");

// Check if running in development
console.log("\nEnvironment Info:");
console.log("- Mode:", import.meta.env.MODE);
console.log("- Dev:", import.meta.env.DEV);
console.log("- Prod:", import.meta.env.PROD);

// Export for use in components
export const authTestUtils = {
  hasClientId: !!clientId,
  hasPlacesKey: !!placesApiKey,
  hasGeminiKey: !!geminiApiKey,
  isComplete: !!clientId && !!placesApiKey && !!geminiApiKey,
  
  getSetupStatus: () => {
    const issues = [];
    if (!clientId) issues.push("Missing VITE_GOOGLE_CLIENT_ID");
    if (!placesApiKey) issues.push("Missing VITE_GOOGLE_PLACE_API_KEY");
    if (!geminiApiKey) issues.push("Missing VITE_GEMINI_API_KEY");
    
    return {
      isReady: issues.length === 0,
      issues,
      message: issues.length === 0 
        ? "✅ All environment variables are configured!"
        : `❌ Setup issues: ${issues.join(", ")}`
    };
  }
};
