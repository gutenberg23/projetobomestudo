import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Topico } from "../../../types";

interface DeleteTopicoDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  topicosList: Topico[];
  currentTopico: Topico | null;
  setCurrentTopico: (topico: Topico | null) => void;
  handleDeleteTopico: () => void;
}

const DeleteTopicoDialog: React.FC<DeleteTopicoDialogProps> = ({
  isOpen,
  setIsOpen,
  topicosList,
  currentTopico,
  setCurrentTopico,
  handleDeleteTopico
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Excluir Tópico</DialogTitle>
          <DialogDescription>
            Esta ação não pode ser desfeita. Deseja realmente excluir o tópico <strong>{currentTopico?.nome}</strong>?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button type="button" variant="destructive" onClick={handleDeleteTopico}>
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteTopicoDialog;
