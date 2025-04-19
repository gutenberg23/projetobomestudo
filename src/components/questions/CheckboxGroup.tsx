import React, { useState, useEffect, useMemo, ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, Edit, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export interface CheckboxGroupProps {
  title?: string;
  options: string[];
  selectedValues: string[];
  placeholder?: string;
  onChange: (value: string, checked: boolean) => void;
  handleEditOption?: (value: string) => void;
  handleDeleteOption?: (value: string) => void;
  openAddDialog?: () => void;
}

export function CheckboxGroup({
  title = '',
  options = [],
  selectedValues = [],
  placeholder = 'Filtrar opções...',
  onChange,
  handleEditOption,
  handleDeleteOption,
  openAddDialog,
}: CheckboxGroupProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Garantir que options e selectedValues sejam arrays
  const safeOptions = Array.isArray(options) ? options : [];
  const safeSelectedValues = Array.isArray(selectedValues) ? selectedValues : [];
  
  // Filtra as opções com base na consulta de pesquisa
  const filteredOptions = useMemo(() => {
    // Se não houver consulta, retorna todas as opções que não estejam selecionadas
    if (!searchQuery) {
      return safeOptions.filter(option => !safeSelectedValues.includes(option));
    }
    
    // Filtrar baseado na consulta e excluir itens já selecionados
    const query = searchQuery.toLowerCase();
    return safeOptions.filter(
      option => 
        option.toLowerCase().includes(query) && 
        !safeSelectedValues.includes(option)
    );
  }, [searchQuery, safeOptions, safeSelectedValues]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Remover item selecionado
  const handleRemoveSelected = (value: string) => {
    onChange(value, false);
  };
  
  return (
    <div className="space-y-4">
      {title && <h3 className="text-sm font-medium">{title}</h3>}
      
      {/* Campo de pesquisa */}
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          className="pl-8 h-9"
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>
      
      {/* Exibir itens selecionados */}
      {safeSelectedValues.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {safeSelectedValues.map((value) => (
            <Badge key={value} variant="secondary" className="flex items-center gap-1">
              {value}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 text-muted-foreground hover:text-foreground"
                onClick={() => handleRemoveSelected(value)}
              >
                <span className="sr-only">Remover {value}</span>
                ×
              </Button>
            </Badge>
          ))}
        </div>
      )}
      
      {/* Filtro */}
      <div className="flex items-center gap-2">
        <Input
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-8"
        />
        
        {openAddDialog && (
          <Button 
            variant="outline" 
            size="sm"
            className="h-8"
            onClick={openAddDialog}
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            Adicionar
          </Button>
        )}
      </div>
      
      {/* Lista de opções */}
      <div className="border rounded-md">
        <ScrollArea className="h-[200px]">
          {filteredOptions.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground text-center">
              Nenhuma opção encontrada
            </div>
          ) : (
            <div className="p-2">
              {filteredOptions.map((option) => (
                <div key={option} className="flex items-center justify-between py-1 px-2 hover:bg-muted rounded-md">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`option-${option}`}
                      checked={safeSelectedValues.includes(option)}
                      onCheckedChange={(checked) => onChange(option, checked === true)}
                    />
                    <Label 
                      htmlFor={`option-${option}`}
                      className="text-sm cursor-pointer"
                    >
                      {option}
                    </Label>
                  </div>
                  
                  {/* Botões de editar e excluir */}
                  {(handleEditOption || handleDeleteOption) && (
                    <div className="flex items-center gap-1">
                      {handleEditOption && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditOption(option)}
                        >
                          <Edit className="h-3 w-3" />
                          <span className="sr-only">Editar {option}</span>
                        </Button>
                      )}
                      
                      {handleDeleteOption && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteOption(option)}
                        >
                          <Trash2 className="h-3 w-3" />
                          <span className="sr-only">Excluir {option}</span>
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
