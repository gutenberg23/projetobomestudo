
"use client";
import * as React from "react";

interface ActionButtonProps {
  icon: string;
  text?: string;
  label?: string;
  variant?: "default" | "highlight";
  isActive?: boolean;
  onClick?: () => void;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  label,
  text,
  variant = "default",
  isActive = false,
  onClick,
}) => {
  const displayText = text || label;
  const baseStyles =
    "flex overflow-hidden gap-2.5 justify-center items-center self-stretch p-2.5 my-auto bg-white rounded-md border";
  const variantStyles =
    isActive && variant === "highlight"
      ? "text-fuchsia-500 border-fuchsia-500"
      : "border-gray-100";

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variantStyles} border-solid hover:bg-gray-50 transition-colors`}
    >
      <img
        src={icon}
        alt=""
        className="object-contain shrink-0 self-stretch my-auto w-6 aspect-square"
      />
      <span className="self-stretch my-auto whitespace-nowrap">{displayText}</span>
    </button>
  );
};
