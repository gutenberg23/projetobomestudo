
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
import { DeleteCursoModalProps } from "../CursosTypes";

export const DeleteCursoModal: React.FC<DeleteCursoModalProps> = ({
  isOpen,
  onClose,
  curso,
  onDelete,
}) => {
  const handleDelete = () => {
    if (curso) {
      onDelete(curso.id);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-[#272f3c]">Excluir Curso</DialogTitle>
          <DialogDescription className="text-[#67748a]">
            Tem certeza que deseja excluir o curso "{curso?.titulo}"? Esta ação não pode ser desfeita.
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
