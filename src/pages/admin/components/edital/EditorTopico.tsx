import React, { useEffect, useMemo, useRef } from "react";
import { ArrowDown, ArrowUp, ChevronDown, Copy, ExternalLink, Filter, Loader2, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Facetas } from "@/services/questoesAdminService";
import { contarQuestoes, FiltroTopico, montarLinkQuestoes, temFiltro, TopicoEdital } from "@/services/editalAdminService";
import { CampoEscolhaMultipla } from "../questoes/CampoEscolha";

export type EstadoContagem = "contando" | "erro" | undefined;

interface EditorTopicoProps {
  topico: TopicoEdital;
  indice: number;
  total: number;
  aberto: boolean;
  facetas: Facetas;
  contagem: EstadoContagem;
  /** Filtros do tópico anterior, para copiar. */
  filtrosAnteriores?: FiltroTopico;
  onAlternar: () => void;
  onChange: (t: TopicoEdital) => void;
  onContar: () => void;
  onMover: (dir: -1 | 1) => void;
  onDuplicar: () => void;
  onRemover: () => void;
  onEnter: () => void;
  autoFocus?: boolean;
}

const unicos = (l: string[]) => [...new Set(l)].sort((a, b) => a.localeCompare(b, "pt-BR"));

/** Resumo curto dos filtros, para a linha recolhida. */
function resumoFiltros(f: FiltroTopico): string {
  const partes: string[] = [];
  const parte = (l: string[], varios: string) => {
    if (l.length === 1) partes.push(l[0]);
    else if (l.length > 1) partes.push(`${l.length} ${varios}`);
  };
  parte(f.disciplinas, "disciplinas");
  parte(f.assuntos, "assuntos");
  parte(f.topicos, "tópicos");
  parte(f.bancas, "bancas");
  return partes.join(" · ");
}

