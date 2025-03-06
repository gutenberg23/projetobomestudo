
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
        size="icon"
        onClick={onAdd}
        title="Adicionar"
        type="button"
      >
        <Plus className="h-4 w-4" />
      </Button>
      <Button 
        variant="outline" 
        size="icon"
        onClick={onEdit}
        disabled={!topicosList.length}
        title="Editar"
        type="button"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button 
        variant="outline" 
        size="icon"
        onClick={onDelete}
        disabled={!topicosList.length}
        title="Excluir"
        type="button"
      >
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default TopicosToolbar;
