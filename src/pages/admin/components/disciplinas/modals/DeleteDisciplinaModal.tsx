
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DeleteDisciplinaModalProps } from "../DisciplinasTypes";

export const DeleteDisciplinaModal: React.FC<DeleteDisciplinaModalProps> = ({
  isOpen,
  onClose,
  disciplina,
  onDelete,
}) => {
  const handleDelete = () => {
    if (disciplina) {
      onDelete(disciplina.id);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-[#272f3c]">Excluir Disciplina</DialogTitle>
          <DialogDescription className="text-[#67748a]">
            Tem certeza que deseja excluir a disciplina "{disciplina?.titulo}"? Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleDelete}
          >
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
