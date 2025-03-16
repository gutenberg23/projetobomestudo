import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash } from "lucide-react";
import { Assunto } from "../../types";

interface AssuntosToolbarProps {
  onAdd: () => void;
  onEdit: () => void;
  onDelete: () => void;
  assuntosList: Assunto[];
  iconsOnly?: boolean;
}

const AssuntosToolbar: React.FC<AssuntosToolbarProps> = ({
  onAdd,
  onEdit,
  onDelete,
  assuntosList,
  iconsOnly = false
}) => {
  const hasAssuntos = assuntosList.length > 0;

  return (
    <div className="flex gap-2">
      {iconsOnly ? (
        <>
          <Button 
            variant="outline" 
            size="icon"
            onClick={onEdit}
            disabled={!hasAssuntos}
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
            disabled={!hasAssuntos}
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
      ) : (
        <>
          <Button 
            variant="outline" 
            onClick={onEdit}
            disabled={!hasAssuntos}
            type="button"
            className="flex items-center gap-1"
          >
            <Edit className="h-4 w-4" />
            <span>Editar</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={onDelete}
            disabled={!hasAssuntos}
            type="button"
            className="flex items-center gap-1"
          >
            <Trash className="h-4 w-4" />
            <span>Excluir</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={onAdd}
            type="button"
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            <span>Adicionar</span>
          </Button>
        </>
      )}
    </div>
  );
};

export default AssuntosToolbar;
