
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Edit, 
  Plus, 
  Search, 
  Trash, 
  X,
  FilterIcon
} from "lucide-react";
import { Question } from "@/components/new/types";

interface CardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const Card: React.FC<CardProps> = ({ title, description, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
      <div 
        className="flex justify-between items-center cursor-pointer" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <div>
          <h2 className="text-lg font-semibold text-[#272f3c]">{title}</h2>
          {description && <p className="text-sm text-[#67748a]">{description}</p>}
        </div>
        <Button variant="ghost" size="sm">
          {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </Button>
      </div>

      {isOpen && (
        <div className="mt-4">
          {children}
        </div>
      )}
    </div>
  );
};

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

const Questoes: React.FC = () => {
  // Estados para formulário de nova questão
  const [questionId, setQuestionId] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [institution, setInstitution] = useState<string>("");
  const [organization, setOrganization] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [discipline, setDiscipline] = useState<string>("");
  const [level, setLevel] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("");
  const [questionType, setQuestionType] = useState<string>("");
  const [questionText, setQuestionText] = useState<string>("");
  const [teacherExplanation, setTeacherExplanation] = useState<string>("");
  
  // Estados para busca de questões
  const [searchId, setSearchId] = useState<string>("");
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  
  // Estados para listagem/gerenciamento de questões
  const [questions, setQuestions] = useState<QuestionItemType[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  
  // Estados para gerenciamento de opções de dropdown
  const [isNewInstitutionModalOpen, setIsNewInstitutionModalOpen] = useState<boolean>(false);
  const [isNewRoleModalOpen, setIsNewRoleModalOpen] = useState<boolean>(false);
  const [isNewLevelModalOpen, setIsNewLevelModalOpen] = useState<boolean>(false);
  const [isNewDifficultyModalOpen, setIsNewDifficultyModalOpen] = useState<boolean>(false);
  const [isNewDisciplineModalOpen, setIsNewDisciplineModalOpen] = useState<boolean>(false);
  const [isNewQuestionTypeModalOpen, setIsNewQuestionTypeModalOpen] = useState<boolean>(false);
  
  // Opções para os dropdowns
  const [institutions, setInstitutions] = useState<string[]>(["IDECAN", "CESPE", "FGV", "VUNESP"]);
  const [roles, setRoles] = useState<string[]>(["Analista", "Técnico", "Auditor", "Escrivão"]);
  const [levels, setLevels] = useState<string[]>(["Básico", "Intermediário", "Avançado"]);
  const [difficulties, setDifficulties] = useState<string[]>(["Fácil", "Médio", "Difícil"]);
  const [disciplines, setDisciplines] = useState<string[]>(["Português", "Matemática", "Direito Constitucional", "Informática"]);
  const [questionTypes, setQuestionTypes] = useState<string[]>(["Múltipla Escolha", "Verdadeiro/Falso", "Discursiva"]);
  
  // Estados para novos itens de dropdown
  const [newInstitution, setNewInstitution] = useState<string>("");
  const [newRole, setNewRole] = useState<string>("");
  const [newLevel, setNewLevel] = useState<string>("");
  const [newDifficulty, setNewDifficulty] = useState<string>("");
  const [newDiscipline, setNewDiscipline] = useState<string>("");
  const [newQuestionType, setNewQuestionType] = useState<string>("");

  // Estados para filtragem
  const [filters, setFilters] = useState({
    id: "",
    year: "",
    institution: "",
    organization: "",
    role: "",
    discipline: "",
    level: "",
    difficulty: "",
    questionType: ""
  });
  
  const [showFilters, setShowFilters] = useState(false);

  // Função para gerar ID único para novas questões
  const generateQuestionId = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${year}${month}${day}${random}`;
  };

  // Inicializa um ID quando o componente é montado
  React.useEffect(() => {
    setQuestionId(generateQuestionId());
  }, []);

  // Função para salvar uma nova questão
  const handleSaveQuestion = () => {
    const newQuestion: QuestionItemType = {
      id: questionId,
      year,
      institution,
      organization,
      role,
      discipline,
      level,
      difficulty,
      questionType,
      content: questionText,
      teacherExplanation,
      options: []
    };
    
    setQuestions([...questions, newQuestion]);
    
    // Limpar formulário
    setQuestionId(generateQuestionId());
    setYear("");
    setInstitution("");
    setOrganization("");
    setRole("");
    setDiscipline("");
    setLevel("");
    setDifficulty("");
    setQuestionType("");
    setQuestionText("");
    setTeacherExplanation("");
  };

  // Função para buscar questão por ID
  const handleSearchQuestion = () => {
    const found = questions.find(q => q.id === searchId);
    if (found) {
      // Preencher formulário com os dados da questão encontrada
      setQuestionId(found.id);
      setYear(found.year);
      setInstitution(found.institution);
      setOrganization(found.organization);
      setRole(found.role);
      setDiscipline(found.discipline);
      setLevel(found.level);
      setDifficulty(found.difficulty);
      setQuestionType(found.questionType);
      setQuestionText(found.content);
      setTeacherExplanation(found.teacherExplanation);
      setIsEditModalOpen(true);
    } else {
      alert("Questão não encontrada!");
    }
  };

  // Função para copiar ID para a área de transferência
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("ID copiado para a área de transferência!");
  };

  // Funções para gerenciar as opções de dropdown
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

  // Funções para editar itens de dropdown
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

  // Funções para remover itens de dropdown
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

  // Função para remover uma questão
  const handleRemoveQuestion = (id: string) => {
    if (window.confirm("Tem certeza que deseja remover esta questão?")) {
      setQuestions(questions.filter(q => q.id !== id));
      setSelectedQuestions(selectedQuestions.filter(qId => qId !== id));
    }
  };

  // Função para atualizar a questão
  const handleUpdateQuestion = () => {
    const updatedQuestions = questions.map(q => q.id === questionId ? {
      ...q,
      year,
      institution,
      organization,
      role,
      discipline,
      level,
      difficulty,
      questionType,
      content: questionText,
      teacherExplanation
    } : q);
    
    setQuestions(updatedQuestions);
    setIsEditModalOpen(false);
  };

  // Função para alternar a seleção de uma questão
  const toggleQuestionSelection = (id: string) => {
    if (selectedQuestions.includes(id)) {
      setSelectedQuestions(selectedQuestions.filter(qId => qId !== id));
    } else {
      setSelectedQuestions([...selectedQuestions, id]);
    }
  };

  // Função para criar um simulado com as questões selecionadas
  const handleCreateSimulado = () => {
    if (selectedQuestions.length === 0) {
      alert("Selecione pelo menos uma questão para criar o simulado.");
      return;
    }
    
    alert(`Simulado criado com ${selectedQuestions.length} questões!`);
    // Aqui seria implementada a lógica para salvar o simulado no banco de dados
    setSelectedQuestions([]);
  };

  // Função para aplicar filtros
  const getFilteredQuestions = () => {
    return questions.filter(question => {
      return (
        (filters.id === "" || question.id.toLowerCase().includes(filters.id.toLowerCase())) &&
        (filters.year === "" || question.year.toLowerCase().includes(filters.year.toLowerCase())) &&
        (filters.institution === "" || question.institution.toLowerCase().includes(filters.institution.toLowerCase())) &&
        (filters.organization === "" || question.organization.toLowerCase().includes(filters.organization.toLowerCase())) &&
        (filters.role === "" || question.role.toLowerCase().includes(filters.role.toLowerCase())) &&
        (filters.discipline === "" || question.discipline.toLowerCase().includes(filters.discipline.toLowerCase())) &&
        (filters.level === "" || question.level.toLowerCase().includes(filters.level.toLowerCase())) &&
        (filters.difficulty === "" || question.difficulty.toLowerCase().includes(filters.difficulty.toLowerCase())) &&
        (filters.questionType === "" || question.questionType.toLowerCase().includes(filters.questionType.toLowerCase()))
      );
    });
  };

  const filteredQuestions = getFilteredQuestions();

  // Função para resetar filtros
  const resetFilters = () => {
    setFilters({
      id: "",
      year: "",
      institution: "",
      organization: "",
      role: "",
      discipline: "",
      level: "",
      difficulty: "",
      questionType: ""
    });
  };

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-bold text-[#272f3c]">Questões</h1>
        <p className="text-[#67748a]">Gerenciamento de questões</p>
      </div>

      {/* Seção de listagem de questões */}
      <Card title="Questões Cadastradas" description="Visualize e gerencie as questões cadastradas" defaultOpen={false}>
        <div className="mb-4 flex justify-between">
          <div className="flex items-center">
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <FilterIcon className="h-4 w-4" />
              {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
            </Button>
            {showFilters && (
              <Button 
                variant="ghost" 
                onClick={resetFilters}
                className="ml-2"
              >
                Limpar Filtros
              </Button>
            )}
          </div>
          <div className="text-sm text-gray-500">
            {filteredQuestions.length} questões encontradas
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <Label htmlFor="filter-id">ID</Label>
              <Input 
                id="filter-id" 
                value={filters.id} 
                onChange={(e) => setFilters({...filters, id: e.target.value})} 
                placeholder="Filtrar por ID" 
              />
            </div>
            <div>
              <Label htmlFor="filter-year">Ano</Label>
              <Input 
                id="filter-year" 
                value={filters.year} 
                onChange={(e) => setFilters({...filters, year: e.target.value})} 
                placeholder="Filtrar por Ano" 
              />
            </div>
            <div>
              <Label htmlFor="filter-institution">Banca</Label>
              <Input 
                id="filter-institution" 
                value={filters.institution} 
                onChange={(e) => setFilters({...filters, institution: e.target.value})} 
                placeholder="Filtrar por Banca" 
              />
            </div>
            <div>
              <Label htmlFor="filter-organization">Instituição</Label>
              <Input 
                id="filter-organization" 
                value={filters.organization} 
                onChange={(e) => setFilters({...filters, organization: e.target.value})} 
                placeholder="Filtrar por Instituição" 
              />
            </div>
            <div>
              <Label htmlFor="filter-role">Cargo</Label>
              <Input 
                id="filter-role" 
                value={filters.role} 
                onChange={(e) => setFilters({...filters, role: e.target.value})} 
                placeholder="Filtrar por Cargo" 
              />
            </div>
            <div>
              <Label htmlFor="filter-discipline">Disciplina</Label>
              <Input 
                id="filter-discipline" 
                value={filters.discipline} 
                onChange={(e) => setFilters({...filters, discipline: e.target.value})} 
                placeholder="Filtrar por Disciplina" 
              />
            </div>
            <div>
              <Label htmlFor="filter-level">Nível</Label>
              <Input 
                id="filter-level" 
                value={filters.level} 
                onChange={(e) => setFilters({...filters, level: e.target.value})} 
                placeholder="Filtrar por Nível" 
              />
            </div>
            <div>
              <Label htmlFor="filter-difficulty">Dificuldade</Label>
              <Input 
                id="filter-difficulty" 
                value={filters.difficulty} 
                onChange={(e) => setFilters({...filters, difficulty: e.target.value})} 
                placeholder="Filtrar por Dificuldade" 
              />
            </div>
            <div>
              <Label htmlFor="filter-questionType">Tipo de Questão</Label>
              <Input 
                id="filter-questionType" 
                value={filters.questionType} 
                onChange={(e) => setFilters({...filters, questionType: e.target.value})} 
                placeholder="Filtrar por Tipo" 
              />
            </div>
          </div>
        )}
        
        {filteredQuestions.length === 0 ? (
          <p className="text-[#67748a] text-center py-6">Nenhuma questão cadastrada.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">
                    <Checkbox 
                      checked={filteredQuestions.length > 0 && selectedQuestions.length === filteredQuestions.length} 
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedQuestions(filteredQuestions.map(q => q.id));
                        } else {
                          setSelectedQuestions([]);
                        }
                      }} 
                    />
                  </TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Ano</TableHead>
                  <TableHead>Banca</TableHead>
                  <TableHead>Disciplina</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuestions.map((question) => (
                  <TableRow key={question.id}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedQuestions.includes(question.id)} 
                        onCheckedChange={() => toggleQuestionSelection(question.id)} 
                      />
                    </TableCell>
                    <TableCell className="font-medium">{question.id}</TableCell>
                    <TableCell>{question.year}</TableCell>
                    <TableCell>{question.institution}</TableCell>
                    <TableCell>{question.discipline}</TableCell>
                    <TableCell>{question.questionType}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => copyToClipboard(question.id)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => {
                          setQuestionId(question.id);
                          setYear(question.year);
                          setInstitution(question.institution);
                          setOrganization(question.organization);
                          setRole(question.role);
                          setDiscipline(question.discipline);
                          setLevel(question.level);
                          setDifficulty(question.difficulty);
                          setQuestionType(question.questionType);
                          setQuestionText(question.content);
                          setTeacherExplanation(question.teacherExplanation);
                          setIsEditModalOpen(true);
                        }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleRemoveQuestion(question.id)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <Button
            onClick={handleCreateSimulado}
            className="bg-[#272f3c] hover:bg-[#1a1f28] text-white"
            disabled={selectedQuestions.length === 0}
          >
            Criar Simulado ({selectedQuestions.length} questões selecionadas)
          </Button>
        </div>
      </Card>

      {/* Nova Questão */}
      <Card title="Nova Questão" description="Crie uma nova questão para suas listas" defaultOpen={false}>
        <div className="space-y-6">
          {/* ID da Questão */}
          <div>
            <Label htmlFor="question-id">ID da Questão</Label>
            <div className="flex items-center gap-2">
              <Input 
                id="question-id" 
                value={questionId} 
                onChange={(e) => setQuestionId(e.target.value)} 
                placeholder="ID da questão" 
                className="bg-gray-50"
                readOnly
              />
              <Button variant="outline" size="icon" onClick={() => copyToClipboard(questionId)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Primeira linha: Banca, Instituição, Ano */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Banca */}
            <div>
              <Label htmlFor="institution">Banca</Label>
              <div className="flex items-center gap-2">
                <Select value={institution} onValueChange={setInstitution}>
                  <SelectTrigger showActions={institution !== ""} onEdit={() => handleEditInstitution(institution)} onDelete={() => handleDeleteInstitution(institution)}>
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

            {/* Instituição */}
            <div>
              <Label htmlFor="organization">Instituição</Label>
              <div className="flex items-center gap-2">
                <Input 
                  id="organization" 
                  value={organization} 
                  onChange={(e) => setOrganization(e.target.value)} 
                  placeholder="Digite a instituição" 
                />
              </div>
            </div>

            {/* Ano */}
            <div>
              <Label htmlFor="year">Ano</Label>
              <Input 
                id="year" 
                value={year} 
                onChange={(e) => setYear(e.target.value)} 
                placeholder="Digite o ano" 
              />
            </div>
          </div>

          {/* Segunda linha: Cargo, Nível, Dificuldade */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Cargo */}
            <div>
              <Label htmlFor="role">Cargo</Label>
              <div className="flex items-center gap-2">
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger showActions={role !== ""} onEdit={() => handleEditRole(role)} onDelete={() => handleDeleteRole(role)}>
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

            {/* Nível */}
            <div>
              <Label htmlFor="level">Nível</Label>
              <div className="flex items-center gap-2">
                <Select value={level} onValueChange={setLevel}>
                  <SelectTrigger showActions={level !== ""} onEdit={() => handleEditLevel(level)} onDelete={() => handleDeleteLevel(level)}>
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

            {/* Dificuldade */}
            <div>
              <Label htmlFor="difficulty">Dificuldade</Label>
              <div className="flex items-center gap-2">
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger showActions={difficulty !== ""} onEdit={() => handleEditDifficulty(difficulty)} onDelete={() => handleDeleteDifficulty(difficulty)}>
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
          </div>

          {/* Terceira linha: Disciplina */}
          <div>
            <Label htmlFor="discipline">Disciplina</Label>
            <div className="flex items-center gap-2">
              <Select value={discipline} onValueChange={setDiscipline}>
                <SelectTrigger showActions={discipline !== ""} onEdit={() => handleEditDiscipline(discipline)} onDelete={() => handleDeleteDiscipline(discipline)}>
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

          {/* Quarta linha: Tipo de Questão */}
          <div>
            <Label htmlFor="question-type">Tipo de Questão</Label>
            <div className="flex items-center gap-2">
              <Select value={questionType} onValueChange={setQuestionType}>
                <SelectTrigger showActions={questionType !== ""} onEdit={() => handleEditQuestionType(questionType)} onDelete={() => handleDeleteQuestionType(questionType)}>
                  <SelectValue placeholder="Selecione o tipo de questão" />
                </SelectTrigger>
                <SelectContent>
                  {questionTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                      placeholder="Nome do tipo de questão" 
                      value={newQuestionType} 
                      onChange={(e) => setNewQuestionType(e.target.value)} 
                    />
                    <Button onClick={handleAddQuestionType}>Adicionar</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Texto da Questão */}
          <div>
            <Label htmlFor="question-text">Texto da Questão</Label>
            <Textarea 
              id="question-text" 
              value={questionText} 
              onChange={(e) => setQuestionText(e.target.value)} 
              placeholder="Digite o texto da questão" 
              rows={8}
            />
          </div>

          {/* Explicação do Professor */}
          <div>
            <Label htmlFor="teacher-explanation">Explicação do Professor</Label>
            <Textarea 
              id="teacher-explanation" 
              value={teacherExplanation} 
              onChange={(e) => setTeacherExplanation(e.target.value)} 
              placeholder="Digite a explicação do professor" 
              rows={8}
            />
          </div>

          {/* Botão de Salvar */}
          <div className="flex justify-end">
            <Button 
              onClick={handleSaveQuestion}
              className="bg-[#ea2be2] hover:bg-[#d026d0] text-white"
            >
              Salvar Questão
            </Button>
          </div>
        </div>
      </Card>

      {/* Editar Questão Existente */}
      <Card title="Editar Questão Existente" description="Modifique uma questão existente usando seu ID" defaultOpen={false}>
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Label htmlFor="search-question-id">ID da Questão</Label>
            <Input 
              id="search-question-id" 
              value={searchId} 
              onChange={(e) => setSearchId(e.target.value)} 
              placeholder="Digite o ID da questão" 
            />
          </div>
          <Button 
            onClick={handleSearchQuestion} 
            className="bg-[#272f3c] hover:bg-[#1a1f28] text-white"
          >
            <Search className="h-4 w-4 mr-2" />
            Buscar Questão
          </Button>
        </div>
      </Card>

      {/* Dialog para edição de questão */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Editar Questão #{questionId}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-4">
              {/* Campos de edição idênticos ao formulário de nova questão */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-institution">Banca</Label>
                  <Select value={institution} onValueChange={setInstitution}>
                    <SelectTrigger showActions={institution !== ""} onEdit={() => handleEditInstitution(institution)} onDelete={() => handleDeleteInstitution(institution)}>
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
                </div>
                <div>
                  <Label htmlFor="edit-organization">Instituição</Label>
                  <Input 
                    id="edit-organization" 
                    value={organization} 
                    onChange={(e) => setOrganization(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-year">Ano</Label>
                  <Input 
                    id="edit-year" 
                    value={year} 
                    onChange={(e) => setYear(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-role">Cargo</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger showActions={role !== ""} onEdit={() => handleEditRole(role)} onDelete={() => handleDeleteRole(role)}>
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
                </div>
                <div>
                  <Label htmlFor="edit-level">Nível</Label>
                  <Select value={level} onValueChange={setLevel}>
                    <SelectTrigger showActions={level !== ""} onEdit={() => handleEditLevel(level)} onDelete={() => handleDeleteLevel(level)}>
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
                </div>
                <div>
                  <Label htmlFor="edit-difficulty">Dificuldade</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger showActions={difficulty !== ""} onEdit={() => handleEditDifficulty(difficulty)} onDelete={() => handleDeleteDifficulty(difficulty)}>
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
                </div>
              </div>

              <div>
                <Label htmlFor="edit-discipline">Disciplina</Label>
                <Select value={discipline} onValueChange={setDiscipline}>
                  <SelectTrigger showActions={discipline !== ""} onEdit={() => handleEditDiscipline(discipline)} onDelete={() => handleDeleteDiscipline(discipline)}>
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
              </div>

              <div>
                <Label htmlFor="edit-question-type">Tipo de Questão</Label>
                <Select value={questionType} onValueChange={setQuestionType}>
                  <SelectTrigger showActions={questionType !== ""} onEdit={() => handleEditQuestionType(questionType)} onDelete={() => handleDeleteQuestionType(questionType)}>
                    <SelectValue placeholder="Selecione o tipo de questão" />
                  </SelectTrigger>
                  <SelectContent>
                    {questionTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-question-text">Texto da Questão</Label>
                <Textarea 
                  id="edit-question-text" 
                  value={questionText} 
                  onChange={(e) => setQuestionText(e.target.value)} 
                  rows={8}
                />
              </div>

              <div>
                <Label htmlFor="edit-teacher-explanation">Explicação do Professor</Label>
                <Textarea 
                  id="edit-teacher-explanation" 
                  value={teacherExplanation} 
                  onChange={(e) => setTeacherExplanation(e.target.value)}
                  rows={8}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleUpdateQuestion}
              className="bg-[#ea2be2] hover:bg-[#d026d0] text-white"
            >
              Salvar Alterações
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Questoes;

