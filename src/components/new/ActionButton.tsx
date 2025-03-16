"use client";

import * as React from "react";
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
  const baseStyles = "flex overflow-hidden gap-2.5 justify-center items-center p-2.5 bg-white rounded-md border w-auto";
  const variantStyles = isActive && variant === "highlight" ? "text-[#5f2ebe] border-[#5f2ebe]" : "border-gray-100";
  return <button onClick={onClick} className={`${baseStyles} ${variantStyles} border-solid hover:bg-gray-50 transition-colors`}>
      
      <span className="whitespace-nowrap text-xs text-[#5f2ebe]">{label}</span>
    </button>;
};