import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Disciplina } from "../DisciplinasTypes";
import { TeoriaResumo } from "../useDisciplinas";
import { BuscaComLista, ListaOrdenavel } from "../../shared/ListaOrdenavel";
import { CampoDisciplinaQuestoes } from "../../shared/CampoDisciplinaQuestoes";

interface EditDisciplinaModalProps {
  /** Disciplina sendo editada; com id vazio, o formulário cria uma nova */
  disciplina: Disciplina | null;
  teorias: Map<string, TeoriaResumo>;
  onClose: () => void;
  onSave: (d: Disciplina) => Promise<boolean>;
}

const detalheTeoria = (t: TeoriaResumo) =>
  [t.disciplinaQuestoes, t.assunto, t.publicada ? "" : "rascunho"].filter(Boolean).join(" · ") || "Sem classificação";

export const EditDisciplinaModal: React.FC<EditDisciplinaModalProps> = ({ disciplina, teorias, onClose, onSave }) => {
  const aberto = !!disciplina;
  const nova = !!disciplina && !disciplina.id;
  const [titulo, setTitulo] = useState("");
  const [banca, setBanca] = useState("");
  const [rating, setRating] = useState("");
  const [disciplinaQuestoes, setDisciplinaQuestoes] = useState("");
  const [teoriasIds, setTeoriasIds] = useState<string[]>([]);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!disciplina) return;
    setTitulo(disciplina.titulo);
    setBanca(disciplina.banca || "");
    setRating(disciplina.descricao || "");
    setDisciplinaQuestoes(disciplina.disciplinaQuestoes || "");
    setTeoriasIds([...disciplina.teoriasIds]);
  }, [disciplina]);

  const todas = useMemo(() => Array.from(teorias.values()), [teorias]);

  // Atalho: teorias classificadas na disciplina das questões escolhida que ainda não estão na lista
  const sugeridas = useMemo(() => {
    const alvo = disciplinaQuestoes.trim().toLowerCase();
    if (!alvo) return [];
    return todas.filter((t) => t.disciplinaQuestoes.trim().toLowerCase() === alvo && !teoriasIds.includes(t.id));
  }, [todas, disciplinaQuestoes, teoriasIds]);

  const salvar = async () => {
    if (!disciplina) return;
    if (!titulo.trim()) {
      toast.error("O título é obrigatório");
      return;
    }
    setSalvando(true);
    const ok = await onSave({ ...disciplina, titulo: titulo.trim(), banca, descricao: rating, teoriasIds, disciplinaQuestoes });
    setSalvando(false);
    if (ok) onClose();
  };

  return (
    <Dialog open={aberto} onOpenChange={(o) => !o && !salvando && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{nova ? "Nova disciplina" : "Editar disciplina"}</DialogTitle>
          <DialogDescription>
            A disciplina é uma lista de teorias. O aluno vê as teorias nesta ordem, agrupadas pelo assunto, na aba Disciplinas dos cursos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr]">
            <div className="space-y-1.5">
              <Label htmlFor="disc-titulo">Título *</Label>
              <Input id="disc-titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="disc-banca">Banca</Label>
              <Input id="disc-banca" value={banca} onChange={(e) => setBanca(e.target.value)} placeholder="Ex.: FGV" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="disc-rating">Rating (1 a 10)</Label>
              <Input
                id="disc-rating"
                type="number"
                min="1"
                max="10"
                value={rating}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "" || (/^\d+$/.test(v) && +v >= 1 && +v <= 10)) setRating(v);
                }}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="disc-questoes">Disciplina das questões</Label>
            <CampoDisciplinaQuestoes id="disc-questoes" valor={disciplinaQuestoes} onChange={setDisciplinaQuestoes} />
            <p className="text-xs text-slate-500">
              Usada na aba Estatísticas e para sugerir teorias abaixo. No automático, o site descobre pela classificação das teorias.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <Label>Teorias da disciplina</Label>
              <span className="text-xs tabular-nums text-slate-500">
                {teoriasIds.length} {teoriasIds.length === 1 ? "teoria" : "teorias"}
              </span>
            </div>
            <ListaOrdenavel
              id="editar-disciplina"
              itens={teoriasIds.map((id) => {
                const t = teorias.get(id);
                return { id, titulo: t?.titulo || "Teoria não encontrada", detalhe: t ? detalheTeoria(t) : id };
              })}
              onChange={(itens) => setTeoriasIds(itens.map((i) => i.id))}
              onRemover={(id) => setTeoriasIds((l) => l.filter((x) => x !== id))}
              vazio={
                <p className="rounded-lg border border-dashed border-slate-200 px-3 py-4 text-center text-sm text-slate-400">
                  Nenhuma teoria. Adicione abaixo.
                </p>
              }
            />
            {sugeridas.length > 0 && (
              <button
                type="button"
                onClick={() => setTeoriasIds((l) => [...l, ...sugeridas.map((t) => t.id)])}
                className="w-full rounded-lg border border-dashed border-[#5f2ebe]/40 bg-[#5f2ebe]/5 px-3 py-2 text-left text-sm font-medium text-[#5f2ebe] hover:bg-[#5f2ebe]/10"
              >
                Adicionar {sugeridas.length === 1 ? "a teoria" : `as ${sugeridas.length} teorias`} de “{disciplinaQuestoes}” que faltam
              </button>
            )}
            <BuscaComLista
              opcoes={todas.map((t) => ({ id: t.id, titulo: t.titulo, detalhe: detalheTeoria(t) }))}
              escolhidos={teoriasIds}
              onEscolher={(id) => setTeoriasIds((l) => [...l, id])}
              placeholder="Buscar teoria por título, disciplina ou assunto"
            />
            <p className="text-xs text-slate-500">Teorias em rascunho só aparecem para o aluno depois de publicadas.</p>
          </div>
        </div>

        <DialogFooter className="sticky -bottom-6 -mx-6 -mb-6 gap-2 border-t border-slate-100 bg-white px-6 py-3 sm:gap-2">
          <Button variant="outline" onClick={onClose} disabled={salvando}>
            Cancelar
          </Button>
          <Button onClick={salvar} disabled={salvando} className="bg-[#ea2be2] text-white hover:bg-[#d029d5]">
            {salvando ? "Salvando..." : nova ? "Criar disciplina" : "Salvar alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
