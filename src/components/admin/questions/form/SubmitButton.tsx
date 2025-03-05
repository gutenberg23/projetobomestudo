
import React from "react";
import { Button } from "@/components/ui/button";

interface SubmitButtonProps {
  onClick: () => void;
  text: string;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ onClick, text }) => {
  return (
    <div>
      <Button onClick={onClick} variant="hero">
        {text}
      </Button>
    </div>
  );
};

export default SubmitButton;
