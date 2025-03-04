
import React from "react";
import { Textarea } from "@/components/ui/textarea";

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
          <Textarea
            id="expandable-content"
            placeholder="Digite textos ou adicione imagens que serão exibidos ao expandir..."
            value={expandableContent}
            onChange={(e) => setExpandableContent(e.target.value)}
            className="min-h-[150px] md:min-h-[200px]"
            richText={true}
          />
        </div>
      )}
      
      {questionText !== null && setQuestionText !== null && (
        <div>
          <label htmlFor="question-text" className="block text-sm font-medium text-[#67748a] mb-1">
            Texto da Questão
          </label>
          <Textarea
            id="question-text"
            placeholder="Digite o texto da questão..."
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            className="min-h-[150px] md:min-h-[200px]"
            richText={true}
          />
        </div>
      )}
      
      {teacherExplanation !== null && setTeacherExplanation !== null && (
        <div>
          <label htmlFor="teacher-explanation" className="block text-sm font-medium text-[#67748a] mb-1">
            Explicação do Professor
          </label>
          <Textarea
            id="teacher-explanation"
            placeholder="Digite a explicação do professor..."
            value={teacherExplanation}
            onChange={(e) => setTeacherExplanation(e.target.value)}
            className="min-h-[150px] md:min-h-[200px]"
            richText={true}
          />
        </div>
      )}
      
      {aiExplanation !== null && setAIExplanation !== null && (
        <div>
          <label htmlFor="ai-explanation" className="block text-sm font-medium text-[#67748a] mb-1">
            Resposta da BIA (BomEstudo IA)
          </label>
          <Textarea
            id="ai-explanation"
            placeholder="Digite a resposta da BIA..."
            value={aiExplanation}
            onChange={(e) => setAIExplanation(e.target.value)}
            className="min-h-[150px] md:min-h-[200px]"
            richText={true}
          />
        </div>
      )}
    </div>
  );
};

export default QuestionTextFields;
