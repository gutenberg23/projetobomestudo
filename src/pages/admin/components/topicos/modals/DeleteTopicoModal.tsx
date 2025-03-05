
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
import { Topico } from "../TopicosTypes";

interface DeleteTopicoModalProps {
  isOpen: boolean;
  onClose: () => void;
  topico: Topico | null;
  onDelete: (id: string) => void;
}

export const DeleteTopicoModal: React.FC<DeleteTopicoModalProps> = ({
  isOpen,
  onClose,
  topico,
  onDelete,
}) => {
  const handleDelete = () => {
    if (topico) {
      onDelete(topico.id);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-[#272f3c]">Excluir Tópico</DialogTitle>
          <DialogDescription className="text-[#67748a]">
            Tem certeza que deseja excluir o tópico "{topico?.titulo}"? Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            className="w-auto"
          >
            Cancelar
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleDelete}
            className="w-auto"
          >
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
