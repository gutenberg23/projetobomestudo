
import React, { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { QuestionOption } from "../types";
import { Radio } from "@/components/ui/radio-group";

interface QuestionOptionsProps {
  questionType: string;
  options: QuestionOption[];
  setOptions: (options: QuestionOption[]) => void;
}

const QuestionOptions: React.FC<QuestionOptionsProps> = ({
  questionType,
  options,
  setOptions,
}) => {
  // Inicializa as opções com base no tipo de questão
  useEffect(() => {
    if (questionType === "Múltipla Escolha" && options.length === 0) {
      // Cria 5 opções vazias para múltipla escolha
      const newOptions = Array(5)
        .fill(null)
        .map((_, index) => ({
          id: `option-${index}`,
          text: "",
          isCorrect: index === 0, // Define a primeira como correta por padrão
        }));
      setOptions(newOptions);
    } else if (questionType === "Certo ou Errado" && (options.length === 0 || options.length > 2)) {
      // Cria 2 opções para Certo ou Errado
      setOptions([
        { id: "option-0", text: "Certo", isCorrect: true },
        { id: "option-1", text: "Errado", isCorrect: false },
      ]);
    } else if (!["Múltipla Escolha", "Certo ou Errado"].includes(questionType)) {
      // Limpa as opções se o tipo não exigir
      setOptions([]);
    }
  }, [questionType]);

  // Atualiza o texto de uma opção
  const handleOptionTextChange = (id: string, text: string) => {
    setOptions(
      options.map((option) =>
        option.id === id ? { ...option, text } : option
      )
    );
  };

  // Define qual opção é a correta (apenas uma pode ser correta)
  const handleCorrectOptionChange = (id: string) => {
    setOptions(
      options.map((option) => ({
        ...option,
        isCorrect: option.id === id,
      }))
    );
  };

  if (!questionType || !["Múltipla Escolha", "Certo ou Errado"].includes(questionType)) {
    return null;
  }

  if (questionType === "Certo ou Errado") {
    return (
      <div className="space-y-4">
        <Label>Opção Correta</Label>
        <div className="space-y-2">
          {options.map((option) => (
            <div key={option.id} className="flex items-center gap-2">
              <Radio
                id={option.id}
                value={option.id}
                checked={option.isCorrect}
                onClick={() => handleCorrectOptionChange(option.id)}
              />
              <Label htmlFor={option.id}>{option.text}</Label>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Label>Alternativas</Label>
      <div className="space-y-2">
        {options.map((option, index) => (
          <div key={option.id} className="flex items-start gap-2">
            <div className="pt-2">
              <Radio
                id={option.id}
                value={option.id}
                checked={option.isCorrect}
                onClick={() => handleCorrectOptionChange(option.id)}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor={`option-text-${option.id}`}>
                Alternativa {String.fromCharCode(65 + index)}
              </Label>
              <Input
                id={`option-text-${option.id}`}
                value={option.text}
                onChange={(e) => handleOptionTextChange(option.id, e.target.value)}
                placeholder={`Digite o texto da alternativa ${String.fromCharCode(65 + index)}`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestionOptions;
