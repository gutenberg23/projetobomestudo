
import React from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Edit, Trash, Plus } from "lucide-react";
import { CheckboxGroup } from "@/components/questions/CheckboxGroup";

interface SelectFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  handleEditOption: (oldValue: string) => void;
  handleDeleteOption: (value: string) => void;
  openAddDialog: () => void;
  placeholder?: string;
}

const SelectField: React.FC<SelectFieldProps> = ({
  id,
  label,
  value,
  onChange,
  options,
  handleEditOption,
  handleDeleteOption,
  openAddDialog,
  placeholder = "Selecione uma opção",
}) => {
  // Converter valor único para array para compatibilidade com CheckboxGroup
  const selectedValues = value ? [value] : [];
  
  // Função para lidar com mudanças no CheckboxGroup
  const handleChange = (optionValue: string) => {
    // Como precisamos de um valor único, apenas substitui o valor atual
    onChange(optionValue);
  };

  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="flex flex-col gap-2">
        <CheckboxGroup
          title=""
          options={options}
          selectedValues={selectedValues}
          onChange={handleChange}
          placeholder={placeholder}
        />
        
        <div className="flex gap-2 justify-end">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => value ? handleEditOption(value) : null}
            disabled={!value}
            title="Editar"
            type="button"
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => value ? handleDeleteOption(value) : null}
            disabled={!value}
            title="Excluir"
            type="button"
            className="h-8 w-8 p-0"
          >
            <Trash className="h-4 w-4" />
          </Button>
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
        </div>
      </div>
    </div>
  );
};

export default SelectField;
