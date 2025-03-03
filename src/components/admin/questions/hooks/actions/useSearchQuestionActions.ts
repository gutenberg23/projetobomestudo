
import { toast } from "sonner";

export const useSearchQuestionActions = (state: ReturnType<typeof import("../useQuestionsState").useQuestionsState>) => {
  // Função para buscar questão
  const handleSearchQuestion = () => {
    const {
      searchId, questions, setQuestionId, setYear, setInstitution,
      setOrganization, setRole, setDiscipline, setLevel, setDifficulty,
      setQuestionType, setQuestionText, setTeacherExplanation, setOptions,
      setIsEditQuestionCardOpen
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
      setOptions(question.options || []);
      setIsEditQuestionCardOpen(true);
      toast.success("Questão encontrada!");
    } else {
      toast.error("Questão não encontrada!");
    }
  };

  return {
    handleSearchQuestion,
  };
};
