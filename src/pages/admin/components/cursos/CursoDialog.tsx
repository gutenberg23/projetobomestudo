import React, { useEffect, useMemo, useState } from "react";
import { Info } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BuscaComLista, ListaOrdenavel } from "../shared/ListaOrdenavel";
import { Curso } from "./CursosTypes";
import { AulaOpcao, EscolherAulasDisciplina } from "./EscolherAulasDisciplina";
import { AulasPorDisciplina, aulasDaDisciplinaNoCurso } from "@/utils/aulasDoCurso";

export interface DisciplinaOpcao {
  id: string;
  titulo: string;
  banca: string | null;
  aulas: number;
  aulasIds: string[];
}

export interface DadosCurso {
  titulo: string;
  cargo: string;
  informacoes: string;
  disciplinasIds: string[];
  aulasPorDisciplina: AulasPorDisciplina;
}

interface CursoDialogProps {
  aberto: boolean;
  /** null = criar curso novo */
  curso: Curso | null;
  disciplinas: DisciplinaOpcao[];
  /** Títulos das aulas, por id */
  aulas: Map<string, AulaOpcao>;
  carregandoDisciplinas?: boolean;
  onFechar: () => void;
  onSalvar: (dados: DadosCurso) => Promise<boolean>;
}

/** Formulário de criação e edição de curso, com as disciplinas em ordem. */
export const CursoDialog: React.FC<CursoDialogProps> = ({ aberto, curso, disciplinas, aulas, carregandoDisciplinas, onFechar, onSalvar }) => {
  const [titulo, setTitulo] = useState("");
  const [cargo, setCargo] = useState("");
  const [informacoes, setInformacoes] = useState("");
  const [escolhidas, setEscolhidas] = useState<string[]>([]);
  const [selecao, setSelecao] = useState<AulasPorDisciplina>({});
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!aberto) return;
    setTitulo(curso?.titulo || "");
    setCargo(curso?.descricao || "");
    setInformacoes(curso?.informacoesCurso || "");
    setEscolhidas(curso ? [...curso.disciplinasIds] : []);
    setSelecao(curso ? { ...curso.aulasPorDisciplina } : {});
  }, [aberto, curso]);

  const porId = useMemo(() => new Map(disciplinas.map((d) => [d.id, d])), [disciplinas]);
  const aulasNoCurso = (id: string) => aulasDaDisciplinaNoCurso(porId.get(id)?.aulasIds, selecao, id);
  const selecaoLimpa = (): AulasPorDisciplina => {
    const r: AulasPorDisciplina = {};
    escolhidas.forEach((id) => {
      if (selecao[id]) r[id] = aulasNoCurso(id);
    });
    return r;
  };
  const chaveSelecao = (m: AulasPorDisciplina) =>
    JSON.stringify(Object.keys(m).sort().map((k) => [k, [...m[k]].sort()]));
  const mudouDisciplinas =
    !!curso &&
    (curso.disciplinasIds.join(",") !== escolhidas.join(",") || chaveSelecao(curso.aulasPorDisciplina) !== chaveSelecao(selecaoLimpa()));
  const totalAulas = escolhidas.reduce((s, id) => s + aulasNoCurso(id).length, 0);

  const salvar = async () => {
    if (!titulo.trim()) {
      toast.error("O título do curso é obrigatório");
      return;
    }
    setSalvando(true);
    const ok = await onSalvar({ titulo: titulo.trim(), cargo, informacoes, disciplinasIds: escolhidas, aulasPorDisciplina: selecaoLimpa() });
    setSalvando(false);
    if (ok) onFechar();
  };

  return (
    <Dialog open={aberto} onOpenChange={(o) => !o && !salvando && onFechar()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{curso ? "Editar curso" : "Novo curso"}</DialogTitle>
          <DialogDescription>
            Escolha as disciplinas na ordem em que devem aparecer e, em cada uma, as aulas que caem neste concurso.
            Tópicos e questões dessas aulas entram no curso automaticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="curso-titulo">Título *</Label>
              <Input id="curso-titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex.: Analista Judiciário - TRF 1" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="curso-cargo">Cargo</Label>
              <Input id="curso-cargo" value={cargo} onChange={(e) => setCargo(e.target.value)} placeholder="Ex.: Área Administrativa" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="curso-info">Informações do curso</Label>
            <Textarea
              id="curso-info"
              value={informacoes}
              onChange={(e) => setInformacoes(e.target.value)}
              rows={3}
              placeholder="Texto exibido na página do curso"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <Label>Disciplinas</Label>
              <span className="text-xs tabular-nums text-slate-500">
                {escolhidas.length} escolhidas · {totalAulas} aulas
              </span>
            </div>
            <ListaOrdenavel
              id="curso-disciplinas"
              itens={escolhidas.map((id) => {
                const d = porId.get(id);
                const n = aulasNoCurso(id).length;
                return {
                  id,
                  titulo: d?.titulo || "Disciplina não encontrada",
                  detalhe: d ? [d.banca, n === d.aulas ? `${d.aulas} aulas` : `${n} de ${d.aulas} aulas`].filter(Boolean).join(" · ") : id,
                };
              })}
              onChange={(itens) => setEscolhidas(itens.map((i) => i.id))}
              onRemover={(id) => setEscolhidas((l) => l.filter((x) => x !== id))}
              vazio={
                <p className="rounded-lg border border-dashed border-slate-200 px-3 py-4 text-center text-sm text-slate-400">
                  Nenhuma disciplina. Adicione abaixo (dá para criar o curso vazio e completar depois).
                </p>
              }
            />
            <BuscaComLista
              opcoes={disciplinas.map((d) => ({ id: d.id, titulo: d.titulo, detalhe: [d.banca, `${d.aulas} aulas`].filter(Boolean).join(" · ") }))}
              escolhidos={escolhidas}
              onEscolher={(id) => setEscolhidas((l) => [...l, id])}
              placeholder="Buscar disciplina por título ou banca"
              carregando={carregandoDisciplinas}
            />
            {escolhidas.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <Label>Aulas de cada disciplina neste curso</Label>
                <p className="text-xs text-slate-500">
                  Use uma disciplina só para vários concursos: abra e desmarque as aulas que não caem neste. As aulas
                  continuam na disciplina e na ordem dela.
                </p>
                {escolhidas.map((id) => {
                  const d = porId.get(id);
                  if (!d) return null;
                  return (
                    <EscolherAulasDisciplina
                      key={id}
                      titulo={d.titulo}
                      aulas={d.aulasIds.map((a) => aulas.get(a) || { id: a, titulo: "Aula não encontrada" })}
                      escolhidas={selecao[id]}
                      onChange={(lista) =>
                        setSelecao((m) => {
                          const novo = { ...m };
                          if (lista) novo[id] = lista;
                          else delete novo[id];
                          return novo;
                        })
                      }
                    />
                  );
                })}
              </div>
            )}
            {mudouDisciplinas && (
              <p className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Ao salvar, as aulas, os tópicos e as questões do curso são recalculados a partir dessas disciplinas e aulas. O
                progresso dos alunos nas aulas que saírem deixa de contar no curso.
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="sticky -bottom-6 -mx-6 -mb-6 gap-2 border-t border-slate-100 bg-white px-6 py-3 sm:gap-2">
          <Button variant="outline" onClick={onFechar} disabled={salvando}>
            Cancelar
          </Button>
          <Button onClick={salvar} disabled={salvando} className="bg-[#ea2be2] text-white hover:bg-[#d029d5]">
            {salvando ? "Salvando..." : curso ? "Salvar alterações" : "Criar curso"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
