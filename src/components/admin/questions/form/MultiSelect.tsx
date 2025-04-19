import React, { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, Plus, X, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export interface MultiSelectProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  maxDisplayItems?: number;
  clearable?: boolean;
  onAdd?: (value: string) => void;
}

export function MultiSelect({
  options = [],
  selected = [],
  onChange,
  placeholder = "Selecione...",
  disabled = false,
  className,
  maxDisplayItems = 3,
  clearable = true,
  onAdd,
}: MultiSelectProps) {
  // Garantir que options e selected sejam sempre arrays válidos
  const safeOptions = Array.isArray(options) ? options : [];
  const safeSelected = Array.isArray(selected) ? selected : [];
  
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);

  useEffect(() => {
    // Filtra as opções com base no texto de pesquisa
    if (inputValue.trim() === "") {
      setFilteredOptions(safeOptions);
    } else {
      const filtered = safeOptions.filter(option => 
        option.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredOptions(filtered);
    }
  }, [inputValue, safeOptions]);

  const displaySelectedOptions = maxDisplayItems 
    ? safeSelected.slice(0, maxDisplayItems) 
    : safeSelected;
  
  const remainingCount = safeSelected.length - displaySelectedOptions.length;
  
  const handleAddCustomOption = () => {
    if (inputValue.trim() && onAdd) {
      onAdd(inputValue.trim());
      setInputValue("");
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleUnselect = (option: string) => {
    onChange(safeSelected.filter(item => item !== option));
  };

  const handleClear = () => {
    onChange([]);
  };

  const handleToggleOption = (option: string) => {
    const isSelected = safeSelected.includes(option);
    onChange(
      isSelected
        ? safeSelected.filter(item => item !== option)
        : [...safeSelected, option]
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue && !safeOptions.includes(inputValue) && onAdd) {
      e.preventDefault();
      handleAddCustomOption();
    }
  };

  useEffect(() => {
    // Se o dropdown for fechado, limpar o valor do input
    if (!open) {
      setInputValue("");
    }
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          {safeSelected.length > 0 ? (
            <div className="flex flex-wrap gap-1 max-w-[90%] overflow-hidden">
              {displaySelectedOptions.map((option) => (
                <Badge
                  key={option}
                  variant="secondary"
                  className="mr-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUnselect(option);
                  }}
                >
                  {option}
                  <button
                    className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleUnselect(option);
                      }
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleUnselect(option);
                    }}
                  >
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </button>
                </Badge>
              ))}
              {remainingCount > 0 && (
                <Badge variant="secondary">+{remainingCount}</Badge>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <div className="flex flex-col w-full rounded-md border border-input bg-transparent">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              ref={inputRef}
              placeholder="Pesquisar opção..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          {onAdd && (
            <div className="px-2 py-1.5 text-sm border-t">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start font-normal"
                onClick={handleAddCustomOption}
                disabled={!inputValue.trim()}
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar "{inputValue.trim() || 'opção'}"
              </Button>
            </div>
          )}
          
          {filteredOptions.length === 0 && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Nenhuma opção encontrada.
            </div>
          )}
          
          <div className="max-h-[300px] overflow-y-auto p-1">
            {filteredOptions.map((option) => {
              const isSelected = safeSelected.includes(option);
              return (
                <div
                  key={option}
                  onClick={() => handleToggleOption(option)}
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
                  {option}
                </div>
              );
            })}
          </div>
          
          {clearable && safeSelected.length > 0 && (
            <div className="px-2 py-1.5 text-sm border-t">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start font-normal text-destructive"
                onClick={handleClear}
              >
                <X className="mr-2 h-4 w-4" />
                Limpar seleção
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
} 