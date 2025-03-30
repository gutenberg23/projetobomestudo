import React from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Edit, Trash, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  // Garantir que as opções estão em ordem alfabética
  const sortedOptions = [...options].sort((a, b) => a.localeCompare(b));

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className="w-full h-10">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {sortedOptions.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <div className="flex gap-2">
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
  );
};

export default SelectField;
