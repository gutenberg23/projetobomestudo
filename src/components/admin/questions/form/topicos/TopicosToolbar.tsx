
import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash, Plus } from "lucide-react";

interface TopicosToolbarProps {
  onAdd: () => void;
  onEdit: () => void;
  onDelete: () => void;
  topicosList: any[];
  iconsOnly?: boolean;
}

const TopicosToolbar: React.FC<TopicosToolbarProps> = ({
  onAdd,
  onEdit,
  onDelete,
  topicosList,
  iconsOnly = false
}) => {
  return (
    <>
      <Button 
        variant="outline" 
        size="icon"
        onClick={onEdit}
        disabled={!topicosList.length}
        title="Editar"
        type="button"
        className="h-8 w-8 p-0"
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
        className="h-8 w-8 p-0"
      >
        <Trash className="h-4 w-4" />
      </Button>
      <Button 
        variant="outline" 
        size="icon" 
        onClick={onAdd}
        title="Adicionar"
        type="button"
        className="h-8 w-8 p-0"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </>
  );
};

export default TopicosToolbar;
