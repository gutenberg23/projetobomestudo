
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AddTopicoDialogProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  newTopicoNome: string;
  setNewTopicoNome: (value: string) => void;
  handleAddTopico: () => void;
}

const AddTopicoDialog: React.FC<AddTopicoDialogProps> = ({
  isOpen,
  setIsOpen,
  newTopicoNome,
  setNewTopicoNome,
  handleAddTopico
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Novo Tópico</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="topico-nome">Nome do Tópico</Label>
            <Input
              id="topico-nome"
              value={newTopicoNome}
              onChange={(e) => setNewTopicoNome(e.target.value)}
              placeholder="Digite o nome do tópico"
            />
          </div>
          <Button onClick={handleAddTopico} className="w-full">Adicionar Tópico</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddTopicoDialog;
