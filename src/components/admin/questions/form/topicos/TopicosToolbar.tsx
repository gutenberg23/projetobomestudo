
import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash, Plus } from "lucide-react";

interface TopicosToolbarProps {
  onAdd: () => void;
  onEdit: () => void;
  onDelete: () => void;
  topicosList: any[];
}

const TopicosToolbar: React.FC<TopicosToolbarProps> = ({
  onAdd,
  onEdit,
  onDelete,
  topicosList
}) => {
  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        size="sm"
        onClick={onAdd}
        title="Adicionar"
        type="button"
        className="flex items-center gap-1"
      >
        <Plus className="h-4 w-4" />
        Adicionar
      </Button>
      <Button 
        variant="outline" 
        size="sm"
        onClick={onEdit}
        disabled={!topicosList.length}
        title="Editar"
        type="button"
        className="flex items-center gap-1"
      >
        <Edit className="h-4 w-4" />
        Editar
      </Button>
      <Button 
        variant="outline" 
        size="sm"
        onClick={onDelete}
        disabled={!topicosList.length}
        title="Excluir"
        type="button"
        className="flex items-center gap-1"
      >
        <Trash className="h-4 w-4" />
        Excluir
      </Button>
    </div>
  );
};

export default TopicosToolbar;
