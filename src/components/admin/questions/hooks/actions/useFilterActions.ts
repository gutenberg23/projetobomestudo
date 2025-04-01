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
  topicos: emptyFilter,
  conteudo: emptyFilter,
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
      const disciplinaValues = filters.disciplina.value ? filters.disciplina.value.split(',').filter(v => v !== '') : [];
      const nivelValues = filters.nivel.value ? filters.nivel.value.split(',').filter(v => v !== '') : [];
      const institutionValues = filters.institution.value ? filters.institution.value.split(',').filter(v => v !== '') : [];
      const organizationValues = filters.organization.value ? filters.organization.value.split(',').filter(v => v !== '') : [];
      const roleValues = filters.role.value ? filters.role.value.split(',').filter(v => v !== '') : [];
      const anoValues = filters.ano.value ? filters.ano.value.split(',').filter(v => v !== '') : [];
      const dificuldadeValues = filters.dificuldade.value ? filters.dificuldade.value.split(',').filter(v => v !== '') : [];
      const questionTypeValues = filters.questionType.value ? filters.questionType.value.split(',').filter(v => v !== '') : [];
      const topicosValues = filters.topicos.value ? filters.topicos.value.split(',').filter(v => v !== '') : [];
      const searchTerm = filters.conteudo.value ? filters.conteudo.value.toLowerCase() : '';

      const matchesDisciplina = !filters.disciplina.isActive || disciplinaValues.length === 0 || disciplinaValues.includes(question.discipline);
      const matchesNivel = !filters.nivel.isActive || nivelValues.length === 0 || nivelValues.includes(question.level);
      const matchesInstitution = !filters.institution.isActive || institutionValues.length === 0 || institutionValues.includes(question.institution);
      const matchesOrganization = !filters.organization.isActive || organizationValues.length === 0 || organizationValues.includes(question.organization);
      const matchesRole = !filters.role.isActive || roleValues.length === 0 || roleValues.includes(question.role);
      const matchesAno = !filters.ano.isActive || anoValues.length === 0 || anoValues.includes(question.year);
      const matchesDificuldade = !filters.dificuldade.isActive || dificuldadeValues.length === 0 || dificuldadeValues.includes(question.difficulty);
      const matchesQuestionType = !filters.questionType.isActive || questionTypeValues.length === 0 || questionTypeValues.includes(question.questionType);
      const matchesTopicos = !filters.topicos.isActive || topicosValues.length === 0 || topicosValues.some(topico => question.topicos?.includes(topico));
      const matchesContent = !filters.conteudo.isActive || !searchTerm || question.content.toLowerCase().includes(searchTerm);

      return (
        matchesDisciplina &&
        matchesNivel &&
        matchesInstitution &&
        matchesOrganization &&
        matchesRole &&
        matchesAno &&
        matchesDificuldade &&
        matchesQuestionType &&
        matchesTopicos &&
        matchesContent
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
