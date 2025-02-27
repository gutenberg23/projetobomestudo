
import React from "react";
import { MessageSquare, CheckSquare, FileText } from "lucide-react";

interface QuestionFooterProps {
  commentsCount: number;
  showComments: boolean;
  showAnswer: boolean;
  showOfficialAnswer: boolean;
  onToggleComments: () => void;
  onToggleAnswer: () => void;
  onToggleOfficialAnswer: () => void;
  hasSelectedOption: boolean;
}

export const QuestionFooter: React.FC<QuestionFooterProps> = ({
  commentsCount,
  showComments,
  showAnswer,
  showOfficialAnswer,
  onToggleComments,
  onToggleAnswer,
  onToggleOfficialAnswer,
  hasSelectedOption,
}) => {
  return (
    <footer className="flex flex-wrap items-center justify-end gap-2.5 px-5 py-2.5 w-full border-t border-gray-100">
      <button
        onClick={onToggleAnswer}
        disabled={!hasSelectedOption}
        className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-[10px] ${
          hasSelectedOption
            ? "text-fuchsia-500 hover:bg-fuchsia-50"
            : "text-gray-400 cursor-not-allowed"
        } ${showAnswer ? "bg-fuchsia-50" : ""}`}
      >
        <CheckSquare className="w-5 h-5" />
        Responder
      </button>

      <button
        onClick={onToggleComments}
        className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-[10px] text-fuchsia-500 hover:bg-fuchsia-50 ${
          showComments ? "bg-fuchsia-50" : ""
        }`}
      >
        <MessageSquare className="w-5 h-5" />
        {commentsCount} Mensagens
      </button>

      <button
        onClick={onToggleOfficialAnswer}
        className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-[10px] text-fuchsia-500 hover:bg-fuchsia-50 ${
          showOfficialAnswer ? "bg-fuchsia-50" : ""
        }`}
      >
        <FileText className="w-5 h-5" />
        Gabarito Comentado
      </button>
    </footer>
  );
};
