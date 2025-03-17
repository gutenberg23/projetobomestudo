
import { FiltersType } from "../../types";
import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";

export const useFilterActions = (state: ReturnType<typeof import("../useQuestionsState").useQuestionsState>) => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Carregar filtros da URL quando o componente é montado
  useEffect(() => {
    const urlFilters: Partial<FiltersType> = {};
    
    // Verificar cada parâmetro na URL
    Array.from(searchParams.entries()).forEach(([key, value]) => {
      if (Object.keys(state.filters).includes(key)) {
        urlFilters[key as keyof FiltersType] = value;
      }
    });
    
    // Atualizar o estado apenas se houver filtros na URL
    if (Object.keys(urlFilters).length > 0) {
      state.setFilters(prevFilters => ({
        ...prevFilters,
        ...urlFilters
      }));
    }
  }, []);

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
    
    // Limpar filtros no estado
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
    
    // Limpar parâmetros da URL
    setSearchParams(new URLSearchParams());
  };

  // Função para atualizar a URL com filtros atuais
  const updateUrlWithFilters = () => {
    const params = new URLSearchParams();
    
    // Adicionar apenas filtros não vazios
    Object.entries(state.filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });
    
    setSearchParams(params);
  };

  return {
    getFilteredQuestions,
    resetFilters,
    updateUrlWithFilters
  };
};
