import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface AddTopicoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (topico: string) => Promise<boolean> | void;
  isLoading?: boolean;
}

export function AddTopicoDialog({
  isOpen,
  onClose,
  onAdd,
  isLoading = false
}: AddTopicoDialogProps) {
  const [newTopicoNome, setNewTopicoNome] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTopicoNome.trim()) {
      const success = await onAdd(newTopicoNome);
      if (success) {
        setNewTopicoNome("");
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Tópico</DialogTitle>
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
              {isLoading ? "Adicionando..." : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 