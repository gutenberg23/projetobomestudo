
import React from "react";
import { Button } from "@/components/ui/button";
import { useClipboard } from "./form/useClipboard";
import { useSelectFieldState } from "./form/useSelectFieldState";
import QuestionIdField from "./form/QuestionIdField";
import SelectField from "./form/SelectField";
import QuestionTextFields from "./form/QuestionTextFields";
import AddValueDialog from "./form/AddValueDialog";

interface QuestionItemType {
  id: string;
  year: string;
  institution: string;
  organization: string;
  role: string;
  discipline: string;
  level: string;
  difficulty: string;
  questionType: string;
  content: string;
  teacherExplanation: string;
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
}

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
  isEditing = false,
}) => {
  const { copyToClipboard } = useClipboard();

  // Estados para os selects
  const institutionState = useSelectFieldState(institution, setInstitution, institutions, setInstitutions, "instituição");
  const organizationState = useSelectFieldState(organization, setOrganization, organizations, setOrganizations, "instituição");
  const yearState = useSelectFieldState(year, setYear, years, setYears, "ano");
  const roleState = useSelectFieldState(role, setRole, roles, setRoles, "cargo");
  const disciplineState = useSelectFieldState(discipline, setDiscipline, disciplines, setDisciplines, "disciplina");
  const levelState = useSelectFieldState(level, setLevel, levels, setLevels, "nível");
  const difficultyState = useSelectFieldState(difficulty, setDifficulty, difficulties, setDifficulties, "dificuldade");
  const questionTypeState = useSelectFieldState(questionType, setQuestionType, questionTypes, setQuestionTypes, "tipo de questão");

  return (
    <div className="space-y-6">
      <QuestionIdField 
        questionId={questionId} 
        copyToClipboard={copyToClipboard} 
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Instituição */}
        <div>
          <SelectField
            id="institution"
            label="Banca"
            value={institutionState.value}
            onChange={setInstitution}
            options={institutions}
            handleEditOption={institutionState.handleEdit}
            handleDeleteOption={institutionState.handleDelete}
            openAddDialog={() => institutionState.setIsDialogOpen(true)}
            placeholder="Selecione a instituição"
          />
          <AddValueDialog
            title="Adicionar Nova Instituição"
            placeholder="Nome da instituição"
            isOpen={institutionState.isDialogOpen}
            setIsOpen={institutionState.setIsDialogOpen}
            value={institutionState.newValue}
            setValue={institutionState.setNewValue}
            onAdd={institutionState.handleAdd}
          />
        </div>

        {/* Organização */}
        <div>
          <SelectField
            id="organization"
            label="Instituição"
            value={organizationState.value}
            onChange={setOrganization}
            options={organizations}
            handleEditOption={organizationState.handleEdit}
            handleDeleteOption={organizationState.handleDelete}
            openAddDialog={() => organizationState.setIsDialogOpen(true)}
            placeholder="Selecione a instituição"
          />
          <AddValueDialog
            title="Adicionar Nova Instituição"
            placeholder="Nome da instituição"
            isOpen={organizationState.isDialogOpen}
            setIsOpen={organizationState.setIsDialogOpen}
            value={organizationState.newValue}
            setValue={organizationState.setNewValue}
            onAdd={organizationState.handleAdd}
          />
        </div>

        {/* Ano */}
        <div>
          <SelectField
            id="year"
            label="Ano"
            value={yearState.value}
            onChange={setYear}
            options={years}
            handleEditOption={yearState.handleEdit}
            handleDeleteOption={yearState.handleDelete}
            openAddDialog={() => yearState.setIsDialogOpen(true)}
            placeholder="Selecione o ano"
          />
          <AddValueDialog
            title="Adicionar Novo Ano"
            placeholder="Ano"
            isOpen={yearState.isDialogOpen}
            setIsOpen={yearState.setIsDialogOpen}
            value={yearState.newValue}
            setValue={yearState.setNewValue}
            onAdd={yearState.handleAdd}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Cargo */}
        <div>
          <SelectField
            id="role"
            label="Cargo"
            value={roleState.value}
            onChange={setRole}
            options={roles}
            handleEditOption={roleState.handleEdit}
            handleDeleteOption={roleState.handleDelete}
            openAddDialog={() => roleState.setIsDialogOpen(true)}
            placeholder="Selecione o cargo"
          />
          <AddValueDialog
            title="Adicionar Novo Cargo"
            placeholder="Nome do cargo"
            isOpen={roleState.isDialogOpen}
            setIsOpen={roleState.setIsDialogOpen}
            value={roleState.newValue}
            setValue={roleState.setNewValue}
            onAdd={roleState.handleAdd}
          />
        </div>

        {/* Disciplina */}
        <div>
          <SelectField
            id="discipline"
            label="Disciplina"
            value={disciplineState.value}
            onChange={setDiscipline}
            options={disciplines}
            handleEditOption={disciplineState.handleEdit}
            handleDeleteOption={disciplineState.handleDelete}
            openAddDialog={() => disciplineState.setIsDialogOpen(true)}
            placeholder="Selecione a disciplina"
          />
          <AddValueDialog
            title="Adicionar Nova Disciplina"
            placeholder="Nome da disciplina"
            isOpen={disciplineState.isDialogOpen}
            setIsOpen={disciplineState.setIsDialogOpen}
            value={disciplineState.newValue}
            setValue={disciplineState.setNewValue}
            onAdd={disciplineState.handleAdd}
          />
        </div>

        {/* Nível */}
        <div>
          <SelectField
            id="level"
            label="Nível"
            value={levelState.value}
            onChange={setLevel}
            options={levels}
            handleEditOption={levelState.handleEdit}
            handleDeleteOption={levelState.handleDelete}
            openAddDialog={() => levelState.setIsDialogOpen(true)}
            placeholder="Selecione o nível"
          />
          <AddValueDialog
            title="Adicionar Novo Nível"
            placeholder="Nome do nível"
            isOpen={levelState.isDialogOpen}
            setIsOpen={levelState.setIsDialogOpen}
            value={levelState.newValue}
            setValue={levelState.setNewValue}
            onAdd={levelState.handleAdd}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Dificuldade */}
        <div>
          <SelectField
            id="difficulty"
            label="Dificuldade"
            value={difficultyState.value}
            onChange={setDifficulty}
            options={difficulties}
            handleEditOption={difficultyState.handleEdit}
            handleDeleteOption={difficultyState.handleDelete}
            openAddDialog={() => difficultyState.setIsDialogOpen(true)}
            placeholder="Selecione a dificuldade"
          />
          <AddValueDialog
            title="Adicionar Nova Dificuldade"
            placeholder="Nome da dificuldade"
            isOpen={difficultyState.isDialogOpen}
            setIsOpen={difficultyState.setIsDialogOpen}
            value={difficultyState.newValue}
            setValue={difficultyState.setNewValue}
            onAdd={difficultyState.handleAdd}
          />
        </div>

        {/* Tipo de Questão */}
        <div>
          <SelectField
            id="question-type"
            label="Tipo de Questão"
            value={questionTypeState.value}
            onChange={setQuestionType}
            options={questionTypes}
            handleEditOption={questionTypeState.handleEdit}
            handleDeleteOption={questionTypeState.handleDelete}
            openAddDialog={() => questionTypeState.setIsDialogOpen(true)}
            placeholder="Selecione o tipo"
          />
          <AddValueDialog
            title="Adicionar Novo Tipo de Questão"
            placeholder="Nome do tipo"
            isOpen={questionTypeState.isDialogOpen}
            setIsOpen={questionTypeState.setIsDialogOpen}
            value={questionTypeState.newValue}
            setValue={questionTypeState.setNewValue}
            onAdd={questionTypeState.handleAdd}
          />
        </div>
      </div>

      {/* Campos de texto */}
      <QuestionTextFields
        questionText={questionText}
        setQuestionText={setQuestionText}
        teacherExplanation={teacherExplanation}
        setTeacherExplanation={setTeacherExplanation}
      />

      <div>
        <Button onClick={onSubmit} className="bg-[#ea2be2] hover:bg-[#d01ec7] text-white">
          {submitButtonText}
        </Button>
      </div>
    </div>
  );
};

export default QuestionForm;
