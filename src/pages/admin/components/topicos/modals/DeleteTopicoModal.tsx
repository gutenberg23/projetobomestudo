
import React from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Topico } from "../TopicosTypes";

interface DeleteTopicoModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  currentTopico: Topico | null;
  handleDeleteTopico: () => void;
}

export const DeleteTopicoModal: React.FC<DeleteTopicoModalProps> = ({
  isOpen,
  setIsOpen,
  currentTopico,
  handleDeleteTopico
}) => {
  if (!currentTopico) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Excluir Tópico</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>Tem certeza que deseja excluir o tópico "{currentTopico.titulo}"?</p>
          <p className="text-red-500 mt-2">Esta ação não pode ser desfeita.</p>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancelar</Button>
          </DialogClose>
          <Button 
            type="button" 
            variant="destructive"
            onClick={handleDeleteTopico}
          >
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
