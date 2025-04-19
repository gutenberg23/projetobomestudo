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
  subtopicos: emptyFilter,
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
        // Manter compatibilidade: se for JSON, manter como está, caso contrário converter
        params.set(key, filter.value);
      }
    });
    
    setSearchParams(params);
  };

  const getFilteredQuestions = (questions: QuestionItemType[]): QuestionItemType[] => {
    return questions.filter(question => {
      // Função auxiliar para extrair valores do filtro (compatível com JSON e formato antigo)
      const getFilterValues = (filterValue: string): string[] => {
        if (!filterValue) return [];
        
        try {
          // Tentar analisar como JSON primeiro (formato novo)
          return JSON.parse(filterValue);
        } catch (e) {
          // Caso não seja JSON (formato antigo com vírgulas), usar o método antigo
          return filterValue.split(',').filter(v => v !== '');
        }
      };

      const disciplinaValues = getFilterValues(filters.disciplina.value);
      const nivelValues = getFilterValues(filters.nivel.value);
      const institutionValues = getFilterValues(filters.institution.value);
      const organizationValues = getFilterValues(filters.organization.value);
      const roleValues = getFilterValues(filters.role.value);
      const anoValues = getFilterValues(filters.ano.value);
      const dificuldadeValues = getFilterValues(filters.dificuldade.value);
      const questionTypeValues = getFilterValues(filters.questionType.value);
      const topicosValues = getFilterValues(filters.topicos.value);
      const searchTerm = filters.conteudo.value ? filters.conteudo.value.toLowerCase() : '';

      const matchesDisciplina = !filters.disciplina.isActive || disciplinaValues.length === 0 || disciplinaValues.includes(question.discipline);
      const matchesNivel = !filters.nivel.isActive || nivelValues.length === 0 || nivelValues.includes(question.level);
      const matchesInstitution = !filters.institution.isActive || institutionValues.length === 0 || institutionValues.includes(question.institution);
      const matchesOrganization = !filters.organization.isActive || organizationValues.length === 0 || organizationValues.includes(question.organization);
      const matchesRole = !filters.role.isActive || roleValues.length === 0 || 
        (Array.isArray(question.role) && question.role.some(r => roleValues.includes(r)));
      const matchesAno = !filters.ano.isActive || anoValues.length === 0 || anoValues.includes(question.year);
      const matchesDificuldade = !filters.dificuldade.isActive || dificuldadeValues.length === 0 || dificuldadeValues.includes(question.difficulty);
      const matchesQuestionType = !filters.questionType.isActive || questionTypeValues.length === 0 || questionTypeValues.includes(question.questionType);
      const matchesTopicos = !filters.topicos.isActive || topicosValues.length === 0 || topicosValues.some(topico => question.assuntos?.includes(topico) || question.topicos?.includes(topico));
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
