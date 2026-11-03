import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Topico } from "../TopicosTypes";
import { TopicoFormFields } from "../TopicoFormFields";

interface EditTopicoModalProps {
  isOpen: boolean;
  onClose: () => void;
  topico: Topico | null;
  onSave: (topico: Topico) => void;
  disciplinasSugeridas?: string[];
}

export const EditTopicoModal: React.FC<EditTopicoModalProps> = ({
  isOpen,
  onClose,
  topico,
  onSave,
  disciplinasSugeridas = [],
}) => {
  const [editedTopico, setEditedTopico] = useState<Topico | null>(null);

  useEffect(() => {
    if (isOpen && topico) {
      setEditedTopico({ ...topico });
    }
  }, [isOpen, topico]);

  const handleSave = () => {
    if (!editedTopico) return;
    if (!editedTopico.titulo.trim() || !editedTopico.disciplina.trim()) {
      toast.error("Título e disciplina são obrigatórios");
      return;
    }
    // Fechar o modal e mostrar mensagem de sucesso é responsabilidade de onSave
    onSave({
      ...editedTopico,
      titulo: editedTopico.titulo.trim(),
      disciplina: editedTopico.disciplina.trim(),
    });
  };

  if (!editedTopico) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[680px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#272f3c]">Editar Tópico</DialogTitle>
        </DialogHeader>
        <div className="py-2">
          <TopicoFormFields
            idPrefix="edit-topico"
            value={editedTopico}
            onChange={(v) => setEditedTopico({ ...editedTopico, ...v })}
            disciplinasSugeridas={disciplinasSugeridas}
          />
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
