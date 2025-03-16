import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash } from "lucide-react";
import AddValueDialog from "./AddValueDialog";
import { Skeleton } from "@/components/ui/skeleton";

interface SelectFieldDBProps<T> {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  items: T[];
  loading: boolean;
  nameField?: keyof T;
  handleEditOption?: (value: string) => void;
  handleDeleteOption?: (value: string) => void;
  openAddDialog?: () => void;
  isDialogOpen?: boolean;
  setIsDialogOpen?: (isOpen: boolean) => void;
  newValue?: string;
  setNewValue?: (value: string) => void;
  handleAdd?: () => void;
  placeholder?: string;
}

function SelectFieldDB<T extends { id: string; nome?: string; valor?: string }>({
  id,
  label,
  value,
  onChange,
  items,
  loading,
  nameField = 'nome' as keyof T,
  handleEditOption,
  handleDeleteOption,
  openAddDialog,
  isDialogOpen,
  setIsDialogOpen,
  newValue,
  setNewValue,
  handleAdd,
  placeholder = "Selecione uma opção"
}: SelectFieldDBProps<T>) {
  if (loading) {
    return (
      <div className="space-y-1 mb-2">
        <Label htmlFor={id} className="block text-sm font-medium text-[#272f3c]">
          {label}
        </Label>
        <Skeleton className="h-9 w-full" />
      </div>
    );
  }

  const getItemName = (item: T): string => {
    if (nameField === 'nome' && item.nome) return item.nome;
    if (nameField === 'valor' && item.valor) return item.valor;
    return String(item[nameField]);
  };

  const getItemById = (itemId: string): T | undefined => {
    return items.find(item => item.id === itemId);
  };

  const getItemByName = (name: string): T | undefined => {
    return items.find(item => getItemName(item) === name);
  };

  const handleChange = (itemId: string) => {
    const item = getItemById(itemId);
    if (item) {
      onChange(getItemName(item));
    }
  };

  return (
    <div className="mb-2">
      <div className="space-y-1">
        <Label htmlFor={id} className="block text-sm font-medium text-[#272f3c]">
          {label}
        </Label>
        <div className="flex items-center gap-2">
          <div className="flex-grow min-w-0">
            <Select
              value={getItemByName(value)?.id || ""}
              onValueChange={handleChange}
            >
              <SelectTrigger id={id} className="w-full h-9">
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {items.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {getItemName(item)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {handleEditOption && handleDeleteOption && openAddDialog && (
            <div className="flex gap-2 flex-shrink-0">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => handleEditOption(value)}
                disabled={!value}
                title="Editar"
                type="button"
                className="h-9 w-9 p-0 flex-shrink-0"
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => handleDeleteOption(value)}
                disabled={!value}
                title="Excluir"
                type="button"
                className="h-9 w-9 p-0 flex-shrink-0"
              >
                <Trash className="h-3.5 w-3.5" />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={openAddDialog}
                title="Adicionar"
                type="button"
                className="h-9 w-9 p-0 flex-shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {isDialogOpen && setIsDialogOpen && newValue !== undefined && setNewValue && handleAdd && (
        <AddValueDialog
          title={`Adicionar ${label}`}
          placeholder={`Nome do ${label.toLowerCase()}`}
          isOpen={isDialogOpen}
          setIsOpen={setIsDialogOpen}
          value={newValue}
          setValue={setNewValue}
          onAdd={handleAdd}
        />
      )}
    </div>
  );
}

export default SelectFieldDB;
