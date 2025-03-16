import { useState, useEffect } from "react";
import { toast } from "sonner";

export interface SelectFieldStateDB<T> {
  value: string;
  setIsDialogOpen: (isOpen: boolean) => void;
  isDialogOpen: boolean;
  newValue: string;
  setNewValue: (value: string) => void;
  handleAdd: () => void;
  handleEdit: (oldValue: string) => void;
  handleDelete: (value: string) => void;
  loading: boolean;
  items: T[];
}

interface Item {
  id: string;
  nome?: string;
  valor?: string;
}

export const useSelectFieldStateDB = <T extends Item>(
  value: string,
  setValue: (value: string) => void,
  fieldName: string,
  fetchItems: () => Promise<T[]>,
  addItem: (nome: string) => Promise<T | null>,
  updateItem: (id: string, nome: string) => Promise<boolean>,
  deleteItem: (id: string) => Promise<boolean>,
  nameField: keyof T = 'nome' as keyof T
): SelectFieldStateDB<T> => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [newValue, setNewValue] = useState<string>("");
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Carregar itens do banco de dados
  useEffect(() => {
    const loadItems = async () => {
      setLoading(true);
      try {
        const fetchedItems = await fetchItems();
        setItems(fetchedItems);
      } catch (error) {
        console.error(`Erro ao carregar ${fieldName}:`, error);
        toast.error(`Erro ao carregar ${fieldName}. Tente novamente.`);
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, [fieldName, fetchItems]);

  const handleAdd = async () => {
    if (newValue.trim() === "") {
      toast.error(`O nome do ${fieldName} não pode estar vazio`);
      return;
    }

    try {
      const newItem = await addItem(newValue);
      if (newItem) {
        setItems([...items, newItem]);
        setNewValue("");
        setIsDialogOpen(false);
        toast.success(`${fieldName} adicionado com sucesso!`);
      }
    } catch (error) {
      console.error(`Erro ao adicionar ${fieldName}:`, error);
      toast.error(`Erro ao adicionar ${fieldName}. Tente novamente.`);
    }
  };

  const handleEdit = async (oldValue: string) => {
    const itemToEdit = items.find(item => String(item[nameField]) === oldValue);
    if (!itemToEdit) {
      toast.error(`${fieldName} não encontrado`);
      return;
    }

    const newValuePrompt = prompt(`Editar ${fieldName}`, oldValue);
    if (!newValuePrompt || newValuePrompt.trim() === "") return;

    try {
      const success = await updateItem(itemToEdit.id, newValuePrompt);
      if (success) {
        setItems(items.map(item => 
          item.id === itemToEdit.id 
            ? { ...item, [nameField]: newValuePrompt } as T
            : item
        ));
        
        if (value === oldValue) setValue(newValuePrompt);
        toast.success(`${fieldName} atualizado com sucesso!`);
      }
    } catch (error) {
      console.error(`Erro ao editar ${fieldName}:`, error);
      toast.error(`Erro ao editar ${fieldName}. Tente novamente.`);
    }
  };

  const handleDelete = async (valueToDelete: string) => {
    const itemToDelete = items.find(item => String(item[nameField]) === valueToDelete);
    if (!itemToDelete) {
      toast.error(`${fieldName} não encontrado`);
      return;
    }

    if (!confirm(`Deseja remover ${fieldName} "${valueToDelete}"?`)) return;

    try {
      const success = await deleteItem(itemToDelete.id);
      if (success) {
        setItems(items.filter(item => item.id !== itemToDelete.id));
        if (value === valueToDelete) setValue("");
        toast.success(`${fieldName} removido com sucesso!`);
      }
    } catch (error) {
      console.error(`Erro ao excluir ${fieldName}:`, error);
      toast.error(`Erro ao excluir ${fieldName}. Tente novamente.`);
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
    handleDelete,
    loading,
    items
  };
};
