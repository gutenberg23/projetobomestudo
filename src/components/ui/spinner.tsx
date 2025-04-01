import React from "react";
import { cn } from "@/lib/utils";

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Spinner: React.FC<SpinnerProps> = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        "animate-spin rounded-full h-8 w-8 border-b-2 border-[#5f2ebe]",
        className
      )}
      {...props}
    />
  );
};
