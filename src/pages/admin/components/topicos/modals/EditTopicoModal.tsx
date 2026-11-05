import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Topico } from "../TopicosTypes";
import { TopicoFormFields } from "../TopicoFormFields";
import { AVISO_MIGRATION, db, faltaMigration, linhaParaFlashcard } from "@/lib/flashcards";

interface EditTopicoModalProps {
  isOpen: boolean;
  onClose: () => void;
  topico: Topico | null;
  onSave: (topico: Topico) => void | Promise<void>;
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
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!isOpen || !topico) return;
    let ativo = true;
    // Flashcards ficam em outra tabela: carregam à parte (undefined = carregando)
    setEditedTopico({ ...topico, flashcards: undefined });
    (async () => {
      const { data, error } = await db
        .from("flashcards")
        .select("*")
        .eq("topico_id", topico.id)
        .order("ordem", { ascending: true })
        .order("created_at", { ascending: true });
      if (!ativo) return;
      if (error) {
        if (faltaMigration(error)) toast.warning(AVISO_MIGRATION);
        else console.error("Erro ao carregar flashcards do tópico:", error);
      }
      const cartoes = error
        ? []
        : (data || []).map(linhaParaFlashcard).map((c) => ({ id: c.id, frente: c.frente, verso: c.verso, tags: c.tags, cursosIds: c.cursosIds }));
      setEditedTopico((atual) => (atual && atual.id === topico.id ? { ...atual, flashcards: cartoes } : atual));
    })();
    return () => {
      ativo = false;
    };
  }, [isOpen, topico]);

  const handleSave = async () => {
    if (!editedTopico) return;
    if (!editedTopico.titulo.trim() || !editedTopico.disciplina.trim()) {
      toast.error("Título e disciplina são obrigatórios");
      return;
    }
    // Fechar o modal e mostrar mensagem de sucesso é responsabilidade de onSave
    setSalvando(true);
    try {
      await onSave({
        ...editedTopico,
        titulo: editedTopico.titulo.trim(),
        disciplina: editedTopico.disciplina.trim(),
      });
    } finally {
      setSalvando(false);
    }
  };

  if (!editedTopico) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && !salvando && onClose()}>
      <DialogContent className="sm:max-w-[680px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar tópico</DialogTitle>
          <DialogDescription className="flex flex-wrap items-center gap-x-2">
            <span>{editedTopico.disciplina || "Sem disciplina"}</span>
            <span aria-hidden>·</span>
            <code className="rounded bg-slate-100 px-1 text-[11px] text-slate-500">{editedTopico.id}</code>
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <TopicoFormFields
            idPrefix="edit-topico"
            value={editedTopico}
            onChange={(v) => setEditedTopico({ ...editedTopico, ...v })}
            disciplinasSugeridas={disciplinasSugeridas}
          />
        </div>
        <DialogFooter className="sticky -bottom-6 -mx-6 -mb-6 gap-2 border-t border-slate-100 bg-white px-6 py-3 sm:gap-2">
          <Button variant="outline" onClick={onClose} disabled={salvando}>
            Cancelar
          </Button>
          <Button className="bg-[#ea2be2] text-white hover:bg-[#d029d5]" onClick={handleSave} disabled={salvando}>
            {salvando ? "Salvando..." : "Salvar alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
