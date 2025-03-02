
import React from "react";
import { Textarea } from "@/components/ui/textarea";

interface QuestionTextFieldsProps {
  questionText: string;
  setQuestionText: (value: string) => void;
  teacherExplanation: string;
  setTeacherExplanation: (value: string) => void;
}

const QuestionTextFields: React.FC<QuestionTextFieldsProps> = ({
  questionText,
  setQuestionText,
  teacherExplanation,
  setTeacherExplanation,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="question-text" className="block text-sm font-medium text-[#272f3c] mb-1">
          Texto da Questão
        </label>
        <Textarea
          id="question-text"
          placeholder="Digite o texto da questão..."
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          className="min-h-[200px]"
          richText={true}
        />
      </div>
      
      <div>
        <label htmlFor="teacher-explanation" className="block text-sm font-medium text-[#272f3c] mb-1">
          Explicação do Professor
        </label>
        <Textarea
          id="teacher-explanation"
          placeholder="Digite a explicação do professor..."
          value={teacherExplanation}
          onChange={(e) => setTeacherExplanation(e.target.value)}
          className="min-h-[200px]"
          richText={true}
        />
      </div>
    </div>
  );
};

export default QuestionTextFields;
