import { useState } from "react";
import { toast } from "sonner";

export interface SelectFieldState {
  value: string;
  isAddDialogOpen: boolean;
  newValue: string;
  setNewValue: (value: string) => void;
  handleAddOption: () => void;
  handleEditOption: (oldValue: string) => void;
  handleDeleteOption: (value: string) => void;
  openAddDialog: () => void;
  setIsOpen: (open: boolean) => void;
}

export const useSelectFieldState = (
  value: string,
  setValue: (value: string) => void,
  values: string[],
  setValues: (values: string[]) => void,
  fieldName: string
): SelectFieldState => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [newValue, setNewValue] = useState<string>("");

  const handleAddOption = () => {
    if (newValue.trim() !== "") {
      if (values.includes(newValue.trim())) {
        toast.error(`${fieldName} já existe!`);
        return;
      }
      setValues([...values, newValue.trim()]);
      setNewValue("");
      setIsAddDialogOpen(false);
      toast.success(`${fieldName} adicionado com sucesso!`);
    }
  };

  const handleEditOption = (oldValue: string) => {
    const newValue = prompt(`Editar ${fieldName}`, oldValue);
    if (newValue && newValue.trim() !== "") {
      if (values.includes(newValue.trim()) && newValue.trim() !== oldValue) {
        toast.error(`${fieldName} já existe!`);
        return;
      }
      setValues(values.map(v => v === oldValue ? newValue.trim() : v));
      if (value === oldValue) setValue(newValue.trim());
      toast.success(`${fieldName} editado com sucesso!`);
    }
  };

  const handleDeleteOption = (valueToDelete: string) => {
    if (confirm(`Deseja remover ${fieldName} "${valueToDelete}"?`)) {
      setValues(values.filter(v => v !== valueToDelete));
      if (value === valueToDelete) setValue("");
      toast.success(`${fieldName} removido com sucesso!`);
    }
  };

  const openAddDialog = () => {
    setIsAddDialogOpen(true);
  };

  const setIsOpen = (open: boolean) => {
    setIsAddDialogOpen(open);
    if (!open) {
      setNewValue("");
    }
  };

  return {
    value,
    isAddDialogOpen,
    newValue,
    setNewValue,
    handleAddOption,
    handleEditOption,
    handleDeleteOption,
    openAddDialog,
    setIsOpen
  };
};
