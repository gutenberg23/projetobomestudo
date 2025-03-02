
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Edit, Plus, Trash } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

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
  const [isNewInstitutionModalOpen, setIsNewInstitutionModalOpen] = React.useState<boolean>(false);
  const [isNewRoleModalOpen, setIsNewRoleModalOpen] = React.useState<boolean>(false);
  const [isNewLevelModalOpen, setIsNewLevelModalOpen] = React.useState<boolean>(false);
  const [isNewDifficultyModalOpen, setIsNewDifficultyModalOpen] = React.useState<boolean>(false);
  const [isNewDisciplineModalOpen, setIsNewDisciplineModalOpen] = React.useState<boolean>(false);
  const [isNewQuestionTypeModalOpen, setIsNewQuestionTypeModalOpen] = React.useState<boolean>(false);
  const [isNewYearModalOpen, setIsNewYearModalOpen] = React.useState<boolean>(false);
  const [isNewOrganizationModalOpen, setIsNewOrganizationModalOpen] = React.useState<boolean>(false);
  
  const [newInstitution, setNewInstitution] = React.useState<string>("");
  const [newRole, setNewRole] = React.useState<string>("");
  const [newLevel, setNewLevel] = React.useState<string>("");
  const [newDifficulty, setNewDifficulty] = React.useState<string>("");
  const [newDiscipline, setNewDiscipline] = React.useState<string>("");
  const [newQuestionType, setNewQuestionType] = React.useState<string>("");
  const [newYear, setNewYear] = React.useState<string>("");
  const [newOrganization, setNewOrganization] = React.useState<string>("");

  // Função para copiar para a área de transferência
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success("Copiado para a área de transferência!");
      })
      .catch((err) => {
        console.error('Erro ao copiar: ', err);
        toast.error("Erro ao copiar texto");
      });
  };

  const handleAddInstitution = () => {
    if (newInstitution.trim() !== "") {
      setInstitutions([...institutions, newInstitution]);
      setNewInstitution("");
      setIsNewInstitutionModalOpen(false);
    }
  };

  const handleAddRole = () => {
    if (newRole.trim() !== "") {
      setRoles([...roles, newRole]);
      setNewRole("");
      setIsNewRoleModalOpen(false);
    }
  };

  const handleAddLevel = () => {
    if (newLevel.trim() !== "") {
      setLevels([...levels, newLevel]);
      setNewLevel("");
      setIsNewLevelModalOpen(false);
    }
  };

  const handleAddDifficulty = () => {
    if (newDifficulty.trim() !== "") {
      setDifficulties([...difficulties, newDifficulty]);
      setNewDifficulty("");
      setIsNewDifficultyModalOpen(false);
    }
  };

  const handleAddDiscipline = () => {
    if (newDiscipline.trim() !== "") {
      setDisciplines([...disciplines, newDiscipline]);
      setNewDiscipline("");
      setIsNewDisciplineModalOpen(false);
    }
  };

  const handleAddQuestionType = () => {
    if (newQuestionType.trim() !== "") {
      setQuestionTypes([...questionTypes, newQuestionType]);
      setNewQuestionType("");
      setIsNewQuestionTypeModalOpen(false);
    }
  };

  const handleAddYear = () => {
    if (newYear.trim() !== "") {
      setYears([...years, newYear]);
      setNewYear("");
      setIsNewYearModalOpen(false);
    }
  };

  const handleAddOrganization = () => {
    if (newOrganization.trim() !== "") {
      setOrganizations([...organizations, newOrganization]);
      setNewOrganization("");
      setIsNewOrganizationModalOpen(false);
    }
  };

  const handleEditInstitution = (oldValue: string) => {
    const newValue = prompt("Editar instituição", oldValue);
    if (newValue && newValue.trim() !== "") {
      setInstitutions(institutions.map(i => i === oldValue ? newValue : i));
      if (institution === oldValue) setInstitution(newValue);
    }
  };

  const handleEditRole = (oldValue: string) => {
    const newValue = prompt("Editar cargo", oldValue);
    if (newValue && newValue.trim() !== "") {
      setRoles(roles.map(r => r === oldValue ? newValue : r));
      if (role === oldValue) setRole(newValue);
    }
  };

  const handleEditLevel = (oldValue: string) => {
    const newValue = prompt("Editar nível", oldValue);
    if (newValue && newValue.trim() !== "") {
      setLevels(levels.map(l => l === oldValue ? newValue : l));
      if (level === oldValue) setLevel(newValue);
    }
  };

  const handleEditDifficulty = (oldValue: string) => {
    const newValue = prompt("Editar dificuldade", oldValue);
    if (newValue && newValue.trim() !== "") {
      setDifficulties(difficulties.map(d => d === oldValue ? newValue : d));
      if (difficulty === oldValue) setDifficulty(newValue);
    }
  };

  const handleEditDiscipline = (oldValue: string) => {
    const newValue = prompt("Editar disciplina", oldValue);
    if (newValue && newValue.trim() !== "") {
      setDisciplines(disciplines.map(d => d === oldValue ? newValue : d));
      if (discipline === oldValue) setDiscipline(newValue);
    }
  };

  const handleEditQuestionType = (oldValue: string) => {
    const newValue = prompt("Editar tipo de questão", oldValue);
    if (newValue && newValue.trim() !== "") {
      setQuestionTypes(questionTypes.map(t => t === oldValue ? newValue : t));
      if (questionType === oldValue) setQuestionType(newValue);
    }
  };

  const handleEditYear = (oldValue: string) => {
    const newValue = prompt("Editar ano", oldValue);
    if (newValue && newValue.trim() !== "") {
      setYears(years.map(y => y === oldValue ? newValue : y));
      if (year === oldValue) setYear(newValue);
    }
  };

  const handleEditOrganization = (oldValue: string) => {
    const newValue = prompt("Editar instituição", oldValue);
    if (newValue && newValue.trim() !== "") {
      setOrganizations(organizations.map(o => o === oldValue ? newValue : o));
      if (organization === oldValue) setOrganization(newValue);
    }
  };

  const handleDeleteInstitution = (value: string) => {
    if (confirm(`Deseja remover a instituição "${value}"?`)) {
      setInstitutions(institutions.filter(i => i !== value));
      if (institution === value) setInstitution("");
    }
  };

  const handleDeleteRole = (value: string) => {
    if (confirm(`Deseja remover o cargo "${value}"?`)) {
      setRoles(roles.filter(r => r !== value));
      if (role === value) setRole("");
    }
  };

  const handleDeleteLevel = (value: string) => {
    if (confirm(`Deseja remover o nível "${value}"?`)) {
      setLevels(levels.filter(l => l !== value));
      if (level === value) setLevel("");
    }
  };

  const handleDeleteDifficulty = (value: string) => {
    if (confirm(`Deseja remover a dificuldade "${value}"?`)) {
      setDifficulties(difficulties.filter(d => d !== value));
      if (difficulty === value) setDifficulty("");
    }
  };

  const handleDeleteDiscipline = (value: string) => {
    if (confirm(`Deseja remover a disciplina "${value}"?`)) {
      setDisciplines(disciplines.filter(d => d !== value));
      if (discipline === value) setDiscipline("");
    }
  };

  const handleDeleteQuestionType = (value: string) => {
    if (confirm(`Deseja remover o tipo de questão "${value}"?`)) {
      setQuestionTypes(questionTypes.filter(t => t !== value));
      if (questionType === value) setQuestionType("");
    }
  };

  const handleDeleteYear = (value: string) => {
    if (confirm(`Deseja remover o ano "${value}"?`)) {
      setYears(years.filter(y => y !== value));
      if (year === value) setYear("");
    }
  };

  const handleDeleteOrganization = (value: string) => {
    if (confirm(`Deseja remover a instituição "${value}"?`)) {
      setOrganizations(organizations.filter(o => o !== value));
      if (organization === value) setOrganization("");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="question-id">ID da Questão</Label>
        <div className="flex items-center gap-2">
          <Input 
            id="question-id" 
            value={questionId} 
            className="bg-gray-50"
            readOnly
          />
          <Button variant="outline" size="icon" onClick={() => copyToClipboard(questionId)}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="institution">Banca</Label>
          <div className="flex items-center gap-2">
            <Select value={institution} onValueChange={setInstitution}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a instituição" />
              </SelectTrigger>
              <SelectContent>
                {institutions.map((inst) => (
                  <SelectItem key={inst} value={inst}>
                    {inst}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => institution ? handleEditInstitution(institution) : null}
              disabled={!institution}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => institution ? handleDeleteInstitution(institution) : null}
              disabled={!institution}
            >
              <Trash className="h-4 w-4" />
            </Button>
            <Dialog open={isNewInstitutionModalOpen} onOpenChange={setIsNewInstitutionModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Nova Instituição</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Input 
                    placeholder="Nome da instituição" 
                    value={newInstitution} 
                    onChange={(e) => setNewInstitution(e.target.value)} 
                  />
                  <Button onClick={handleAddInstitution}>Adicionar</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div>
          <Label htmlFor="organization">Instituição</Label>
          <div className="flex items-center gap-2">
            <Select value={organization} onValueChange={setOrganization}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a instituição" />
              </SelectTrigger>
              <SelectContent>
                {organizations.map((org) => (
                  <SelectItem key={org} value={org}>
                    {org}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => organization ? handleEditOrganization(organization) : null}
              disabled={!organization}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => organization ? handleDeleteOrganization(organization) : null}
              disabled={!organization}
            >
              <Trash className="h-4 w-4" />
            </Button>
            <Dialog open={isNewOrganizationModalOpen} onOpenChange={setIsNewOrganizationModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Nova Instituição</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Input 
                    placeholder="Nome da instituição" 
                    value={newOrganization} 
                    onChange={(e) => setNewOrganization(e.target.value)} 
                  />
                  <Button onClick={handleAddOrganization}>Adicionar</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div>
          <Label htmlFor="year">Ano</Label>
          <div className="flex items-center gap-2">
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o ano" />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => year ? handleEditYear(year) : null}
              disabled={!year}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => year ? handleDeleteYear(year) : null}
              disabled={!year}
            >
              <Trash className="h-4 w-4" />
            </Button>
            <Dialog open={isNewYearModalOpen} onOpenChange={setIsNewYearModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Ano</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Input 
                    placeholder="Ano" 
                    value={newYear} 
                    onChange={(e) => setNewYear(e.target.value)} 
                  />
                  <Button onClick={handleAddYear}>Adicionar</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="role">Cargo</Label>
          <div className="flex items-center gap-2">
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o cargo" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => role ? handleEditRole(role) : null}
              disabled={!role}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => role ? handleDeleteRole(role) : null}
              disabled={!role}
            >
              <Trash className="h-4 w-4" />
            </Button>
            <Dialog open={isNewRoleModalOpen} onOpenChange={setIsNewRoleModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Cargo</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Input 
                    placeholder="Nome do cargo" 
                    value={newRole} 
                    onChange={(e) => setNewRole(e.target.value)} 
                  />
                  <Button onClick={handleAddRole}>Adicionar</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div>
          <Label htmlFor="discipline">Disciplina</Label>
          <div className="flex items-center gap-2">
            <Select value={discipline} onValueChange={setDiscipline}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a disciplina" />
              </SelectTrigger>
              <SelectContent>
                {disciplines.map((disc) => (
                  <SelectItem key={disc} value={disc}>
                    {disc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => discipline ? handleEditDiscipline(discipline) : null}
              disabled={!discipline}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => discipline ? handleDeleteDiscipline(discipline) : null}
              disabled={!discipline}
            >
              <Trash className="h-4 w-4" />
            </Button>
            <Dialog open={isNewDisciplineModalOpen} onOpenChange={setIsNewDisciplineModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Nova Disciplina</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Input 
                    placeholder="Nome da disciplina" 
                    value={newDiscipline} 
                    onChange={(e) => setNewDiscipline(e.target.value)} 
                  />
                  <Button onClick={handleAddDiscipline}>Adicionar</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div>
          <Label htmlFor="level">Nível</Label>
          <div className="flex items-center gap-2">
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o nível" />
              </SelectTrigger>
              <SelectContent>
                {levels.map((lvl) => (
                  <SelectItem key={lvl} value={lvl}>
                    {lvl}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => level ? handleEditLevel(level) : null}
              disabled={!level}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => level ? handleDeleteLevel(level) : null}
              disabled={!level}
            >
              <Trash className="h-4 w-4" />
            </Button>
            <Dialog open={isNewLevelModalOpen} onOpenChange={setIsNewLevelModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Nível</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Input 
                    placeholder="Nome do nível" 
                    value={newLevel} 
                    onChange={(e) => setNewLevel(e.target.value)} 
                  />
                  <Button onClick={handleAddLevel}>Adicionar</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="difficulty">Dificuldade</Label>
          <div className="flex items-center gap-2">
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a dificuldade" />
              </SelectTrigger>
              <SelectContent>
                {difficulties.map((diff) => (
                  <SelectItem key={diff} value={diff}>
                    {diff}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => difficulty ? handleEditDifficulty(difficulty) : null}
              disabled={!difficulty}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => difficulty ? handleDeleteDifficulty(difficulty) : null}
              disabled={!difficulty}
            >
              <Trash className="h-4 w-4" />
            </Button>
            <Dialog open={isNewDifficultyModalOpen} onOpenChange={setIsNewDifficultyModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Nova Dificuldade</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Input 
                    placeholder="Nome da dificuldade" 
                    value={newDifficulty} 
                    onChange={(e) => setNewDifficulty(e.target.value)} 
                  />
                  <Button onClick={handleAddDifficulty}>Adicionar</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div>
          <Label htmlFor="question-type">Tipo de Questão</Label>
          <div className="flex items-center gap-2">
            <Select value={questionType} onValueChange={setQuestionType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {questionTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => questionType ? handleEditQuestionType(questionType) : null}
              disabled={!questionType}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => questionType ? handleDeleteQuestionType(questionType) : null}
              disabled={!questionType}
            >
              <Trash className="h-4 w-4" />
            </Button>
            <Dialog open={isNewQuestionTypeModalOpen} onOpenChange={setIsNewQuestionTypeModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Tipo de Questão</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Input 
                    placeholder="Nome do tipo" 
                    value={newQuestionType} 
                    onChange={(e) => setNewQuestionType(e.target.value)} 
                  />
                  <Button onClick={handleAddQuestionType}>Adicionar</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="question-text">Texto da Questão</Label>
        <Textarea 
          id="question-text" 
          value={questionText} 
          onChange={(e) => setQuestionText(e.target.value)} 
          placeholder="Digite o texto da questão" 
          className="min-h-[200px]"
        />
      </div>

      <div>
        <Label htmlFor="teacher-explanation">Explicação do Professor</Label>
        <Textarea 
          id="teacher-explanation" 
          value={teacherExplanation} 
          onChange={(e) => setTeacherExplanation(e.target.value)} 
          placeholder="Digite a explicação do professor" 
          className="min-h-[150px]"
        />
      </div>

      <div>
        <Button onClick={onSubmit} className="bg-[#ea2be2] hover:bg-[#d01ec7] text-white">
          {submitButtonText}
        </Button>
      </div>
    </div>
  );
};

export default QuestionForm;
