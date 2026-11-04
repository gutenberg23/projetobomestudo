import React, { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { ArrowDown, ArrowUp, GripVertical, Minus, Plus } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { formatTimeValue } from "./utils";

export interface CicloDisciplina {
  id: string;
  titulo: string;
  descricao?: string;
  ativo?: boolean;
  horasDedicadas?: number;
  cor?: string;
}

interface DisciplinaItemProps {
  subject: CicloDisciplina;
  index: number;
  /** Posição no ciclo, contando só as disciplinas ativas (null se inativa). */
  posicao: number | null;
  total: number;
  maxHoras: number;
  percentual: number;
  onToggleActive: (id: string) => void;
  onUpdateHoras: (id: string, horas: number) => void;
  onMove: (dragIndex: number, hoverIndex: number) => void;
}

interface DragItem {
  index: number;
  id: string;
}

const PASSO = 0.25; // 15 minutos nos botões

export const DisciplinaItem: React.FC<DisciplinaItemProps> = ({
  subject,
  index,
  posicao,
  total,
  maxHoras,
  percentual,
  onToggleActive,
  onUpdateHoras,
  onMove,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const alca = useRef<HTMLButtonElement>(null);
  const horas = subject.horasDedicadas || 0;
  const ativo = !!subject.ativo;

  const [{ isDragging }, drag, preview] = useDrag({
    type: "DISCIPLINA_ITEM",
    item: { index, id: subject.id },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  const [, drop] = useDrop({
    accept: "DISCIPLINA_ITEM",
    hover: (item: DragItem, monitor) => {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      const rect = ref.current.getBoundingClientRect();
      const meio = (rect.bottom - rect.top) / 2;
      const offset = monitor.getClientOffset();
      if (!offset) return;
      const y = offset.y - rect.top;
      if (dragIndex < hoverIndex && y < meio) return;
      if (dragIndex > hoverIndex && y > meio) return;
      onMove(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  // Só a alça inicia o arraste; o resto do cartão continua clicável (slider, botões)
  drag(alca);
  drop(preview(ref));

  const mudar = (v: number) => onUpdateHoras(subject.id, Math.max(0, Math.min(maxHoras, Math.round(v * 12) / 12)));

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border bg-white p-3.5 transition-shadow md:p-4",
        isDragging ? "opacity-40" : "hover:shadow-[0_2px_8px_rgba(16,24,40,0.06)]",
        ativo ? "border-slate-200" : "border-dashed border-slate-200 bg-slate-50/70"
      )}
      style={{ borderLeft: ativo ? `4px solid ${subject.cor}` : undefined }}
    >
      <div className="flex items-center gap-2.5">
        <button
          ref={alca}
          type="button"
          className="hidden cursor-grab touch-none text-slate-300 hover:text-slate-500 active:cursor-grabbing sm:block"
          aria-label="Arrastar para reordenar"
          title="Arraste para mudar a ordem"
        >
          <GripVertical className="h-5 w-5" />
        </button>
        <span
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold tabular-nums",
            ativo ? "text-white" : "bg-slate-200 text-slate-400"
          )}
          style={ativo ? { backgroundColor: subject.cor } : undefined}
        >
          {posicao ?? "–"}
        </span>
        <div className="min-w-0 flex-1">
          <p className={cn("truncate font-medium", ativo ? "text-slate-800" : "text-slate-400")} title={subject.titulo}>
            {subject.titulo}
          </p>
          {subject.descricao && <p className="truncate text-xs text-slate-400">{subject.descricao}</p>}
        </div>
        <div className="flex shrink-0 items-center">
          <button
            type="button"
            onClick={() => onMove(index, index - 1)}
            disabled={index === 0}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 disabled:hover:bg-transparent"
            aria-label="Mover para cima"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onMove(index, index + 1)}
            disabled={index === total - 1}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 disabled:hover:bg-transparent"
            aria-label="Mover para baixo"
          >
            <ArrowDown className="h-4 w-4" />
          </button>
        </div>
        <Switch checked={ativo} onCheckedChange={() => onToggleActive(subject.id)} aria-label={ativo ? "Tirar do ciclo" : "Incluir no ciclo"} />
      </div>

      {ativo ? (
        <div className="mt-3 flex items-center gap-3 sm:pl-[30px]">
          <Slider
            value={[Math.round(horas * 60)]}
            min={0}
            max={Math.round(maxHoras * 60)}
            step={5}
            onValueChange={(v) => v.length && mudar(v[0] / 60)}
            className="flex-1 cursor-pointer"
            aria-label="Horas por semana"
          />
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => mudar(horas - PASSO)}
              disabled={horas <= 0}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-800 disabled:opacity-40"
              aria-label="Menos 15 minutos"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="min-w-[64px] text-center text-sm font-semibold tabular-nums text-slate-800">{formatTimeValue(horas)}</span>
            <button
              type="button"
              onClick={() => mudar(horas + PASSO)}
              disabled={horas >= maxHoras}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-800 disabled:opacity-40"
              aria-label="Mais 15 minutos"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
            <span className="hidden w-10 text-right text-xs tabular-nums text-slate-400 sm:inline">{percentual}%</span>
          </div>
        </div>
      ) : (
        <p className="mt-2 text-xs text-slate-400 sm:pl-[30px]">Fora do ciclo. Ative para incluir esta disciplina.</p>
      )}
    </div>
  );
};
