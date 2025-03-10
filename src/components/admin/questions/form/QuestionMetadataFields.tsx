
import React from "react";
import AddValueDialog from "./AddValueDialog";
import { useSelectFieldState } from "./useSelectFieldState";
import TopicosField from "./TopicosField";
import { CheckboxGroup } from "@/components/questions/CheckboxGroup";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash } from "lucide-react";
import { Label } from "@/components/ui/label";

interface QuestionMetadataFieldsProps {
  // Institution
  institution: string[];
  setInstitution: (value: string[]) => void;
  institutions: string[];
  setInstitutions: (value: string[]) => void;
  
  // Organization
  organization: string[];
  setOrganization: (value: string[]) => void;
  organizations: string[];
  setOrganizations: (value: string[]) => void;
  
  // Year
  year: string[];
  setYear: (value: string[]) => void;
  years: string[];
  setYears: (value: string[]) => void;
  
  // Role
  role: string[];
  setRole: (value: string[]) => void;
  roles: string[];
  setRoles: (value: string[]) => void;
  
  // Discipline
  discipline: string[];
  setDiscipline: (value: string[]) => void;
  disciplines: string[];
  setDisciplines: (value: string[]) => void;
  
  // Tópicos
  topicos: string[];
  setTopicos: (value: string[]) => void;
  
  // Level
  level: string[];
  setLevel: (value: string[]) => void;
  levels: string[];
  setLevels: (value: string[]) => void;
  
  // Difficulty
  difficulty: string[];
  setDifficulty: (value: string[]) => void;
  difficulties: string[];
  setDifficulties: (value: string[]) => void;
  
  // Question Type
  questionType: string[];
  setQuestionType: (value: string[]) => void;
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

  // Funções para lidar com mudanças nos campos
  const handleInstitutionChange = (value: string) => {
    if (institution.includes(value)) {
      setInstitution(institution.filter(i => i !== value));
    } else {
      setInstitution([...institution, value]);
    }
  };

  const handleOrganizationChange = (value: string) => {
    if (organization.includes(value)) {
      setOrganization(organization.filter(o => o !== value));
    } else {
      setOrganization([...organization, value]);
    }
  };

  const handleYearChange = (value: string) => {
    if (year.includes(value)) {
      setYear(year.filter(y => y !== value));
    } else {
      setYear([...year, value]);
    }
  };

  const handleRoleChange = (value: string) => {
    if (role.includes(value)) {
      setRole(role.filter(r => r !== value));
    } else {
      setRole([...role, value]);
    }
  };

  const handleDisciplineChange = (value: string) => {
    if (discipline.includes(value)) {
      setDiscipline(discipline.filter(d => d !== value));
    } else {
      setDiscipline([...discipline, value]);
    }
  };

  const handleLevelChange = (value: string) => {
    if (level.includes(value)) {
      setLevel(level.filter(l => l !== value));
    } else {
      setLevel([...level, value]);
    }
  };

  const handleDifficultyChange = (value: string) => {
    if (difficulty.includes(value)) {
      setDifficulty(difficulty.filter(d => d !== value));
    } else {
      setDifficulty([...difficulty, value]);
    }
  };

  const handleQuestionTypeChange = (value: string) => {
    if (questionType.includes(value)) {
      setQuestionType(questionType.filter(qt => qt !== value));
    } else {
      setQuestionType([...questionType, value]);
    }
  };

