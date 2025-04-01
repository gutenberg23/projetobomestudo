import React from "react";
import { cn } from "@/lib/utils";

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
}

export const Spinner: React.FC<SpinnerProps> = ({ className, size = "md", ...props }) => {
  const sizeClasses = {
    sm: "h-4 w-4 border-b-1",
    md: "h-8 w-8 border-b-2",
    lg: "h-12 w-12 border-b-3",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-[#5f2ebe]",
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
};
