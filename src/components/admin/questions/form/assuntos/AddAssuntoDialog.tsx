import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface AddAssuntoDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  newAssuntoNome: string;
  setNewAssuntoNome: (nome: string) => void;
  handleAddAssunto: () => void;
}

const AddAssuntoDialog: React.FC<AddAssuntoDialogProps> = ({
  isOpen,
  setIsOpen,
  newAssuntoNome,
  setNewAssuntoNome,
  handleAddAssunto
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAddAssunto();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Assunto</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nome" className="text-right">
                Nome
              </Label>
              <Input
                id="nome"
                value={newAssuntoNome}
                onChange={(e) => setNewAssuntoNome(e.target.value)}
                className="col-span-3"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Adicionar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAssuntoDialog;
