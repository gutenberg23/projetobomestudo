import React from "react";
import { cn } from "@/lib/utils";

/** Caixa de seleção redonda usada para marcar teorias. */
export const MarcaConcluido: React.FC<{ marcado: boolean; onClick: (e: React.MouseEvent) => void; rotulo: string; tamanho?: "sm" | "md" }> = ({
  marcado,
  onClick,
  rotulo,
  tamanho = "md",
}) => (
  <button
    type="button"
    role="checkbox"
    aria-checked={marcado}
    aria-label={rotulo}
    title={marcado ? "Desmarcar como concluída" : "Marcar como concluída"}
    onClick={(e) => {
      e.stopPropagation();
      onClick(e);
    }}
    className={cn(
      "flex shrink-0 items-center justify-center rounded-full border-2 transition-colors",
      tamanho === "sm" ? "h-5 w-5" : "h-6 w-6",
      marcado ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 bg-white text-transparent hover:border-[#5f2ebe]"
    )}
  >
    <svg viewBox="0 0 14 14" fill="none" className={tamanho === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"}>
      <path d="M11.083 2.917L4.375 9.625 1.917 7.167" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </button>
);

/** Anel de progresso pequeno. */
export const AnelProgresso: React.FC<{ valor: number; tamanho?: number; espessura?: number; className?: string; children?: React.ReactNode }> = ({
  valor,
  tamanho = 48,
  espessura = 5,
  className,
  children,
}) => {
  const r = (tamanho - espessura) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, valor));
  return (
    <div className={cn("relative shrink-0", className)} style={{ width: tamanho, height: tamanho }}>
      <svg width={tamanho} height={tamanho} className="-rotate-90">
        <circle cx={tamanho / 2} cy={tamanho / 2} r={r} fill="none" strokeWidth={espessura} className="stroke-slate-100" />
        <circle
          cx={tamanho / 2}
          cy={tamanho / 2}
          r={r}
          fill="none"
          strokeWidth={espessura}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (v / 100) * c}
          className={cn("transition-all", v >= 100 ? "stroke-emerald-500" : "stroke-[#5f2ebe]")}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-[11px] font-bold tabular-nums text-slate-700">
        {children ?? `${v}%`}
      </div>
    </div>
  );
};
