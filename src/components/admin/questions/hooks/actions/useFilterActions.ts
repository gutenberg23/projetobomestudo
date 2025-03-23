
import { FiltersType } from "../../types";
import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";

// Interface para o estado de filtros usado no componente QuestionFilters
export interface FilterItem {
  key: string;
  isActive: boolean;
  value: string;
}

export interface Filters {
  disciplina: FilterItem;
  nivel: FilterItem;
  institution: FilterItem;
  organization: FilterItem;
  role: FilterItem;
  ano: FilterItem;
  dificuldade: FilterItem;
  questionType: FilterItem;
}

export const useFilterActions = (state: ReturnType<typeof import("../useQuestionsState").useQuestionsState>) => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Carregar filtros da URL quando o componente é montado
  useEffect(() => {
    const urlFilters: Partial<Record<keyof Filters, string>> = {};
    
    // Verificar cada parâmetro na URL
    Array.from(searchParams.entries()).forEach(([key, value]) => {
      if (key in state.filters) {
        urlFilters[key as keyof Filters] = value;
      }
    });
    
    // Atualizar o estado apenas se houver filtros na URL
    if (Object.keys(urlFilters).length > 0) {
      state.setFilters(prevFilters => {
        const newFilters = { ...prevFilters };
        
        // Atualizar apenas os filtros encontrados na URL
        Object.entries(urlFilters).forEach(([key, value]) => {
          const filterKey = key as keyof Filters;
          if (filterKey in newFilters) {
            newFilters[filterKey] = {
              ...newFilters[filterKey],
              isActive: true,
              value: value
            };
          }
        });
        
        return newFilters;
      });
    }
  }, []);

  const getFilteredQuestions = () => {
    const { questions, filters } = state;
    
    return questions.filter(question => {
      // Verificar se filtros estão ativos antes de aplicá-los
      const disciplinaMatch = !filters.disciplina.isActive || 
        (question.discipline.toLowerCase().includes(filters.disciplina.value.toLowerCase()));
      
      const nivelMatch = !filters.nivel.isActive || 
        (question.level.toLowerCase().includes(filters.nivel.value.toLowerCase()));
      
      const institutionMatch = !filters.institution.isActive || 
        (question.institution.toLowerCase().includes(filters.institution.value.toLowerCase()));
      
      const organizationMatch = !filters.organization.isActive || 
        (question.organization.toLowerCase().includes(filters.organization.value.toLowerCase()));
      
      const roleMatch = !filters.role.isActive || 
        (question.role.toLowerCase().includes(filters.role.value.toLowerCase()));
      
      const anoMatch = !filters.ano.isActive || 
        (question.year.toLowerCase().includes(filters.ano.value.toLowerCase()));
      
      const dificuldadeMatch = !filters.dificuldade.isActive || 
        (question.difficulty.toLowerCase().includes(filters.dificuldade.value.toLowerCase()));
      
      const typeMatch = !filters.questionType.isActive || 
        (question.questionType.toLowerCase().includes(filters.questionType.value.toLowerCase()));
      
      return disciplinaMatch && nivelMatch && institutionMatch && 
             organizationMatch && roleMatch && anoMatch && 
             dificuldadeMatch && typeMatch;
    });
  };

  const resetFilters = () => {
    const { setFilters } = state;
    
    // Criar um objeto de filtros limpo
    const emptyFilters: Filters = {
      disciplina: { key: 'disciplina', isActive: false, value: '' },
      nivel: { key: 'nivel', isActive: false, value: '' },
      institution: { key: 'institution', isActive: false, value: '' },
      organization: { key: 'organization', isActive: false, value: '' },
      role: { key: 'role', isActive: false, value: '' },
      ano: { key: 'ano', isActive: false, value: '' },
      dificuldade: { key: 'dificuldade', isActive: false, value: '' },
      questionType: { key: 'questionType', isActive: false, value: '' }
    };
    
    // Limpar filtros no estado
    setFilters(emptyFilters);
    
    // Limpar parâmetros da URL
    setSearchParams(new URLSearchParams());
  };

  // Função para atualizar a URL com filtros atuais
  const updateUrlWithFilters = () => {
    const params = new URLSearchParams();
    
    // Adicionar apenas filtros ativos e não vazios
    Object.entries(state.filters).forEach(([key, filterItem]) => {
      if (filterItem.isActive && filterItem.value) {
        params.set(key, filterItem.value);
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
