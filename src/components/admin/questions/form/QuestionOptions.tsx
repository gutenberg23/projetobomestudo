import React, { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2 } from "lucide-react";
import { QuestionOption } from "../types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { QuestionTiptapEditor } from "./QuestionTiptapEditor";

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
    if (questionType === "Múltipla Escolha" && (options.length === 0 || options.length < 5)) {
      // Cria 5 opções vazias para múltipla escolha
      const newOptions = Array(5)
        .fill(null)
        .map((_, index) => ({
          id: `option-${index}`,
          text: "",
          isCorrect: index === 0, // Define a primeira como correta por padrão
        }));
      setOptions(newOptions);
    } else if (questionType === "Certo ou Errado") {
      // Sempre criar exatamente 2 opções para Certo ou Errado
      setOptions([
        { id: "option-0", text: "Certo", isCorrect: true },
        { id: "option-1", text: "Errado", isCorrect: false },
      ]);
    } else if (!["Múltipla Escolha", "Certo ou Errado"].includes(questionType)) {
      // Limpa as opções se o tipo não exigir
      setOptions([]);
    }
  }, [questionType]);

  const handleAddOption = () => {
    if (questionType === "Múltipla Escolha" && options.length >= 5) return;
    
    const newOption: QuestionOption = {
      id: `option-${Math.random().toString(36).substr(2, 9)}`,
      text: "",
      isCorrect: false,
    };
    setOptions([...options, newOption]);
  };

  const handleRemoveOption = (id: string) => {
    setOptions(options.filter((option) => option.id !== id));
  };

  const handleOptionChange = (id: string, text: string) => {
    setOptions(
      options.map((option) =>
        option.id === id ? { ...option, text } : option
      )
    );
  };

  const handleCorrectChange = (id: string) => {
    setOptions(
      options.map((option) =>
        option.id === id
          ? { ...option, isCorrect: !option.isCorrect }
          : { ...option, isCorrect: false }
      )
    );
  };

  if (!questionType || !["Múltipla Escolha", "Certo ou Errado"].includes(questionType)) {
    return null;
  }

  if (questionType === "Certo ou Errado") {
    return (
      <div className="space-y-4">
        <Label>Opção Correta</Label>
        <RadioGroup
          value={options.find(o => o.isCorrect)?.id || ""}
          onValueChange={handleCorrectChange}
          className="space-y-2"
        >
          {options.map((option) => (
            <div key={option.id} className="flex items-center gap-2">
              <RadioGroupItem
                id={option.id}
                value={option.id}
              />
              <Label htmlFor={option.id}>{option.text}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Alternativas</Label>
        {questionType === "Múltipla Escolha" && options.length < 5 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddOption}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Adicionar Alternativa
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {options.map((option, index) => (
          <div key={option.id} className="flex items-center gap-2">
            <span className="font-medium">{String.fromCharCode(65 + index)}.</span>
            <Input
              value={option.text}
              onChange={(e) => handleOptionChange(option.id, e.target.value)}
              placeholder={`Digite a alternativa ${String.fromCharCode(65 + index)}`}
              className={`flex-1 ${index === 4 ? 'border-gray-300' : ''}`}
            />
            <Checkbox
              checked={option.isCorrect}
              onCheckedChange={() => handleCorrectChange(option.id)}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveOption(option.id)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestionOptions;