/** Uma linha da lista de tópicos da disciplina, com os filtros de questões abaixo. */
export const EditorTopico: React.FC<EditorTopicoProps> = ({
  topico,
  indice,
  total,
  aberto,
  facetas,
  contagem,
  filtrosAnteriores,
  onAlternar,
  onChange,
  onContar,
  onMover,
  onDuplicar,
  onRemover,
  onEnter,
  autoFocus,
}) => {
  const f = topico.filtros;
  const comFiltro = temFiltro(f);
  const link = comFiltro ? montarLinkQuestoes(f) : topico.link;
  const setFiltro = (k: keyof FiltroTopico, v: string[]) => onChange({ ...topico, filtros: { ...f, [k]: v } });

  const assuntosSugeridos = useMemo(() => unicos(f.disciplinas.flatMap((d) => facetas.assuntosPorDisciplina[d] || [])), [f.disciplinas, facetas]);
  const topicosSugeridos = useMemo(() => unicos(f.assuntos.flatMap((a) => facetas.topicosPorAssunto[a] || [])), [f.assuntos, facetas]);

  // Reconta sozinho quando os filtros mudam com o painel aberto
  const chaveFiltros = JSON.stringify(f);
  const primeira = useRef(true);
  useEffect(() => {
    if (primeira.current) {
      primeira.current = false;
      return;
    }
    if (!aberto) return;
    const t = setTimeout(onContar, 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chaveFiltros]);

  const resumo = resumoFiltros(f);

  return (
    <li className={cn("rounded-lg border bg-white transition-colors", aberto ? "border-[#5f2ebe]/40 shadow-sm" : "border-slate-200")}>
      <div className="flex items-center gap-2 px-2 py-1.5 sm:px-3">
        <span className="w-6 shrink-0 text-right text-xs tabular-nums text-slate-400">{indice + 1}.</span>
        <Input
          value={topico.nome}
          onChange={(e) => onChange({ ...topico, nome: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onEnter();
            }
          }}
          autoFocus={autoFocus}
          placeholder="Nome do tópico, como está no edital"
          aria-label={`Nome do tópico ${indice + 1}`}
          className="h-8 min-w-0 flex-1 border-transparent bg-transparent px-2 shadow-none hover:border-slate-200 focus-visible:border-input focus-visible:bg-white"
        />
        <button
          type="button"
          onClick={onAlternar}
          aria-expanded={aberto}
          title={comFiltro ? resumo : link ? "Link manual" : "Sem filtro de questões"}
          className={cn(
            "hidden max-w-[16rem] shrink items-center gap-1 truncate rounded-full px-2 py-0.5 text-[11px] font-medium md:inline-flex",
            comFiltro ? "bg-[#5f2ebe]/[0.07] text-[#4a2396]" : link ? "bg-slate-100 text-slate-600" : "bg-amber-50 text-amber-700"
          )}
        >
          <Filter className="h-3 w-3 shrink-0" />
          <span className="truncate">{comFiltro ? resumo : link ? "Link manual" : "Sem filtro"}</span>
        </button>
        <span className="hidden w-20 shrink-0 text-right text-xs tabular-nums text-slate-500 sm:block">
          {contagem === "contando" ? (
            <Loader2 className="ml-auto h-3.5 w-3.5 animate-spin text-slate-400" />
          ) : comFiltro ? (
            `${topico.quantidade.toLocaleString("pt-BR")} quest.`
          ) : (
            "—"
          )}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onAlternar}
          aria-label={aberto ? "Fechar filtros" : "Editar filtros de questões"}
          className="h-8 w-8 shrink-0 text-slate-500"
        >
          <ChevronDown className={cn("h-4 w-4 transition-transform", aberto && "rotate-180")} />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="icon" aria-label="Mais ações do tópico" className="h-8 w-8 shrink-0 text-slate-500">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem disabled={indice === 0} onClick={() => onMover(-1)}>
              <ArrowUp className="mr-2 h-4 w-4" /> Subir
            </DropdownMenuItem>
            <DropdownMenuItem disabled={indice === total - 1} onClick={() => onMover(1)}>
              <ArrowDown className="mr-2 h-4 w-4" /> Descer
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDuplicar}>
              <Copy className="mr-2 h-4 w-4" /> Duplicar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onRemover} className="text-red-600 focus:bg-red-50 focus:text-red-700">
              <Trash2 className="mr-2 h-4 w-4" /> Remover
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {aberto && (
        <div className="space-y-3 border-t border-slate-100 bg-slate-50/60 px-3 py-3 sm:pl-11">
          <p className="text-xs text-slate-500">
            Os filtros montam o link “Questões” que o aluno abre neste tópico. Assunto e tópico mostram primeiro o que existe nas
            disciplinas e assuntos escolhidos.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {(
              [
                ["disciplinas", "Disciplina", facetas.disciplinas, undefined, undefined],
                ["assuntos", "Assunto", facetas.assuntos, assuntosSugeridos, "Das disciplinas escolhidas"],
                ["topicos", "Tópico", facetas.topicos, topicosSugeridos, "Dos assuntos escolhidos"],
                ["bancas", "Banca", facetas.bancas, undefined, undefined],
              ] as const
            ).map(([k, rotulo, opcoes, sugeridas, rotuloSugeridas]) => (
              <div key={k} className="space-y-1.5">
                <Label htmlFor={`${topico.chave}-${k}`} className="text-xs font-medium text-slate-600">
                  {rotulo}
                </Label>
                <CampoEscolhaMultipla
                  id={`${topico.chave}-${k}`}
                  valores={f[k]}
                  onChange={(v) => setFiltro(k, v)}
                  opcoes={opcoes}
                  sugeridas={sugeridas}
                  rotuloSugeridas={rotuloSugeridas}
                  permitirNovo={false}
                  placeholder={k === "bancas" ? "Todas" : "Qualquer"}
                />
              </div>
            ))}
          </div>

          {!comFiltro && (
            <div className="space-y-1.5">
              <Label htmlFor={`${topico.chave}-link`} className="text-xs font-medium text-slate-600">
                Ou um link manual (usado só quando não há filtros)
              </Label>
              <Input
                id={`${topico.chave}-link`}
                value={topico.link}
                onChange={(e) => onChange({ ...topico, link: e.target.value })}
                placeholder="/questions?... ou https://..."
                className="h-9 bg-white"
              />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
            {comFiltro && (
              <span className="font-medium text-slate-700">
                {contagem === "contando" ? (
                  <span className="inline-flex items-center gap-1.5 text-slate-500">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Contando questões...
                  </span>
                ) : contagem === "erro" ? (
                  <span className="text-red-600">Não foi possível contar as questões</span>
                ) : (
                  <>
                    {topico.quantidade.toLocaleString("pt-BR")} {topico.quantidade === 1 ? "questão" : "questões"} com esses filtros
                    {topico.quantidade === 0 && <span className="ml-1 font-normal text-amber-600">(confira os filtros)</span>}
                  </>
                )}
              </span>
            )}
            {link && (
              <a href={link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-[#5f2ebe] hover:underline">
                <ExternalLink className="h-3.5 w-3.5" /> Abrir questões
              </a>
            )}
            {filtrosAnteriores && temFiltro(filtrosAnteriores) && (
              <button
                type="button"
                onClick={() => onChange({ ...topico, filtros: { ...filtrosAnteriores } })}
                className="font-medium text-slate-500 hover:text-slate-800"
              >
                Copiar filtros do tópico anterior
              </button>
            )}
            {comFiltro && (
              <button
                type="button"
                onClick={() => onChange({ ...topico, filtros: { disciplinas: [], assuntos: [], topicos: [], bancas: [] } })}
                className="font-medium text-slate-500 hover:text-slate-800"
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>
      )}
    </li>
  );
};
