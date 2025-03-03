
import { toast } from "sonner";

export const useUpdateQuestionActions = (state: ReturnType<typeof import("../useQuestionsState").useQuestionsState>) => {
  const handleUpdateQuestion = () => {
    const {
      questionId, year, institution, organization, role, discipline,
      level, difficulty, questionType, questionText, teacherExplanation,
      options, questions, setQuestions, setIsEditQuestionCardOpen, setQuestionId, 
      setYear, setInstitution, setOrganization, setRole, setDiscipline,
      setLevel, setDifficulty, setQuestionType, setQuestionText, setTeacherExplanation,
      setOptions
    } = state;

    // Verificações de preenchimento (igual ao salvamento)
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

    // Verificar se as opções estão preenchidas para tipos de questão que precisam delas
    if (["Múltipla Escolha", "Certo ou Errado"].includes(questionType)) {
      if (options.length === 0) {
        toast.error("Adicione as alternativas para a questão!");
        return;
      }

      if (questionType === "Múltipla Escolha") {
        // Verificar se todas as alternativas têm texto para múltipla escolha
        const emptyOptions = options.filter(o => !o.text.trim());
        if (emptyOptions.length > 0) {
          toast.error("Todas as alternativas devem ter um texto!");
          return;
        }
      }

      // Verificar se tem pelo menos uma alternativa correta
      if (!options.some(o => o.isCorrect)) {
        toast.error("Selecione a alternativa correta!");
        return;
      }
    }

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
      teacherExplanation,
      options
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
    setOptions([]);
  };

  return {
    handleUpdateQuestion,
  };
};
