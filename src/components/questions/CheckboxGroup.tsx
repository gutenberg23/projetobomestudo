import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { CheckIcon, ChevronDownIcon, Search, Edit, Trash, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface CheckboxGroupProps {
  title: string;
  options: string[];
  selectedValues: string[];
  onChange: (value: string, checked: boolean) => void;
  handleEditOption?: (oldValue: string) => void;
  handleDeleteOption?: (value: string) => void;
  openAddDialog?: () => void;
  placeholder?: string;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  title,
  options,
  selectedValues,
  onChange,
  handleEditOption,
  handleDeleteOption,
  openAddDialog,
  placeholder = "Selecione os itens"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string>('');

  const toggleDropdown = () => setIsOpen(!isOpen);
  const closeDropdown = () => setIsOpen(false);

  // Memoize sortedOptions para evitar recriação a cada renderização
  const sortedOptions = useMemo(() => {
    return [...options].sort((a, b) => a.localeCompare(b));
  }, [options]);

  // Filtrar opções quando o termo de busca ou sortedOptions mudar
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredOptions(sortedOptions);
    } else {
      const filtered = sortedOptions.filter(option => 
        option.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOptions(filtered);
    }
  }, [searchTerm, sortedOptions]);

  // Inicializar as opções filtradas quando o componente montar
  useEffect(() => {
    setFilteredOptions(sortedOptions);
  }, []); // Executa apenas na montagem do componente

  return (
    <div className="flex flex-col gap-2">
      {title && <div className="font-medium text-sm">{title}</div>}
      
      <div className="relative w-full">
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className="w-full justify-between"
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
                    {filteredOptions.map((option) => (
                      <div 
                        key={option} 
                        className={cn(
                          "flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100",
                          selectedOption === option && "bg-gray-100"
                        )}
                        onClick={() => {
                          const isSelected = selectedValues.includes(option);
                          onChange(option, !isSelected);
                          setSelectedOption(option);
                        }}
                      >
                        <div
                          className={cn(
                            "h-4 w-4 rounded border flex items-center justify-center",
                            selectedValues.includes(option)
                              ? "bg-[#5f2ebe] border-[#5f2ebe]"
                              : "border-gray-300"
                          )}
                        >
                          {selectedValues.includes(option) && (
                            <CheckIcon className="h-3 w-3 text-white" />
                          )}
                        </div>
                        <label
                          className="text-sm font-medium text-[#67748a] cursor-pointer"
                        >
                          {option}
                        </label>
                      </div>
                    ))}
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

      {(handleEditOption || handleDeleteOption || openAddDialog) && (
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => selectedOption && handleEditOption?.(selectedOption)}
            disabled={!selectedOption || !handleEditOption}
            title="Editar"
            type="button"
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => selectedOption && handleDeleteOption?.(selectedOption)}
            disabled={!selectedOption || !handleDeleteOption}
            title="Excluir"
            type="button"
            className="h-8 w-8 p-0"
          >
            <Trash className="h-4 w-4" />
          </Button>
          {openAddDialog && (
            <Button 
              variant="outline" 
              size="icon" 
              onClick={openAddDialog}
              title="Adicionar"
              type="button"
              className="h-8 w-8 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
