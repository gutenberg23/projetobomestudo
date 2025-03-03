
import { toast } from "sonner";
import { QuestionItemType } from "../../types";

export const useQuestionManagementActions = (state: ReturnType<typeof import("../useQuestionsState").useQuestionsState>) => {
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
      setQuestionText, setTeacherExplanation, setOptions, setIsEditQuestionCardOpen
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
    setOptions(question.options || []);
    setIsEditQuestionCardOpen(true);
  };

  return {
    handleRemoveQuestion,
    handleEditQuestion,
  };
};
