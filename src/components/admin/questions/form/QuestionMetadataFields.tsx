import React from 'react';
import { useQuestionManagementStore } from '@/stores/questionManagementStore';
import SelectField from "./SelectField";
import AssuntosField from "./AssuntosField";
import { useSelectFieldState } from "./useSelectFieldState";
import { CheckboxGroup } from "@/components/questions/CheckboxGroup";
import AddValueDialog from "./AddValueDialog";

interface QuestionMetadataFieldsProps {
  institution: string;
  setInstitution: (value: string) => void;
  organization: string;
  setOrganization: (value: string) => void;
  year: string;
  setYear: (value: string) => void;
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
  topicos: string[];
  setTopicos: (value: string[]) => void;
}

export const QuestionMetadataFields: React.FC<QuestionMetadataFieldsProps> = ({
  institution,
  setInstitution,
  organization,
  setOrganization,
  year,
  setYear,
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
  topicos,
  setTopicos,
}) => {
  const dropdownData = useQuestionManagementStore((state) => state.dropdownData);

  // Estados para os campos de seleção
  const institutionState = useSelectFieldState(
    institution,
    setInstitution,
    dropdownData.institutions,
    (values) => useQuestionManagementStore.setState(state => ({ dropdownData: { ...state.dropdownData, institutions: values } })),
    "Banca"
  );

  const organizationState = useSelectFieldState(
    organization,
    setOrganization,
    dropdownData.organizations,
    (values) => useQuestionManagementStore.setState(state => ({ dropdownData: { ...state.dropdownData, organizations: values } })),
    "Órgão"
  );

  const yearState = useSelectFieldState(
    year,
    setYear,
    dropdownData.years,
    (values) => useQuestionManagementStore.setState(state => ({ dropdownData: { ...state.dropdownData, years: values } })),
    "Ano"
  );

  const disciplineState = useSelectFieldState(
    discipline,
    setDiscipline,
    dropdownData.disciplines,
    (values) => useQuestionManagementStore.setState(state => ({ dropdownData: { ...state.dropdownData, disciplines: values } })),
    "Disciplina"
  );

  const levelState = useSelectFieldState(
    level,
    setLevel,
    dropdownData.levels,
    (values) => useQuestionManagementStore.setState(state => ({ dropdownData: { ...state.dropdownData, levels: values } })),
    "Nível"
  );

  const difficultyState = useSelectFieldState(
    difficulty,
    setDifficulty,
    dropdownData.difficulties,
    (values) => useQuestionManagementStore.setState(state => ({ dropdownData: { ...state.dropdownData, difficulties: values } })),
    "Dificuldade"
  );

  const questionTypeState = useSelectFieldState(
    questionType,
    setQuestionType,
    dropdownData.questionTypes,
    (values) => useQuestionManagementStore.setState(state => ({ dropdownData: { ...state.dropdownData, questionTypes: values } })),
    "Tipo de Questão"
  );

  const rolesState = useSelectFieldState(
    role,
    setRole,
    dropdownData.roles,
    (values) => useQuestionManagementStore.setState(state => ({ dropdownData: { ...state.dropdownData, roles: values } })),
    "Cargo"
  );

  // Função para gerenciar seleção múltipla de cargos
  const handleRoleChange = (value: string) => {
    const newRoles = role.split(',').filter(r => r !== '');
    const index = newRoles.indexOf(value);
    if (index === -1) {
      newRoles.push(value);
    } else {
      newRoles.splice(index, 1);
    }
    setRole(newRoles.join(','));
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Banca */}
        <SelectField
          id="institution"
          label="Banca"
          value={institutionState.value}
          onChange={setInstitution}
          options={dropdownData.institutions}
          handleEditOption={institutionState.handleEdit}
          handleDeleteOption={institutionState.handleDelete}
          openAddDialog={() => institutionState.setIsDialogOpen(true)}
          placeholder="Selecione a banca"
        />

        {/* Órgão */}
        <SelectField
          id="organization"
          label="Órgão"
          value={organizationState.value}
          onChange={setOrganization}
          options={dropdownData.organizations}
          handleEditOption={organizationState.handleEdit}
          handleDeleteOption={organizationState.handleDelete}
          openAddDialog={() => organizationState.setIsDialogOpen(true)}
          placeholder="Selecione o órgão"
        />

        {/* Ano */}
        <SelectField
          id="year"
          label="Ano"
          value={yearState.value}
          onChange={setYear}
          options={dropdownData.years}
          handleEditOption={yearState.handleEdit}
          handleDeleteOption={yearState.handleDelete}
          openAddDialog={() => yearState.setIsDialogOpen(true)}
          placeholder="Selecione o ano"
        />

        {/* Disciplina */}
        <SelectField
          id="discipline"
          label="Disciplina"
          value={disciplineState.value}
          onChange={setDiscipline}
          options={dropdownData.disciplines}
          handleEditOption={disciplineState.handleEdit}
          handleDeleteOption={disciplineState.handleDelete}
          openAddDialog={() => disciplineState.setIsDialogOpen(true)}
          placeholder="Selecione a disciplina"
        />

        {/* Nível */}
        <SelectField
          id="level"
          label="Nível"
          value={levelState.value}
          onChange={setLevel}
          options={dropdownData.levels}
          handleEditOption={levelState.handleEdit}
          handleDeleteOption={levelState.handleDelete}
          openAddDialog={() => levelState.setIsDialogOpen(true)}
          placeholder="Selecione o nível"
        />

        {/* Dificuldade */}
        <SelectField
          id="difficulty"
          label="Dificuldade"
          value={difficultyState.value}
          onChange={setDifficulty}
          options={dropdownData.difficulties}
          handleEditOption={difficultyState.handleEdit}
          handleDeleteOption={difficultyState.handleDelete}
          openAddDialog={() => difficultyState.setIsDialogOpen(true)}
          placeholder="Selecione a dificuldade"
        />

        {/* Tipo de Questão */}
        <SelectField
          id="questionType"
          label="Tipo de Questão"
          value={questionTypeState.value}
          onChange={setQuestionType}
          options={dropdownData.questionTypes}
          handleEditOption={questionTypeState.handleEdit}
          handleDeleteOption={questionTypeState.handleDelete}
          openAddDialog={() => questionTypeState.setIsDialogOpen(true)}
          placeholder="Selecione o tipo"
        />

        {/* Cargo */}
        <CheckboxGroup
          title="Cargo"
          options={dropdownData.roles}
          selectedValues={role.split(',').filter(r => r !== '')}
          onChange={handleRoleChange}
          placeholder="Selecione os cargos"
          handleEditOption={rolesState.handleEdit}
          handleDeleteOption={rolesState.handleDelete}
          openAddDialog={() => rolesState.setIsDialogOpen(true)}
        />

        {/* Assuntos */}
        <AssuntosField
          disciplina={discipline}
          assuntos={topicos}
          setAssuntos={setTopicos}
        />
      </div>

      {/* Diálogos de adição */}
      <AddValueDialog
        title="Adicionar Banca"
        placeholder="Nome da banca"
        isOpen={institutionState.isDialogOpen}
        setIsOpen={institutionState.setIsDialogOpen}
        value={institutionState.newValue}
        setValue={institutionState.setNewValue}
        onAdd={institutionState.handleAdd}
      />

      <AddValueDialog
        title="Adicionar Órgão"
        placeholder="Nome do órgão"
        isOpen={organizationState.isDialogOpen}
        setIsOpen={organizationState.setIsDialogOpen}
        value={organizationState.newValue}
        setValue={organizationState.setNewValue}
        onAdd={organizationState.handleAdd}
      />

      <AddValueDialog
        title="Adicionar Ano"
        placeholder="Ano"
        isOpen={yearState.isDialogOpen}
        setIsOpen={yearState.setIsDialogOpen}
        value={yearState.newValue}
        setValue={yearState.setNewValue}
        onAdd={yearState.handleAdd}
      />

      <AddValueDialog
        title="Adicionar Disciplina"
        placeholder="Nome da disciplina"
        isOpen={disciplineState.isDialogOpen}
        setIsOpen={disciplineState.setIsDialogOpen}
        value={disciplineState.newValue}
        setValue={disciplineState.setNewValue}
        onAdd={disciplineState.handleAdd}
      />

      <AddValueDialog
        title="Adicionar Nível"
        placeholder="Nome do nível"
        isOpen={levelState.isDialogOpen}
        setIsOpen={levelState.setIsDialogOpen}
        value={levelState.newValue}
        setValue={levelState.setNewValue}
        onAdd={levelState.handleAdd}
      />

      <AddValueDialog
        title="Adicionar Dificuldade"
        placeholder="Nome da dificuldade"
        isOpen={difficultyState.isDialogOpen}
        setIsOpen={difficultyState.setIsDialogOpen}
        value={difficultyState.newValue}
        setValue={difficultyState.setNewValue}
        onAdd={difficultyState.handleAdd}
      />

      <AddValueDialog
        title="Adicionar Tipo de Questão"
        placeholder="Nome do tipo"
        isOpen={questionTypeState.isDialogOpen}
        setIsOpen={questionTypeState.setIsDialogOpen}
        value={questionTypeState.newValue}
        setValue={questionTypeState.setNewValue}
        onAdd={questionTypeState.handleAdd}
      />

      <AddValueDialog
        title="Adicionar Cargo"
        placeholder="Nome do cargo"
        isOpen={rolesState.isDialogOpen}
        setIsOpen={rolesState.setIsDialogOpen}
        value={rolesState.newValue}
        setValue={rolesState.setNewValue}
        onAdd={rolesState.handleAdd}
      />
    </>
  );
};

export default QuestionMetadataFields;
