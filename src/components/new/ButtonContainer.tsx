
"use client";

import * as React from "react";
import { ActionButton } from "./ActionButton";

interface ButtonContainerProps {
  setShowQuestions: () => void;
  showQuestions: boolean;
}

export const ButtonContainer: React.FC<ButtonContainerProps> = ({
  setShowQuestions,
  showQuestions
}) => {
  return (
    <div className="flex items-center justify-between w-full max-md:flex-wrap max-md:max-w-full px-0">
      <div className="flex gap-5 justify-center items-center">
        <ActionButton
          icon="/lovable-uploads/interroga.svg"
          label="Caderno de Questões"
          variant="highlight"
          isActive={showQuestions}
          onClick={setShowQuestions}
        />
      </div>
    </div>
  );
};
