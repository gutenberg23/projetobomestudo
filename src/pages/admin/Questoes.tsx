
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Copy, Edit, Plus, Search, Trash, X } from "lucide-react";
import { Question } from "@/components/new/types";

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
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  
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
    const newQuestion: Question = {
      id: questionId,
      year,
      institution,
      organization,
      role,
      content: questionText,
      options: [],
      comments: []
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
      setSelectedQuestion(found);
      // Preencher formulário com os dados da questão encontrada
      setQuestionId(found.id);
      setYear(found.year);
      setInstitution(found.institution);
      setOrganization(found.organization);
      setRole(found.role);
      setQuestionText(found.content);
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

  // Função para adicionar nova instituição
  const handleAddInstitution = () => {
    if (newInstitution.trim() !== "") {
      setInstitutions([...institutions, newInstitution]);
      setNewInstitution("");
      setIsNewInstitutionModalOpen(false);
    }
  };

  // Função para adicionar novo cargo
  const handleAddRole = () => {
    if (newRole.trim() !== "") {
      setRoles([...roles, newRole]);
      setNewRole("");
      setIsNewRoleModalOpen(false);
    }
  };

  // Função para adicionar novo nível
  const handleAddLevel = () => {
    if (newLevel.trim() !== "") {
      setLevels([...levels, newLevel]);
      setNewLevel("");
      setIsNewLevelModalOpen(false);
    }
  };

  // Função para adicionar nova dificuldade
  const handleAddDifficulty = () => {
    if (newDifficulty.trim() !== "") {
      setDifficulties([...difficulties, newDifficulty]);
      setNewDifficulty("");
      setIsNewDifficultyModalOpen(false);
    }
  };

  // Função para adicionar nova disciplina
  const handleAddDiscipline = () => {
    if (newDiscipline.trim() !== "") {
      setDisciplines([...disciplines, newDiscipline]);
      setNewDiscipline("");
      setIsNewDisciplineModalOpen(false);
    }
  };

  // Função para adicionar novo tipo de questão
  const handleAddQuestionType = () => {
    if (newQuestionType.trim() !== "") {
      setQuestionTypes([...questionTypes, newQuestionType]);
      setNewQuestionType("");
      setIsNewQuestionTypeModalOpen(false);
    }
  };

  // Função para remover uma questão
  const handleRemoveQuestion = (id: string) => {
    if (window.confirm("Tem certeza que deseja remover esta questão?")) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-bold text-[#272f3c]">Questões</h1>
        <p className="text-[#67748a]">Gerenciamento de questões</p>
      </div>

      {/* Seção de listagem de questões */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-[#272f3c] mb-4">Questões Cadastradas</h2>
        
        {questions.length === 0 ? (
          <p className="text-[#67748a] text-center py-6">Nenhuma questão cadastrada.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Ano</TableHead>
                  <TableHead>Instituição</TableHead>
                  <TableHead>Disciplina</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.map((question) => (
                  <TableRow key={question.id}>
                    <TableCell className="font-medium">{question.id}</TableCell>
                    <TableCell>{question.year}</TableCell>
                    <TableCell>{question.institution}</TableCell>
                    <TableCell>{discipline}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => copyToClipboard(question.id)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => {
                          setSelectedQuestion(question);
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
      </div>

      {/* Nova Questão */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold text-[#272f3c]">Nova Questão</h2>
            <p className="text-sm text-[#67748a]">Crie uma nova questão para suas listas</p>
          </div>
        </div>

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
                <Button variant="outline" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Trash className="h-4 w-4" />
                </Button>
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
                  placeholder="Selecione a instituição" 
                />
                <Button variant="outline" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
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
                <Button variant="outline" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Nível */}
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
                <Button variant="outline" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Dificuldade */}
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
                <Button variant="outline" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Terceira linha: Disciplina */}
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
              <Button variant="outline" size="icon">
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quarta linha: Tipo de Questão */}
          <div>
            <Label htmlFor="question-type">Tipo de Questão</Label>
            <div className="flex items-center gap-2">
              <Select value={questionType} onValueChange={setQuestionType}>
                <SelectTrigger>
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
              <Button variant="outline" size="icon">
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Texto da Questão */}
          <div>
            <Label htmlFor="question-text">Texto da Questão</Label>
            <div className="border rounded-md p-2 mb-2">
              <div className="flex gap-2 mb-2">
                <Button variant="outline" size="sm">B</Button>
                <Button variant="outline" size="sm">I</Button>
                <Button variant="outline" size="sm">S</Button>
                <Button variant="outline" size="sm">1.</Button>
                <Button variant="outline" size="sm">•</Button>
                <Button variant="outline" size="sm">@</Button>
                <Button variant="outline" size="sm">📷</Button>
              </div>
            </div>
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
            <div className="border rounded-md p-2 mb-2">
              <div className="flex gap-2 mb-2">
                <Button variant="outline" size="sm">B</Button>
                <Button variant="outline" size="sm">I</Button>
                <Button variant="outline" size="sm">S</Button>
                <Button variant="outline" size="sm">1.</Button>
                <Button variant="outline" size="sm">•</Button>
                <Button variant="outline" size="sm">@</Button>
                <Button variant="outline" size="sm">📷</Button>
              </div>
            </div>
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
      </div>

      {/* Editar Questão Existente */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold text-[#272f3c]">Editar Questão Existente</h2>
            <p className="text-sm text-[#67748a]">Modifique uma questão existente usando seu ID</p>
          </div>
        </div>

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
      </div>

      {/* Dialog para edição de questão */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Editar Questão #{selectedQuestion?.id}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedQuestion && (
              <div className="space-y-4">
                {/* Campos de edição idênticos ao formulário de nova questão */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="edit-institution">Banca</Label>
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
                  </div>
                  <div>
                    <Label htmlFor="edit-level">Nível</Label>
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
                  </div>
                  <div>
                    <Label htmlFor="edit-difficulty">Dificuldade</Label>
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
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-discipline">Disciplina</Label>
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
                </div>

                <div>
                  <Label htmlFor="edit-question-type">Tipo de Questão</Label>
                  <Select value={questionType} onValueChange={setQuestionType}>
                    <SelectTrigger>
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
            )}
          </div>
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={() => {
                // Atualizar a questão no array de questões
                const updatedQuestions = questions.map(q => q.id === selectedQuestion?.id ? {
                  ...q,
                  year,
                  institution,
                  organization,
                  role,
                  content: questionText,
                } : q);
                setQuestions(updatedQuestions);
                setIsEditModalOpen(false);
              }}
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
