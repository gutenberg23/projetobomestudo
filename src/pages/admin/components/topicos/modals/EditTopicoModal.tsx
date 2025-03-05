
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Topico } from "../TopicosTypes";

interface EditTopicoModalProps {
  isOpen: boolean;
  onClose: () => void;
  topico: Topico | null;
  onSave: (topico: Topico) => void;
}

export const EditTopicoModal: React.FC<EditTopicoModalProps> = ({
  isOpen,
  onClose,
  topico,
  onSave,
}) => {
  const [editedTopico, setEditedTopico] = useState<Topico | null>(null);

  useEffect(() => {
    if (isOpen && topico) {
      setEditedTopico({ ...topico });
    }
  }, [isOpen, topico]);

  const handleSave = () => {
    if (editedTopico) {
      onSave(editedTopico);
      onClose();
    }
  };

  if (!editedTopico) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-[#272f3c]">Editar Tópico</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <Label htmlFor="edit-titulo">Título</Label>
            <Input
              id="edit-titulo"
              value={editedTopico.titulo}
              onChange={(e) => setEditedTopico({ ...editedTopico, titulo: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="edit-disciplina">Disciplina</Label>
            <Input
              id="edit-disciplina"
              value={editedTopico.disciplina}
              onChange={(e) => setEditedTopico({ ...editedTopico, disciplina: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="edit-patrocinador">Patrocinador</Label>
            <Input
              id="edit-patrocinador"
              value={editedTopico.patrocinador}
              onChange={(e) => setEditedTopico({ ...editedTopico, patrocinador: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button className="bg-[#ea2be2] hover:bg-[#ea2be2]/90" onClick={handleSave}>
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
