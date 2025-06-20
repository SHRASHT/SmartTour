import React from "react";
import { Button } from "../ui/ui/button";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <div className="flex flex-col items-center mx-70 gap-9">
      <h1 className="font-extrabold text-[60px] leading-tight mt-16 text-center">
        <span className="block text-[#f56551]">
          Plan smarter, travel better
        </span>
        <span className="block text-gray-800">
          Let AI craft your perfect getaway.
        </span>
      </h1>

      <p className="text-xl text-gray-500 text-center max-w-2xl">
        No confusion. No spreadsheets. Just destinations and discoveries. <br />
        Planned by AI, perfected for you.
      </p>

      {/* Wrap the button with Link */}
      <Link to="/create-trip">
        <Button>Get Started</Button>
      </Link>
    </div>
  );
};

export default Hero;
