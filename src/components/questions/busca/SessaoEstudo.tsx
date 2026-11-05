import React, { useEffect, useState } from "react";
import { Pause, Play, RotateCcw, Timer } from "lucide-react";
import { cn } from "@/lib/utils";

const relogio = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const seg = s % 60;
  const dois = (n: number) => String(n).padStart(2, "0");
  return h ? `${h}:${dois(m)}:${dois(seg)}` : `${dois(m)}:${dois(seg)}`;
};

/**
 * Placar da sessão: conta acertos e erros das questões respondidas nesta
 * visita e marca o tempo. Substitui o contador flutuante na nova página.
 * O cronômetro começa sozinho na primeira resposta.
 */
export const SessaoEstudo: React.FC<{ className?: string }> = ({ className }) => {
  const [acertos, setAcertos] = useState(0);
  const [erros, setErros] = useState(0);
  const [segundos, setSegundos] = useState(0);
  const [rodando, setRodando] = useState(false);
  const total = acertos + erros;
  const taxa = total ? Math.round((acertos / total) * 100) : 0;

  useEffect(() => {
    window.handleQuestionAnswer = (certo: boolean) => {
      if (certo) setAcertos((n) => n + 1);
      else setErros((n) => n + 1);
      setRodando(true);
    };
    return () => {
      delete window.handleQuestionAnswer;
    };
  }, []);

  useEffect(() => {
    if (!rodando) return;
    const t = setInterval(() => setSegundos((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [rodando]);

  const zerar = () => {
    setAcertos(0);
    setErros(0);
    setSegundos(0);
    setRodando(false);
  };

  return (
    <div className={cn("flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-sm shadow-[0_1px_3px_rgba(16,24,40,0.05)]", className)}>
      <span className="hidden text-xs font-semibold uppercase tracking-wide text-slate-400 lg:inline">Sessão</span>
      <span className="flex items-center gap-1 font-semibold tabular-nums text-emerald-600" title="Acertos">
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        {acertos}
      </span>
      <span className="flex items-center gap-1 font-semibold tabular-nums text-red-500" title="Erros">
        <span className="h-2 w-2 rounded-full bg-red-500" />
        {erros}
      </span>
      <span className={cn("font-bold tabular-nums", total ? "text-slate-900" : "text-slate-300")} title="Aproveitamento">
        {taxa}%
      </span>
      <span className="h-4 w-px bg-slate-200" />
      <span className="flex items-center gap-1 tabular-nums text-slate-600" title="Tempo de estudo">
        <Timer className="h-3.5 w-3.5 text-slate-400" />
        {relogio(segundos)}
      </span>
      <button
        type="button"
        onClick={() => setRodando((r) => !r)}
        aria-label={rodando ? "Pausar cronômetro" : "Iniciar cronômetro"}
        className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
      >
        {rodando ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
      </button>
      {(total > 0 || segundos > 0) && (
        <button type="button" onClick={zerar} aria-label="Zerar sessão" className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};
