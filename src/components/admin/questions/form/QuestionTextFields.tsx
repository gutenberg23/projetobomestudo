
import React from "react";
import { Textarea } from "@/components/ui/textarea";

interface QuestionTextFieldsProps {
  questionText: string | null;
  setQuestionText: ((value: string) => void) | null;
  teacherExplanation: string | null;
  setTeacherExplanation: ((value: string) => void) | null;
}

const QuestionTextFields: React.FC<QuestionTextFieldsProps> = ({
  questionText,
  setQuestionText,
  teacherExplanation,
  setTeacherExplanation,
}) => {
  return (
    <div className="space-y-4">
      {questionText !== null && setQuestionText !== null && (
        <div>
          <Textarea
            id="question-text"
            placeholder="Digite o texto da questão..."
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            className="min-h-[200px]"
            richText={true}
          />
        </div>
      )}
      
      {teacherExplanation !== null && setTeacherExplanation !== null && (
        <div>
          <Textarea
            id="teacher-explanation"
            placeholder="Digite a explicação do professor..."
            value={teacherExplanation}
            onChange={(e) => setTeacherExplanation(e.target.value)}
            className="min-h-[200px]"
            richText={true}
          />
        </div>
      )}
    </div>
  );
};

export default QuestionTextFields;
