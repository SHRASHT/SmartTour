import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import "./index.css";
import App from "./App.jsx";
import Header from "./components/custom/Header.jsx";
import CreateTrip from "./create-trip/index.jsx";
import Hero from "./components/custom/Hero.jsx";
import MyTrips from "./my-trips/index.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import ViewTrip from "./view-trip/[tripid]/index.jsx";

// Define your routes
const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <Hero />
        <App />
      </>
    ),
  },
  {
    path: "/create-trip",
    element: (
      <>
        <Header />
        <CreateTrip />
      </>
    ),
  },
  {
    path: "/view-trip/:tripid",
    element: (
      <>
        <Header />
        <ViewTrip />
      </>
    ),
  },
  {
    path: "/my-trips",
    element: (
      <>
        <Header />
        <MyTrips />
      </>
    ),
  },
]);

// Render the app with routing and toast support
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <RouterProvider router={router} />
    </GoogleOAuthProvider>
  </StrictMode>
);
