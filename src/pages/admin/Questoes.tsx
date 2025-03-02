
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { QuestionItemType, FiltersType } from "@/components/admin/questions/types";
import Card from "@/components/admin/questions/Card";
import SearchQuestion from "@/components/admin/questions/SearchQuestion";
import QuestionFilters from "@/components/admin/questions/QuestionFilters";
import QuestionList from "@/components/admin/questions/QuestionList";
import QuestionForm from "@/components/admin/questions/QuestionForm";

const Questoes: React.FC = () => {
  // Estado para informações da questão
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
  
  // Estado para busca e edição
  const [searchId, setSearchId] = useState<string>("");
  const [questions, setQuestions] = useState<QuestionItemType[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [isEditQuestionCardOpen, setIsEditQuestionCardOpen] = useState<boolean>(false);
  
  // Estado para os filtros
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [filters, setFilters] = useState<FiltersType>({
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
  
  // Estado para opções selecionáveis
  const [institutions, setInstitutions] = useState<string[]>(["IDECAN", "CESPE", "FGV", "VUNESP"]);
  const [roles, setRoles] = useState<string[]>(["Analista", "Técnico", "Auditor", "Escrivão"]);
  const [levels, setLevels] = useState<string[]>(["Básico", "Intermediário", "Avançado"]);
  const [difficulties, setDifficulties] = useState<string[]>(["Fácil", "Médio", "Difícil"]);
  const [disciplines, setDisciplines] = useState<string[]>(["Português", "Matemática", "Direito Constitucional", "Informática"]);
  const [questionTypes, setQuestionTypes] = useState<string[]>(["Múltipla Escolha", "Verdadeiro/Falso", "Discursiva"]);
  const [years, setYears] = useState<string[]>(["2024", "2023", "2022", "2021", "2020", "2019", "2018"]);
  const [organizations, setOrganizations] = useState<string[]>(["Tribunal de Justiça", "Ministério Público", "Polícia Federal", "Receita Federal"]);
  
  // Gerar ID automático para a questão
  useEffect(() => {
    const generateQuestionId = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      
      return `${year}${month}${day}${hours}${minutes}${seconds}`;
    };
    
    if (!questionId) {
      setQuestionId(generateQuestionId());
    }
  }, [questionId]);
  
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

  // Função para salvar questão
  const handleSaveQuestion = () => {
    if (
      !year || 
      !institution || 
      !organization || 
      !role || 
      !discipline || 
      !level || 
      !difficulty || 
      !questionType || 
      !questionText
    ) {
      toast.error("Preencha todos os campos obrigatórios!");
      return;
    }

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

    // Gerar um novo ID para a próxima questão
    const now = new Date();
    const newId = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
    setQuestionId(newId);

    // Limpar campos
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

    toast.success("Questão salva com sucesso!");
  };

  // Função para buscar questão
  const handleSearchQuestion = () => {
    if (!searchId.trim()) {
      toast.error("Digite o ID da questão para buscar");
      return;
    }

    const question = questions.find(q => q.id === searchId);
    if (question) {
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
      setIsEditQuestionCardOpen(true);
      toast.success("Questão encontrada!");
    } else {
      toast.error("Questão não encontrada!");
    }
  };

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
    setIsEditQuestionCardOpen(false);
    toast.success("Questão atualizada com sucesso!");
    
    // Limpar campos e gerar novo ID
    const now = new Date();
    const newId = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
    setQuestionId(newId);
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

  const toggleQuestionSelection = (id: string) => {
    if (id === '') {
      // Desmarcar todas
      setSelectedQuestions([]);
      return;
    }
    
    if (id.includes(',')) {
      // Selecionar várias
      setSelectedQuestions(id.split(','));
      return;
    }
    
    if (selectedQuestions.includes(id)) {
      setSelectedQuestions(selectedQuestions.filter(qId => qId !== id));
    } else {
      setSelectedQuestions([...selectedQuestions, id]);
    }
  };

  const handleCreateSimulado = () => {
    if (selectedQuestions.length === 0) {
      toast.error("Selecione pelo menos uma questão para criar o simulado.");
      return;
    }
    
    toast.success(`Simulado criado com ${selectedQuestions.length} questões!`);
    setSelectedQuestions([]);
  };

  const handleRemoveQuestion = (id: string) => {
    if (window.confirm("Tem certeza que deseja remover esta questão?")) {
      setQuestions(questions.filter(q => q.id !== id));
      setSelectedQuestions(selectedQuestions.filter(qId => qId !== id));
      toast.success("Questão removida com sucesso!");
    }
  };

  const handleEditQuestion = (question: QuestionItemType) => {
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
    setIsEditQuestionCardOpen(true);
  };

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

      <Card title="Buscar Questão" description="Pesquise e edite questões pelo ID" defaultOpen={true}>
        <SearchQuestion 
          searchId={searchId} 
          setSearchId={setSearchId} 
          handleSearchQuestion={handleSearchQuestion} 
        />
      </Card>

      {isEditQuestionCardOpen && (
        <Card title="Editar Questão" description="Edite os dados da questão" defaultOpen={true}>
          <QuestionForm
            questionId={questionId}
            year={year}
            setYear={setYear}
            institution={institution}
            setInstitution={setInstitution}
            organization={organization}
            setOrganization={setOrganization}
            role={role}
            setRole={setRole}
            discipline={discipline}
            setDiscipline={setDiscipline}
            level={level}
            setLevel={setLevel}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            questionType={questionType}
            setQuestionType={setQuestionType}
            questionText={questionText}
            setQuestionText={setQuestionText}
            teacherExplanation={teacherExplanation}
            setTeacherExplanation={setTeacherExplanation}
            institutions={institutions}
            setInstitutions={setInstitutions}
            organizations={organizations}
            setOrganizations={setOrganizations}
            roles={roles}
            setRoles={setRoles}
            disciplines={disciplines}
            setDisciplines={setDisciplines}
            levels={levels}
            setLevels={setLevels}
            difficulties={difficulties}
            setDifficulties={setDifficulties}
            questionTypes={questionTypes}
            setQuestionTypes={setQuestionTypes}
            years={years}
            setYears={setYears}
            onSubmit={handleUpdateQuestion}
            submitButtonText="Salvar Modificações"
            isEditing={true}
          />
        </Card>
      )}

      <Card title="Questões Cadastradas" description="Visualize e gerencie as questões cadastradas" defaultOpen={false}>
        <QuestionFilters
          filters={filters}
          setFilters={setFilters}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          resetFilters={resetFilters}
        />
        
        <QuestionList
          filteredQuestions={filteredQuestions}
          selectedQuestions={selectedQuestions}
          toggleQuestionSelection={toggleQuestionSelection}
          handleCreateSimulado={handleCreateSimulado}
          handleRemoveQuestion={handleRemoveQuestion}
          handleEditQuestion={handleEditQuestion}
          copyToClipboard={copyToClipboard}
        />
      </Card>

      <Card title="Nova Questão" description="Crie uma nova questão para suas listas" defaultOpen={false}>
        <QuestionForm
          questionId={questionId}
          year={year}
          setYear={setYear}
          institution={institution}
          setInstitution={setInstitution}
          organization={organization}
          setOrganization={setOrganization}
          role={role}
          setRole={setRole}
          discipline={discipline}
          setDiscipline={setDiscipline}
          level={level}
          setLevel={setLevel}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          questionType={questionType}
          setQuestionType={setQuestionType}
          questionText={questionText}
          setQuestionText={setQuestionText}
          teacherExplanation={teacherExplanation}
          setTeacherExplanation={setTeacherExplanation}
          institutions={institutions}
          setInstitutions={setInstitutions}
          organizations={organizations}
          setOrganizations={setOrganizations}
          roles={roles}
          setRoles={setRoles}
          disciplines={disciplines}
          setDisciplines={setDisciplines}
          levels={levels}
          setLevels={setLevels}
          difficulties={difficulties}
          setDifficulties={setDifficulties}
          questionTypes={questionTypes}
          setQuestionTypes={setQuestionTypes}
          years={years}
          setYears={setYears}
          onSubmit={handleSaveQuestion}
          submitButtonText="Salvar Questão"
        />
      </Card>
    </div>
  );
};

export default Questoes;
