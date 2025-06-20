import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import "./index.css";
import App from "./App.jsx";
import Header from "./components/custom/Header.jsx";
import CreateTrip from "./create-trip/index.jsx";
import Hero from "./components/custom/Hero.jsx";
import { Toaster } from "./components/ui/ui/sonner.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";

// Define your routes
const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <Header />
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
        <Toaster />
      </>
    ),
  },
]);

// Render the app with routing and toast support
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <Header />
      <App />
      <RouterProvider router={router} />
      <Toaster />
    </GoogleOAuthProvider>
  </StrictMode>
);
