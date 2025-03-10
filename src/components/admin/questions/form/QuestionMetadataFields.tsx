
import React, { useState, useEffect } from "react";
import SelectField from "./SelectField";
import AddValueDialog from "./AddValueDialog";
import { useSelectFieldState } from "./useSelectFieldState";
import TopicosField from "./TopicosField";
import { CheckboxGroup } from "@/components/questions/CheckboxGroup";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash } from "lucide-react";
import { Label } from "@/components/ui/label";

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

  // Estados para múltipla seleção
  const [selectedInstitutions, setSelectedInstitutions] = useState<string[]>([]);
  const [selectedOrganizations, setSelectedOrganizations] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedDisciplines, setSelectedDisciplines] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
  const [selectedQuestionTypes, setSelectedQuestionTypes] = useState<string[]>([]);

  // Inicializar os valores selecionados
  useEffect(() => {
    if (institution) setSelectedInstitutions([institution]);
  }, [institution]);

  useEffect(() => {
    if (organization) setSelectedOrganizations([organization]);
  }, [organization]);

  useEffect(() => {
    if (year) setSelectedYears([year]);
  }, [year]);

  useEffect(() => {
    if (role) {
      const rolesArray = role.split(', ').filter(r => roles.includes(r));
      setSelectedRoles(rolesArray);
    }
  }, [role, roles]);

  useEffect(() => {
    if (discipline) setSelectedDisciplines([discipline]);
  }, [discipline]);

  useEffect(() => {
    if (level) setSelectedLevels([level]);
  }, [level]);

  useEffect(() => {
    if (difficulty) setSelectedDifficulties([difficulty]);
  }, [difficulty]);

  useEffect(() => {
    if (questionType) setSelectedQuestionTypes([questionType]);
  }, [questionType]);

  // Funções para lidar com mudanças nos campos
  const handleInstitutionChange = (value: string) => {
    if (selectedInstitutions.includes(value)) {
      setSelectedInstitutions(selectedInstitutions.filter(i => i !== value));
    } else {
      setSelectedInstitutions([...selectedInstitutions, value]);
    }
  };

  const handleOrganizationChange = (value: string) => {
    if (selectedOrganizations.includes(value)) {
      setSelectedOrganizations(selectedOrganizations.filter(o => o !== value));
    } else {
      setSelectedOrganizations([...selectedOrganizations, value]);
    }
  };

  const handleYearChange = (value: string) => {
    if (selectedYears.includes(value)) {
      setSelectedYears(selectedYears.filter(y => y !== value));
    } else {
      setSelectedYears([...selectedYears, value]);
    }
  };

  const handleRoleChange = (value: string) => {
    if (selectedRoles.includes(value)) {
      setSelectedRoles(selectedRoles.filter(r => r !== value));
    } else {
      setSelectedRoles([...selectedRoles, value]);
    }
  };

  const handleDisciplineChange = (value: string) => {
    if (selectedDisciplines.includes(value)) {
      setSelectedDisciplines(selectedDisciplines.filter(d => d !== value));
    } else {
      setSelectedDisciplines([...selectedDisciplines, value]);
    }
  };

  const handleLevelChange = (value: string) => {
    if (selectedLevels.includes(value)) {
      setSelectedLevels(selectedLevels.filter(l => l !== value));
    } else {
      setSelectedLevels([...selectedLevels, value]);
    }
  };

  const handleDifficultyChange = (value: string) => {
    if (selectedDifficulties.includes(value)) {
      setSelectedDifficulties(selectedDifficulties.filter(d => d !== value));
    } else {
      setSelectedDifficulties([...selectedDifficulties, value]);
    }
  };

  const handleQuestionTypeChange = (value: string) => {
    if (selectedQuestionTypes.includes(value)) {
      setSelectedQuestionTypes(selectedQuestionTypes.filter(qt => qt !== value));
    } else {
      setSelectedQuestionTypes([...selectedQuestionTypes, value]);
    }
  };

  // Atualizar os valores dos campos quando os selecionados mudarem
  useEffect(() => {
    if (selectedInstitutions.length > 0) {
      setInstitution(selectedInstitutions[0]); // Por enquanto, usamos apenas o primeiro
    } else {
      setInstitution('');
    }
  }, [selectedInstitutions, setInstitution]);

  useEffect(() => {
    if (selectedOrganizations.length > 0) {
      setOrganization(selectedOrganizations[0]); // Por enquanto, usamos apenas o primeiro
    } else {
      setOrganization('');
    }
  }, [selectedOrganizations, setOrganization]);

  useEffect(() => {
    if (selectedYears.length > 0) {
      setYear(selectedYears[0]); // Por enquanto, usamos apenas o primeiro
    } else {
      setYear('');
    }
  }, [selectedYears, setYear]);

  useEffect(() => {
    if (selectedRoles.length > 0) {
      setRole(selectedRoles.join(', '));
    } else {
      setRole('');
    }
  }, [selectedRoles, setRole]);

  useEffect(() => {
    if (selectedDisciplines.length > 0) {
      setDiscipline(selectedDisciplines[0]); // Por enquanto, usamos apenas o primeiro
    } else {
      setDiscipline('');
    }
  }, [selectedDisciplines, setDiscipline]);

  useEffect(() => {
    if (selectedLevels.length > 0) {
      setLevel(selectedLevels[0]); // Por enquanto, usamos apenas o primeiro
    } else {
      setLevel('');
    }
  }, [selectedLevels, setLevel]);

  useEffect(() => {
    if (selectedDifficulties.length > 0) {
      setDifficulty(selectedDifficulties[0]); // Por enquanto, usamos apenas o primeiro
    } else {
      setDifficulty('');
    }
  }, [selectedDifficulties, setDifficulty]);

  useEffect(() => {
    if (selectedQuestionTypes.length > 0) {
      setQuestionType(selectedQuestionTypes[0]); // Por enquanto, usamos apenas o primeiro
    } else {
      setQuestionType('');
    }
  }, [selectedQuestionTypes, setQuestionType]);

  return (
    <>
      {/* Institution Field */}
      <div>
        <Label className="block text-sm font-medium text-[#272f3c]">Banca</Label>
        <div className="flex flex-col gap-2">
          <CheckboxGroup
            title=""
            options={institutions}
            selectedValues={selectedInstitutions}
            onChange={handleInstitutionChange}
            placeholder="Selecione a banca"
          />
          <div className="flex gap-2 justify-end">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => institutionState.handleEdit(institution)}
              disabled={!institution}
              title="Editar"
              type="button"
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => institutionState.handleDelete(institution)}
              disabled={!institution}
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
            selectedValues={selectedOrganizations}
            onChange={handleOrganizationChange}
            placeholder="Selecione a instituição"
          />
          <div className="flex gap-2 justify-end">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => organizationState.handleEdit(organization)}
              disabled={!organization}
              title="Editar"
              type="button"
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => organizationState.handleDelete(organization)}
              disabled={!organization}
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
            selectedValues={selectedYears}
            onChange={handleYearChange}
            placeholder="Selecione o ano"
          />
          <div className="flex gap-2 justify-end">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => yearState.handleEdit(year)}
              disabled={!year}
              title="Editar"
              type="button"
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => yearState.handleDelete(year)}
              disabled={!year}
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
            selectedValues={selectedRoles}
            onChange={handleRoleChange}
            placeholder="Selecione os cargos"
          />
          <div className="flex gap-2 justify-end">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => roleState.handleEdit(role)}
              disabled={!role}
              title="Editar"
              type="button"
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => roleState.handleDelete(role)}
              disabled={!role}
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
            selectedValues={selectedDisciplines}
            onChange={handleDisciplineChange}
            placeholder="Selecione a disciplina"
          />
          <div className="flex gap-2 justify-end">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => disciplineState.handleEdit(discipline)}
              disabled={!discipline}
              title="Editar"
              type="button"
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => disciplineState.handleDelete(discipline)}
              disabled={!discipline}
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
      {discipline && (
        <div>
          <TopicosField
            disciplina={discipline}
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
            selectedValues={selectedLevels}
            onChange={handleLevelChange}
            placeholder="Selecione o nível"
          />
          <div className="flex gap-2 justify-end">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => levelState.handleEdit(level)}
              disabled={!level}
              title="Editar"
              type="button"
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => levelState.handleDelete(level)}
              disabled={!level}
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
            selectedValues={selectedDifficulties}
            onChange={handleDifficultyChange}
            placeholder="Selecione a dificuldade"
          />
          <div className="flex gap-2 justify-end">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => difficultyState.handleEdit(difficulty)}
              disabled={!difficulty}
              title="Editar"
              type="button"
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => difficultyState.handleDelete(difficulty)}
              disabled={!difficulty}
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
            selectedValues={selectedQuestionTypes}
            onChange={handleQuestionTypeChange}
            placeholder="Selecione o tipo"
          />
          <div className="flex gap-2 justify-end">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => questionTypeState.handleEdit(questionType)}
              disabled={!questionType}
              title="Editar"
              type="button"
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => questionTypeState.handleDelete(questionType)}
              disabled={!questionType}
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
