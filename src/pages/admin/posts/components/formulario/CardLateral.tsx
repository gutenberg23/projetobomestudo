import React from "react";
import { cn } from "@/lib/utils";

interface CardLateralProps {
  titulo: string;
  descricao?: string;
  icone?: React.ReactNode;
  acao?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/** Cartão do editor de posts (coluna lateral e blocos do formulário). */
export const CardLateral: React.FC<CardLateralProps> = ({ titulo, descricao, icone, acao, children, className }) => (
  <section className={cn("rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]", className)}>
    <header className="flex items-start justify-between gap-2 border-b border-slate-100 px-4 py-3">
      <div className="min-w-0">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          {icone}
          {titulo}
        </h3>
        {descricao && <p className="mt-0.5 text-xs text-slate-500">{descricao}</p>}
      </div>
      {acao}
    </header>
    <div className="space-y-3 p-4">{children}</div>
  </section>
);

/** Contador de caracteres com aviso quando passa do ideal. */
export const Contador: React.FC<{ atual: number; ideal: number; max?: number }> = ({ atual, ideal, max }) => (
  <span
    className={cn(
      "text-[11px] tabular-nums",
      max && atual > max ? "text-red-600" : atual > ideal ? "text-amber-600" : "text-slate-400"
    )}
  >
    {atual}/{ideal}
  </span>
);
