
import React from "react";
import { Button } from "@/components/ui/button";

interface SubmitButtonProps {
  onClick: () => void;
  text: string;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ onClick, text }) => {
  return (
    <div>
      <Button 
        onClick={onClick} 
        className="bg-[#5f2ebe] hover:bg-[#5f2ebe]/90 text-white"
      >
        {text}
      </Button>
    </div>
  );
};

export default SubmitButton;
