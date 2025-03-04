
import { toast } from "sonner";
import { QuestionItemType } from "../../types";

export const useSaveQuestionActions = (state: ReturnType<typeof import("../useQuestionsState").useQuestionsState>) => {
  // Função para salvar questão
  const handleSaveQuestion = () => {
    const {
      questionId, year, institution, organization, role, discipline,
      level, difficulty, questionType, questionText, teacherExplanation,
      aiExplanation, options, questions, setQuestions, setQuestionId, setYear, setInstitution,
      setOrganization, setRole, setDiscipline, setLevel, setDifficulty,
      setQuestionType, setQuestionText, setTeacherExplanation, setAIExplanation, setOptions
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
      aiExplanation,
      options: options
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
    setAIExplanation("");
    setOptions([]);

    toast.success("Questão salva com sucesso!");
  };

  return {
    handleSaveQuestion,
  };
};
