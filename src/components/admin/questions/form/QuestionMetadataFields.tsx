
import React from "react";
import SelectField from "./SelectField";
import AddValueDialog from "./AddValueDialog";
import { useSelectFieldState } from "./useSelectFieldState";

interface QuestionMetadataFieldsProps {
  // Institution
  institution: string;
  setInstitution: (value: string) => void;
  institutions: string[];
  setInstitutions: (value: string[]) => void;
  
  // Organization
  organization: string;
  setOrganization: (value: string) => void;
  organizations: string[];
  setOrganizations: (value: string[]) => void;
  
  // Year
  year: string;
  setYear: (value: string) => void;
  years: string[];
  setYears: (value: string[]) => void;
  
  // Role
  role: string;
  setRole: (value: string) => void;
  roles: string[];
  setRoles: (value: string[]) => void;
  
  // Discipline
  discipline: string;
  setDiscipline: (value: string) => void;
  disciplines: string[];
  setDisciplines: (value: string[]) => void;
  
  // Level
  level: string;
  setLevel: (value: string) => void;
  levels: string[];
  setLevels: (value: string[]) => void;
  
  // Difficulty
  difficulty: string;
  setDifficulty: (value: string) => void;
  difficulties: string[];
  setDifficulties: (value: string[]) => void;
  
  // Question Type
  questionType: string;
  setQuestionType: (value: string) => void;
  questionTypes: string[];
  setQuestionTypes: (value: string[]) => void;
}

const QuestionMetadataFields: React.FC<QuestionMetadataFieldsProps> = ({
  institution, setInstitution, institutions, setInstitutions,
  organization, setOrganization, organizations, setOrganizations,
  year, setYear, years, setYears,
  role, setRole, roles, setRoles,
  discipline, setDiscipline, disciplines, setDisciplines,
  level, setLevel, levels, setLevels,
  difficulty, setDifficulty, difficulties, setDifficulties,
  questionType, setQuestionType, questionTypes, setQuestionTypes
}) => {
  const institutionState = useSelectFieldState(institution, setInstitution, institutions, setInstitutions, "instituição");
  const organizationState = useSelectFieldState(organization, setOrganization, organizations, setOrganizations, "instituição");
  const yearState = useSelectFieldState(year, setYear, years, setYears, "ano");
  const roleState = useSelectFieldState(role, setRole, roles, setRoles, "cargo");
  const disciplineState = useSelectFieldState(discipline, setDiscipline, disciplines, setDisciplines, "disciplina");
  const levelState = useSelectFieldState(level, setLevel, levels, setLevels, "nível");
  const difficultyState = useSelectFieldState(difficulty, setDifficulty, difficulties, setDifficulties, "dificuldade");
  const questionTypeState = useSelectFieldState(questionType, setQuestionType, questionTypes, setQuestionTypes, "tipo de questão");

  return (
    <>
      {/* Institution, Organization, Year Fields */}
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

      {/* Role, Discipline, Level Fields */}
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

      {/* Difficulty, Question Type Fields */}
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
    </>
  );
};

export default QuestionMetadataFields;