  return (
    <>
      {/* Institution Field */}
      <div>
        <Label className="block text-sm font-medium text-[#272f3c]">Banca</Label>
        <div className="flex flex-col gap-2">
          <CheckboxGroup
            title=""
            options={institutions}
            selectedValues={institution}
            onChange={handleInstitutionChange}
            placeholder="Selecione a banca"
          />
          <div className="flex gap-2 justify-end">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => institution.length === 1 ? institutionState.handleEdit(institution[0]) : null}
              disabled={institution.length !== 1}
              title="Editar"
              type="button"
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => institution.length === 1 ? institutionState.handleDelete(institution[0]) : null}
              disabled={institution.length !== 1}
              title="Excluir"
              type="button"
              className="h-8 w-8 p-0"
            >
              <Trash className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => institutionState.setIsDialogOpen(true)}
              title="Adicionar"
              type="button"
              className="h-8 w-8 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
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

      {/* Organization Field */}
      <div>
        <Label className="block text-sm font-medium text-[#272f3c]">Instituição</Label>
        <div className="flex flex-col gap-2">
          <CheckboxGroup
            title=""
            options={organizations}
            selectedValues={organization}
            onChange={handleOrganizationChange}
            placeholder="Selecione a instituição"
          />
          <div className="flex gap-2 justify-end">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => organization.length === 1 ? organizationState.handleEdit(organization[0]) : null}
              disabled={organization.length !== 1}
              title="Editar"
              type="button"
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => organization.length === 1 ? organizationState.handleDelete(organization[0]) : null}
              disabled={organization.length !== 1}
              title="Excluir"
              type="button"
              className="h-8 w-8 p-0"
            >
              <Trash className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => organizationState.setIsDialogOpen(true)}
              title="Adicionar"
              type="button"
              className="h-8 w-8 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
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

      {/* Year Field */}
      <div>
        <Label className="block text-sm font-medium text-[#272f3c]">Ano</Label>
        <div className="flex flex-col gap-2">
          <CheckboxGroup
            title=""
            options={years}
            selectedValues={year}
            onChange={handleYearChange}
            placeholder="Selecione o ano"
          />
          <div className="flex gap-2 justify-end">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => year.length === 1 ? yearState.handleEdit(year[0]) : null}
              disabled={year.length !== 1}
              title="Editar"
              type="button"
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => year.length === 1 ? yearState.handleDelete(year[0]) : null}
              disabled={year.length !== 1}
              title="Excluir"
              type="button"
              className="h-8 w-8 p-0"
            >
              <Trash className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => yearState.setIsDialogOpen(true)}
              title="Adicionar"
              type="button"
              className="h-8 w-8 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
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

      {/* Cargos Field */}
      <div>
        <Label className="block text-sm font-medium text-[#272f3c]">Cargos</Label>
        <div className="flex flex-col gap-2">
          <CheckboxGroup
            title=""
            options={roles}
            selectedValues={role}
            onChange={handleRoleChange}
            placeholder="Selecione os cargos"
          />
          <div className="flex gap-2 justify-end">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => role.length === 1 ? roleState.handleEdit(role[0]) : null}
              disabled={role.length !== 1}
              title="Editar"
              type="button"
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => role.length === 1 ? roleState.handleDelete(role[0]) : null}
              disabled={role.length !== 1}
              title="Excluir"
              type="button"
              className="h-8 w-8 p-0"
            >
              <Trash className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => roleState.setIsDialogOpen(true)}
              title="Adicionar"
              type="button"
              className="h-8 w-8 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
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

      {/* Discipline Field */}
      <div>
        <Label className="block text-sm font-medium text-[#272f3c]">Disciplina</Label>
        <div className="flex flex-col gap-2">
          <CheckboxGroup
            title=""
            options={disciplines}
            selectedValues={discipline}
            onChange={handleDisciplineChange}
            placeholder="Selecione a disciplina"
          />
          <div className="flex gap-2 justify-end">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => discipline.length === 1 ? disciplineState.handleEdit(discipline[0]) : null}
              disabled={discipline.length !== 1}
              title="Editar"
              type="button"
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => discipline.length === 1 ? disciplineState.handleDelete(discipline[0]) : null}
              disabled={discipline.length !== 1}
              title="Excluir"
              type="button"
              className="h-8 w-8 p-0"
            >
              <Trash className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => disciplineState.setIsDialogOpen(true)}
              title="Adicionar"
              type="button"
              className="h-8 w-8 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
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
      {discipline.length > 0 && (
        <div>
          <TopicosField
            disciplina={discipline[0]}
            topicos={topicos}
            setTopicos={setTopicos}
          />
        </div>
      )}

      {/* Level Field */}
      <div>
        <Label className="block text-sm font-medium text-[#272f3c]">Nível</Label>
        <div className="flex flex-col gap-2">
          <CheckboxGroup
            title=""
            options={levels}
            selectedValues={level}
            onChange={handleLevelChange}
            placeholder="Selecione o nível"
          />
          <div className="flex gap-2 justify-end">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => level.length === 1 ? levelState.handleEdit(level[0]) : null}
              disabled={level.length !== 1}
              title="Editar"
              type="button"
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => level.length === 1 ? levelState.handleDelete(level[0]) : null}
              disabled={level.length !== 1}
              title="Excluir"
              type="button"
              className="h-8 w-8 p-0"
            >
              <Trash className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => levelState.setIsDialogOpen(true)}
              title="Adicionar"
              type="button"
              className="h-8 w-8 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
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

      {/* Difficulty Field */}
      <div>
        <Label className="block text-sm font-medium text-[#272f3c]">Dificuldade</Label>
        <div className="flex flex-col gap-2">
          <CheckboxGroup
            title=""
            options={difficulties}
            selectedValues={difficulty}
            onChange={handleDifficultyChange}
            placeholder="Selecione a dificuldade"
          />
          <div className="flex gap-2 justify-end">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => difficulty.length === 1 ? difficultyState.handleEdit(difficulty[0]) : null}
              disabled={difficulty.length !== 1}
              title="Editar"
              type="button"
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => difficulty.length === 1 ? difficultyState.handleDelete(difficulty[0]) : null}
              disabled={difficulty.length !== 1}
              title="Excluir"
              type="button"
              className="h-8 w-8 p-0"
            >
              <Trash className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => difficultyState.setIsDialogOpen(true)}
              title="Adicionar"
              type="button"
              className="h-8 w-8 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
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

      {/* Question Type Field */}
      <div>
        <Label className="block text-sm font-medium text-[#272f3c]">Tipo de Questão</Label>
        <div className="flex flex-col gap-2">
          <CheckboxGroup
            title=""
            options={questionTypes}
            selectedValues={questionType}
            onChange={handleQuestionTypeChange}
            placeholder="Selecione o tipo"
          />
          <div className="flex gap-2 justify-end">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => questionType.length === 1 ? questionTypeState.handleEdit(questionType[0]) : null}
              disabled={questionType.length !== 1}
              title="Editar"
              type="button"
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => questionType.length === 1 ? questionTypeState.handleDelete(questionType[0]) : null}
              disabled={questionType.length !== 1}
              title="Excluir"
              type="button"
              className="h-8 w-8 p-0"
            >
              <Trash className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => questionTypeState.setIsDialogOpen(true)}
              title="Adicionar"
              type="button"
              className="h-8 w-8 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
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
