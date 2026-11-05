import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Disciplina } from "../DisciplinasTypes";
import { AulaResumo } from "../useDisciplinas";
import { BuscaComLista, ListaOrdenavel } from "../../shared/ListaOrdenavel";
import { CampoDisciplinaQuestoes } from "../../shared/CampoDisciplinaQuestoes";

interface EditDisciplinaModalProps {
  disciplina: Disciplina | null;
  aulas: Map<string, AulaResumo>;
  onClose: () => void;
  onSave: (d: Disciplina, novasAulas: AulaResumo[]) => Promise<boolean>;
}

let cacheAulas: AulaResumo[] | null = null;

export const EditDisciplinaModal: React.FC<EditDisciplinaModalProps> = ({ disciplina, aulas, onClose, onSave }) => {
  const aberto = !!disciplina;
  const [titulo, setTitulo] = useState("");
  const [banca, setBanca] = useState("");
  const [rating, setRating] = useState("");
  const [disciplinaQuestoes, setDisciplinaQuestoes] = useState("");
  const [aulasIds, setAulasIds] = useState<string[]>([]);
  const [todas, setTodas] = useState<AulaResumo[]>(cacheAulas || []);
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!disciplina) return;
    setTitulo(disciplina.titulo);
    setBanca(disciplina.banca || "");
    setRating(disciplina.descricao || "");
    setDisciplinaQuestoes(disciplina.disciplinaQuestoes || "");
    setAulasIds([...disciplina.aulasIds]);
  }, [disciplina]);

  useEffect(() => {
    if (!aberto) return;
    setCarregando(!cacheAulas);
    supabase
      .from("aulas")
      .select("id, titulo, topicos_ids, questoes_ids")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) toast.error("Não foi possível carregar a lista de aulas");
        cacheAulas = ((data || []) as AulaResumo[]).map((a) => ({
          ...a,
          topicos_ids: a.topicos_ids || [],
          questoes_ids: a.questoes_ids || [],
        }));
        setTodas(cacheAulas);
        setCarregando(false);
      });
  }, [aberto]);

  const porId = useMemo(() => {
    const m = new Map(aulas);
    todas.forEach((a) => m.set(a.id, a));
    return m;
  }, [aulas, todas]);

  const salvar = async () => {
    if (!disciplina) return;
    if (!titulo.trim()) {
      toast.error("O título é obrigatório");
      return;
    }
    setSalvando(true);
    const ok = await onSave(
      { ...disciplina, titulo: titulo.trim(), banca, descricao: rating, aulasIds, disciplinaQuestoes },
      aulasIds.map((id) => porId.get(id)).filter((a): a is AulaResumo => !!a)
    );
    setSalvando(false);
    if (ok) onClose();
  };

  return (
    <Dialog open={aberto} onOpenChange={(o) => !o && !salvando && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar disciplina</DialogTitle>
          <DialogDescription>
            Mudanças nas aulas valem para cursos criados daqui em diante. Cursos já criados guardam a composição que tinham.
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
              Usada na aba Estatísticas da disciplina para mostrar os assuntos mais cobrados. No automático, o site descobre pelas questões ligadas aos tópicos.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <Label>Aulas da disciplina</Label>
              <span className="text-xs tabular-nums text-slate-500">{aulasIds.length} aulas</span>
            </div>
            <ListaOrdenavel
              id="editar-disciplina"
              itens={aulasIds.map((id) => {
                const a = porId.get(id);
                return { id, titulo: a?.titulo || "Aula não encontrada", detalhe: a ? `${a.topicos_ids.length} tópicos` : id };
              })}
              onChange={(itens) => setAulasIds(itens.map((i) => i.id))}
              onRemover={(id) => setAulasIds((l) => l.filter((x) => x !== id))}
              vazio={
                <p className="rounded-lg border border-dashed border-slate-200 px-3 py-4 text-center text-sm text-slate-400">
                  Nenhuma aula. Adicione abaixo.
                </p>
              }
            />
            <BuscaComLista
              opcoes={todas.map((a) => ({ id: a.id, titulo: a.titulo, detalhe: `${a.topicos_ids.length} tópicos` }))}
              escolhidos={aulasIds}
              onEscolher={(id) => setAulasIds((l) => [...l, id])}
              placeholder="Buscar aula para adicionar"
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
