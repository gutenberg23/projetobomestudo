import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface EditTopicoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (newTopico: string) => Promise<boolean> | void;
  currentValue: string;
  isLoading?: boolean;
}

export function EditTopicoDialog({
  isOpen,
  onClose,
  onEdit,
  currentValue,
  isLoading = false
}: EditTopicoDialogProps) {
  const [newTopicoNome, setNewTopicoNome] = useState("");

  // Atualizar o campo de nome quando um tópico for selecionado
  useEffect(() => {
    if (currentValue) {
      setNewTopicoNome(currentValue);
    }
  }, [currentValue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTopicoNome.trim()) {
      await onEdit(newTopicoNome);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
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
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !newTopicoNome.trim()}>
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 