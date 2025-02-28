
"use client";

import React from "react";
import { ActionButton } from "./ActionButton";

interface ButtonContainerProps {
  setShowQuestions: (show: boolean) => void;
  showQuestions: boolean;
}

export const ButtonContainer: React.FC<ButtonContainerProps> = ({
  setShowQuestions,
  showQuestions
}) => {
  return (
    <div className="flex justify-center items-center w-full gap-2.5 max-md:flex-wrap">
      <ActionButton
        icon="star"
        text="Questões"
        isActive={showQuestions}
        onClick={() => setShowQuestions(true)}
      />
      <ActionButton
        icon="video"
        text="Videoaulas"
        isActive={!showQuestions}
        onClick={() => setShowQuestions(false)}
      />
    </div>
  );
};
