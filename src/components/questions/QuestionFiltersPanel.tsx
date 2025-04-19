import React, { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Search, X } from "lucide-react";
import { FilterGroup } from "@/components/questions/FilterGroup";
import { useSearchParams } from "react-router-dom";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";

interface QuestionFiltersPanelProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  selectedFilters: {
    disciplines: string[];
    topics: string[];
    institutions: string[];
    organizations: string[];
    roles: string[];
    years: string[];
    educationLevels: string[];
    difficulty: string[];
    subtopics?: string[];
  };
  handleFilterChange: (category: "topics" | "disciplines" | "institutions" | "organizations" | "roles" | "years" | "educationLevels" | "difficulty" | "subtopics", value: string) => void;
  handleApplyFilters: () => void;
  questionsPerPage: string;
  setQuestionsPerPage: (value: string) => void;
  filterOptions: {
    disciplines: string[];
    topics: string[];
    institutions: string[];
    organizations: string[];
    roles: string[];
    years: string[];
    educationLevels: string[];
    difficulty: string[];
  };
  rightElement?: React.ReactNode;
}

const QuestionFiltersPanel: React.FC<QuestionFiltersPanelProps> = ({
  searchQuery,
  setSearchQuery,
  selectedFilters,
  handleFilterChange,
  handleApplyFilters,
  questionsPerPage,
  filterOptions,
  rightElement
}) => {
  const [_, setSearchParams] = useSearchParams();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [topicsByDiscipline, setTopicsByDiscipline] = useState<Record<string, string[]>>({});
  const [subjectsByDiscipline, setSubjectsByDiscipline] = useState<Record<string, string[]>>({});
  const [topicsBySubject, setTopicsBySubject] = useState<Record<string, string[]>>({});
  const [_allQuestions, setAllQuestions] = useState<any[]>([]);
  const [_isLoading, setIsLoading] = useState(false);

  // Buscar questões para análise de disciplinas, assuntos e tópicos
  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('questoes')
          .select('discipline, assuntos, topicos');
          
        if (error) throw error;
        
        if (data) {
          setAllQuestions(data);
          
          // Criar mapeamento de disciplinas para assuntos e tópicos
          const disciplineToSubjectsMap: Record<string, Set<string>> = {};
          const disciplineToTopicsMap: Record<string, Set<string>> = {};
          const subjectToTopicsMap: Record<string, Set<string>> = {};
          
          data.forEach(question => {
            const discipline = question.discipline;
            const subjects = Array.isArray(question.assuntos) ? question.assuntos : [];
            const topics = Array.isArray(question.topicos) ? question.topicos : [];
            
            // Mapear disciplina para assuntos
            if (discipline && subjects.length > 0) {
              if (!disciplineToSubjectsMap[discipline]) {
                disciplineToSubjectsMap[discipline] = new Set();
              }
              
              subjects.forEach((subject: string) => {
                if (subject) {
                  disciplineToSubjectsMap[discipline].add(subject);
                  
                  // Mapear assunto para tópicos
                  if (topics.length > 0) {
                    if (!subjectToTopicsMap[subject]) {
                      subjectToTopicsMap[subject] = new Set();
                    }
                    
                    topics.forEach((topic: string) => {
                      if (topic) {
                        subjectToTopicsMap[subject].add(topic);
                      }
                    });
                  }
                }
              });
            }
            
            // Mapear disciplina para tópicos
            if (discipline && topics.length > 0) {
              if (!disciplineToTopicsMap[discipline]) {
                disciplineToTopicsMap[discipline] = new Set();
              }
              
              topics.forEach((topic: string) => {
                if (topic) {
                  disciplineToTopicsMap[discipline].add(topic);
                }
              });
            }
          });
          
          // Converter Sets para arrays e ordenar
          const formattedSubjectsMap: Record<string, string[]> = {};
          Object.keys(disciplineToSubjectsMap).forEach(discipline => {
            formattedSubjectsMap[discipline] = [...disciplineToSubjectsMap[discipline]]
              .filter(Boolean)
              .sort((a, b) => String(a).localeCompare(String(b)));
          });
          
          const formattedTopicsMap: Record<string, string[]> = {};
          Object.keys(disciplineToTopicsMap).forEach(discipline => {
            formattedTopicsMap[discipline] = [...disciplineToTopicsMap[discipline]]
              .filter(Boolean)
              .sort((a, b) => String(a).localeCompare(String(b)));
          });

          const formattedSubjectToTopicsMap: Record<string, string[]> = {};
          Object.keys(subjectToTopicsMap).forEach(subject => {
            formattedSubjectToTopicsMap[subject] = [...subjectToTopicsMap[subject]]
              .filter(Boolean)
              .sort((a, b) => String(a).localeCompare(String(b)));
          });
          
          setSubjectsByDiscipline(formattedSubjectsMap);
          setTopicsByDiscipline(formattedTopicsMap);
          setTopicsBySubject(formattedSubjectToTopicsMap);
        }
      } catch (error) {
        console.error('Erro ao carregar questões:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchQuestions();
  }, []);

  // Ordenar todas as listas de opções em ordem alfabética
  const sortedOptions = {
    disciplines: [...filterOptions.disciplines].filter(Boolean).sort((a, b) => String(a).localeCompare(String(b))),
    topics: [...filterOptions.topics].filter(Boolean).sort((a, b) => String(a).localeCompare(String(b))),
    institutions: [...filterOptions.institutions].filter(Boolean).sort((a, b) => String(a).localeCompare(String(b))),
    organizations: [...filterOptions.organizations].filter(Boolean).sort((a, b) => String(a).localeCompare(String(b))),
    roles: [...filterOptions.roles].filter(Boolean).sort((a, b) => String(a).localeCompare(String(b))),
    years: [...filterOptions.years].filter(Boolean).sort((a, b) => String(b).localeCompare(String(a))), // Anos em ordem decrescente
    educationLevels: [...filterOptions.educationLevels].filter(Boolean).sort((a, b) => String(a).localeCompare(String(b))),
    difficulty: [...filterOptions.difficulty].filter(Boolean).sort((a, b) => String(a).localeCompare(String(b)))
  };

  // Filtrar assuntos com base nas disciplinas selecionadas
  const filteredSubjects = useMemo(() => {
    if (selectedFilters.disciplines.length === 0) {
      return [];
    }
    
    // Se tiver disciplinas selecionadas, mostrar apenas assuntos relacionados
    const subjectsSet = new Set<string>();
    
    selectedFilters.disciplines.forEach(discipline => {
      const subjects = subjectsByDiscipline[discipline] || [];
      subjects.forEach(subject => subjectsSet.add(subject));
    });
    
    return [...subjectsSet].filter(Boolean).sort((a, b) => String(a).localeCompare(String(b)));
  }, [selectedFilters.disciplines, subjectsByDiscipline]);

  // Filtrar tópicos com base nos assuntos selecionados
  const filteredTopicsBySubject = useMemo(() => {
    if (selectedFilters.topics.length === 0) {
      // Se não houver assuntos selecionados, mostrar tópicos baseados na disciplina
      if (selectedFilters.disciplines.length > 0) {
        const topicsSet = new Set<string>();
        
        selectedFilters.disciplines.forEach(discipline => {
          const topics = topicsByDiscipline[discipline] || [];
          topics.forEach(topic => topicsSet.add(topic));
        });
        
        return [...topicsSet].filter(Boolean).sort((a, b) => String(a).localeCompare(String(b)));
      }
      return [];
    }
    
    // Se tiver assuntos selecionados, mostrar apenas tópicos relacionados
    const topicsSet = new Set<string>();
    
    selectedFilters.topics.forEach(subject => {
      const topics = topicsBySubject[subject] || [];
      topics.forEach(topic => topicsSet.add(topic));
    });
    
    return [...topicsSet].filter(Boolean).sort((a, b) => String(a).localeCompare(String(b)));
  }, [selectedFilters.topics, selectedFilters.disciplines, topicsBySubject, topicsByDiscipline]);

  // Atualizar a URL com os filtros selecionados
  const updateUrlWithFilters = () => {
    const params = new URLSearchParams();
    
    // Adicionar consulta de pesquisa
    if (localSearchQuery) {
      params.set('q', localSearchQuery);
    }
    
    // Adicionar filtros selecionados
    Object.entries(selectedFilters).forEach(([key, values]) => {
      if (values.length) {
        // Usar JSON para evitar problemas com valores que contêm vírgulas
        params.set(key, JSON.stringify(values));
      }
    });
    
    // Adicionar questões por página
    params.set('perPage', questionsPerPage);
    
    // Atualizar a URL sem recarregar a página
    setSearchParams(params);
  };

  // Aplicar filtros e atualizar URL
  const applyFiltersWithUrl = () => {
    setSearchQuery(localSearchQuery);
    updateUrlWithFilters();
    handleApplyFilters();
    if (isMobile) {
      setIsOpen(false);
    }
  };

  // Contar quantos filtros estão ativos
  const countActiveFilters = () => {
    return Object.values(selectedFilters).reduce((count, filters) => count + filters.length, 0);
  };

  const activeFiltersCount = countActiveFilters();
  
  // Função para remover todos os filtros
  const clearAllFilters = () => {
    // Resetar a pesquisa local
    setLocalSearchQuery("");
    
    // Criar um objeto com todos os filtros vazios
    const emptyFilters = {
      disciplines: [],
      topics: [],
      institutions: [],
      organizations: [],
      roles: [],
      years: [],
      educationLevels: [],
      difficulty: [],
      subtopics: []
    };
    
    // Atualizar a URL sem filtros
    const params = new URLSearchParams();
    params.set('perPage', questionsPerPage);
    setSearchParams(params);
    
    // Propagar as mudanças para o componente pai
    setSearchQuery("");
    
    // Usar evento de retorno para atualizar todos os filtros
    const handler = handleFilterChange as any;
    if (typeof handler === 'function') {
      handler("reset_all", emptyFilters);
    }
    
    // Aplicar os filtros vazios
    handleApplyFilters();
  };
  
  const filtersContent = (
    <>
      <div className="grid grid-cols-1 gap-6 mb-6">
        <div className="relative w-full">
          <Input 
            type="text" 
            placeholder="Pesquisar palavras-chave..." 
            value={localSearchQuery} 
            onChange={e => setLocalSearchQuery(e.target.value)} 
            className="pr-10 w-full" 
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        <FilterGroup 
          title="Disciplina" 
          options={sortedOptions.disciplines} 
          selectedValues={selectedFilters.disciplines} 
          onChange={handleFilterChange} 
          category="disciplines"
          placeholder="Selecione as disciplinas"
        />
        
        <FilterGroup 
          title="Assunto" 
          options={filteredSubjects} 
          selectedValues={selectedFilters.topics} 
          onChange={handleFilterChange} 
          category="topics"
          placeholder={
            selectedFilters.disciplines.length === 0 
              ? "Selecione uma disciplina primeiro" 
              : "Selecione os assuntos"
          }
        />
        
        <FilterGroup 
          title="Tópicos" 
          options={filteredTopicsBySubject} 
          selectedValues={selectedFilters.subtopics || []} 
          onChange={handleFilterChange} 
          category="subtopics"
          placeholder={
            (selectedFilters.disciplines.length === 0)
              ? "Selecione uma disciplina primeiro"
              : (selectedFilters.topics.length === 0)
                ? "Selecione um assunto primeiro"
                : "Selecione os tópicos"
          }
        />
        
        <FilterGroup 
          title="Banca" 
          options={sortedOptions.institutions} 
          selectedValues={selectedFilters.institutions} 
          onChange={handleFilterChange} 
          category="institutions"
          placeholder="Selecione as bancas"
        />
        
        <FilterGroup 
          title="Instituição" 
          options={sortedOptions.organizations} 
          selectedValues={selectedFilters.organizations} 
          onChange={handleFilterChange} 
          category="organizations"
          placeholder="Selecione as instituições"
        />
        
        <FilterGroup 
          title="Cargo" 
          options={sortedOptions.roles} 
          selectedValues={selectedFilters.roles} 
          onChange={handleFilterChange} 
          category="roles"
          placeholder="Selecione os cargos"
        />
        
        <FilterGroup 
          title="Ano" 
          options={sortedOptions.years} 
          selectedValues={selectedFilters.years} 
          onChange={handleFilterChange} 
          category="years"
          placeholder="Selecione os anos"
        />
        
        <FilterGroup 
          title="Escolaridade" 
          options={sortedOptions.educationLevels} 
          selectedValues={selectedFilters.educationLevels} 
          onChange={handleFilterChange} 
          category="educationLevels"
          placeholder="Selecione a escolaridade"
        />
        
        <FilterGroup 
          title="Dificuldade" 
          options={sortedOptions.difficulty} 
          selectedValues={selectedFilters.difficulty} 
          onChange={handleFilterChange} 
          category="difficulty"
          placeholder="Selecione a dificuldade"
        />
      </div>

      <div className="flex justify-between">
        <Button 
          variant="outline" 
          className="text-gray-600 border-gray-300 hover:bg-gray-50" 
          onClick={clearAllFilters}
        >
          <X className="h-4 w-4 mr-2" />
          Limpar filtros
        </Button>
        
        <Button 
          className="bg-[#5f2ebe] hover:bg-[#4f25a0] text-white" 
          onClick={applyFiltersWithUrl}
        >
          Aplicar filtros
        </Button>
      </div>
    </>
  );

  return (
    <div className="bg-white rounded-lg mb-8">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between cursor-pointer py-6 pl-6 pr-0">
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <h3 className="text-lg font-medium text-[#272f3c]">Filtros</h3>
                <div className="p-1.5 ml-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-[#5f2ebe]" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-[#5f2ebe]" />
                  )}
                </div>
              </div>
              {activeFiltersCount > 0 && (
                <span className="bg-[#5f2ebe] text-white text-xs px-2 py-1 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </div>
            
            {rightElement && 
              <div className="flex items-center mr-0">
                {!isMobile && <span className="text-sm text-gray-600 mr-2">Questões por página:</span>}
                <div className="dropdown-wrapper" style={{width: "auto", marginRight: 0, paddingRight: 0}}>
                  {rightElement}
                </div>
              </div>
            }
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className={`px-6 pb-6 ${isOpen ? 'border-t border-gray-100 mt-4' : ''}`}>
          {filtersContent}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default QuestionFiltersPanel; 