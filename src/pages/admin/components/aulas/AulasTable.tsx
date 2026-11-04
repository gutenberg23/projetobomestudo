import React, { useEffect, useState } from "react";
import { ChevronDown, Copy, CopyPlus, Edit, FileQuestion, Layers, ListOrdered, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CaixaSelecao, Contador, Etiqueta, MenuAcoes, copiarTexto } from "@/components/admin/ui/listagem";
import { cn } from "@/lib/utils";
import { Aula } from "./AulasTypes";
import { TopicoResumo } from "./hooks/useAulasActions";
import { ItemOrdenavel, ListaOrdenavel } from "../shared/ListaOrdenavel";

interface AulasTableProps {
  aulas: Aula[];
  selecao: string[];
  topicos: Map<string, TopicoResumo>;
  disciplinasDaAula: Map<string, { id: string; titulo: string }[]>;
  onAlternar: (id: string) => void;
  onAlternarPagina: () => void;
  onEditar: (aula: Aula) => void;
  onExcluir: (aula: Aula) => void;
  onDuplicar: (aula: Aula) => void;
  onReordenar: (aula: Aula, ordem: string[]) => Promise<void>;
  vazio?: React.ReactNode;
}

/** Tópicos da aula, abertos abaixo da linha, com reordenação. */
const PainelTopicos: React.FC<{
  aula: Aula;
  topicos: Map<string, TopicoResumo>;
  onReordenar: (ordem: string[]) => Promise<void>;
  onEditar: () => void;
}> = ({ aula, topicos, onReordenar, onEditar }) => {
  const paraItens = (ids: string[]): ItemOrdenavel[] =>
    ids.map((id) => {
      const t = topicos.get(id);
      return {
        id,
        titulo: t?.nome || "Tópico não encontrado",
        detalhe: t ? `${t.disciplina} · ${t.questoes_ids.length} questões` : id,
      };
    });
  const [itens, setItens] = useState(paraItens(aula.topicosIds));
  const [salvando, setSalvando] = useState(false);

  useEffect(() => setItens(paraItens(aula.topicosIds)), [aula.topicosIds, topicos]); // eslint-disable-line react-hooks/exhaustive-deps

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
          Ordem dos tópicos {salvando ? "· salvando..." : "· arraste ou use as setas, a ordem é salva na hora"}
        </p>
        <Button variant="ghost" size="sm" className="h-7 text-xs text-[#5f2ebe]" onClick={onEditar}>
          Adicionar ou remover tópicos
        </Button>
      </div>
      <ListaOrdenavel
        id={`aula-${aula.id}`}
        itens={itens}
        onChange={mudar}
        desabilitado={salvando}
        vazio={<p className="py-3 text-sm text-slate-400">Esta aula ainda não tem tópicos.</p>}
      />
    </div>
  );
};

export const AulasTable: React.FC<AulasTableProps> = ({
  aulas,
  selecao,
  topicos,
  disciplinasDaAula,
  onAlternar,
  onAlternarPagina,
  onEditar,
  onExcluir,
  onDuplicar,
  onReordenar,
  vazio,
}) => {
  const [aberta, setAberta] = useState<string | null>(null);
  if (aulas.length === 0) return <>{vazio}</>;

  const marcadas = aulas.filter((a) => selecao.includes(a.id)).length;

  return (
    <div>
      <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/70 px-3 py-2 text-xs font-medium text-slate-500 sm:px-4">
        <CaixaSelecao
          marcado={marcadas === aulas.length ? true : marcadas > 0 ? "indeterminado" : false}
          onChange={onAlternarPagina}
          rotulo="Selecionar todas desta página"
        />
        <span className="flex-1">Aula</span>
      </div>
      <ul className="divide-y divide-slate-100">
        {aulas.map((aula) => {
          const pos = selecao.indexOf(aula.id);
          const disciplinas = disciplinasDaAula.get(aula.id) || [];
          const expandida = aberta === aula.id;
          return (
            <li key={aula.id} className={cn(pos >= 0 && "bg-[#5f2ebe]/[0.04]")}>
              <div className={cn("flex items-center gap-3 px-3 py-3 transition-colors sm:px-4", pos < 0 && "hover:bg-[#faf8ff]")}>
                <CaixaSelecao marcado={pos >= 0} onChange={() => onAlternar(aula.id)} rotulo={`Selecionar ${aula.titulo}`} />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onEditar(aula)}
                      className="text-left text-sm font-semibold leading-snug text-slate-900 hover:text-[#5f2ebe]"
                    >
                      {aula.titulo}
                    </button>
                    {pos >= 0 && <Etiqueta tom="roxo">{pos + 1}ª na seleção</Etiqueta>}
                  </div>
                  {aula.descricao && (
                    <p className="mt-0.5 line-clamp-1 text-xs text-slate-500" title={aula.descricao}>
                      <span className="font-medium text-slate-400">No edital:</span> {aula.descricao}
                    </p>
                  )}
                  <div className="mt-1 flex flex-wrap items-center gap-1">
                    {disciplinas.length === 0 ? (
                      <span className="text-[11px] italic text-slate-400">em nenhuma disciplina</span>
                    ) : (
                      disciplinas.slice(0, 3).map((d) => (
                        <span key={d.id} className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600">
                          <Layers className="h-3 w-3 text-slate-400" />
                          {d.titulo}
                        </span>
                      ))
                    )}
                    {disciplinas.length > 3 && (
                      <span className="text-[11px] text-slate-400" title={disciplinas.map((d) => d.titulo).join(", ")}>
                        +{disciplinas.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                <div className="hidden items-center gap-4 text-xs md:flex">
                  <Contador icone={FileQuestion} n={aula.totalQuestoes || 0} titulo="questões" />
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAberta(expandida ? null : aula.id)}
                    aria-expanded={expandida}
                    className="text-slate-600"
                  >
                    <span className="hidden sm:inline">{aula.topicosIds.length} tópicos</span>
                    <span className="sm:hidden tabular-nums">{aula.topicosIds.length}</span>
                    <ChevronDown className={cn("ml-1 h-4 w-4 transition-transform", expandida && "rotate-180")} />
                  </Button>
                  <MenuAcoes
                    acoes={[
                      { label: "Editar", icone: Edit, onClick: () => onEditar(aula) },
                      { label: "Ordenar tópicos", icone: ListOrdered, onClick: () => setAberta(aula.id) },
                      { label: "Duplicar", icone: CopyPlus, onClick: () => onDuplicar(aula) },
                      {
                        label: "Copiar ID",
                        icone: Copy,
                        onClick: async () =>
                          (await copiarTexto(aula.id)) ? toast.success("ID copiado") : toast.error("Não foi possível copiar"),
                      },
                      { label: "Excluir", icone: Trash2, onClick: () => onExcluir(aula), perigo: true, separadorAntes: true },
                    ]}
                  />
                </div>
              </div>
              {expandida && (
                <PainelTopicos
                  aula={aula}
                  topicos={topicos}
                  onReordenar={(ordem) => onReordenar(aula, ordem)}
                  onEditar={() => onEditar(aula)}
                />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
