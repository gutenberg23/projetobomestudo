import React from 'react';
import { useQuestionManagementStore } from '@/stores/questionManagementStore';
import SelectField from "./SelectField";
import AssuntosField from "./AssuntosField";
import { useSelectFieldState } from "./useSelectFieldState";
import { CheckboxGroup } from "@/components/questions/CheckboxGroup";
import AddValueDialog from "./AddValueDialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

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
  showValidation?: boolean;
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
  showValidation = false,
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
        <CheckboxGroup
          title="Banca"
          options={dropdownData.institutions}
          selectedValues={institution.split(',').filter(i => i !== '')}
          onChange={setInstitution}
          handleEditOption={institutionState.handleEditOption}
          handleDeleteOption={institutionState.handleDeleteOption}
          openAddDialog={institutionState.openAddDialog}
          placeholder="Selecione as bancas"
        />

        {/* Órgão */}
        <CheckboxGroup
          title="Órgão"
          options={dropdownData.organizations}
          selectedValues={organization.split(',').filter(o => o !== '')}
          onChange={setOrganization}
          handleEditOption={organizationState.handleEditOption}
          handleDeleteOption={organizationState.handleDeleteOption}
          openAddDialog={organizationState.openAddDialog}
          placeholder="Selecione os órgãos"
        />

        {/* Ano */}
        <CheckboxGroup
          title="Ano"
          options={dropdownData.years}
          selectedValues={year.split(',').filter(y => y !== '')}
          onChange={setYear}
          handleEditOption={yearState.handleEditOption}
          handleDeleteOption={yearState.handleDeleteOption}
          openAddDialog={yearState.openAddDialog}
          placeholder="Selecione os anos"
        />

        {/* Disciplina */}
        <CheckboxGroup
          title="Disciplina"
          options={dropdownData.disciplines}
          selectedValues={discipline.split(',').filter(d => d !== '')}
          onChange={setDiscipline}
          handleEditOption={disciplineState.handleEditOption}
          handleDeleteOption={disciplineState.handleDeleteOption}
          openAddDialog={disciplineState.openAddDialog}
          placeholder="Selecione as disciplinas"
        />

        {/* Nível */}
        <CheckboxGroup
          title="Nível"
          options={dropdownData.levels}
          selectedValues={level.split(',').filter(l => l !== '')}
          onChange={setLevel}
          handleEditOption={levelState.handleEditOption}
          handleDeleteOption={levelState.handleDeleteOption}
          openAddDialog={levelState.openAddDialog}
          placeholder="Selecione os níveis"
        />

        {/* Dificuldade */}
        <CheckboxGroup
          title="Dificuldade"
          options={dropdownData.difficulties}
          selectedValues={difficulty.split(',').filter(d => d !== '')}
          onChange={setDifficulty}
          handleEditOption={difficultyState.handleEditOption}
          handleDeleteOption={difficultyState.handleDeleteOption}
          openAddDialog={difficultyState.openAddDialog}
          placeholder="Selecione as dificuldades"
        />

        {/* Tipo de Questão */}
        <CheckboxGroup
          title="Tipo de Questão"
          options={dropdownData.questionTypes}
          selectedValues={questionType.split(',').filter(t => t !== '')}
          onChange={setQuestionType}
          handleEditOption={questionTypeState.handleEditOption}
          handleDeleteOption={questionTypeState.handleDeleteOption}
          openAddDialog={questionTypeState.openAddDialog}
          placeholder="Selecione os tipos"
        />

        {/* Cargo */}
        <CheckboxGroup
          title="Cargo"
          options={dropdownData.roles}
          selectedValues={role.split(',').filter(r => r !== '')}
          onChange={handleRoleChange}
          handleEditOption={rolesState.handleEditOption}
          handleDeleteOption={rolesState.handleDeleteOption}
          openAddDialog={rolesState.openAddDialog}
          placeholder="Selecione os cargos"
        />

        {/* Assuntos */}
        <AssuntosField
          disciplina={discipline}
          assuntos={topicos}
          setAssuntos={setTopicos}
        />
      </div>

      {/* Diálogos para adicionar valores */}
      <AddValueDialog
        isOpen={institutionState.isAddDialogOpen}
        setIsOpen={institutionState.setIsOpen}
        onAdd={institutionState.handleAddOption}
        title="Adicionar Banca"
        value={institutionState.newValue}
        setValue={institutionState.setNewValue}
        placeholder="Digite o nome da banca"
      />

      <AddValueDialog
        isOpen={organizationState.isAddDialogOpen}
        setIsOpen={organizationState.setIsOpen}
        onAdd={organizationState.handleAddOption}
        title="Adicionar Órgão"
        value={organizationState.newValue}
        setValue={organizationState.setNewValue}
        placeholder="Digite o nome do órgão"
      />

      <AddValueDialog
        isOpen={yearState.isAddDialogOpen}
        setIsOpen={yearState.setIsOpen}
        onAdd={yearState.handleAddOption}
        title="Adicionar Ano"
        value={yearState.newValue}
        setValue={yearState.setNewValue}
        placeholder="Digite o ano"
      />

      <AddValueDialog
        isOpen={disciplineState.isAddDialogOpen}
        setIsOpen={disciplineState.setIsOpen}
        onAdd={disciplineState.handleAddOption}
        title="Adicionar Disciplina"
        value={disciplineState.newValue}
        setValue={disciplineState.setNewValue}
        placeholder="Digite o nome da disciplina"
      />

      <AddValueDialog
        isOpen={levelState.isAddDialogOpen}
        setIsOpen={levelState.setIsOpen}
        onAdd={levelState.handleAddOption}
        title="Adicionar Nível"
        value={levelState.newValue}
        setValue={levelState.setNewValue}
        placeholder="Digite o nível"
      />

      <AddValueDialog
        isOpen={difficultyState.isAddDialogOpen}
        setIsOpen={difficultyState.setIsOpen}
        onAdd={difficultyState.handleAddOption}
        title="Adicionar Dificuldade"
        value={difficultyState.newValue}
        setValue={difficultyState.setNewValue}
        placeholder="Digite a dificuldade"
      />

      <AddValueDialog
        isOpen={questionTypeState.isAddDialogOpen}
        setIsOpen={questionTypeState.setIsOpen}
        onAdd={questionTypeState.handleAddOption}
        title="Adicionar Tipo de Questão"
        value={questionTypeState.newValue}
        setValue={questionTypeState.setNewValue}
        placeholder="Digite o tipo de questão"
      />

      <AddValueDialog
        isOpen={rolesState.isAddDialogOpen}
        setIsOpen={rolesState.setIsOpen}
        onAdd={rolesState.handleAddOption}
        title="Adicionar Cargo"
        value={rolesState.newValue}
        setValue={rolesState.setNewValue}
        placeholder="Digite o cargo"
      />
    </>
  );
};

export default QuestionMetadataFields;
