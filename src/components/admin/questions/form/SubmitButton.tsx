
import React from "react";
import { Button } from "@/components/ui/button";

interface SubmitButtonProps {
  onClick: () => void;
  text: string;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ onClick, text }) => {
  return (
    <div>
      <Button onClick={onClick} className="bg-[#ea2be2] hover:bg-[#d01ec7] text-white">
        {text}
      </Button>
    </div>
  );
};

export default SubmitButton;
