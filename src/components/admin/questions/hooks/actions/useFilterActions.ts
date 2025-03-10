
import { FiltersType } from "../../types";

export const useFilterActions = (state: ReturnType<typeof import("../useQuestionsState").useQuestionsState>) => {
  const getFilteredQuestions = () => {
    const { questions, filters } = state;
    
    return questions.filter(question => {
      return (
        (filters.id === "" || question.id.toLowerCase().includes(filters.id.toLowerCase())) &&
        (filters.year.length === 0 || filters.year.some(f => question.year.includes(f))) &&
        (filters.institution.length === 0 || filters.institution.some(f => question.institution.includes(f))) &&
        (filters.organization.length === 0 || filters.organization.some(f => question.organization.includes(f))) &&
        (filters.role.length === 0 || filters.role.some(f => question.role.includes(f))) &&
        (filters.discipline.length === 0 || filters.discipline.some(f => question.discipline.includes(f))) &&
        (filters.level.length === 0 || filters.level.some(f => question.level.includes(f))) &&
        (filters.difficulty.length === 0 || filters.difficulty.some(f => question.difficulty.includes(f))) &&
        (filters.questionType.length === 0 || filters.questionType.some(f => question.questionType.includes(f)))
      );
    });
  };

  const resetFilters = () => {
    const { setFilters } = state;
    
    setFilters({
      id: "",
      year: [],
      institution: [],
      organization: [],
      role: [],
      discipline: [],
      level: [],
      difficulty: [],
      questionType: []
    });
  };

  return {
    getFilteredQuestions,
    resetFilters,
  };
};
