import React, { useState, useEffect } from "react";
import QuestionIdField from "./form/QuestionIdField";
import QuestionMetadataFields from "./form/QuestionMetadataFields";
import QuestionTextFields from "./form/QuestionTextFields";
import QuestionOptions from "./form/QuestionOptions";
import FormSection from "./form/FormSection";
import SubmitButton from "./form/SubmitButton";
import { useClipboard } from "./form/useClipboard";
import { QuestionOption } from "./types";

// Importando os serviços
import { fetchBancas } from "@/services/bancasService";
import { fetchInstituicoes } from "@/services/instituicoesService";
import { fetchAnos } from "@/services/anosService";
import { fetchCargos } from "@/services/cargosService";
import { fetchDisciplinasQuestoes } from "@/services/disciplinasQuestoesService";
import { fetchNiveis } from "@/services/niveisService";
import { fetchDificuldades } from "@/services/dificuldadesService";
import { fetchTiposQuestao } from "@/services/tiposQuestaoService";

interface QuestionFormProps {
  questionId: string;
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
  setTopicos: (topicos: string[]) => void;
  institutions: string[];
  setInstitutions: (value: string[]) => void;
  organizations: string[];
  setOrganizations: (value: string[]) => void;
  roles: string[];
  setRoles: (value: string[]) => void;
  disciplines: string[];
  setDisciplines: (value: string[]) => void;
  levels: string[];
  setLevels: (value: string[]) => void;
  difficulties: string[];
  setDifficulties: (value: string[]) => void;
  questionTypes: string[];
  setQuestionTypes: (value: string[]) => void;
  years: string[];
  setYears: (value: string[]) => void;
  onSubmit: () => void;
  submitButtonText: string;
  isEditing?: boolean;
}

const QuestionForm: React.FC<QuestionFormProps> = ({
  questionId,
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
  institutions,
  setInstitutions,
  organizations,
  setOrganizations,
  roles,
  setRoles,
  disciplines,
  setDisciplines,
  levels,
  setLevels,
  difficulties,
  setDifficulties,
  questionTypes,
  setQuestionTypes,
  years,
  setYears,
  onSubmit,
  submitButtonText,
  isEditing = false
}) => {
  const {
    copyToClipboard
  } = useClipboard();

  // Carregar dados iniciais das tabelas
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Carregar dados das bancas
        const bancasData = await fetchBancas();
        setInstitutions(bancasData.map(banca => banca.nome));

        // Carregar dados dos anos
        const anosData = await fetchAnos();
        setYears(anosData.map(ano => ano.valor));

        // Carregar dados dos cargos
        const cargosData = await fetchCargos();
        setRoles(cargosData.map(cargo => cargo.nome));

        // Carregar dados das disciplinas
        const disciplinasData = await fetchDisciplinasQuestoes();
        setDisciplines(disciplinasData.map(disciplina => disciplina.nome));

        // Carregar dados dos níveis
        const niveisData = await fetchNiveis();
        setLevels(niveisData.map(nivel => nivel.nome));

        // Carregar dados das dificuldades
        const dificuldadesData = await fetchDificuldades();
        setDifficulties(dificuldadesData.map(dificuldade => dificuldade.nome));

        // Carregar dados dos tipos de questão
        const tiposQuestaoData = await fetchTiposQuestao();
        setQuestionTypes(tiposQuestaoData.map(tipo => tipo.nome));
      } catch (error) {
        console.error("Erro ao carregar dados iniciais:", error);
      }
    };

    loadInitialData();
  }, [
    setInstitutions,
    setYears,
    setRoles,
    setDisciplines,
    setLevels,
    setDifficulties,
    setQuestionTypes
  ]);

  return <div className="space-y-6">
      {/* Question ID Field */}
      <QuestionIdField questionId={questionId} copyToClipboard={copyToClipboard} />

      {/* Question Metadata Fields */}
      <QuestionMetadataFields 
        institution={institution} 
        setInstitution={setInstitution} 
        institutions={institutions} 
        setInstitutions={setInstitutions} 
        organization={organization} 
        setOrganization={setOrganization} 
        organizations={organizations} 
        setOrganizations={setOrganizations} 
        year={year} 
        setYear={setYear} 
        years={years} 
        setYears={setYears} 
        role={role} 
        setRole={setRole} 
        roles={roles} 
        setRoles={setRoles} 
        discipline={discipline} 
        setDiscipline={setDiscipline} 
        disciplines={disciplines} 
        setDisciplines={setDisciplines} 
        topicos={topicos}
        setTopicos={setTopicos}
        level={level}
        setLevel={setLevel}
        levels={levels}
        setLevels={setLevels}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        difficulties={difficulties}
        setDifficulties={setDifficulties}
        questionType={questionType}
        setQuestionType={setQuestionType}
        questionTypes={questionTypes}
        setQuestionTypes={setQuestionTypes}
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
          Resposta da IA
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
    </div>;
};

export default QuestionForm;
