import React from "react";
import { Concurso } from "@/types/concurso";
import { BlogPost } from "@/components/blog/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CalendarDays, Edit, ExternalLink, FileText, MoreHorizontal, Star, Trash2, Users, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { dataCompleta, dataCurta, diasAte, NIVEL_CURTO, paraData, statusConcurso } from "./utils";

interface ListagemConcursosProps {
  concursos: Concurso[];
  postsPorId: Map<string, BlogPost>;
  onEditar: (concurso: Concurso) => void;
  onExcluir: (id: string) => void;
  onToggleDestaque: (concurso: Concurso) => void;
  vazio?: React.ReactNode;
}

const ESTILO_STATUS = {
  aberto: { label: "Inscrições abertas", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  "em-breve": { label: "Em breve", cls: "bg-sky-50 text-sky-700 ring-sky-200" },
  encerrado: { label: "Encerrado", cls: "bg-slate-100 text-slate-500 ring-slate-200" },
} as const;

/** Quadradinho de calendário com a data de fim das inscrições. */
const Calendario: React.FC<{ concurso: Concurso }> = ({ concurso }) => {
  const status = statusConcurso(concurso);
  const alvo = status === "em-breve" ? concurso.dataInicioInscricao : concurso.dataFimInscricao;
  const d = paraData(alvo);
  return (
    <div
      className={cn(
        "flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg border text-center",
        status === "aberto" ? "border-[#5f2ebe]/20 bg-[#faf8ff] text-[#5f2ebe]" : "border-slate-200 bg-slate-50 text-slate-500"
      )}
      title={status === "em-breve" ? "Início das inscrições" : "Fim das inscrições"}
    >
      <span className="text-[10px] font-semibold uppercase leading-none">
        {d ? d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "") : "—"}
      </span>
      <span className="text-xl font-bold leading-tight tabular-nums">{d ? d.getDate() : ""}</span>
      <span className="text-[9px] uppercase leading-none opacity-70">{status === "em-breve" ? "início" : "fim"}</span>
    </div>
  );
};

const Prazo: React.FC<{ concurso: Concurso }> = ({ concurso }) => {
  const status = statusConcurso(concurso);
  if (status === "encerrado") return null;
  const dias = diasAte(status === "em-breve" ? concurso.dataInicioInscricao : concurso.dataFimInscricao);
  if (dias === null) return null;
  const texto =
    status === "em-breve"
      ? dias <= 1 ? (dias === 0 ? "abre hoje" : "abre amanhã") : `abre em ${dias} dias`
      : dias === 0 ? "termina hoje" : dias === 1 ? "termina amanhã" : `termina em ${dias} dias`;
  return (
    <span className={cn("text-xs font-medium", status === "aberto" && dias <= 7 ? "text-amber-600" : "text-slate-500")}>
      {texto}
    </span>
  );
};

const ListagemConcursos: React.FC<ListagemConcursosProps> = ({
  concursos,
  postsPorId,
  onEditar,
  onExcluir,
  onToggleDestaque,
  vazio,
}) => {
  if (concursos.length === 0) return <>{vazio}</>;

  return (
    <ul className="divide-y divide-slate-100">
      {concursos.map((concurso) => {
        const status = statusConcurso(concurso);
        const estilo = ESTILO_STATUS[status];
        const post = concurso.postId ? postsPorId.get(concurso.postId) : undefined;
        const estados = concurso.estados || [];
        return (
          <li key={concurso.id} className="group flex items-start gap-3 px-3 py-3.5 transition-colors hover:bg-[#faf8ff] sm:items-center sm:gap-4 sm:px-4">
            <Calendario concurso={concurso} />

            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <button
                  type="button"
                  onClick={() => onEditar(concurso)}
                  className="text-left text-sm font-semibold leading-snug text-slate-900 hover:text-[#5f2ebe]"
                >
                  {concurso.titulo}
                </button>
                {concurso.destacar && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-label="Destacado na página inicial" />}
              </div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium ring-1", estilo.cls)}>{estilo.label}</span>
                {concurso.prorrogado && (
                  <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[11px] font-medium text-purple-700 ring-1 ring-purple-200">
                    Prorrogado
                  </span>
                )}
                <Prazo concurso={concurso} />
                <span className="hidden items-center gap-1 sm:inline-flex">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {dataCurta(concurso.dataInicioInscricao)} – {dataCurta(concurso.dataFimInscricao)}
                </span>
                {concurso.dataProva && <span className="hidden sm:inline">· prova {dataCompleta(concurso.dataProva)}</span>}
              </div>
              <div className="flex flex-wrap items-center gap-1">
                {concurso.niveis.map((n) => (
                  <span key={n} className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600">
                    {NIVEL_CURTO[n] || n}
                  </span>
                ))}
                {estados.slice(0, 5).map((uf) => (
                  <span key={uf} className="rounded border border-slate-200 px-1.5 py-0.5 text-[11px] font-medium text-slate-600">
                    {uf}
                  </span>
                ))}
                {estados.length > 5 && (
                  <span className="text-[11px] text-slate-400" title={estados.join(", ")}>
                    +{estados.length - 5}
                  </span>
                )}
                {post && (
                  <span className="ml-1 inline-flex items-center gap-1 truncate text-[11px] text-slate-400" title={post.title}>
                    <FileText className="h-3 w-3" /> post vinculado
                  </span>
                )}
              </div>
            </div>

            <div className="hidden shrink-0 flex-col items-end gap-1 text-xs text-slate-500 md:flex">
              <span className="flex items-center gap-1 tabular-nums" title="Vagas">
                <Users className="h-3.5 w-3.5" />
                <span className="font-semibold text-slate-800">{(concurso.vagas || 0).toLocaleString("pt-BR")}</span> vagas
              </span>
              {concurso.salario && (
                <span className="flex items-center gap-1" title="Salário">
                  <Wallet className="h-3.5 w-3.5" /> {concurso.salario}
                </span>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <Button type="button" variant="outline" size="sm" onClick={() => onEditar(concurso)} className="hidden h-8 sm:inline-flex">
                <Edit className="mr-1.5 h-3.5 w-3.5" />
                Editar
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label="Mais ações">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => onEditar(concurso)} className="sm:hidden">
                    <Edit className="mr-2 h-4 w-4" /> Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onToggleDestaque(concurso)}>
                    <Star className="mr-2 h-4 w-4" />
                    {concurso.destacar ? "Tirar da página inicial" : "Destacar na página inicial"}
                  </DropdownMenuItem>
                  {post?.slug && (
                    <DropdownMenuItem asChild>
                      <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" /> Ver post vinculado
                      </a>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onExcluir(concurso.id)} className="text-red-600 focus:bg-red-50 focus:text-red-700">
                    <Trash2 className="mr-2 h-4 w-4" /> Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default ListagemConcursos;
