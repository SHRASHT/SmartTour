import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const chatSession = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

export const AI_PROMPT = `You are a travel planner AI. I am planning a trip for {noOfDays} days for {location} for {totalPeople} people with a {budget} budget.

IMPORTANT: Respond ONLY with valid JSON. Do not include any text before or after the JSON. Do not use markdown formatting or code blocks.

Please provide a detailed travel plan in the exact JSON format below:

{
  "hotels": [
    {
      "name": "Hotel Name",
      "address": "Full Address", 
      "price_per_night": "$100",
      "image_url": "https://example.com/image.jpg",
      "geo_coordinates": {
        "lat": 0.0,
        "lng": 0.0
      },
      "rating": 4.5,
      "description": "Brief description"
    }
  ],
  "itinerary": [
    {
      "day": 1,
      "best_time_to_visit": "9:00 AM - 6:00 PM",
      "places": [
        {
          "place_name": "Place Name",
          "place_details": "Description of the place",
          "image_url": "https://example.com/place.jpg",
          "geo_coordinates": {
            "lat": 0.0,
            "lng": 0.0
          },
          "ticket_price": "$20 for {totalPeople} people",
          "travel_time": "30 minutes from hotel"
        }
      ]
    }
  ]
}

Provide 3-5 hotels and create a {noOfDays}-day itinerary with 2-3 places per day. Use realistic prices and locations for {location}. Ensure all numbers are actual numbers, not strings with currency symbols in geo_coordinates and rating fields.`;

export default chatSession;
