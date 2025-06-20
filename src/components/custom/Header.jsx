import React from "react";
import img from "../../assets/TravelSmart AI Logo Design.png"; // Adjust the path as necessary
const Header = () => {
  return (
    <div className="p-2 shadow-sm flex justify-between items-center">
      <img src={img} className="h-12 w-12" />
      <div>
        <button>Sign in</button>
      </div>
    </div>
  );
};

export default Header;
