
import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  buttonText,
  onClick,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 border border-dashed border-gray-200 rounded-lg bg-white">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-4">
        {icon || <PlusCircle className="h-6 w-6 text-gray-400" />}
      </div>
      <h3 className="text-lg font-medium text-[#272f3c] mb-2">{title}</h3>
      <p className="text-sm text-[#67748a] text-center mb-4 max-w-md">{description}</p>
      <Button onClick={onClick} className="bg-[#ea2be2] hover:bg-[#d026d5]">
        {buttonText}
      </Button>
    </div>
  );
};
