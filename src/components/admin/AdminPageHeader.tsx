import React from "react";
import { Link } from "react-router-dom";

interface AdminPageHeaderProps {
  titulo: string;
  descricao?: React.ReactNode;
  /** Botões de ação (ex.: "Criar tópico") */
  acoes?: React.ReactNode;
  /** Linha opcional abaixo do título (ex.: dicas de fluxo) */
  children?: React.ReactNode;
}

/** Cabeçalho padrão das páginas do admin: título, descrição e ações à direita. */
export const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({ titulo, descricao, acoes, children }) => (
  <div className="mb-6 space-y-3">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="admin-page-title">{titulo}</h1>
        {descricao && <p className="mt-1 text-sm text-slate-500">{descricao}</p>}
      </div>
      {acoes && <div className="flex flex-wrap items-center gap-2 sm:justify-end">{acoes}</div>}
    </div>
    {children}
  </div>
);

interface FluxoConteudoProps {
  atual: "teorias" | "topicos" | "aulas" | "disciplinas" | "cursos";
}

const PASSOS: { id: FluxoConteudoProps["atual"]; label: string; path: string }[] = [
  { id: "teorias", label: "Teorias", path: "/admin/teorias" },
  { id: "disciplinas", label: "Disciplinas", path: "/admin/disciplinas" },
  { id: "cursos", label: "Cursos", path: "/admin/cursos" },
];

/**
 * Trilha que mostra onde a página está no fluxo de montagem do curso:
 * teoria → disciplina → curso. (Tópicos e aulas saíram do fluxo: a disciplina é formada por teorias.)
 */
export const FluxoConteudo: React.FC<FluxoConteudoProps> = ({ atual }) =>
  atual === "topicos" || atual === "aulas" ? (
    <p className="text-xs text-amber-700">
      Modelo antigo: as disciplinas agora são formadas por teorias. Esta página fica só para consulta.
    </p>
  ) : (
  <ol className="flex flex-wrap items-center gap-1 text-xs" aria-label="Etapas da montagem do curso">
    {PASSOS.map((p, i) => (
      <li key={p.id} className="flex items-center gap-1">
        {i > 0 && <span className="text-slate-300" aria-hidden>→</span>}
        <Link
          to={p.path}
          aria-current={p.id === atual ? "step" : undefined}
          className={
            p.id === atual
              ? "rounded-full bg-[#5f2ebe] px-2.5 py-1 font-medium text-white"
              : "rounded-full bg-white px-2.5 py-1 text-slate-500 ring-1 ring-slate-200 hover:text-[#5f2ebe] hover:ring-[#5f2ebe]/30"
          }
        >
          {i + 1}. {p.label}
        </Link>
      </li>
    ))}
  </ol>
);
