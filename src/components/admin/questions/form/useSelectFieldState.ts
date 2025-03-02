
import { useState } from "react";
import { toast } from "sonner";

export interface SelectFieldState {
  value: string;
  setIsDialogOpen: (isOpen: boolean) => void;
  isDialogOpen: boolean;
  newValue: string;
  setNewValue: (value: string) => void;
  handleAdd: () => void;
  handleEdit: (oldValue: string) => void;
  handleDelete: (value: string) => void;
}

export const useSelectFieldState = (
  value: string,
  setValue: (value: string) => void,
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
    const newValue = prompt(`Editar ${fieldName}`, oldValue);
    if (newValue && newValue.trim() !== "") {
      setValues(values.map(v => v === oldValue ? newValue : v));
      if (value === oldValue) setValue(newValue);
    }
  };

  const handleDelete = (valueToDelete: string) => {
    if (confirm(`Deseja remover ${fieldName} "${valueToDelete}"?`)) {
      setValues(values.filter(v => v !== valueToDelete));
      if (value === valueToDelete) setValue("");
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
