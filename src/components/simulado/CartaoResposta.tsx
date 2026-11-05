import React from "react";
import { cn } from "@/lib/utils";

export type SituacaoQuestao = "acertou" | "errou" | "branco";

interface Props {
  situacoes: SituacaoQuestao[];
  atual: number | null;
  onIr: (indice: number) => void;
  className?: string;
}

const cores: Record<SituacaoQuestao, string> = {
  acertou: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300",
  errou: "border-red-200 bg-red-50 text-red-600 hover:border-red-300",
  branco: "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
};

/** Cartão-resposta do simulado: um quadradinho por questão, colorido pela resposta. */
export const CartaoResposta: React.FC<Props> = ({ situacoes, atual, onIr, className }) => (
  <div className={className}>
    <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-8 lg:grid-cols-5">
      {situacoes.map((s, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onIr(i)}
          aria-label={`Questão ${i + 1}${s === "acertou" ? ", acertou" : s === "errou" ? ", errou" : ", em branco"}`}
          aria-current={atual === i ? "step" : undefined}
          className={cn(
            "flex h-9 items-center justify-center rounded-lg border text-xs font-semibold tabular-nums transition-colors",
            cores[s],
            atual === i && "ring-2 ring-[#5f2ebe] ring-offset-1"
          )}
        >
          {i + 1}
        </button>
      ))}
    </div>
    <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500">
      <span className="flex items-center gap-1">
        <span className="h-2.5 w-2.5 rounded-sm border border-emerald-200 bg-emerald-50" /> Acertou
      </span>
      <span className="flex items-center gap-1">
        <span className="h-2.5 w-2.5 rounded-sm border border-red-200 bg-red-50" /> Errou
      </span>
      <span className="flex items-center gap-1">
        <span className="h-2.5 w-2.5 rounded-sm border border-slate-200 bg-white" /> Em branco
      </span>
    </div>
  </div>
);
