import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Search, X, ChevronsUpDown, Check } from "lucide-react";
import { FilterGroup } from "@/components/questions/FilterGroup";
import { useSearchParams } from "react-router-dom";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

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
  totalCount?: number; // Nova prop para o total de questões
}

const QuestionFiltersPanel: React.FC<QuestionFiltersPanelProps> = ({
  searchQuery,
  setSearchQuery,
  selectedFilters,
  handleFilterChange,
  handleApplyFilters,
  questionsPerPage,
  filterOptions,
  rightElement,
  totalCount // Nova prop
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
    disciplines: [...new Set(filterOptions.disciplines)].filter(Boolean).sort((a, b) => String(a).localeCompare(String(b))),
    topics: [...new Set(filterOptions.topics)].filter(Boolean).sort((a, b) => String(a).localeCompare(String(b))),
    institutions: [...new Set(filterOptions.institutions)].filter(Boolean).sort((a, b) => String(a).localeCompare(String(b))),
    organizations: [...new Set(filterOptions.organizations)].filter(Boolean).sort((a, b) => String(a).localeCompare(String(b))),
    roles: [...new Set(filterOptions.roles)].filter(Boolean).sort((a, b) => String(a).localeCompare(String(b))),
    years: [...new Set(filterOptions.years)].filter(Boolean).sort((a, b) => String(b).localeCompare(String(a))), // Anos em ordem decrescente
    educationLevels: [...new Set(filterOptions.educationLevels)].filter(Boolean).sort((a, b) => String(a).localeCompare(String(b))),
    difficulty: [...new Set(filterOptions.difficulty)].filter(Boolean).sort((a, b) => String(a).localeCompare(String(b)))
  };

  // Organizar assuntos por disciplina para exibição hierárquica
  const organizedSubjects = useMemo(() => {
    if (selectedFilters.disciplines.length === 0) {
      return [];
    }
    
    const result: Array<{discipline: string, subjects: string[]}> = [];
    
    selectedFilters.disciplines.forEach((discipline: string) => {
      const subjects = subjectsByDiscipline[discipline] || [];
      if (subjects.length > 0) {
        result.push({
          discipline,
          subjects: subjects.sort((a, b) => String(a).localeCompare(String(b)))
        });
      }
    });
    
    return result;
  }, [selectedFilters.disciplines, subjectsByDiscipline]);

  // Organizar tópicos por assunto para exibição hierárquica  
  const organizedTopics = useMemo(() => {
    if (selectedFilters.topics.length === 0) {
      // Se não houver assuntos selecionados, mostrar tópicos agrupados por disciplina
      if (selectedFilters.disciplines.length > 0) {
        const result: Array<{groupName: string, topics: string[]}> = [];
        
        selectedFilters.disciplines.forEach((discipline: string) => {
          const topics = topicsByDiscipline[discipline] || [];
          if (topics.length > 0) {
            result.push({
              groupName: `Disciplina: ${discipline}`,
              topics: topics.sort((a, b) => String(a).localeCompare(String(b)))
            });
          }
        });
        
        return result;
      }
      return [];
    }
    
    // Se tiver assuntos selecionados, mostrar tópicos agrupados por assunto
    const result: Array<{groupName: string, topics: string[]}> = [];
    
    selectedFilters.topics.forEach((subject: string) => {
      const topics = topicsBySubject[subject] || [];
      if (topics.length > 0) {
        result.push({
          groupName: `Assunto: ${subject}`,
          topics: topics.sort((a, b) => String(a).localeCompare(String(b)))
        });
      }
    });
    
    return result;
  }, [selectedFilters.topics, selectedFilters.disciplines, topicsBySubject, topicsByDiscipline]);

  // Componente para exibir filtros hierárquicos com busca
  const HierarchicalFilter = ({ 
    title, 
    groups, 
    selectedValues, 
    onChange, 
    category,
    placeholder 
  }: {
    title: string;
    groups: Array<{groupName: string, topics?: string[], subjects?: string[]}>;
    selectedValues: string[];
    onChange: (category: any, value: string) => void;
    category: any;
    placeholder: string;
  }) => {
    const [open, setOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const hasItems = groups.length > 0 && groups.some(group => (group.topics || group.subjects || []).length > 0);
    
    // Filtrar grupos baseado na busca
    const filteredGroups = useMemo(() => {
      if (!searchValue.trim()) return groups;
      
      return groups.map(group => {
        const items = group.topics || group.subjects || [];
        const filteredItems = items.filter(item => 
          item.toLowerCase().includes(searchValue.toLowerCase())
        );
        
        return {
          ...group,
          topics: group.topics ? filteredItems : undefined,
          subjects: group.subjects ? filteredItems : undefined
        };
      }).filter(group => {
        const items = group.topics || group.subjects || [];
        return items.length > 0;
      });
    }, [groups, searchValue]);
    
    // Limpar busca quando fechar dropdown
    useEffect(() => {
      if (!open) {
        setSearchValue("");
      }
    }, [open]);
    
    const handleItemClick = (item: string, e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      onChange(category, item);
      // NÃO fechar o dropdown para permitir seleção múltipla
      // setOpen(false);
    };
    
    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      // Limpar todos os itens selecionados
      selectedValues.forEach(value => {
        onChange(category, value);
      });
    };
    
    // Função para lidar com mudanças no estado do popover
    const handleOpenChange = (isOpen: boolean) => {
      // Evitar fechamento automático em alguns casos
      if (isOpen || selectedValues.length > 0) {
        setOpen(isOpen);
      }
    };
    
    return (
      <div className="space-y-2">
        <h3 className="text-sm font-medium">{title}</h3>
        <Popover open={open} onOpenChange={handleOpenChange}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
              disabled={!hasItems}
              onClick={(e) => {
                e.stopPropagation();
                setOpen(!open);
              }}
            >
              {selectedValues.length > 0 ? (
                <span className="text-foreground">
                  {selectedValues.length === 1 
                    ? `1 item selecionado` 
                    : `${selectedValues.length} itens selecionados`
                  }
                </span>
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <div className="flex flex-col w-full rounded-md border border-input bg-transparent">
              {hasItems && (
                <div className="flex items-center border-b px-3">
                  <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                  <Input
                    placeholder="Pesquisar..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}
              
              {!hasItems ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  {placeholder}
                </div>
              ) : filteredGroups.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Nenhum item encontrado.
                </div>
              ) : (
                <div className="max-h-[300px] overflow-y-auto">
                  {filteredGroups.map((group, groupIndex) => {
                    const items = group.topics || group.subjects || [];
                    if (items.length === 0) return null;
                    
                    return (
                      <div key={groupIndex} className="border-b last:border-b-0">
                        <div className="px-3 py-2 bg-gray-50 border-b text-xs font-medium text-gray-600 sticky top-0 z-10">
                          {group.groupName}
                        </div>
                        <div className="p-1">
                          {items.map((item) => {
                            const isSelected = selectedValues.includes(item);
                            return (
                              <div 
                                key={item}
                                onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                handleItemClick(item, e);
                                // Manter o foco no popover após a seleção
                                e.nativeEvent.stopImmediatePropagation();
                              }}
                                className={cn(
                                  "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                                  isSelected ? "bg-accent text-accent-foreground" : ""
                                )}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    isSelected ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {item}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {selectedValues.length > 0 && (
                <div className="px-2 py-1.5 text-sm border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start font-normal text-destructive"
                    onClick={(e) => handleClear(e)}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Limpar seleção
                  </Button>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  };

  // Função para criar o mapeamento de nomes dos filtros
  const getFilterDisplayNames = () => {
    return {
      disciplines: 'Disciplina',
      topics: 'Assunto',
      subtopics: 'Tópicos',
      institutions: 'Banca',
      organizations: 'Instituição',
      roles: 'Cargo',
      years: 'Ano',
      educationLevels: 'Escolaridade',
      difficulty: 'Dificuldade'
    };
  };

  // Função para remover um filtro específico
  const removeSpecificFilter = (filterKey: string, valueToRemove: string) => {
    if (filterKey === 'search') {
      setLocalSearchQuery("");
      setSearchQuery("");
    } else {
      // Usar handleFilterChange para atualizar o filtro
      handleFilterChange(filterKey as any, valueToRemove); // Isso vai toggle/remover o item
    }
    
    // Atualizar a URL após remover o filtro
    setTimeout(() => {
      updateUrlWithFilters();
    }, 100);
  };

  // Função para renderizar os filtros aplicados
  const renderAppliedFilters = () => {
    const filterDisplayNames = getFilterDisplayNames();
    const appliedFilters = [];

    // Adicionar query de pesquisa se existir
    if (localSearchQuery.trim()) {
      appliedFilters.push({
        key: 'search',
        label: 'Pesquisa',
        values: [localSearchQuery.trim()]
      });
    }

    // Adicionar filtros selecionados
    Object.entries(selectedFilters).forEach(([key, values]) => {
      if (values && values.length > 0) {
        const displayName = filterDisplayNames[key as keyof typeof filterDisplayNames];
        if (displayName) {
          appliedFilters.push({
            key: key,
            label: displayName,
            values: values
          });
        }
      }
    });

    if (appliedFilters.length === 0) {
      return null;
    }

    return (
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Filtros Aplicados:</h4>
        <div className="space-y-3">
          {appliedFilters.map((filter, index) => (
            <div key={index} className="text-sm">
              <span className="font-medium text-gray-900">{filter.label}: </span>
              <div className="inline-flex flex-wrap gap-2 mt-1">
                {filter.values.map((value, valueIndex) => (
                  <span 
                    key={valueIndex}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-[#5f2ebe] text-white text-xs rounded-full"
                  >
                    {value}
                    <button
                      onClick={() => removeSpecificFilter(filter.key, value)}
                      className="ml-1 hover:bg-[#4f25a0] rounded-full p-0.5 transition-colors"
                      title={`Remover ${value}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
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
    
    // Atualizar a URL e aplicar os filtros vazios
    setTimeout(() => {
      updateUrlWithFilters();
      handleApplyFilters();
    }, 100);
  };

  // Atualizar a URL com os filtros selecionados (otimizado para evitar URLs muito longas)
  const updateUrlWithFilters = useCallback(() => {
    const params = new URLSearchParams();
    
    // Adicionar consulta de pesquisa
    if (localSearchQuery) {
      params.set('q', localSearchQuery);
    }
    
    // Adicionar filtros selecionados (apenas os primeiros 100 itens de cada categoria para evitar URLs muito longas)
    Object.entries(selectedFilters).forEach(([key, values]) => {
      if (values.length) {
        // Limitar a 100 itens por categoria para evitar URLs muito longas
        const limitedValues = values.slice(0, 100);
        params.set(key, limitedValues.join(','));
      }
    });
    
    // Adicionar questões por página
    params.set('perPage', questionsPerPage);
    
    // Atualizar a URL sem recarregar a página
    setSearchParams(params);
  }, [localSearchQuery, selectedFilters, questionsPerPage, setSearchParams]);

  // Aplicar filtros e atualizar URL
  const applyFiltersWithUrl = () => {
    setSearchQuery(localSearchQuery);
    updateUrlWithFilters();
    handleApplyFilters();
    if (isMobile) {
      setIsOpen(false);
    }
  };

  // Atualizar URL quando os filtros mudarem (com debounce para evitar atualizações frequentes)
  useEffect(() => {
    const timer = setTimeout(() => {
      updateUrlWithFilters();
    }, 1000); // Atualizar a URL após 1 segundo de inatividade nos filtros
    
    return () => clearTimeout(timer);
  }, [localSearchQuery, selectedFilters, questionsPerPage, updateUrlWithFilters]);

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
        
        <HierarchicalFilter
          title="Assunto"
          groups={organizedSubjects.map(item => ({
            groupName: `Disciplina: ${item.discipline}`,
            subjects: item.subjects
          }))}
          selectedValues={selectedFilters.topics}
          onChange={(category, value) => handleFilterChange(category, value)}
          category="topics"
          placeholder="Selecione uma disciplina primeiro"
        />
        
        <HierarchicalFilter
          title="Tópicos"
          groups={organizedTopics}
          selectedValues={selectedFilters.subtopics || []}
          onChange={(category, value) => handleFilterChange(category, value)}
          category="subtopics"
          placeholder={
            selectedFilters.disciplines.length === 0
              ? "Selecione uma disciplina primeiro"
              : selectedFilters.topics.length === 0
                ? "Selecione um assunto primeiro"
                : "Nenhum tópico disponível"
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
        
        {/* Filtro de Cargo removido conforme solicitado */}
        
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

      {/* Mostrar filtros aplicados */}
      {renderAppliedFilters()}

      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="text-gray-600 border-gray-300 hover:bg-gray-50" 
            onClick={clearAllFilters}
          >
            <X className="h-4 w-4 mr-2" />
            Limpar filtros
          </Button>
          
          <Button 
            className="bg-[#5f2ebe] text-white hover:bg-[#4f25a0]" 
            onClick={applyFiltersWithUrl}
          >
            Aplicar filtros
          </Button>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Mostrar o total de questões encontradas */}
          {totalCount !== undefined && (
            <div className="text-sm text-gray-600">
              {totalCount} {totalCount === 1 ? 'questão encontrada' : 'questões encontradas'}
            </div>
          )}
        </div>
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