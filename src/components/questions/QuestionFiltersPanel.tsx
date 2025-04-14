import React, { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Search, SlidersHorizontal, X } from "lucide-react";
import { CheckboxGroup } from "@/components/questions/CheckboxGroup";
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
  };
  handleFilterChange: (category: "topics" | "disciplines" | "institutions" | "organizations" | "roles" | "years" | "educationLevels" | "difficulty", value: string) => void;
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
  const [allQuestions, setAllQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Buscar questões para análise de tópicos por disciplina
  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('questoes')
          .select('discipline, topicos');
          
        if (error) throw error;
        
        if (data) {
          setAllQuestions(data);
          
          // Criar mapeamento de disciplinas para tópicos
          const topicsMap: Record<string, Set<string>> = {};
          
          data.forEach(question => {
            const discipline = question.discipline;
            const topics = question.topicos || [];
            
            if (discipline && topics.length > 0) {
              if (!topicsMap[discipline]) {
                topicsMap[discipline] = new Set();
              }
              
              topics.forEach((topic: string) => {
                topicsMap[discipline].add(topic);
              });
            }
          });
          
          // Converter Sets para arrays e ordenar
          const formattedMap: Record<string, string[]> = {};
          Object.keys(topicsMap).forEach(discipline => {
            formattedMap[discipline] = [...topicsMap[discipline]].sort((a, b) => 
              a.localeCompare(b)
            );
          });
          
          setTopicsByDiscipline(formattedMap);
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
    disciplines: [...filterOptions.disciplines].sort((a, b) => a.localeCompare(b)),
    topics: [...filterOptions.topics].sort((a, b) => a.localeCompare(b)),
    institutions: [...filterOptions.institutions].sort((a, b) => a.localeCompare(b)),
    organizations: [...filterOptions.organizations].sort((a, b) => a.localeCompare(b)),
    roles: [...filterOptions.roles].sort((a, b) => a.localeCompare(b)),
    years: [...filterOptions.years].sort((a, b) => b.localeCompare(a)), // Anos em ordem decrescente
    educationLevels: [...filterOptions.educationLevels].sort((a, b) => a.localeCompare(b)),
    difficulty: [...filterOptions.difficulty].sort((a, b) => a.localeCompare(b))
  };

  // Filtrar tópicos com base nas disciplinas selecionadas
  const filteredTopics = useMemo(() => {
    if (selectedFilters.disciplines.length === 0) {
      return [];
    }
    
    // Se tiver disciplinas selecionadas, mostrar apenas tópicos relacionados
    const topicsSet = new Set<string>();
    
    selectedFilters.disciplines.forEach(discipline => {
      const topics = topicsByDiscipline[discipline] || [];
      topics.forEach(topic => topicsSet.add(topic));
    });
    
    return [...topicsSet].sort((a, b) => a.localeCompare(b));
  }, [selectedFilters.disciplines, topicsByDiscipline]);

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
        params.set(key, values.join(','));
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
      difficulty: []
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
        <CheckboxGroup 
          title="Disciplina" 
          options={sortedOptions.disciplines} 
          selectedValues={selectedFilters.disciplines} 
          onChange={value => handleFilterChange("disciplines", value)} 
        />
        
        <CheckboxGroup 
          title="Assunto" 
          options={filteredTopics} 
          selectedValues={selectedFilters.topics} 
          onChange={value => handleFilterChange("topics", value)} 
          placeholder={
            selectedFilters.disciplines.length === 0 
              ? "Selecione uma disciplina primeiro" 
              : "Selecione os assuntos"
          }
        />
        
        <CheckboxGroup 
          title="Banca" 
          options={sortedOptions.institutions} 
          selectedValues={selectedFilters.institutions} 
          onChange={value => handleFilterChange("institutions", value)} 
        />
        
        <CheckboxGroup 
          title="Instituição" 
          options={sortedOptions.organizations} 
          selectedValues={selectedFilters.organizations} 
          onChange={value => handleFilterChange("organizations", value)} 
        />
        
        <CheckboxGroup 
          title="Cargo" 
          options={sortedOptions.roles} 
          selectedValues={selectedFilters.roles} 
          onChange={value => handleFilterChange("roles", value)} 
        />
        
        <CheckboxGroup 
          title="Ano" 
          options={sortedOptions.years} 
          selectedValues={selectedFilters.years} 
          onChange={value => handleFilterChange("years", value)} 
        />
        
        <CheckboxGroup 
          title="Escolaridade" 
          options={sortedOptions.educationLevels} 
          selectedValues={selectedFilters.educationLevels} 
          onChange={value => handleFilterChange("educationLevels", value)} 
        />

        <CheckboxGroup 
          title="Dificuldade" 
          options={sortedOptions.difficulty} 
          selectedValues={selectedFilters.difficulty} 
          onChange={value => handleFilterChange("difficulty", value)} 
        />
      </div>

      <div className="flex gap-2">
        <Button 
          onClick={applyFiltersWithUrl} 
          variant="flat" 
          className="flex-1"
        >
          Filtrar Questões
        </Button>
        
        {activeFiltersCount > 0 && (
          <Button 
            onClick={clearAllFilters} 
            variant="outline" 
            className="flex items-center gap-1"
          >
            <X className="h-4 w-4" />
            Remover filtros
          </Button>
        )}
      </div>
    </>
  );

  return (
    <div className="bg-white rounded-lg p-6 mb-8">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <CollapsibleTrigger asChild>
          <div className={`flex items-center justify-between cursor-pointer ${isOpen ? 'pb-4 mb-4 border-b border-gray-100' : ''}`}>
            <div className="flex items-center">
              <h3 className="text-lg font-medium text-[#272f3c]">Filtros</h3>
              {activeFiltersCount > 0 && (
                <span className="ml-2 bg-[#5f2ebe] text-white text-xs px-2 py-1 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </div>
            <div className="flex items-center">
              {rightElement && <div className="flex items-center space-x-2 mr-3">
                {!isMobile && <span className="text-sm text-gray-600">Questões por página:</span>}
                {rightElement}
              </div>}
              <div className="flex items-center bg-gray-100 hover:bg-gray-200 rounded-md px-2 py-1 transition-colors">
                <SlidersHorizontal className="h-4 w-4 mr-1 text-[#5f2ebe]" />
                <span className="text-sm text-gray-700 mr-1">
                  {isOpen ? "Ocultar filtros" : "Mostrar filtros"}
                </span>
                {isOpen ? (
                  <ChevronUp className="h-4 w-4 text-[#5f2ebe]" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-[#5f2ebe]" />
                )}
              </div>
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          {filtersContent}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default QuestionFiltersPanel;
