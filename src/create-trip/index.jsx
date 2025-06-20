import React, { useEffect, useState } from "react";
import GooglePlacesAutoComplete from "react-google-autocomplete";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";

import { Input } from "../components/ui/ui/input";
import { Button } from "../components/ui/ui/button";
import { AI_PROMPT } from "../service/AIModal";
import { FcGoogle } from "react-icons/fc";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/ui/dialog";
import {
  SelectBudgetOptions,
  SelectTravellersList,
} from "../constants/options";
import chatSession from "../service/AIModal";
import { db } from "../service/firebaseConfig";
import { collection, addDoc, doc, setDoc, serverTimestamp, getDocs } from "firebase/firestore";

const CreateTrip = () => {
  const [formData, setFormData] = useState({
    location: null,
    days: "",
    budget: null,
    traveller: null,
  });
  const [loading, setLoading] = useState(false);
  const [tripData, setTripData] = useState(null);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // Track save status

  // Check for existing user on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedProfile = localStorage.getItem("userProfile");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    }
  }, []);
  // Fetch user profile from Google
  const fetchUserProfile = async (accessToken) => {
    try {
      console.log(
        "Fetching user profile with token:",
        accessToken.substring(0, 20) + "..."
      );

      const response = await axios.get(
        `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${accessToken}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
        }
      );

      console.log("Profile API Response:", response.data);
      const profile = response.data;
      setUserProfile(profile);
      localStorage.setItem("userProfile", JSON.stringify(profile));
      return profile;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      console.error("Error details:", error.response?.data);
      // Don't fail the entire login process if profile fetch fails
      return null;
    }
  };

  const handleInputChange = ({ name, value }) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  useEffect(() => {
    console.log("Form Data Updated:", formData);
  }, [formData]);
  const login = useGoogleLogin({
    onSuccess: async (codeResp) => {
      setAuthLoading(true);
      console.log("Login Success Response:", codeResp);

      try {
        // Validate the response
        if (!codeResp.access_token) {
          throw new Error("No access token received from Google");
        }

        // Store user information in localStorage
        const userInfo = {
          access_token: codeResp.access_token,
          token_type: codeResp.token_type || "Bearer",
          expires_in: codeResp.expires_in || 3600,
          scope: codeResp.scope || "openid email profile",
          authuser: codeResp.authuser || "0",
          prompt: codeResp.prompt || "consent",
          loginTime: new Date().toISOString(),
          expiresAt: new Date(
            Date.now() + (codeResp.expires_in || 3600) * 1000
          ).toISOString(),
        };

        console.log("Storing user info:", userInfo);
        localStorage.setItem("user", JSON.stringify(userInfo));
        setUser(userInfo);

        // Fetch user profile
        console.log("Attempting to fetch user profile...");
        const profile = await fetchUserProfile(codeResp.access_token);
        if (profile) {
          console.log("User Profile successfully fetched:", profile);
        } else {
          console.warn("Profile fetch failed, but login will continue");
        }

        setOpenDialog(false);
        alert("Login successful! You can now generate your trip.");
      } catch (error) {
        console.error("Authentication process error:", error);
        alert(`Authentication error: ${error.message}`);
        // Clear any partial state
        localStorage.removeItem("user");
        localStorage.removeItem("userProfile");
        setUser(null);
        setUserProfile(null);
      } finally {
        setAuthLoading(false);
      }
    },
    onError: (error) => {
      setAuthLoading(false);
      console.error("Google Login Error:", error);
      alert(
        `Login failed: ${
          error.error_description || error.error || "Unknown error"
        }`
      );
    },
    scope: "openid email profile",
    flow: "implicit",
  });

  // Test authentication for development
  const testLogin = () => {
    const testUser = {
      access_token: "test_token_" + Date.now(),
      token_type: "Bearer",
      expires_in: 3600,
      scope: "openid email profile",
      loginTime: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
    };

    const testProfile = {
      id: "test_user_123",
      email: "test@example.com",
      name: "Test User",
      picture: "https://via.placeholder.com/40x40/4285f4/ffffff?text=TU",
    };

    localStorage.setItem("user", JSON.stringify(testUser));
    localStorage.setItem("userProfile", JSON.stringify(testProfile));
    setUser(testUser);
    setUserProfile(testProfile);
    setOpenDialog(false);
    alert("Test login successful!");
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userProfile");
    setUser(null);
    setUserProfile(null);
    setTripData(null);
    alert("Logged out successfully!");
  };  // Check if token is expired
  const isTokenExpired = () => {
    if (!user || !user.expiresAt) return true;
    return new Date() > new Date(user.expiresAt);
  };

  // Helper function to sanitize data for Firebase (remove functions, undefined values, etc.)
  const sanitizeForFirebase = (obj) => {
    if (obj === null || obj === undefined) return null;
    if (typeof obj === 'function') return null; // Remove functions
    if (typeof obj === 'symbol') return null; // Remove symbols
    if (obj instanceof Date) return obj; // Keep dates
    if (Array.isArray(obj)) {
      return obj.map(item => sanitizeForFirebase(item)).filter(item => item !== null);
    }
    if (typeof obj === 'object') {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        const cleanValue = sanitizeForFirebase(value);
        if (cleanValue !== null && cleanValue !== undefined) {
          sanitized[key] = cleanValue;
        }
      }
      return sanitized;
    }
    return obj; // Return primitive values as-is
  };
  // Save trip to Firebase
  const saveTripToFirebase = async (tripData) => {
    try {
      if (!user || !userProfile) {
        console.error("User not authenticated or profile not loaded");
        return null;
      }

      // Debug: Log the form data to see what we're working with
      console.log("Form data before save:", {
        location: formData.location,
        days: formData.days,
        budget: formData.budget,
        traveller: formData.traveller
      });
      console.log("User profile:", userProfile);
      console.log("Trip data:", tripData);

      const tripDocument = {        // Trip metadata
        id: `trip_${Date.now()}`,
        userId: userProfile?.id || user?.access_token?.substring(0, 10) || 'anonymous',
        userEmail: userProfile?.email || 'unknown@email.com',
        userName: userProfile?.name || 'Anonymous User',
          // Trip details from form
        destination: {
          name: formData.location?.name || formData.location?.formatted_address || 'Unknown Destination',
          address: formData.location?.formatted_address || '',
          ...(formData.location?.place_id && { placeId: formData.location.place_id }),
        },
        duration: parseInt(formData.days) || 1,        budget: {
          type: formData.budget?.title || 'Budget',
          description: formData.budget?.desc || '',
          // Remove icon field completely as it contains React components
        },
        travelers: {
          type: formData.traveller?.title || 'Solo',
          count: formData.traveller?.people || '1',
          description: formData.traveller?.desc || '',
          // Remove icon field completely as it contains React components
        },
          // AI generated data
        aiResponse: tripData || {},
        hotels: Array.isArray(tripData?.hotels) ? tripData.hotels : [],
        itinerary: Array.isArray(tripData?.itinerary) ? tripData.itinerary : [],
        
        // Additional metadata
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'active',
        version: '1.0',
        tags: [
          (formData.budget?.title || 'budget').toLowerCase().replace(/\s+/g, '-'),
          (formData.traveller?.title || 'solo').toLowerCase().replace(/\s+/g, '-'),
          `${formData.days || '1'}-days`,
        ].filter(Boolean),
      };      // Save to Firestore
      const sanitizedTripDocument = sanitizeForFirebase(tripDocument);
      const docRef = await addDoc(collection(db, 'trips'), sanitizedTripDocument);
      console.log("Trip saved to Firebase with ID:", docRef.id);
      
      // Also save to user's trips collection for easier querying
      const userTripData = sanitizeForFirebase({
        tripId: docRef.id,
        destination: tripDocument.destination.name,
        duration: tripDocument.duration,
        budget: tripDocument.budget.type,
        createdAt: serverTimestamp(),
      });

      await setDoc(doc(db, 'users', tripDocument.userId, 'trips', docRef.id), userTripData);

      return {
        id: docRef.id,
        success: true,
        message: "Trip saved successfully!"
      };} catch (error) {
      console.error("Error saving trip to Firebase:", error);
      return {
        success: false,
        error: error.message
      };
    }
  };

  // Test Firebase connection
  const testFirebaseConnection = async () => {
    try {
      setSaveStatus("saving");
      console.log("Testing Firebase connection...");
      
      // Try to read from a collection
      const testCollection = collection(db, 'trips');
      const snapshot = await getDocs(testCollection);
      
      console.log(`Firebase connection successful! Found ${snapshot.size} trips in database.`);
      setSaveStatus("success");
      alert(`Firebase connection successful! Found ${snapshot.size} existing trips.`);
      
      return true;
    } catch (error) {
      console.error("Firebase connection failed:", error);
      setSaveStatus("error");
      alert(`Firebase connection failed: ${error.message}`);
      return false;
    }
  };

  const OnGenerateTrip = async () => {
    // Check if user is authenticated and token is valid
    if (!user || isTokenExpired()) {
      if (isTokenExpired()) {
        alert("Your session has expired. Please log in again.");
        logout();
      }
      setOpenDialog(true);
      return;
    }
    if (Number(formData?.days) > 15) {
      alert("Please enter days less than or equal to 15");
      return;
    }

    if (!formData?.location || !formData?.budget || !formData?.traveller) {
      alert("Please fill all the fields");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Final Form Data", formData);
      const FINAL_PROMPT = AI_PROMPT.replace(
        "{location}",
        formData?.location.formatted_address
      )
        .replace("{noOfDays}", formData?.days)
        .replace("{totalPeople}", formData?.traveller?.people)
        .replace("{budget}", formData?.budget?.title);
      console.log("Final Prompt", FINAL_PROMPT);

      const result = await chatSession.generateContent(FINAL_PROMPT);
      const responseText = result?.response?.text();

      console.log("Raw AI Response:", responseText);

      // Clean and parse the JSON response
      try {
        // Remove any markdown formatting or extra text
        let cleanedResponse = responseText;

        // Remove markdown code blocks if present
        cleanedResponse = cleanedResponse.replace(/```json\s*/g, "");
        cleanedResponse = cleanedResponse.replace(/```\s*/g, "");

        // Remove any text before the first { or [
        const jsonStart = Math.min(
          cleanedResponse.indexOf("{") === -1
            ? Infinity
            : cleanedResponse.indexOf("{"),
          cleanedResponse.indexOf("[") === -1
            ? Infinity
            : cleanedResponse.indexOf("[")
        );

        if (jsonStart !== Infinity) {
          cleanedResponse = cleanedResponse.substring(jsonStart);
        }

        // Remove any text after the last } or ]
        const lastBrace = Math.max(
          cleanedResponse.lastIndexOf("}"),
          cleanedResponse.lastIndexOf("]")
        );

        if (lastBrace !== -1) {
          cleanedResponse = cleanedResponse.substring(0, lastBrace + 1);
        }

        console.log("Cleaned Response:", cleanedResponse);        // Try to parse the cleaned JSON
        const parsedResponse = JSON.parse(cleanedResponse);
        setTripData(parsedResponse);
        console.log("Parsed Trip Data:", parsedResponse);
          // Save to Firebase
        console.log("Saving trip to Firebase...");
        setSaveStatus("saving");
        const saveResult = await saveTripToFirebase(parsedResponse);
        if (saveResult && saveResult.success) {
          setSaveStatus("success");
          alert(`Trip generated and saved successfully! Firebase ID: ${saveResult.id}`);
          console.log("Trip saved to Firebase with ID:", saveResult.id);
        } else {
          setSaveStatus("error");
          alert("Trip generated successfully, but failed to save to database. Check console for details.");
          console.error("Firebase save failed:", saveResult?.error);
        }
      } catch (parseError) {
        console.error("Error parsing AI response:", parseError);
        console.error("Response that failed to parse:", responseText);

        // Try to extract JSON manually if structured parsing fails
        try {
          // Look for hotel and itinerary data patterns
          const hotelMatch = responseText.match(/"hotels":\s*\[([\s\S]*?)\]/);
          const itineraryMatch = responseText.match(
            /"itinerary":\s*\[([\s\S]*?)\]/
          );          if (hotelMatch || itineraryMatch) {
            const fallbackData = {
              hotels: hotelMatch ? JSON.parse(`[${hotelMatch[1]}]`) : [],
              itinerary: itineraryMatch
                ? JSON.parse(`[${itineraryMatch[1]}]`)
                : [],
            };
            setTripData(fallbackData);
            
            // Save fallback data to Firebase
            console.log("Saving fallback trip data to Firebase...");
            const saveResult = await saveTripToFirebase(fallbackData);
            if (saveResult && saveResult.success) {
              alert(`Trip generated with partial data and saved successfully! Firebase ID: ${saveResult.id}`);
            } else {
              alert("Trip generated with partial data! Check console for details.");
              console.error("Firebase save failed:", saveResult?.error);
            }
          } else {
            setError(
              "AI response is not in valid JSON format. Response: " +
                responseText.substring(0, 200) +
                "..."
            );
            alert(
              "Error: AI response is not valid JSON. Check console for full response."
            );
          }
        } catch (fallbackError) {
          setError(
            "Failed to parse AI response. Please try again with different parameters."
          );
          alert("Error parsing response: " + parseError.message);
        }
      }
    } catch (error) {
      console.error("Error generating trip:", error);
      setError(
        "Failed to generate trip. Please check your API key and try again."
      );
      alert("Error generating trip: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const saveAiTrip = async (tripData) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const docId = Date.now().toString();
    await setDoc(doc(db, "AITrips", "LA"), {
      name: "Los Angeles Trip",
      state: "CA",
      country: "USA",
    });
  };

  return (
    <div className="sm:px-10 md:px-32 lg:px-56 xl:px-10 px-5 mt-10">
      {/* Debug Panel */}
      {debugMode && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-bold text-yellow-800 mb-2">
            🔧 Debug Information
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p>
                <strong>Environment Variables:</strong>
              </p>
              <p>
                Google Client ID:{" "}
                {import.meta.env.VITE_GOOGLE_CLIENT_ID
                  ? "✅ Present"
                  : "❌ Missing"}
              </p>
              <p>
                Places API Key:{" "}
                {import.meta.env.VITE_GOOGLE_PLACE_API_KEY
                  ? "✅ Present"
                  : "❌ Missing"}
              </p>              <p>
                Gemini API Key:{" "}
                {import.meta.env.VITE_GEMINI_API_KEY
                  ? "✅ Present"
                  : "❌ Missing"}
              </p>
              <p>
                Firebase Project ID:{" "}
                {import.meta.env.VITE_FIREBASE_PROJECT_ID
                  ? "✅ Present"
                  : "❌ Missing"}
              </p>
            </div>
            <div>
              <p>
                <strong>Authentication State:</strong>
              </p>
              <p>User: {user ? "✅ Authenticated" : "❌ Not authenticated"}</p>
              <p>Profile: {userProfile ? "✅ Loaded" : "❌ Not loaded"}</p>
              <p>
                Token Valid:{" "}
                {user && !isTokenExpired() ? "✅ Valid" : "❌ Invalid/Expired"}
              </p>
              <p>
                <strong>Database Status:</strong>
              </p>
              <p>
                Last Save: {
                  saveStatus === "saving" ? "🔄 Saving..." :
                  saveStatus === "success" ? "✅ Success" :
                  saveStatus === "error" ? "❌ Failed" :
                  "➖ No attempts"
                }
              </p>            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <Button
              onClick={testFirebaseConnection}
              size="sm"
              variant="outline"
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
              disabled={saveStatus === "saving"}
            >
              {saveStatus === "saving" ? "Testing..." : "Test Database"}
            </Button>
            <Button
              onClick={() => setDebugMode(false)}
              size="sm"
              variant="outline"
              className="text-gray-600"
            >
              Hide Debug
            </Button>
          </div>
        </div>
      )}
      {/* User Status */}
      {user && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              {userProfile?.picture && (
                <img
                  src={userProfile.picture}
                  alt="Profile"
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div>
                <p className="text-green-700 font-medium">
                  ✓ Authenticated with Google
                  {userProfile?.name && ` - Welcome, ${userProfile.name}!`}
                </p>
                <p className="text-sm text-green-600">
                  {userProfile?.email || "Ready to generate your trip!"}
                </p>
                {isTokenExpired() && (
                  <p className="text-sm text-orange-600 font-medium">
                    ⚠️ Session expired - Please log in again
                  </p>
                )}
              </div>
            </div>{" "}
            <div className="flex gap-2">
              <Button
                onClick={() => setDebugMode(true)}
                variant="outline"
                size="sm"
                className="text-gray-600"
              >
                Debug
              </Button>
              <Button
                onClick={logout}
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>      )}

      {/* Database Status */}
      {saveStatus && (
        <div className={`mb-4 p-3 rounded-lg border ${
          saveStatus === "saving" ? "bg-blue-50 border-blue-200" :
          saveStatus === "success" ? "bg-green-50 border-green-200" :
          saveStatus === "error" ? "bg-red-50 border-red-200" :
          "bg-gray-50 border-gray-200"
        }`}>
          <div className="flex items-center gap-2">
            {saveStatus === "saving" && (
              <>
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-blue-700 font-medium">Saving trip to database...</span>
              </>
            )}
            {saveStatus === "success" && (
              <>
                <span className="text-green-700 text-lg">✅</span>
                <span className="text-green-700 font-medium">Trip saved to database successfully!</span>
              </>
            )}
            {saveStatus === "error" && (
              <>
                <span className="text-red-700 text-lg">❌</span>
                <span className="text-red-700 font-medium">Failed to save trip to database</span>
              </>
            )}
          </div>
        </div>
      )}

      <h2 className="font-bold text-black text-3xl">
        Tell us your Travel Preference
      </h2>
      <p className="mt-3 text-gray-500 text-xl">
        Just provide source and destination
      </p>
      <div className="mt-20 flex flex-col space-y-8">
        {/* Destination Input */}
        <div>
          <h2 className="text-xl font-medium mb-2">
            Destination of your choice
          </h2>
          <GooglePlacesAutoComplete
            apiKey={import.meta.env.VITE_GOOGLE_PLACE_API_KEY}
            className="w-full text-black p-2 border rounded-md"
            onPlaceSelected={(place) => {
              handleInputChange({ name: "location", value: place });
            }}
            options={{
              types: ["(cities)"],
              fields: ["formatted_address", "geometry", "name"],
            }}
          />
        </div>

        {/* Number of Days */}
        <div>
          <h2 className="text-xl font-medium mb-2">How many days?</h2>
          <Input
            placeholder="Ex. 3"
            type="number"
            className="text-black"
            value={formData.days}
            onChange={(e) =>
              handleInputChange({
                name: "days",
                value: e.target.value,
              })
            }
          />
        </div>

        {/* Budget Options */}
        <div>
          <h2 className="text-xl font-medium mb-2">What is your Budget?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {" "}
            {SelectBudgetOptions.map((item) => (
              <div
                key={item.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  formData.budget?.id === item.id
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200"
                }`}
                onClick={() =>
                  handleInputChange({ name: "budget", value: item })
                }
              >
                <div className="text-3xl mb-2">{item.icon()}</div>
                <h2 className="font-bold text-lg">{item.title}</h2>
                <p className="text-sm text-gray-600">{item.des}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Traveller Options */}
        <div>
          <h2 className="text-xl font-medium mb-2">
            Who do you plan on adventuring with?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {" "}
            {SelectTravellersList.map((item) => (
              <div
                key={item.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  formData.traveller?.id === item.id
                    ? "border-purple-600 bg-purple-50"
                    : "border-gray-200"
                }`}
                onClick={() =>
                  handleInputChange({ name: "traveller", value: item })
                }
              >
                <div className="text-3xl mb-2">{item.icon()}</div>
                <h2 className="font-bold text-lg">{item.title}</h2>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>{" "}
      {/* Submit Button */}
      <div className="my-10 justify-end flex">
        <Button
          onClick={OnGenerateTrip}
          disabled={loading}
          className={`${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {loading ? "Generating Trip..." : "Generate Trip"}
        </Button>
      </div>{" "}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Sign In Required</DialogTitle>
            <DialogDescription>
              You need to sign in to generate a trip plan. Please choose a
              sign-in method.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-4">
            <Button
              onClick={() => {
                login();
              }}
              className="w-full flex items-center justify-center gap-2"
              disabled={authLoading}
            >
              {authLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Authenticating...
                </>
              ) : (
                <>
                  <FcGoogle />
                  Sign In with Google
                </>
              )}
            </Button>

            {/* Development/Testing Options */}
            <div className="border-t pt-3">
              <p className="text-xs text-gray-500 mb-2">Development Options:</p>
              <Button
                variant="outline"
                onClick={testLogin}
                className="w-full text-sm"
              >
                🧪 Test Login (Development)
              </Button>
            </div>

            <div className="flex justify-between space-x-2">
              <Button
                variant="outline"
                onClick={() => setOpenDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={() => setDebugMode(!debugMode)}
                className="flex-1 text-xs"
              >
                {debugMode ? "Hide Debug" : "Show Debug"}
              </Button>
            </div>
          </div>

          {/* Debug Information */}
          {debugMode && (
            <div className="mt-4 p-3 bg-gray-50 rounded text-xs space-y-2">
              <p>
                <strong>Environment:</strong>
              </p>
              <p>
                Client ID:{" "}
                {import.meta.env.VITE_GOOGLE_CLIENT_ID ? "✓ Set" : "❌ Missing"}
              </p>
              <p>
                Places API:{" "}
                {import.meta.env.VITE_GOOGLE_PLACE_API_KEY
                  ? "✓ Set"
                  : "❌ Missing"}
              </p>
              <p>
                Gemini API:{" "}
                {import.meta.env.VITE_GEMINI_API_KEY ? "✓ Set" : "❌ Missing"}
              </p>
              {user && (
                <div>
                  <p>
                    <strong>Current User:</strong>
                  </p>
                  <p>Token: {user.access_token ? "✓ Present" : "❌ Missing"}</p>
                  <p>Expires: {user.expiresAt}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Error Display */}
      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <p>{error}</p>
        </div>
      )}
      {/* Trip Data Display */}
      {tripData && (
        <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-xl font-bold text-green-800 mb-4">
            Trip Generated Successfully!
          </h3>
          <div className="space-y-4">
            {tripData.hotels && (
              <div>
                <h4 className="font-semibold text-lg">Recommended Hotels:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  {tripData.hotels.slice(0, 3).map((hotel, index) => (
                    <div key={index} className="p-3 bg-white rounded border">
                      <h5 className="font-medium">{hotel.name}</h5>
                      <p className="text-sm text-gray-600">{hotel.address}</p>
                      <p className="text-sm font-medium text-green-600">
                        {hotel.price_per_night}
                      </p>
                      <p className="text-xs text-yellow-600">
                        Rating: {hotel.rating}/5
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tripData.itinerary && (
              <div>
                <h4 className="font-semibold text-lg">Itinerary:</h4>
                <div className="space-y-3 mt-2">
                  {tripData.itinerary.slice(0, 3).map((day, index) => (
                    <div key={index} className="p-3 bg-white rounded border">
                      <h5 className="font-medium">Day {day.day}</h5>
                      <p className="text-sm text-gray-600">
                        {day.best_time_to_visit}
                      </p>
                      <div className="mt-2">
                        {day.places &&
                          day.places.slice(0, 2).map((place, placeIndex) => (
                            <div key={placeIndex} className="text-sm">
                              <span className="font-medium">
                                {place.place_name}
                              </span>
                              {place.ticket_price && (
                                <span className="text-green-600 ml-2">
                                  {place.ticket_price}
                                </span>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> Full trip data is available in the browser
              console. Check the developer tools for complete details.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateTrip;
