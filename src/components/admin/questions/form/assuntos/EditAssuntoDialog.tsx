import React, { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Assunto } from "../../types";

interface EditAssuntoDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  assuntosList: Assunto[];
  currentAssunto: Assunto | null;
  setCurrentAssunto: (assunto: Assunto | null) => void;
  newAssuntoNome: string;
  setNewAssuntoNome: (nome: string) => void;
  handleEditAssunto: () => void;
}

const EditAssuntoDialog: React.FC<EditAssuntoDialogProps> = ({
  isOpen,
  setIsOpen,
  assuntosList,
  currentAssunto,
  setCurrentAssunto,
  newAssuntoNome,
  setNewAssuntoNome,
  handleEditAssunto
}) => {
  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentAssunto(null);
      setNewAssuntoNome("");
    }
  }, [isOpen, setCurrentAssunto, setNewAssuntoNome]);

  // Update nome field when currentAssunto changes
  useEffect(() => {
    if (currentAssunto) {
      setNewAssuntoNome(currentAssunto.nome);
    }
  }, [currentAssunto, setNewAssuntoNome]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleEditAssunto();
  };

  const handleSelectAssunto = (id: string) => {
    const assunto = assuntosList.find(a => a.id === id);
    if (assunto) {
      setCurrentAssunto(assunto);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Assunto</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="assunto-select" className="text-right">
                Assunto
              </Label>
              <Select
                value={currentAssunto?.id || ""}
                onValueChange={handleSelectAssunto}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione um assunto" />
                </SelectTrigger>
                <SelectContent>
                  {assuntosList.map((assunto) => (
                    <SelectItem key={assunto.id} value={assunto.id}>
                      {assunto.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="novo-nome" className="text-right">
                Novo Nome
              </Label>
              <Input
                id="novo-nome"
                value={newAssuntoNome}
                onChange={(e) => setNewAssuntoNome(e.target.value)}
                className="col-span-3"
                disabled={!currentAssunto}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!currentAssunto || !newAssuntoNome.trim()}>
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditAssuntoDialog;
