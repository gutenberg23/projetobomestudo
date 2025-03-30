import React, { useState, useEffect } from "react";
import QuestionMetadataFields from "./form/QuestionMetadataFields";
import QuestionTextFields from "./form/QuestionTextFields";
import QuestionOptions from "./form/QuestionOptions";
import FormSection from "./form/FormSection";
import SubmitButton from "./form/SubmitButton";
import { useClipboard } from "./form/useClipboard";
import { QuestionOption } from "./types";
import { useQuestionManagementStore } from "@/stores/questionManagementStore";

interface QuestionFormProps {
  year: string;
  setYear: (value: string) => void;
  institution: string;
  setInstitution: (value: string) => void;
  organization: string;
  setOrganization: (value: string) => void;
  role: string;
  setRole: (value: string) => void;
  discipline: string;
  setDiscipline: (value: string) => void;
  level: string;
  setLevel: (value: string) => void;
  difficulty: string;
  setDifficulty: (value: string) => void;
  questionType: string;
  setQuestionType: (value: string) => void;
  questionText: string;
  setQuestionText: (value: string) => void;
  teacherExplanation: string;
  setTeacherExplanation: (value: string) => void;
  expandableContent: string;
  setExpandableContent: (value: string) => void;
  aiExplanation: string;
  setAIExplanation: (value: string) => void;
  options: QuestionOption[];
  setOptions: (options: QuestionOption[]) => void;
  topicos: string[];
  setTopicos: (value: string[]) => void;
  onSubmit: () => void;
  submitButtonText: string;
  isEditing?: boolean;
}

export const QuestionForm: React.FC<QuestionFormProps> = ({
  year,
  setYear,
  institution,
  setInstitution,
  organization,
  setOrganization,
  role,
  setRole,
  discipline,
  setDiscipline,
  level,
  setLevel,
  difficulty,
  setDifficulty,
  questionType,
  setQuestionType,
  questionText,
  setQuestionText,
  teacherExplanation,
  setTeacherExplanation,
  expandableContent,
  setExpandableContent,
  aiExplanation,
  setAIExplanation,
  options,
  setOptions,
  topicos,
  setTopicos,
  onSubmit,
  submitButtonText,
  isEditing = false
}) => {
  const { copyToClipboard } = useClipboard();
  const dropdownData = useQuestionManagementStore((state) => state.dropdownData);

  // Função para garantir o número correto de opções baseado no tipo de questão
  const ensureCorrectNumberOfOptions = () => {
    const currentOptions = [...options];
    const targetLength = questionType === "Certo ou Errado" ? 2 : 5;
    
    // Remover opções extras se necessário
    if (currentOptions.length > targetLength) {
      currentOptions.splice(targetLength);
    }
    
    // Adicionar opções faltantes se necessário
    while (currentOptions.length < targetLength) {
      currentOptions.push({
        id: `option-${Math.random().toString(36).substr(2, 9)}`,
        text: questionType === "Certo ou Errado" 
          ? currentOptions.length === 0 ? "Certo" : "Errado"
          : '',
        isCorrect: false
      });
    }
    setOptions(currentOptions);
  };

  // Atualizar opções quando o tipo de questão mudar
  useEffect(() => {
    if (questionType === "Certo ou Errado" || questionType === "Múltipla Escolha") {
      ensureCorrectNumberOfOptions();
    }
  }, [questionType]);

  return (
    <div className="space-y-6">
      {/* Question Metadata Fields */}
      <QuestionMetadataFields 
        institution={institution}
        setInstitution={setInstitution}
        organization={organization}
        setOrganization={setOrganization}
        year={year}
        setYear={setYear}
        role={role}
        setRole={setRole}
        discipline={discipline}
        setDiscipline={setDiscipline}
        level={level}
        setLevel={setLevel}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        questionType={questionType}
        setQuestionType={setQuestionType}
        topicos={topicos}
        setTopicos={setTopicos}
      />

      {/* Expandable Content */}
      <div>
        <label htmlFor="expandable-content" className="block text-sm font-medium text-[#272f3c] mb-1">
          Texto/Imagem Expansível
        </label>
        <QuestionTextFields 
          questionText={null} 
          setQuestionText={null} 
          teacherExplanation={null} 
          setTeacherExplanation={null}
          expandableContent={expandableContent}
          setExpandableContent={setExpandableContent}
          aiExplanation={null}
          setAIExplanation={null}
        />
      </div>

      {/* Question Text */}
      <div>
        <label htmlFor="question-text" className="block text-sm font-medium text-[#272f3c] mb-1">
          Texto da Questão
        </label>
        <QuestionTextFields 
          questionText={questionText} 
          setQuestionText={setQuestionText} 
          teacherExplanation={null} 
          setTeacherExplanation={null}
          expandableContent={null}
          setExpandableContent={null}
          aiExplanation={null}
          setAIExplanation={null}
        />
      </div>

      {/* Question Options */}
      {questionType && <QuestionOptions questionType={questionType} options={options} setOptions={setOptions} />}

      {/* Teacher Explanation */}
      <div>
        <label htmlFor="teacher-explanation" className="block text-sm font-medium text-[#272f3c] mb-1">
          Explicação do Professor
        </label>
        <QuestionTextFields 
          questionText={null} 
          setQuestionText={null} 
          teacherExplanation={teacherExplanation} 
          setTeacherExplanation={setTeacherExplanation}
          expandableContent={null}
          setExpandableContent={null}
          aiExplanation={null}
          setAIExplanation={null}
        />
      </div>

      {/* AI Explanation */}
      <div>
        <label htmlFor="ai-explanation" className="block text-sm font-medium text-[#272f3c] mb-1">
          Resposta da BIA
        </label>
        <QuestionTextFields 
          questionText={null} 
          setQuestionText={null} 
          teacherExplanation={null} 
          setTeacherExplanation={null}
          expandableContent={null}
          setExpandableContent={null}
          aiExplanation={aiExplanation}
          setAIExplanation={setAIExplanation}
        />
      </div>

      {/* Submit Button */}
      <SubmitButton onClick={onSubmit} text={submitButtonText} />
    </div>
  );
};

export default QuestionForm;
