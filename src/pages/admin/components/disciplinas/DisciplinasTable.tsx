import React, { useEffect, useState } from "react";
import { BookOpen, ChevronDown, Copy, Edit, FileQuestion, FolderOpen, Heart, ListOrdered, ListTree, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CaixaSelecao, Contador, Etiqueta, MenuAcoes, copiarTexto } from "@/components/admin/ui/listagem";
import { cn } from "@/lib/utils";
import { Disciplina } from "./DisciplinasTypes";
import { AulaResumo } from "./useDisciplinas";
import { ItemOrdenavel, ListaOrdenavel } from "../shared/ListaOrdenavel";

interface DisciplinasTableProps {
  disciplinas: Disciplina[];
  selecao: string[];
  aulas: Map<string, AulaResumo>;
  cursosDaDisciplina: Map<string, { id: string; titulo: string }[]>;
  onAlternar: (id: string) => void;
  onAlternarPagina: () => void;
  onEditar: (d: Disciplina) => void;
  onExcluir: (d: Disciplina) => void;
  onReordenar: (d: Disciplina, ordem: string[]) => Promise<void>;
  vazio?: React.ReactNode;
}

const PainelAulas: React.FC<{
  disciplina: Disciplina;
  aulas: Map<string, AulaResumo>;
  onReordenar: (ordem: string[]) => Promise<void>;
  onEditar: () => void;
}> = ({ disciplina, aulas, onReordenar, onEditar }) => {
  const paraItens = (ids: string[]): ItemOrdenavel[] =>
    ids.map((id) => {
      const a = aulas.get(id);
      return { id, titulo: a?.titulo || "Aula não encontrada", detalhe: a ? `${a.topicos_ids.length} tópicos` : id };
    });
  const [itens, setItens] = useState(paraItens(disciplina.aulasIds));
  const [salvando, setSalvando] = useState(false);
  useEffect(() => setItens(paraItens(disciplina.aulasIds)), [disciplina.aulasIds, aulas]); // eslint-disable-line react-hooks/exhaustive-deps

  const mudar = async (novos: ItemOrdenavel[]) => {
    setItens(novos);
    setSalvando(true);
    await onReordenar(novos.map((i) => i.id));
    setSalvando(false);
  };

  return (
    <div className="border-t border-slate-100 bg-slate-50/70 px-3 py-3 sm:pl-[3.25rem] sm:pr-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-slate-500">
          Ordem das aulas {salvando ? "· salvando..." : "· arraste ou use as setas, a ordem é salva na hora"}
        </p>
        <Button variant="ghost" size="sm" className="h-7 text-xs text-[#5f2ebe]" onClick={onEditar}>
          Adicionar ou remover aulas
        </Button>
      </div>
      <ListaOrdenavel
        id={`disc-${disciplina.id}`}
        itens={itens}
        onChange={mudar}
        desabilitado={salvando}
        vazio={<p className="py-3 text-sm text-slate-400">Esta disciplina ainda não tem aulas.</p>}
      />
    </div>
  );
};

export const DisciplinasTable: React.FC<DisciplinasTableProps> = ({
  disciplinas,
  selecao,
  aulas,
  cursosDaDisciplina,
  onAlternar,
  onAlternarPagina,
  onEditar,
  onExcluir,
  onReordenar,
  vazio,
}) => {
  const [aberta, setAberta] = useState<string | null>(null);
  if (disciplinas.length === 0) return <>{vazio}</>;
  const marcadas = disciplinas.filter((d) => selecao.includes(d.id)).length;

  return (
    <div>
      <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/70 px-3 py-2 text-xs font-medium text-slate-500 sm:px-4">
        <CaixaSelecao
          marcado={marcadas === disciplinas.length ? true : marcadas > 0 ? "indeterminado" : false}
          onChange={onAlternarPagina}
          rotulo="Selecionar todas desta página"
        />
        <span className="flex-1">Disciplina</span>
      </div>
      <ul className="divide-y divide-slate-100">
        {disciplinas.map((d) => {
          const pos = selecao.indexOf(d.id);
          const cursos = cursosDaDisciplina.get(d.id) || [];
          const expandida = aberta === d.id;
          const rating = parseInt(d.descricao, 10);
          return (
            <li key={d.id} className={cn(pos >= 0 && "bg-[#5f2ebe]/[0.04]")}>
              <div className={cn("flex items-center gap-3 px-3 py-3 transition-colors sm:px-4", pos < 0 && "hover:bg-[#faf8ff]")}>
                <CaixaSelecao marcado={pos >= 0} onChange={() => onAlternar(d.id)} rotulo={`Selecionar ${d.titulo}`} />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onEditar(d)}
                      className="text-left text-sm font-semibold leading-snug text-slate-900 hover:text-[#5f2ebe]"
                    >
                      {d.titulo}
                    </button>
                    {d.banca && <Etiqueta tom="azul">{d.banca}</Etiqueta>}
                    {!Number.isNaN(rating) && (
                      <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-amber-600" title="Nota de rating">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {rating}/10
                      </span>
                    )}
                    {pos >= 0 && <Etiqueta tom="roxo">{pos + 1}ª na seleção</Etiqueta>}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1">
                    {cursos.length === 0 ? (
                      <span className="text-[11px] italic text-slate-400">em nenhum curso</span>
                    ) : (
                      cursos.slice(0, 3).map((c) => (
                        <span key={c.id} className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600">
                          <FolderOpen className="h-3 w-3 text-slate-400" />
                          {c.titulo}
                        </span>
                      ))
                    )}
                    {cursos.length > 3 && (
                      <span className="text-[11px] text-slate-400" title={cursos.map((c) => c.titulo).join(", ")}>
                        +{cursos.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                <div className="hidden items-center gap-4 text-xs md:flex">
                  <Contador icone={BookOpen} n={d.aulasIds.length} titulo="aulas" />
                  <Contador icone={ListTree} n={d.topicosIds?.length || 0} titulo="tópicos" />
                  <Contador icone={FileQuestion} n={d.totalQuestoes || 0} titulo="questões" />
                  <Contador icone={Heart} n={d.favoritos || 0} titulo="alunos favoritaram" className={d.favoritos ? "text-fuchsia-600" : ""} />
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAberta(expandida ? null : d.id)}
                    aria-expanded={expandida}
                    className="text-slate-600"
                  >
                    <span className="hidden sm:inline">{d.aulasIds.length} aulas</span>
                    <span className="tabular-nums sm:hidden">{d.aulasIds.length}</span>
                    <ChevronDown className={cn("ml-1 h-4 w-4 transition-transform", expandida && "rotate-180")} />
                  </Button>
                  <MenuAcoes
                    acoes={[
                      { label: "Editar", icone: Edit, onClick: () => onEditar(d) },
                      { label: "Ordenar aulas", icone: ListOrdered, onClick: () => setAberta(d.id) },
                      {
                        label: "Copiar ID",
                        icone: Copy,
                        onClick: async () =>
                          (await copiarTexto(d.id)) ? toast.success("ID copiado") : toast.error("Não foi possível copiar"),
                      },
                      { label: "Excluir", icone: Trash2, onClick: () => onExcluir(d), perigo: true, separadorAntes: true },
                    ]}
                  />
                </div>
              </div>
              {expandida && (
                <PainelAulas disciplina={d} aulas={aulas} onReordenar={(o) => onReordenar(d, o)} onEditar={() => onEditar(d)} />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
