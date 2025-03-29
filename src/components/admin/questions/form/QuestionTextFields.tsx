import React from "react";
import { QuestionTiptapEditor } from "./QuestionTiptapEditor";

interface QuestionTextFieldsProps {
  questionText: string | null;
  setQuestionText: ((value: string) => void) | null;
  teacherExplanation: string | null;
  setTeacherExplanation: ((value: string) => void) | null;
  expandableContent?: string | null;
  setExpandableContent?: ((value: string) => void) | null;
  aiExplanation?: string | null;
  setAIExplanation?: ((value: string) => void) | null;
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
  return (
    <div className="space-y-4">
      {expandableContent !== undefined && expandableContent !== null && setExpandableContent !== undefined && setExpandableContent !== null && (
        <div>
          <label htmlFor="expandable-content" className="block text-sm font-medium text-[#67748a] mb-1">
            Conteúdo Expansível
          </label>
          <QuestionTiptapEditor
            content={expandableContent}
            onChange={setExpandableContent}
            placeholder="Digite textos ou adicione imagens que serão exibidos ao expandir..."
          />
        </div>
      )}
      
      {questionText !== null && setQuestionText !== null && (
        <div>
          <label htmlFor="question-text" className="block text-sm font-medium text-[#67748a] mb-1">
            Texto da Questão
          </label>
          <QuestionTiptapEditor
            content={questionText}
            onChange={setQuestionText}
            placeholder="Digite o texto da questão..."
          />
        </div>
      )}
      
      {teacherExplanation !== null && setTeacherExplanation !== null && (
        <div>
          <label htmlFor="teacher-explanation" className="block text-sm font-medium text-[#67748a] mb-1">
            Explicação do Professor
          </label>
          <QuestionTiptapEditor
            content={teacherExplanation}
            onChange={setTeacherExplanation}
            placeholder="Digite a explicação do professor..."
          />
        </div>
      )}
      
      {aiExplanation !== null && setAIExplanation !== null && (
        <div>
          <label htmlFor="ai-explanation" className="block text-sm font-medium text-[#67748a] mb-1">
            Resposta da BIA (BomEstudo IA)
          </label>
          <QuestionTiptapEditor
            content={aiExplanation}
            onChange={setAIExplanation}
            placeholder="Digite a resposta da BIA..."
          />
        </div>
      )}
    </div>
  );
};

export default QuestionTextFields;
