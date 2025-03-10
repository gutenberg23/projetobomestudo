
import { FiltersType } from "../../types";

export const useFilterActions = (state: ReturnType<typeof import("../useQuestionsState").useQuestionsState>) => {
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
    getFilteredQuestions,
    resetFilters,
  };
};
