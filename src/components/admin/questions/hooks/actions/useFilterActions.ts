import { useState } from 'react';
import { Filters, FilterItem } from '../../types';
import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { QuestionItemType } from '../../types';

const emptyFilter: FilterItem = { label: 'Todos', value: '', isActive: false };

const initialFilters: Filters = {
  disciplina: emptyFilter,
  nivel: emptyFilter,
  institution: emptyFilter,
  organization: emptyFilter,
  role: emptyFilter,
  ano: emptyFilter,
  dificuldade: emptyFilter,
  questionType: emptyFilter,
};

export const useFilterActions = (state: ReturnType<typeof import("../useQuestionsState").useQuestionsState>) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [showFilters, setShowFilters] = useState(false);
  
  // Carregar filtros da URL quando o componente é montado
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    const loadedFilters: Filters = { ...initialFilters };
    
    Object.keys(loadedFilters).forEach((key) => {
      const filterKey = key as keyof Filters;
      const value = params.get(key);
      if (value !== null) {
        loadedFilters[filterKey] = {
          ...loadedFilters[filterKey],
          value,
          isActive: true
        };
      }
    });
    
    setFilters(loadedFilters);
  }, [searchParams]);

  const updateUrlWithFilters = (newFilters: Filters) => {
    const params = new URLSearchParams();
    
    Object.entries(newFilters).forEach(([key, filter]) => {
      if (filter.isActive && filter.value) {
        params.set(key, filter.value);
      }
    });
    
    setSearchParams(params);
  };

  const getFilteredQuestions = (questions: QuestionItemType[]): QuestionItemType[] => {
    return questions.filter(question => {
      const matchesDisciplina = !filters.disciplina.isActive || question.discipline === filters.disciplina.value;
      const matchesNivel = !filters.nivel.isActive || question.level === filters.nivel.value;
      const matchesInstitution = !filters.institution.isActive || question.institution === filters.institution.value;
      const matchesOrganization = !filters.organization.isActive || question.organization === filters.organization.value;
      const matchesRole = !filters.role.isActive || question.role === filters.role.value;
      const matchesAno = !filters.ano.isActive || question.year === filters.ano.value;
      const matchesDificuldade = !filters.dificuldade.isActive || question.difficulty === filters.dificuldade.value;
      const matchesQuestionType = !filters.questionType.isActive || question.questionType === filters.questionType.value;

      return (
        matchesDisciplina &&
        matchesNivel &&
        matchesInstitution &&
        matchesOrganization &&
        matchesRole &&
        matchesAno &&
        matchesDificuldade &&
        matchesQuestionType
      );
    });
  };

  const resetFilters = () => {
    setFilters(initialFilters);
    setSearchParams(new URLSearchParams());
  };

  return {
    getFilteredQuestions,
    resetFilters,
    updateUrlWithFilters,
    filters,
    setFilters,
    showFilters,
    setShowFilters,
  };
};
