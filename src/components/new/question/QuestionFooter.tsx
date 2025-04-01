import React from "react";
import { MessageSquare, GraduationCap, Sparkles } from "lucide-react";

interface QuestionFooterProps {
  commentsCount: number;
  showComments: boolean;
  showAnswer: boolean;
  showStats: boolean;
  showOfficialAnswer: boolean;
  showAIAnswer: boolean;
  onToggleComments: () => void;
  onToggleAnswer: () => void;
  onToggleOfficialAnswer: () => void;
  onToggleAIAnswer: () => void;
  hasSelectedOption: boolean;
  hasTeacherExplanation: boolean;
  hasAIExplanation: boolean;
  isSubmittingAnswer: boolean;
  addToBookDialog?: React.ReactNode;
}

export const QuestionFooter: React.FC<QuestionFooterProps> = ({
  commentsCount,
  showComments,
  showAnswer,
  showStats,
  showOfficialAnswer,
  showAIAnswer,
  onToggleComments,
  onToggleAnswer,
  onToggleOfficialAnswer,
  onToggleAIAnswer,
  hasSelectedOption,
  hasTeacherExplanation,
  hasAIExplanation,
  isSubmittingAnswer,
  addToBookDialog
}) => {
  return (
    <div className="flex flex-wrap gap-2 justify-between items-center px-4 py-2 border-t border-gray-100">
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleComments}
          className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-full transition-colors ${
            showComments
              ? "bg-purple-100 text-purple-700"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>{commentsCount}</span>
        </button>

        {addToBookDialog}
      </div>

      <div className="flex items-center gap-2">
        {hasTeacherExplanation && (
          <button
            onClick={onToggleOfficialAnswer}
            className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-full transition-colors ${
              showOfficialAnswer
                ? "bg-purple-100 text-purple-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Gabarito</span>
          </button>
        )}

        {hasAIExplanation && (
          <button
            onClick={onToggleAIAnswer}
            className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-full transition-colors ${
              showAIAnswer
                ? "bg-purple-100 text-purple-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>BIA</span>
          </button>
        )}
      </div>
    </div>
  );
};
