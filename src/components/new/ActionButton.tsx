"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ActionButtonProps {
  icon: string;
  label: string;
  variant?: "default" | "highlight";
  isActive?: boolean;
  onClick?: () => void;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  label,
  variant = "default",
  isActive = false,
  onClick
}) => {
  return (
    <button 
      onClick={onClick} 
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200",
        "text-[rgba(38,47,60,0.7)] hover:text-[#5f2ebe]",
        "bg-white hover:bg-[#f8f5ff]",
        "border border-[#efefef] hover:border-[#5f2ebe]/20",
        isActive && variant === "highlight" && "text-[#5f2ebe] bg-[#f8f5ff] border-[#5f2ebe]/20"
      )}
    >
      <img 
        src={icon} 
        alt="" 
        className={cn(
          "w-4 h-4 object-contain",
          isActive && variant === "highlight" ? "opacity-100" : "opacity-70"
        )} 
      />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
};
