
import React from "react";

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
        <img
          src="https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/85c4f963004985c984c218da550aba94152745f3fe4607e8cb2aa5b220fc681e"
          alt="Answer Icon"
          className="w-5 h-5"
        />
        Responder
      </button>

      <button
        onClick={onToggleComments}
        className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-[10px] text-fuchsia-500 hover:bg-fuchsia-50 ${
          showComments ? "bg-fuchsia-50" : ""
        }`}
      >
        <img
          src="https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/053912c8e6850c9a06c83ffae3f7cc6596370f8329d8c65e7e0b651646e33e59"
          alt="Comments Icon"
          className="w-5 h-5"
        />
        {commentsCount} Mensagens
      </button>

      <button
        onClick={onToggleOfficialAnswer}
        className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-[10px] text-fuchsia-500 hover:bg-fuchsia-50 ${
          showOfficialAnswer ? "bg-fuchsia-50" : ""
        }`}
      >
        <img
          src="https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/0055fefcc304b1e6fa3d8b6d06eb182bc28c8e8e2e0423ba4a3481bc187780a1"
          alt="Official Answer Icon"
          className="w-5 h-5"
        />
        Gabarito Comentado
      </button>
    </footer>
  );
};
