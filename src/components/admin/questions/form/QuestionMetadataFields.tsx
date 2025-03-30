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
        <div className="space-y-2">
          <Label htmlFor="institution">Banca</Label>
          <Select value={institutionState.value} onValueChange={setInstitution}>
            <SelectTrigger className={cn(showValidation && !institution && "border-red-500")}>
              <SelectValue placeholder="Selecione a banca" />
            </SelectTrigger>
            <SelectContent>
              {dropdownData.institutions.map((inst) => (
                <SelectItem key={inst} value={inst}>{inst}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Órgão */}
        <div className="space-y-2">
          <Label htmlFor="organization">Órgão</Label>
          <Select value={organizationState.value} onValueChange={setOrganization}>
            <SelectTrigger className={cn(showValidation && !organization && "border-red-500")}>
              <SelectValue placeholder="Selecione o órgão" />
            </SelectTrigger>
            <SelectContent>
              {dropdownData.organizations.map((org) => (
                <SelectItem key={org} value={org}>{org}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Ano */}
        <div className="space-y-2">
          <Label htmlFor="year">Ano</Label>
          <Select value={yearState.value} onValueChange={setYear}>
            <SelectTrigger className={cn(showValidation && !year && "border-red-500")}>
              <SelectValue placeholder="Selecione o ano" />
            </SelectTrigger>
            <SelectContent>
              {dropdownData.years.map((y) => (
                <SelectItem key={y} value={y}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Disciplina */}
        <div className="space-y-2">
          <Label htmlFor="discipline">Disciplina</Label>
          <Select value={disciplineState.value} onValueChange={setDiscipline}>
            <SelectTrigger className={cn(showValidation && !discipline && "border-red-500")}>
              <SelectValue placeholder="Selecione a disciplina" />
            </SelectTrigger>
            <SelectContent>
              {dropdownData.disciplines.map((disc) => (
                <SelectItem key={disc} value={disc}>{disc}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Nível */}
        <div className="space-y-2">
          <Label htmlFor="level">Nível</Label>
          <Select value={levelState.value} onValueChange={setLevel}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o nível" />
            </SelectTrigger>
            <SelectContent>
              {dropdownData.levels.map((lvl) => (
                <SelectItem key={lvl} value={lvl}>{lvl}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Dificuldade */}
        <div className="space-y-2">
          <Label htmlFor="difficulty">Dificuldade</Label>
          <Select value={difficultyState.value} onValueChange={setDifficulty}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a dificuldade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="facil">Fácil</SelectItem>
              <SelectItem value="medio">Médio</SelectItem>
              <SelectItem value="dificil">Difícil</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tipo de Questão */}
        <div className="space-y-2">
          <Label htmlFor="questionType">Tipo de Questão</Label>
          <Select value={questionTypeState.value} onValueChange={setQuestionType}>
            <SelectTrigger className={cn(showValidation && !questionType && "border-red-500")}>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Múltipla Escolha">Múltipla Escolha</SelectItem>
              <SelectItem value="Certo ou Errado">Certo ou Errado</SelectItem>
            </SelectContent>
          </Select>
        </div>

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
