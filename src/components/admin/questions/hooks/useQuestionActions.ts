
import { useState } from "react";
import { toast } from "sonner";
import { QuestionItemType, FiltersType } from "../types";

export const useQuestionActions = (state: ReturnType<typeof import("./useQuestionsState").useQuestionsState>) => {
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
    const {
      questionId, year, institution, organization, role, discipline,
      level, difficulty, questionType, questionText, teacherExplanation,
      questions, setQuestions, setQuestionId, setYear, setInstitution,
      setOrganization, setRole, setDiscipline, setLevel, setDifficulty,
      setQuestionType, setQuestionText, setTeacherExplanation
    } = state;

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
    const {
      searchId, questions, setQuestionId, setYear, setInstitution,
      setOrganization, setRole, setDiscipline, setLevel, setDifficulty,
      setQuestionType, setQuestionText, setTeacherExplanation, setIsEditQuestionCardOpen
    } = state;

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
    const {
      questionId, year, institution, organization, role, discipline,
      level, difficulty, questionType, questionText, teacherExplanation,
      questions, setQuestions, setIsEditQuestionCardOpen, setQuestionId, 
      setYear, setInstitution, setOrganization, setRole, setDiscipline,
      setLevel, setDifficulty, setQuestionType, setQuestionText, setTeacherExplanation
    } = state;

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
    const { selectedQuestions, setSelectedQuestions } = state;
    
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
    const { selectedQuestions, setSelectedQuestions } = state;
    
    if (selectedQuestions.length === 0) {
      toast.error("Selecione pelo menos uma questão para criar o simulado.");
      return;
    }
    
    toast.success(`Simulado criado com ${selectedQuestions.length} questões!`);
    setSelectedQuestions([]);
  };

  const handleRemoveQuestion = (id: string) => {
    const { questions, selectedQuestions, setQuestions, setSelectedQuestions } = state;
    
    if (window.confirm("Tem certeza que deseja remover esta questão?")) {
      setQuestions(questions.filter(q => q.id !== id));
      setSelectedQuestions(selectedQuestions.filter(qId => qId !== id));
      toast.success("Questão removida com sucesso!");
    }
  };

  const handleEditQuestion = (question: QuestionItemType) => {
    const {
      setQuestionId, setYear, setInstitution, setOrganization, setRole,
      setDiscipline, setLevel, setDifficulty, setQuestionType,
      setQuestionText, setTeacherExplanation, setIsEditQuestionCardOpen
    } = state;
    
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
    const { questions, filters } = state;
    
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

  const resetFilters = () => {
    const { setFilters } = state;
    
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

  return {
    copyToClipboard,
    handleSaveQuestion,
    handleSearchQuestion,
    handleUpdateQuestion,
    toggleQuestionSelection,
    handleCreateSimulado,
    handleRemoveQuestion,
    handleEditQuestion,
    getFilteredQuestions,
    resetFilters
  };
};
