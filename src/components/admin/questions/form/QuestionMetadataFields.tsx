
import React from "react";
import SelectField from "./SelectField";
import AddValueDialog from "./AddValueDialog";
import { useSelectFieldState } from "./useSelectFieldState";
import TopicosField from "./TopicosField";
import { CheckboxGroup } from "@/components/questions/CheckboxGroup";

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
  
  // Tópicos
  topicos: string[];
  setTopicos: (value: string[]) => void;
  
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
  topicos, setTopicos,
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

  const [selectedRoles, setSelectedRoles] = React.useState<string[]>([]);

  // Atualiza o campo role quando os roles selecionados mudam
  React.useEffect(() => {
    if (selectedRoles.length > 0) {
      setRole(selectedRoles.join(', '));
    } else {
      setRole('');
    }
  }, [selectedRoles, setRole]);

  // Atualiza selectedRoles quando o valor de role muda externamente
  React.useEffect(() => {
    if (role) {
      setSelectedRoles(role.split(', ').filter(r => roles.includes(r)));
    }
  }, [role, roles]);

  const handleRoleChange = (role: string) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter(r => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

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

      {/* Role, Discipline Fields */}
      <div>
        <div className="mb-1">
          <label htmlFor="roles" className="block text-sm font-medium text-[#272f3c]">Cargos</label>
        </div>
        <CheckboxGroup
          title=""
          options={roles}
          selectedValues={selectedRoles}
          onChange={handleRoleChange}
          placeholder="Selecione os cargos"
        />
        <div className="flex justify-end mt-1">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => roleState.setIsDialogOpen(true)}
            title="Adicionar"
            type="button"
            className="flex items-center h-7 w-7 p-0 justify-center"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => roleState.handleEdit(role)}
            disabled={!role}
            title="Editar"
            type="button"
            className="flex items-center h-7 w-7 p-0 justify-center ml-1"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => roleState.handleDelete(role)}
            disabled={!role}
            title="Excluir"
            type="button"
            className="flex items-center h-7 w-7 p-0 justify-center ml-1"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
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

      {/* Tópicos Field - only shown when discipline is selected */}
      {discipline && (
        <div>
          <TopicosField
            disciplina={discipline}
            topicos={topicos}
            setTopicos={setTopicos}
          />
        </div>
      )}

      {/* Remaining fields */}
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

import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash } from "lucide-react";

export default QuestionMetadataFields;
