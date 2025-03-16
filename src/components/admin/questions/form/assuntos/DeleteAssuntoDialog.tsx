import React, { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Assunto } from "../../types";

interface DeleteAssuntoDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  assuntosList: Assunto[];
  currentAssunto: Assunto | null;
  setCurrentAssunto: (assunto: Assunto | null) => void;
  handleDeleteAssunto: () => void;
}

const DeleteAssuntoDialog: React.FC<DeleteAssuntoDialogProps> = ({
  isOpen,
  setIsOpen,
  assuntosList,
  currentAssunto,
  setCurrentAssunto,
  handleDeleteAssunto
}) => {
  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentAssunto(null);
    }
  }, [isOpen, setCurrentAssunto]);

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
          <DialogTitle>Excluir Assunto</DialogTitle>
          <DialogDescription>
            Esta ação não pode ser desfeita. O assunto será permanentemente removido.
          </DialogDescription>
        </DialogHeader>
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
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleDeleteAssunto}
            disabled={!currentAssunto}
          >
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteAssuntoDialog;
