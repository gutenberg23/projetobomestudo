
import React from "react";
import { X } from "lucide-react";

interface QuestionOptionProps {
  id: string;
  text: string;
  index: number;
  isDisabled: boolean;
  isSelected: boolean;
  onToggleDisabled: (optionId: string, event: React.MouseEvent) => void;
  onSelect: (optionId: string) => void;
}

export const QuestionOption: React.FC<QuestionOptionProps> = ({
  id,
  text,
  index,
  isDisabled,
  isSelected,
  onToggleDisabled,
  onSelect,
}) => {
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
          isSelected ? "bg-[#F6F8FA] border-slate-200" : "border-slate-200"
        } ${isDisabled ? "opacity-50 line-through" : ""}`}
        disabled={isDisabled}
      >
        <span
          className={`gap-2.5 self-stretch font-bold text-center rounded border border-solid border-slate-200 min-h-[30px] w-[30px] flex items-center justify-center ${
            isSelected && !isDisabled
              ? "text-white bg-fuchsia-500 border-fuchsia-500"
              : "text-fuchsia-500"
          }`}
        >
          {String.fromCharCode(65 + index)}
        </span>
        <span className="flex-1 text-slate-800 text-left">{text}</span>
      </button>
    </div>
  );
};
