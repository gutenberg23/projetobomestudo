import React from "react";
import { BookOpenText, Copy, Edit, ExternalLink, FolderOpen, Heart, Layers, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Contador, MenuAcoes, copiarTexto } from "@/components/admin/ui/listagem";
import { generateFriendlyUrl } from "@/utils/slug-utils";
import { Curso } from "./CursosTypes";

interface CursosTableProps {
  cursos: Curso[];
  nomesDisciplinas: Map<string, string>;
  onEditar: (curso: Curso) => void;
  onExcluir: (curso: Curso) => void;
  vazio?: React.ReactNode;
}

export const CursosTable: React.FC<CursosTableProps> = ({ cursos, nomesDisciplinas, onEditar, onExcluir, vazio }) => {
  if (cursos.length === 0) return <>{vazio}</>;

  return (
    <ul className="divide-y divide-slate-100">
      {cursos.map((curso) => {
        const nomes = curso.disciplinasIds.map((id) => nomesDisciplinas.get(id)).filter(Boolean) as string[];
        const link = `/course/${generateFriendlyUrl(curso.titulo, curso.id)}`;
        return (
          <li key={curso.id} className="group flex items-start gap-3 px-3 py-3.5 transition-colors hover:bg-[#faf8ff] sm:items-center sm:gap-4 sm:px-4">
            <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#5f2ebe]/10 text-[#5f2ebe] sm:flex" aria-hidden>
              <FolderOpen className="h-5 w-5" />
            </span>

            <div className="min-w-0 flex-1">
              <button
                type="button"
                onClick={() => onEditar(curso)}
                className="text-left text-sm font-semibold leading-snug text-slate-900 hover:text-[#5f2ebe]"
              >
                {curso.titulo}
              </button>
              <p className="mt-0.5 text-xs text-slate-500">
                {curso.descricao || <span className="italic text-slate-400">sem cargo</span>}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-1">
                {nomes.length === 0 ? (
                  <span className="text-[11px] italic text-amber-600">nenhuma disciplina</span>
                ) : (
                  nomes.slice(0, 4).map((n, i) => (
                    <span key={`${n}-${i}`} className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600">
                      <Layers className="h-3 w-3 text-slate-400" />
                      {n}
                    </span>
                  ))
                )}
                {nomes.length > 4 && (
                  <span className="text-[11px] text-slate-400" title={nomes.join(", ")}>
                    +{nomes.length - 4}
                  </span>
                )}
              </div>
              {/* Contagens no celular */}
              <div className="mt-1.5 flex flex-wrap gap-3 text-xs md:hidden">
                <Contador icone={BookOpenText} n={curso.totalTeorias} titulo="teorias" />
              </div>
            </div>

            <div className="hidden items-center gap-4 text-xs md:flex">
              <Contador icone={BookOpenText} n={curso.totalTeorias} titulo="teorias" />
              <Contador icone={Heart} n={curso.favoritos} titulo="alunos favoritaram" className={curso.favoritos ? "text-fuchsia-600" : ""} />
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <Button variant="ghost" size="sm" onClick={() => onEditar(curso)} className="hidden text-slate-600 sm:inline-flex">
                <Edit className="mr-1.5 h-4 w-4" />
                Editar
              </Button>
              <MenuAcoes
                acoes={[
                  { label: "Editar", icone: Edit, onClick: () => onEditar(curso), soCelular: true },
                  { label: "Ver no site", icone: ExternalLink, href: link, externo: true },
                  {
                    label: "Copiar ID",
                    icone: Copy,
                    onClick: async () =>
                      (await copiarTexto(curso.id)) ? toast.success("ID copiado") : toast.error("Não foi possível copiar"),
                  },
                  { label: "Excluir", icone: Trash2, onClick: () => onExcluir(curso), perigo: true, separadorAntes: true },
                ]}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
};
