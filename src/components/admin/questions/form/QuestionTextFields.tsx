import React, { useEffect } from "react";
import { Label } from "@/components/ui/label";
import QuestionTiptapEditor from "./QuestionTiptapEditor";
import { Card, CardContent } from "@/components/ui/card";

interface QuestionTextFieldsProps {
  questionText: string | null;
  setQuestionText: ((value: string) => void) | null;
  teacherExplanation: string | null;
  setTeacherExplanation: ((value: string) => void) | null;
  expandableContent: string | null;
  setExpandableContent: ((value: string) => void) | null;
  aiExplanation: string | null;
  setAIExplanation: ((value: string) => void) | null;
}

const QuestionTextFields: React.FC<QuestionTextFieldsProps> = ({
  questionText,
  setQuestionText,
  teacherExplanation,
  setTeacherExplanation,
  expandableContent,
  setExpandableContent,
  aiExplanation,
  setAIExplanation
}) => {
  // Log para depuração (apenas uma vez na montagem)
  useEffect(() => {
    console.log("QuestionTextFields montado com valores iniciais");
  }, []);

  // Gerar IDs estáveis para cada instância do editor TipTap para evitar problemas de reinicialização
  const questionTextId = React.useMemo(() => `question-text-${Math.random().toString(36).substring(2, 9)}`, []);
  const teacherExplanationId = React.useMemo(() => `teacher-explanation-${Math.random().toString(36).substring(2, 9)}`, []);
  const expandableContentId = React.useMemo(() => `expandable-content-${Math.random().toString(36).substring(2, 9)}`, []);
  const aiExplanationId = React.useMemo(() => `ai-explanation-${Math.random().toString(36).substring(2, 9)}`, []);

  return (
    <div className="space-y-6 w-full">
      {questionText !== null && setQuestionText !== null && (
        <div className="space-y-2">
          <Label htmlFor="questionText">Texto da Questão</Label>
          <QuestionTiptapEditor
            key={questionTextId}
            content={questionText || ''}
            onChange={setQuestionText}
            placeholder="Digite o texto da questão aqui..."
            minHeight="200px"
          />
        </div>
      )}

      {teacherExplanation !== null && setTeacherExplanation !== null && (
        <div className="space-y-2">
          <Label htmlFor="teacherExplanation">Explicação do Professor</Label>
          <QuestionTiptapEditor
            key={teacherExplanationId}
            content={teacherExplanation || ''}
            onChange={setTeacherExplanation}
            placeholder="Digite a explicação do professor aqui..."
            minHeight="150px"
          />
        </div>
      )}

      {expandableContent !== null && setExpandableContent !== null && (
        <div className="space-y-2">
          <Label htmlFor="expandableContent">Texto/Imagem Expansível</Label>
          <QuestionTiptapEditor
            key={expandableContentId}
            content={expandableContent || ''}
            onChange={setExpandableContent}
            placeholder="Digite o conteúdo expansível aqui..."
            minHeight="150px"
          />
        </div>
      )}

      {aiExplanation !== null && setAIExplanation !== null && (
        <div className="space-y-2">
          <Label htmlFor="aiExplanation">Explicação da IA</Label>
          <QuestionTiptapEditor
            key={aiExplanationId}
            content={aiExplanation || ''}
            onChange={setAIExplanation}
            placeholder="Digite a explicação da IA aqui..."
            minHeight="150px"
          />
        </div>
      )}
    </div>
  );
};

export default QuestionTextFields;
