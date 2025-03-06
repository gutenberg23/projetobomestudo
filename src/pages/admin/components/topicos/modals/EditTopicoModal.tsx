
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
import { QuestionsManager } from "./components/QuestionsManager";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const [newQuestaoId, setNewQuestaoId] = useState("");

  useEffect(() => {
    if (isOpen && topico) {
      setEditedTopico({ ...topico });
    }
  }, [isOpen, topico]);

  const addQuestaoId = () => {
    if (!editedTopico || !newQuestaoId.trim()) {
      toast.error("Digite um ID de questão válido");
      return;
    }

    if (editedTopico.questoesIds.includes(newQuestaoId)) {
      toast.error("Esta questão já foi adicionada");
      return;
    }

    setEditedTopico({
      ...editedTopico,
      questoesIds: [...editedTopico.questoesIds, newQuestaoId]
    });
    setNewQuestaoId("");
  };

  const removeQuestaoId = (index: number) => {
    if (!editedTopico) return;
    
    const updatedQuestoes = [...editedTopico.questoesIds];
    updatedQuestoes.splice(index, 1);
    setEditedTopico({
      ...editedTopico,
      questoesIds: updatedQuestoes
    });
  };

  const handleSave = async () => {
    if (editedTopico) {
      try {
        // Atualizar no Supabase
        const { error } = await supabase
          .from('topicos')
          .update({ 
            nome: editedTopico.titulo,
            disciplina: editedTopico.disciplina,
            patrocinador: editedTopico.patrocinador,
            questoes_ids: editedTopico.questoesIds
          })
          .eq('id', editedTopico.id);

        if (error) throw error;
        
        // Atualizar na interface
        onSave(editedTopico);
        toast.success("Tópico atualizado com sucesso!");
      } catch (error) {
        console.error("Erro ao atualizar tópico:", error);
        toast.error("Erro ao atualizar o tópico. Tente novamente.");
      }
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
          <QuestionsManager
            questoesIds={editedTopico.questoesIds}
            newQuestaoId={newQuestaoId}
            setNewQuestaoId={setNewQuestaoId}
            addQuestaoId={addQuestaoId}
            removeQuestaoId={removeQuestaoId}
            label="Questões"
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
