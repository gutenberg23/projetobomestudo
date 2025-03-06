
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckboxGroupProps {
  title: string;
  options: string[];
  selectedValues: string[];
  onChange: (value: string) => void;
  placeholder?: string;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  title,
  options,
  selectedValues,
  onChange,
  placeholder = "Selecione os itens"
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);
  const closeDropdown = () => setIsOpen(false);

  return (
    <div className="relative w-full">
      {title && <div className="font-medium text-sm mb-1">{title}</div>}
      
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
            ? `${selectedValues.length} ${selectedValues.length === 1 ? 'tópico selecionado' : 'tópicos selecionados'}`
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
            {options.length > 0 ? (
              <div className="space-y-1 p-2">
                {options.map((option) => (
                  <div key={option} className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100">
                    <div
                      className={cn(
                        "h-4 w-4 rounded border flex items-center justify-center",
                        selectedValues.includes(option)
                          ? "bg-[#ea2be2] border-[#ea2be2]"
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
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 p-2">
                Nenhuma opção disponível
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
