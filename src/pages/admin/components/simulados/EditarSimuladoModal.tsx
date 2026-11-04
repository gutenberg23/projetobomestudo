import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Search } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { normalizar } from "@/components/admin/ui/listagem";
import { GrupoSimulado } from "./SimuladosTypes";

interface EditarSimuladoModalProps {
  grupo: GrupoSimulado | null;
  cursos: { id: string; titulo: string; descricao?: string }[];
  onClose: () => void;
  onSalvo: () => void;
}

const paraData = (iso: string | null) => (iso ? new Date(iso).toISOString().split("T")[0] : "");

/**
 * Edita título, data de encerramento e os cursos do simulado.
 * Cada curso tem a sua linha em `simulados`: cursos novos ganham uma cópia,
 * cursos desmarcados têm a linha excluída (com aviso).
 */
const EditarSimuladoModal: React.FC<EditarSimuladoModalProps> = ({ grupo, cursos, onClose, onSalvo }) => {
  const [titulo, setTitulo] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [escolhidos, setEscolhidos] = useState<string[]>([]);
  const [busca, setBusca] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!grupo) return;
    setTitulo(grupo.titulo);
    setDataFim(paraData(grupo.dataFim));
    setEscolhidos(Array.from(new Set(grupo.linhas.map((l) => l.curso_id))));
    setBusca("");
  }, [grupo]);

  const atuais = useMemo(() => new Set(grupo?.linhas.map((l) => l.curso_id) || []), [grupo]);
  const removidos = grupo ? grupo.linhas.filter((l) => !escolhidos.includes(l.curso_id)) : [];
  const adicionados = escolhidos.filter((id) => !atuais.has(id));
  const nomeCurso = (id: string) => cursos.find((c) => c.id === id)?.titulo || "Curso removido";

  const filtrados = useMemo(() => {
    const t = normalizar(busca.trim());
    // Escolhidos primeiro
    return cursos
      .filter((c) => !t || normalizar(`${c.titulo} ${c.descricao || ""}`).includes(t))
      .sort((a, b) => Number(escolhidos.includes(b.id)) - Number(escolhidos.includes(a.id)));
  }, [cursos, busca, escolhidos]);

  const alternar = (id: string) => setEscolhidos((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id]));

  const salvar = async () => {
    if (!grupo) return;
    if (!titulo.trim()) {
      toast.error("Informe o título do simulado");
      return;
    }
    if (escolhidos.length === 0) {
      toast.error("Escolha pelo menos um curso");
      return;
    }
    setSalvando(true);
    try {
      const data_fim = dataFim ? new Date(dataFim).toISOString() : null;
      const mantidos = grupo.linhas.filter((l) => escolhidos.includes(l.curso_id));

      if (mantidos.length) {
        const { error } = await supabase
          .from("simulados")
          .update({ titulo: titulo.trim(), data_fim })
          .in("id", mantidos.map((l) => l.id));
        if (error) throw error;
      }

      if (adicionados.length) {
        const modelo = grupo.linhas[0];
        const { error } = await supabase.from("simulados").insert(
          adicionados.map((curso_id) => ({
            titulo: titulo.trim(),
            descricao: modelo.descricao,
            curso_id,
            data_fim,
            questoes_ids: modelo.questoes_ids,
            quantidade_questoes: modelo.quantidade_questoes ?? modelo.questoes_ids.length,
            ativo: modelo.ativo,
          }))
        );
        if (error) throw error;
      }

      if (removidos.length) {
        const { error } = await supabase.from("simulados").delete().in("id", removidos.map((l) => l.id));
        if (error) throw error;
      }

      toast.success("Simulado atualizado");
      onSalvo();
      onClose();
    } catch (error) {
      console.error("Erro ao atualizar simulado:", error);
      toast.error("Erro ao atualizar o simulado. " + ((error as Error)?.message || ""));
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Dialog open={!!grupo} onOpenChange={(o) => !o && !salvando && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Editar simulado</DialogTitle>
          <DialogDescription>
            {grupo ? `${grupo.questoes} questões. As questões são escolhidas na página Questões, ao criar o simulado.` : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_170px]">
            <div className="space-y-1.5">
              <Label htmlFor="sim-titulo">Título *</Label>
              <Input id="sim-titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sim-fim">Encerra em</Label>
              <Input id="sim-fim" type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <Label>Cursos onde aparece *</Label>
              <span className="text-xs tabular-nums text-slate-500">{escolhidos.length} selecionados</span>
            </div>
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <div className="relative border-b border-slate-100 bg-slate-50">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar curso"
                  className="w-full bg-transparent py-2 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none"
                />
              </div>
              <ul className="max-h-60 overflow-y-auto">
                {filtrados.map((c) => (
                  <li key={c.id}>
                    <label className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm hover:bg-[#faf8ff]">
                      <input
                        type="checkbox"
                        checked={escolhidos.includes(c.id)}
                        onChange={() => alternar(c.id)}
                        className="h-4 w-4 rounded border-slate-300 accent-[#5f2ebe]"
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-slate-800">{c.titulo}</span>
                        {c.descricao && <span className="block truncate text-xs text-slate-400">{c.descricao}</span>}
                      </span>
                    </label>
                  </li>
                ))}
                {filtrados.length === 0 && <li className="px-3 py-3 text-sm text-slate-400">Nenhum curso encontrado.</li>}
              </ul>
            </div>
          </div>

          {(adicionados.length > 0 || removidos.length > 0) && (
            <div className="space-y-1.5 rounded-lg bg-slate-50 px-3 py-2.5 text-xs text-slate-600">
              {adicionados.length > 0 && (
                <p>
                  <strong className="text-emerald-700">Vai entrar em:</strong> {adicionados.map(nomeCurso).join(", ")}.
                </p>
              )}
              {removidos.length > 0 && (
                <p className="flex items-start gap-1.5 text-red-700">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>
                    <strong>Vai sair de:</strong> {removidos.map((l) => nomeCurso(l.curso_id)).join(", ")}. O simulado desses cursos é
                    excluído, e os alunos deles perdem o acesso a ele.
                  </span>
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
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

export default EditarSimuladoModal;
