
import { useState } from "react";
import { toast } from "sonner";

export interface SelectFieldState {
  value: string[];
  setIsDialogOpen: (isOpen: boolean) => void;
  isDialogOpen: boolean;
  newValue: string;
  setNewValue: (value: string) => void;
  handleAdd: () => void;
  handleEdit: (oldValue: string) => void;
  handleDelete: (value: string) => void;
}

export const useSelectFieldState = (
  value: string[],
  setValue: (value: string[]) => void,
  values: string[],
  setValues: (values: string[]) => void,
  fieldName: string
): SelectFieldState => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [newValue, setNewValue] = useState<string>("");

  const handleAdd = () => {
    if (newValue.trim() !== "") {
      setValues([...values, newValue]);
      setNewValue("");
      setIsDialogOpen(false);
    }
  };

  const handleEdit = (oldValue: string) => {
    const newValuePrompt = prompt(`Editar ${fieldName}`, oldValue);
    if (newValuePrompt && newValuePrompt.trim() !== "") {
      setValues(values.map(v => v === oldValue ? newValuePrompt : v));
      if (value.includes(oldValue)) {
        setValue(value.map(v => v === oldValue ? newValuePrompt : v));
      }
    }
  };

  const handleDelete = (valueToDelete: string) => {
    if (confirm(`Deseja remover ${fieldName} "${valueToDelete}"?`)) {
      setValues(values.filter(v => v !== valueToDelete));
      if (value.includes(valueToDelete)) {
        setValue(value.filter(v => v !== valueToDelete));
      }
    }
  };

  return {
    value,
    setIsDialogOpen,
    isDialogOpen,
    newValue,
    setNewValue,
    handleAdd,
    handleEdit,
    handleDelete
  };
};
