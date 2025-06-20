import React, { useEffect, useState } from "react";
import GooglePlacesAutoComplete from "react-google-autocomplete";

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
  const [openDialog, setOpenDialog] = useState(false);

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
    onSuccess: (codeResp) => console.log(codeResp),
    onError: (error) => console.log(error),
  });

  const OnGenerateTrip = async () => {
    const user = localStorage.getItem("user");

    if (!user) {
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

        console.log("Cleaned Response:", cleanedResponse);

        // Try to parse the cleaned JSON
        const parsedResponse = JSON.parse(cleanedResponse);
        setTripData(parsedResponse);
        console.log("Parsed Trip Data:", parsedResponse);
        alert("Trip generated successfully! Check console for details.");
      } catch (parseError) {
        console.error("Error parsing AI response:", parseError);
        console.error("Response that failed to parse:", responseText);

        // Try to extract JSON manually if structured parsing fails
        try {
          // Look for hotel and itinerary data patterns
          const hotelMatch = responseText.match(/"hotels":\s*\[([\s\S]*?)\]/);
          const itineraryMatch = responseText.match(
            /"itinerary":\s*\[([\s\S]*?)\]/
          );

          if (hotelMatch || itineraryMatch) {
            const fallbackData = {
              hotels: hotelMatch ? JSON.parse(`[${hotelMatch[1]}]`) : [],
              itinerary: itineraryMatch
                ? JSON.parse(`[${itineraryMatch[1]}]`)
                : [],
            };
            setTripData(fallbackData);
            alert(
              "Trip generated with partial data! Check console for details."
            );
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

  return (
    <div className="sm:px-10 md:px-32 lg:px-56 xl:px-10 px-5 mt-10">
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign In Required</DialogTitle>
            <DialogDescription>
              You need to sign in to generate a trip plan. Please sign in to
              continue.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Cancel
            </Button>
            {/* <Button variant="outline" onClick={() => {
              // For testing - bypass authentication
              localStorage.setItem("user", JSON.stringify({name: "Test User"}));
              setOpenDialog(false);
              OnGenerateTrip();
            }}>
              Continue as Guest
            </Button> */}
            <Button
              onClick={() => {
                setOpenDialog(false);
                // Add your sign-in logic here
                window.location.href = "/auth"; // or your auth route
              }}
            >
              <FcGoogle />
              Sign In with Google
            </Button>
          </div>
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
