
import React from "react";
import ItensDaAula from "../ItensDaAula";
import { QuestionCard } from "../QuestionCard";
import { Question } from "../types";

interface ContentSectionProps {
  showQuestions: boolean;
  setShowQuestions: (show: boolean) => void;
  question: Question;
  disabledOptions: string[];
  onToggleDisabled: (optionId: string, event: React.MouseEvent) => void;
}

export const ContentSection: React.FC<ContentSectionProps> = ({
  showQuestions,
  setShowQuestions,
  question,
  disabledOptions,
  onToggleDisabled,
}) => {
  return (
    <div className="px-5">
      <div className="mt-8">
        <ItensDaAula
          setShowQuestions={setShowQuestions}
          showQuestions={showQuestions}
        />
      </div>
      {showQuestions && (
        <div className="mt-8">
          <QuestionCard
            question={question}
            disabledOptions={disabledOptions}
            onToggleDisabled={onToggleDisabled}
          />
        </div>
      )}
    </div>
  );
};
