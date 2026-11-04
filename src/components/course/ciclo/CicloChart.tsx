import React, { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { formatTimeValue } from "./utils";
import type { CicloDisciplina } from "./DisciplinaItem";

interface CicloChartProps {
  subjects: CicloDisciplina[];
  totalHoras: number;
}

export const CicloChart: React.FC<CicloChartProps> = ({ subjects, totalHoras }) => {
  const data = useMemo(
    () =>
      subjects
        .filter((s) => s.ativo && (s.horasDedicadas || 0) > 0)
        .map((s) => ({
          name: s.titulo,
          value: s.horasDedicadas || 0,
          percentual: totalHoras > 0 ? Math.round(((s.horasDedicadas || 0) * 100) / totalHoras) : 0,
          color: s.cor,
        })),
    [subjects, totalHoras]
  );

  if (data.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-slate-400">
        Ative uma disciplina e defina o tempo dela
        <br />
        para ver a distribuição.
      </p>
    );
  }

  return (
    <div>
      <div className="relative h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={66} outerRadius={92} paddingAngle={data.length > 1 ? 2 : 0} dataKey="value" stroke="none">
              {data.map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { color?: string; percentual: number } }> }) =>
                active && payload?.length ? (
                  <div className="rounded-lg border border-slate-100 bg-white px-3 py-2 text-xs shadow-md">
                    <p className="font-medium text-slate-800">{payload[0].name}</p>
                    <p style={{ color: payload[0].payload.color }}>
                      {formatTimeValue(payload[0].value)} · {payload[0].payload.percentual}%
                    </p>
                  </div>
                ) : null
              }
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold tabular-nums text-slate-900">{formatTimeValue(totalHoras)}</span>
          <span className="text-xs text-slate-500">por semana</span>
        </div>
      </div>

      <ol className="mt-2 space-y-1.5">
        {data.map((d, i) => (
          <li key={i} className="flex items-center gap-2 text-sm">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="min-w-0 flex-1 truncate text-slate-700" title={d.name}>
              {d.name}
            </span>
            <span className="shrink-0 tabular-nums text-slate-500">{formatTimeValue(d.value)}</span>
            <span className="w-9 shrink-0 text-right text-xs tabular-nums text-slate-400">{d.percentual}%</span>
          </li>
        ))}
      </ol>
    </div>
  );
};
