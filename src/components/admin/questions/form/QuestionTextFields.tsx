
import React from "react";
import { Label } from "@/components/ui/label";
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
    <>
      <div>
        <Label htmlFor="question-text">Texto da Questão</Label>
        <Textarea 
          id="question-text" 
          value={questionText} 
          onChange={(e) => setQuestionText(e.target.value)} 
          placeholder="Digite o texto da questão" 
          className="min-h-[200px]"
        />
      </div>

      <div>
        <Label htmlFor="teacher-explanation">Explicação do Professor</Label>
        <Textarea 
          id="teacher-explanation" 
          value={teacherExplanation} 
          onChange={(e) => setTeacherExplanation(e.target.value)} 
          placeholder="Digite a explicação do professor" 
          className="min-h-[150px]"
        />
      </div>
    </>
  );
};

export default QuestionTextFields;
