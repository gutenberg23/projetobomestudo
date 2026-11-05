import React, { useEffect, useState } from "react";
import { Pause, Play, Timer } from "lucide-react";
import { BarraProgresso } from "@/components/course/ui";
import { cn } from "@/lib/utils";

export const relogio = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const seg = s % 60;
  const dois = (n: number) => String(n).padStart(2, "0");
  return h ? `${h}:${dois(m)}:${dois(seg)}` : `${dois(m)}:${dois(seg)}`;
};

const chave = (id: string) => `simulado_tempo_${id}`;

const lerTempo = (id: string) => {
  try {
    return Math.max(0, parseInt(localStorage.getItem(chave(id)) || "0", 10) || 0);
  } catch {
    return 0;
  }
};

/**
 * Tempo de prova. Começa sozinho ao abrir o simulado e fica guardado no
 * navegador, então recarregar a página não zera o relógio.
 */
export function useCronometro(simuladoId: string | undefined, ativo: boolean) {
  const [segundos, setSegundos] = useState(0);
  const [rodando, setRodando] = useState(true);

  useEffect(() => {
    if (simuladoId) setSegundos(lerTempo(simuladoId));
  }, [simuladoId]);

  useEffect(() => {
    if (!ativo || !rodando || !simuladoId) return;
    const t = setInterval(() => {
      setSegundos((s) => {
        const novo = s + 1;
        try {
          localStorage.setItem(chave(simuladoId), String(novo));
        } catch {
          /* sem armazenamento: o tempo só não sobrevive a um recarregamento */
        }
        return novo;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [ativo, rodando, simuladoId]);

  const zerar = () => {
    setSegundos(0);
    if (!simuladoId) return;
    try {
      localStorage.removeItem(chave(simuladoId));
    } catch {
      /* nada a fazer */
    }
  };

  return { segundos, rodando, alternar: () => setRodando((r) => !r), parar: () => setRodando(false), zerar };
}

interface Props {
  segundos: number;
  rodando: boolean;
  onAlternar: () => void;
  estimadoMin: number;
  className?: string;
}

export const CronometroProva: React.FC<Props> = ({ segundos, rodando, onAlternar, estimadoMin, className }) => {
  const usado = estimadoMin > 0 ? (segundos / (estimadoMin * 60)) * 100 : 0;
  const passou = usado > 100;
  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <Timer className="h-3.5 w-3.5 text-[#5f2ebe]" /> Tempo de prova
        </span>
        <button
          type="button"
          onClick={onAlternar}
          aria-label={rodando ? "Pausar cronômetro" : "Continuar cronômetro"}
          className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800"
        >
          {rodando ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {rodando ? "Pausar" : "Continuar"}
        </button>
      </div>
      <div className={cn("mt-1 text-3xl font-bold tabular-nums tracking-tight", rodando ? "text-slate-900" : "text-slate-400")}>
        {relogio(segundos)}
      </div>
      <BarraProgresso valor={usado} corClasse={passou ? "bg-amber-500" : "bg-[#5f2ebe]"} className="mt-2 h-1.5" />
      <p className="mt-1.5 text-xs text-slate-500">
        {passou ? "Passou do tempo sugerido de " : "Tempo sugerido: "}
        {estimadoMin} min
        {!rodando && " · pausado"}
      </p>
    </div>
  );
};
