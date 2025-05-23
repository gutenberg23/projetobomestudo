import React, { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Topico } from "../../../types";

interface EditTopicoDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  topicosList: Topico[];
  currentTopico: Topico | null;
  setCurrentTopico: (topico: Topico | null) => void;
  newTopicoNome: string;
  setNewTopicoNome: (nome: string) => void;
  handleEditTopico: () => void;
}

const EditTopicoDialog: React.FC<EditTopicoDialogProps> = ({
  isOpen,
  setIsOpen,
  topicosList,
  currentTopico,
  setCurrentTopico,
  newTopicoNome,
  setNewTopicoNome,
  handleEditTopico
}) => {
  // Atualizar o campo de nome quando um tópico for selecionado
  useEffect(() => {
    if (currentTopico) {
      setNewTopicoNome(currentTopico.nome);
    }
  }, [currentTopico, setNewTopicoNome]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleEditTopico();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Tópico</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nome" className="text-right">
                Nome
              </Label>
              <Input
                id="nome"
                value={newTopicoNome}
                onChange={(e) => setNewTopicoNome(e.target.value)}
                className="col-span-3"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTopicoDialog;
