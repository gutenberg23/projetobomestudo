import React from "react";
import { MessageSquare, GraduationCap, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuestionFooterProps {
  commentsCount: number;
  showComments: boolean;
  showOfficialAnswer: boolean;
  showAIAnswer: boolean;
  showStats?: boolean;
  onToggleComments: () => void;
  onToggleOfficialAnswer: () => void;
  onToggleAIAnswer: () => void;
  onToggleStats?: () => void;
  hasTeacherExplanation: boolean;
  hasAIExplanation: boolean;
  addToBookDialog?: React.ReactNode;
  onRemove?: () => void;
  isAdmin?: boolean;
  isFixingMetadata?: boolean;
  onFixMetadata?: () => void;
}

export const QuestionFooter: React.FC<QuestionFooterProps> = ({
  commentsCount,
  showComments,
  showOfficialAnswer,
  showAIAnswer,
  onToggleComments,
  onToggleOfficialAnswer,
  onToggleAIAnswer,
  hasTeacherExplanation,
  hasAIExplanation,
  addToBookDialog,
  onRemove,
  isAdmin = false,
  isFixingMetadata = false,
  onFixMetadata
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

        {onRemove && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
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
            <Sparkles className="w-4 w-4" />
            <span>BIA</span>
          </button>
        )}
      </div>
    </div>
  );
};
