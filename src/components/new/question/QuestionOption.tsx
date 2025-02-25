
import React from "react";
import { X } from "lucide-react";

interface QuestionOptionProps {
  id: string;
  text: string;
  index: number;
  isDisabled: boolean;
  isSelected: boolean;
  isCorrect: boolean;
  onToggleDisabled: (optionId: string, event: React.MouseEvent) => void;
  onSelect: (optionId: string) => void;
  showAnswer: boolean;
}

export const QuestionOption: React.FC<QuestionOptionProps> = ({
  id,
  text,
  index,
  isDisabled,
  isSelected,
  isCorrect,
  onToggleDisabled,
  onSelect,
  showAnswer,
}) => {
  const getOptionStyles = () => {
    if (!showAnswer) {
      return {
        container: "border-slate-200",
        letter: isSelected ? "text-white bg-fuchsia-500 border-fuchsia-500" : "text-fuchsia-500",
        background: isSelected ? "bg-[#F6F8FA]" : "",
        text: ""
      };
    }

    if (isCorrect) {
      return {
        container: "border-[#40CE5A] bg-[#EDFFF0]",
        letter: "text-white bg-[#40CE5A] border-[#40CE5A]",
        background: "",
        text: ""
      };
    }

    if (isSelected && !isCorrect) {
      return {
        container: "border-[#F4E8F0] bg-[#FBF8FA]",
        letter: "text-[#BEB5BB] bg-[#FBF8FA] border-[#E5D7E1]",
        background: "",
        text: "line-through decoration-[#E5D7E1] decoration-2"
      };
    }

    return {
      container: "border-[#F4E8F0] bg-[#FBF8FA]",
      letter: "text-[#BEB5BB] bg-[#FBF8FA] border-[#E5D7E1]",
      background: "",
      text: ""
    };
  };

  const styles = getOptionStyles();

  return (
    <div className="flex gap-4 items-center px-3 md:px-5 py-1 w-full rounded-none min-h-16">
      <button
        onClick={(e) => onToggleDisabled(id, e)}
        className="flex gap-5 justify-center items-center self-stretch rounded-xl min-h-[30px] w-[30px] hover:bg-slate-50"
      >
        <X className={`w-4 h-4 ${isDisabled ? "text-red-500" : "text-slate-400"}`} />
      </button>
      <button
        onClick={() => onSelect(id)}
        className={`flex flex-1 gap-4 items-center self-stretch p-3 text-base whitespace-normal rounded-xl border border-solid ${
          styles.container
        } ${styles.background} ${isDisabled && !isCorrect ? "opacity-50 line-through" : ""}`}
        disabled={isDisabled}
      >
        <span
          className={`gap-2.5 self-stretch font-bold text-center rounded border border-solid min-h-[30px] w-[30px] flex items-center justify-center ${
            styles.letter
          }`}
        >
          {String.fromCharCode(65 + index)}
        </span>
        <span className={`flex-1 text-slate-800 text-left ${styles.text}`}>{text}</span>
      </button>
    </div>
  );
};
