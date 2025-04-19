import React from "react";
import { X } from "lucide-react";
import { prepareHtmlContent } from "@/utils/text-utils";

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
  questionType?: string;
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
  questionType
}) => {
  const getOptionStyles = () => {
    if (!showAnswer) {
      return {
        container: "border-slate-200",
        letter: isSelected ? "text-white bg-[#5f2ebe] border-[#5f2ebe]" : "text-[#5f2ebe]",
        background: isSelected ? "bg-[#F6F8FA]" : "",
        text: ""
      };
    }
    
    // Quando a resposta está sendo mostrada
    if (isCorrect) {
      return {
        container: "border-[#40CE5A] bg-[#EDFFF0]",
        letter: "text-white bg-[#40CE5A] border-[#40CE5A]",
        background: "",
        text: "font-medium"
      };
    }
    
    if (isSelected && !isCorrect) {
      return {
        container: "border-[#FF5A5A] bg-[#FFF0F0]",
        letter: "text-white bg-[#FF5A5A] border-[#FF5A5A]",
        background: "",
        text: "line-through decoration-[#FF5A5A] decoration-1"
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
  
  // Determinar o texto da letra da opção
  const getOptionLetter = () => {
    // Se for questão do tipo Certo ou Errado, use C e E
    if (questionType === "Certo ou Errado") {
      return index === 0 ? "C" : "E";
    }
    // Para outros tipos, use as letras comuns (A, B, C, etc.)
    return String.fromCharCode(65 + index);
  };
  
  // Preparar o texto da opção, garantindo que glifos sejam preservados
  const preparedText = prepareHtmlContent(text);
  
  return (
    <div className="flex gap-1 items-center md:px-5 py-1 w-full rounded-none min-h-16 px-[6px]">
      <button 
        onClick={e => onToggleDisabled(id, e)} 
        className="flex gap-5 justify-center items-center self-stretch rounded-xl min-h-[30px] w-[30px] hover:bg-slate-50"
        disabled={showAnswer}
      >
        <X className={`w-4 h-4 ${isDisabled ? "text-red-500" : "text-slate-400"}`} />
      </button>
      
      <button 
        onClick={() => onSelect(id)} 
        className={`flex flex-1 gap-4 items-center self-stretch p-3 text-base max-sm:text-sm whitespace-normal rounded-xl border border-solid ${styles.container} ${styles.background} ${isDisabled && !showAnswer ? "opacity-50 line-through" : ""}`} 
        disabled={isDisabled || showAnswer}
      >
        <span className={`gap-2.5 self-stretch font-bold text-center rounded border border-solid min-h-[30px] w-[30px] flex items-center justify-center ${styles.letter}`}>
          {getOptionLetter()}
        </span>
        
        <span 
          className={`flex-1 text-slate-800 text-left ${styles.text}`}
          dangerouslySetInnerHTML={{ __html: preparedText }}
        />
      </button>
    </div>
  );
};
