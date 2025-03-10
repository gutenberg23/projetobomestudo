
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CheckIcon, ChevronDownIcon, ChevronRightIcon, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { TopicOption } from "@/components/new/types";

interface CheckboxGroupProps {
  title: string;
  options: string[] | TopicOption[];
  selectedValues: string[];
  onChange: (value: string) => void;
  placeholder?: string;
  hierarchical?: boolean;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  title,
  options,
  selectedValues,
  onChange,
  placeholder = "Selecione os itens",
  hierarchical = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<string[] | TopicOption[]>(options);
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});

  const toggleDropdown = () => setIsOpen(!isOpen);
  const closeDropdown = () => setIsOpen(false);

  // Organizar opções em hierarquia se necessário
  const hierarchicalOptions = React.useMemo(() => {
    if (!hierarchical || options.length === 0) {
      // Se não for hierárquico ou se options for um array de strings, retorna as opções ordenadas alfabeticamente
      return [...options].sort((a, b) => {
        const aStr = typeof a === 'string' ? a : a.name;
        const bStr = typeof b === 'string' ? b : b.name;
        return aStr.localeCompare(bStr);
      });
    }

    // Verificamos se estamos lidando com TopicOption[]
    if (typeof options[0] !== 'string') {
      // Primeiro ordenamos todas as opções
      const sortedOptions = [...(options as TopicOption[])].sort((a, b) => a.name.localeCompare(b.name));
      return sortedOptions;
    }
    
    return options;
  }, [options, hierarchical]);

  // Filtrar opções quando o termo de busca mudar
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredOptions(hierarchicalOptions);
      return;
    }
    
    const searchTermLower = searchTerm.toLowerCase();
    
    if (hierarchical && typeof options[0] !== 'string') {
      // Para opções hierárquicas, filtramos TopicOption[]
      const filtered = (hierarchicalOptions as TopicOption[]).filter(option => 
        option.name.toLowerCase().includes(searchTermLower)
      );
      setFilteredOptions(filtered);
    } else if (typeof options[0] === 'string') {
      // Se todas as opções são strings
      const filtered = (hierarchicalOptions as string[]).filter(option => 
        option.toLowerCase().includes(searchTermLower)
      );
      setFilteredOptions(filtered);
    } else {
      // Se todas as opções são TopicOption
      const filtered = (hierarchicalOptions as TopicOption[]).filter(option => 
        option.name.toLowerCase().includes(searchTermLower)
      );
      setFilteredOptions(filtered);
    }
  }, [searchTerm, hierarchicalOptions, options, hierarchical]);

  // Atualizar as opções filtradas quando as opções mudarem
  useEffect(() => {
    setFilteredOptions(hierarchicalOptions);
  }, [hierarchicalOptions]);

  // Função para alternar a expansão de um tópico
  const toggleExpand = (id: string) => {
    setExpandedTopics(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Renderiza uma opção de tópico hierárquica
  const renderHierarchicalOption = (option: TopicOption) => {
    const hasChildren = hierarchical && Array.isArray(options) && 
      typeof options[0] !== 'string' &&
      (options as TopicOption[]).some(o => o.parent === option.id);
    
    const isExpanded = expandedTopics[option.id];
    
    return (
      <div key={option.id} className="flex flex-col">
        <div 
          className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100"
          style={{ paddingLeft: `${option.level * 12 + 8}px` }}
        >
          {hasChildren && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(option.id);
              }}
              className="flex items-center justify-center h-4 w-4 text-gray-500"
            >
              {isExpanded ? <ChevronDownIcon className="h-3 w-3" /> : <ChevronRightIcon className="h-3 w-3" />}
            </button>
          )}
          
          {!hasChildren && <div className="w-4"></div>}
          
          <div
            className={cn(
              "h-4 w-4 rounded border flex items-center justify-center",
              selectedValues.includes(option.id)
                ? "bg-[#5f2ebe] border-[#5f2ebe]"
                : "border-gray-300"
            )}
            onClick={() => onChange(option.id)}
          >
            {selectedValues.includes(option.id) && (
              <CheckIcon className="h-3 w-3 text-white" />
            )}
          </div>
          <label
            onClick={() => onChange(option.id)}
            className="text-sm font-medium text-[#67748a] cursor-pointer"
          >
            {option.name}
          </label>
        </div>
        
        {/* Renderiza filhos se estiver expandido */}
        {isExpanded && hasChildren && (
          <div className="ml-4">
            {(options as TopicOption[])
              .filter(o => o.parent === option.id)
              .sort((a, b) => a.name.localeCompare(b.name))
              .map(child => renderHierarchicalOption(child))
            }
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative w-full">
      {title && <div className="font-medium text-sm mb-1">{title}</div>}
      
      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={isOpen}
        className="w-full justify-between h-10"
        onClick={toggleDropdown}
      >
        <span className="truncate">
          {selectedValues.length > 0 
            ? `${selectedValues.length} ${selectedValues.length === 1 ? 'item selecionado' : 'itens selecionados'}`
            : placeholder}
        </span>
        <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={closeDropdown}
          />
          <div 
            className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-white py-1 shadow-lg"
          >
            <div className="p-2">
              <div className="relative mb-2">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              
              {filteredOptions.length > 0 ? (
                <div className="space-y-1">
                  {hierarchical && typeof filteredOptions[0] !== 'string' ? (
                    // Renderiza opções hierárquicas
                    (filteredOptions as TopicOption[])
                      .filter(option => !option.parent) // Apenas tópicos raiz
                      .map(option => renderHierarchicalOption(option))
                  ) : (
                    // Renderiza opções simples
                    typeof filteredOptions[0] === 'string' ?
                      // Se for array de strings
                      (filteredOptions as string[]).map((option) => (
                        <div key={option} className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100">
                          <div
                            className={cn(
                              "h-4 w-4 rounded border flex items-center justify-center",
                              selectedValues.includes(option)
                                ? "bg-[#5f2ebe] border-[#5f2ebe]"
                                : "border-gray-300"
                            )}
                            onClick={() => onChange(option)}
                          >
                            {selectedValues.includes(option) && (
                              <CheckIcon className="h-3 w-3 text-white" />
                            )}
                          </div>
                          <label
                            onClick={() => onChange(option)}
                            className="text-sm font-medium text-[#67748a] cursor-pointer"
                          >
                            {option}
                          </label>
                        </div>
                      ))
                      :
                      // Se for array de TopicOption
                      (filteredOptions as TopicOption[]).map((option) => (
                        <div key={option.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100">
                          <div
                            className={cn(
                              "h-4 w-4 rounded border flex items-center justify-center",
                              selectedValues.includes(option.id)
                                ? "bg-[#5f2ebe] border-[#5f2ebe]"
                                : "border-gray-300"
                            )}
                            onClick={() => onChange(option.id)}
                          >
                            {selectedValues.includes(option.id) && (
                              <CheckIcon className="h-3 w-3 text-white" />
                            )}
                          </div>
                          <label
                            onClick={() => onChange(option.id)}
                            className="text-sm font-medium text-[#67748a] cursor-pointer"
                          >
                            {option.name}
                          </label>
                        </div>
                      ))
                  )}
                </div>
              ) : (
                <div className="text-sm text-gray-500 p-2">
                  Nenhuma opção encontrada
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
