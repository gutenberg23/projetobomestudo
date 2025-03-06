
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Topico } from "../../types";

interface DeleteTopicoDialogProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir Tópico</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="topico-delete-select">Selecione o Tópico para Excluir</Label>
            <Select
              onValueChange={(value) => {
                const selected = topicosList.find(t => t.id === value);
                if (selected) {
                  setCurrentTopico(selected);
                }
              }}
              value={currentTopico?.id || ""}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione um tópico" />
              </SelectTrigger>
              <SelectContent>
                {topicosList.map(topico => (
                  <SelectItem key={topico.id} value={topico.id}>
                    {topico.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {currentTopico && (
            <p className="text-red-500">
              Tem certeza que deseja excluir o tópico "{currentTopico.nome}"?
              Esta ação não pode ser desfeita.
            </p>
          )}
          <Button 
            onClick={handleDeleteTopico} 
            className="w-full bg-red-500 hover:bg-red-600"
            disabled={!currentTopico}
          >
            Confirmar Exclusão
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteTopicoDialog;
