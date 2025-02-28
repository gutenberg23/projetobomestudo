
import React from "react";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-[#f6f8fa] py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-center">
          <Link to="/">
            <img
              src="/lovable-uploads/ee47f81d3df30406eedeb997df60ffc12cce0b3965827fc005f4c7a2da4ca470.png"
              alt="BomEstudo Logo"
              className="h-10"
            />
          </Link>
        </div>
      </div>
    </footer>
  );
};
