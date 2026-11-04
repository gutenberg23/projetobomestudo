import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/** Peças visuais comuns às abas do curso (Edital, Simulados, Ciclo e Lei Seca). */

export const Painel: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div
    className={cn("rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(16,24,40,0.05)]", className)}
    {...props}
  />
);

export const CabecalhoAba: React.FC<{
  titulo: string;
  descricao?: React.ReactNode;
  acoes?: React.ReactNode;
  className?: string;
}> = ({ titulo, descricao, acoes, className }) => (
  <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between", className)}>
    <div className="min-w-0">
      <h2 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">{titulo}</h2>
      {descricao && <p className="mt-1 text-sm text-slate-500">{descricao}</p>}
    </div>
    {acoes && <div className="flex shrink-0 flex-wrap items-center gap-2">{acoes}</div>}
  </div>
);

export const Metrica: React.FC<{
  rotulo: string;
  valor: React.ReactNode;
  detalhe?: React.ReactNode;
  icone?: React.ElementType;
  tom?: "roxo" | "rosa" | "verde" | "laranja" | "azul" | "cinza";
  children?: React.ReactNode;
  className?: string;
}> = ({ rotulo, valor, detalhe, icone: Icone, tom = "roxo", children, className }) => {
  const cores: Record<string, string> = {
    roxo: "bg-[#5f2ebe]/10 text-[#5f2ebe]",
    rosa: "bg-[#ea2be2]/10 text-[#c41fbd]",
    verde: "bg-emerald-50 text-emerald-600",
    laranja: "bg-amber-50 text-amber-600",
    azul: "bg-sky-50 text-sky-600",
    cinza: "bg-slate-100 text-slate-500",
  };
  return (
    <Painel className={cn("flex min-w-0 flex-col gap-2 p-3 sm:p-4", className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium uppercase leading-tight tracking-wide text-slate-500 sm:text-xs">{rotulo}</span>
        {Icone && (
          <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", cores[tom])}>
            <Icone className="h-4 w-4" />
          </span>
        )}
      </div>
      <div className="text-xl font-bold tabular-nums text-slate-900 sm:text-2xl">{valor}</div>
      {detalhe && <div className="text-xs text-slate-500">{detalhe}</div>}
      {children}
    </Painel>
  );
};

export const BarraProgresso: React.FC<{ valor: number; className?: string; corClasse?: string; marca?: number }> = ({
  valor,
  className,
  corClasse = "bg-[#5f2ebe]",
  marca,
}) => (
  <div className={cn("relative h-2 w-full overflow-hidden rounded-full bg-slate-100", className)}>
    <div className={cn("h-full rounded-full transition-all", corClasse)} style={{ width: `${Math.max(0, Math.min(100, valor))}%` }} />
    {marca !== undefined && marca > 0 && marca < 100 && (
      <div className="absolute inset-y-0 w-0.5 bg-slate-400/70" style={{ left: `${marca}%` }} title={`Meta: ${marca}%`} />
    )}
  </div>
);

/** Cor do aproveitamento em relação à meta do aluno. */
export const tomAproveitamento = (valor: number, meta: number, tentativas: number) => {
  if (tentativas === 0) return { texto: "text-slate-400", fundo: "bg-slate-100 text-slate-500", barra: "bg-slate-300" };
  if (valor >= meta) return { texto: "text-emerald-600", fundo: "bg-emerald-50 text-emerald-700", barra: "bg-emerald-500" };
  if (valor >= meta - 15) return { texto: "text-amber-600", fundo: "bg-amber-50 text-amber-700", barra: "bg-amber-500" };
  return { texto: "text-red-600", fundo: "bg-red-50 text-red-700", barra: "bg-red-500" };
};

export const EstadoVazio: React.FC<{
  icone: React.ElementType;
  titulo: string;
  texto?: React.ReactNode;
  acao?: React.ReactNode;
  className?: string;
}> = ({ icone: Icone, titulo, texto, acao, className }) => (
  <Painel className={cn("flex flex-col items-center px-6 py-14 text-center", className)}>
    <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#5f2ebe]/10 text-[#5f2ebe]">
      <Icone className="h-7 w-7" />
    </span>
    <h3 className="text-lg font-semibold text-slate-900">{titulo}</h3>
    {texto && <p className="mt-1 max-w-md text-sm text-slate-500">{texto}</p>}
    {acao && <div className="mt-5">{acao}</div>}
  </Painel>
);

export const Carregando: React.FC<{ texto?: string }> = ({ texto = "Carregando..." }) => (
  <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 text-sm text-slate-500">
    <Loader2 className="h-7 w-7 animate-spin text-[#5f2ebe]" />
    {texto}
  </div>
);

/** Botões em grupo (segmented control) para filtros e modos. */
export function Segmentos<T extends string>({
  valor,
  opcoes,
  onChange,
  className,
}: {
  valor: T;
  opcoes: Array<{ valor: T; rotulo: React.ReactNode; contagem?: number }>;
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex max-w-full overflow-x-auto rounded-xl bg-slate-100 p-1", className)}>
      {opcoes.map((o) => (
        <button
          key={o.valor}
          type="button"
          onClick={() => onChange(o.valor)}
          className={cn(
            "flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
            valor === o.valor ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
          )}
        >
          {o.rotulo}
          {o.contagem !== undefined && (
            <span
              className={cn(
                "rounded-full px-1.5 text-xs tabular-nums",
                valor === o.valor ? "bg-[#5f2ebe]/10 text-[#5f2ebe]" : "bg-slate-200/70 text-slate-500"
              )}
            >
              {o.contagem}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

/** Tira acentos e caixa para buscas. */
export const normalizar = (s: string) =>
  (s || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
