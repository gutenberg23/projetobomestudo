import React, { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Aula } from "../AulasTypes";
import { TopicoResumo } from "../hooks/useAulasActions";
import { BuscaComLista, ListaOrdenavel } from "../../shared/ListaOrdenavel";

interface EditAulaModalProps {
  isOpen: boolean;
  onClose: () => void;
  aula: Aula | null;
  topicos: Map<string, TopicoResumo>;
  onSave: (aula: Aula, novosTopicos: TopicoResumo[]) => Promise<boolean>;
}

let cacheTodos: TopicoResumo[] | null = null;

export const EditAulaModal: React.FC<EditAulaModalProps> = ({ isOpen, onClose, aula, topicos, onSave }) => {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [topicosIds, setTopicosIds] = useState<string[]>([]);
  const [todos, setTodos] = useState<TopicoResumo[]>(cacheTodos || []);
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (isOpen && aula) {
      setTitulo(aula.titulo);
      setDescricao(aula.descricao);
      setTopicosIds([...aula.topicosIds]);
    }
  }, [isOpen, aula]);

  // Lista de todos os tópicos, para adicionar à aula
  useEffect(() => {
    if (!isOpen) return;
    // Mostra a lista guardada na hora e atualiza em segundo plano
    setCarregando(!cacheTodos);
    supabase
      .from("topicos")
      .select("id, nome, disciplina, questoes_ids")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) toast.error("Não foi possível carregar a lista de tópicos");
        cacheTodos = ((data || []) as TopicoResumo[]).map((t) => ({ ...t, questoes_ids: t.questoes_ids || [] }));
        setTodos(cacheTodos);
        setCarregando(false);
      });
  }, [isOpen]);

  const porId = useMemo(() => {
    const m = new Map(topicos);
    todos.forEach((t) => m.set(t.id, t));
    return m;
  }, [topicos, todos]);

  const questoes = useMemo(
    () => new Set(topicosIds.flatMap((id) => porId.get(id)?.questoes_ids || [])).size,
    [topicosIds, porId]
  );

  const salvar = async () => {
    if (!aula) return;
    if (!titulo.trim()) {
      toast.error("O título da aula é obrigatório");
      return;
    }
    setSalvando(true);
    const ok = await onSave(
      { ...aula, titulo: titulo.trim(), descricao, topicosIds },
      topicosIds.map((id) => porId.get(id)).filter((t): t is TopicoResumo => !!t)
    );
    setSalvando(false);
    if (ok) onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && !salvando && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar aula</DialogTitle>
          <DialogDescription>As questões da aula são as dos tópicos escolhidos, sem repetição.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="aula-titulo">Título *</Label>
            <Input id="aula-titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex.: Aula 01 - Princípios" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="aula-edital">No edital</Label>
            <Textarea
              id="aula-edital"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={2}
              placeholder="Tópicos do edital cobertos pela aula"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <Label>Tópicos da aula</Label>
              <span className="text-xs tabular-nums text-slate-500">
                {topicosIds.length} tópicos · {questoes} questões
              </span>
            </div>
            <ListaOrdenavel
              id="editar-aula"
              itens={topicosIds.map((id) => {
                const t = porId.get(id);
                return { id, titulo: t?.nome || "Tópico não encontrado", detalhe: t ? `${t.disciplina} · ${t.questoes_ids.length} questões` : id };
              })}
              onChange={(itens) => setTopicosIds(itens.map((i) => i.id))}
              onRemover={(id) => setTopicosIds((l) => l.filter((x) => x !== id))}
              vazio={<p className="rounded-lg border border-dashed border-slate-200 px-3 py-4 text-center text-sm text-slate-400">Nenhum tópico. Adicione abaixo.</p>}
            />
            <BuscaComLista
              opcoes={todos.map((t) => ({ id: t.id, titulo: t.nome, detalhe: `${t.disciplina} · ${t.questoes_ids.length} questões` }))}
              escolhidos={topicosIds}
              onEscolher={(id) => setTopicosIds((l) => [...l, id])}
              placeholder="Buscar tópico para adicionar (título, disciplina ou ID)"
              carregando={carregando}
            />
          </div>
        </div>

        <DialogFooter className="sticky -bottom-6 -mx-6 -mb-6 gap-2 border-t border-slate-100 bg-white px-6 py-3 sm:gap-2">
          <Button variant="outline" onClick={onClose} disabled={salvando}>
            Cancelar
          </Button>
          <Button onClick={salvar} disabled={salvando} className="bg-[#ea2be2] text-white hover:bg-[#d029d5]">
            {salvando ? "Salvando..." : "Salvar alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
