import { useMemo, useState } from "react";
import { Subject } from "../types/editorialized";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { BarChart3, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { BarraProgresso, Painel, tomAproveitamento } from "../ui";

interface StatisticsCardProps {
  subjects: Subject[];
  performanceGoal?: number;
}

const encurtar = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

/** Painel recolhível "Meu desempenho" da aba Edital. */
export const StatisticsCard = ({ subjects, performanceGoal = 70 }: StatisticsCardProps) => {
  const [aberto, setAberto] = useState(false);
  const [disciplinaId, setDisciplinaId] = useState<string>(subjects[0] ? String(subjects[0].id) : "");

  const porDisciplina = useMemo(
    () =>
      subjects.map((s) => {
        const feitas = s.topics.reduce((a, t) => a + (t.exercisesDone || 0), 0);
        const acertos = s.topics.reduce((a, t) => a + (t.hits || 0), 0);
        return {
          subject: encurtar(s.name, 22),
          nome: s.name,
          value: feitas > 0 ? Math.round((acertos / feitas) * 100) : 0,
          feitas,
        };
      }),
    [subjects]
  );

  // Tópicos já praticados com o pior aproveitamento
  const piores = useMemo(
    () =>
      subjects
        .flatMap((s) =>
          s.topics
            .filter((t) => (t.exercisesDone || 0) > 0)
            .map((t) => ({
              nome: t.name,
              disciplina: s.name,
              feitas: t.exercisesDone || 0,
              perf: Math.round(((t.hits || 0) / (t.exercisesDone || 1)) * 100),
            }))
        )
        .filter((t) => t.perf < performanceGoal)
        .sort((a, b) => a.perf - b.perf || b.feitas - a.feitas)
        .slice(0, 6),
    [subjects, performanceGoal]
  );

  const dadosBarras = useMemo(() => {
    const s = subjects.find((x) => String(x.id) === disciplinaId);
    return (s?.topics || []).map((t) => ({
      name: `${t.id}`,
      titulo: t.name,
      acertos: t.hits || 0,
      erros: Math.max(0, (t.exercisesDone || 0) - (t.hits || 0)),
    }));
  }, [subjects, disciplinaId]);

  const comDados = porDisciplina.some((d) => d.feitas > 0);

  return (
    <Painel className="overflow-hidden">
      <button
        type="button"
        onClick={() => setAberto(!aberto)}
        aria-expanded={aberto}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/70 md:px-5"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#5f2ebe]/10 text-[#5f2ebe]">
          <BarChart3 className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-900">Meu desempenho</p>
          <p className="text-xs text-slate-500">
            {piores.length > 0
              ? `${piores.length} ${piores.length === 1 ? "tópico está" : "tópicos estão"} abaixo da meta`
              : "Gráficos por disciplina e tópicos que precisam de revisão"}
          </p>
        </div>
        <ChevronDown className={cn("h-5 w-5 shrink-0 text-slate-400 transition-transform", aberto && "rotate-180")} />
      </button>

      {aberto && (
        <div className="grid gap-4 border-t border-slate-100 p-4 md:grid-cols-2 md:p-5">
          <div className="rounded-xl bg-slate-50 p-4">
            <h4 className="mb-2 text-sm font-semibold text-slate-800">Aproveitamento por disciplina</h4>
            {!comDados ? (
              <p className="py-16 text-center text-sm text-slate-400">Resolva questões para ver o gráfico.</p>
            ) : porDisciplina.length >= 3 ? (
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={porDisciplina} outerRadius="70%">
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#64748b" }} />
                    <Radar name="Aproveitamento" dataKey="value" stroke="#5f2ebe" fill="#5f2ebe" fillOpacity={0.35} />
                    <Tooltip
                      formatter={(v: number) => [`${v}%`, "Aproveitamento"]}
                      labelFormatter={(_, p) => p?.[0]?.payload?.nome || ""}
                      contentStyle={{ fontSize: 12, borderRadius: 8 }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="space-y-3 py-4">
                {porDisciplina.map((d) => {
                  const t = tomAproveitamento(d.value, performanceGoal, d.feitas);
                  return (
                    <div key={d.nome}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="text-slate-700">{d.nome}</span>
                        <span className={cn("font-semibold tabular-nums", t.texto)}>{d.feitas > 0 ? `${d.value}%` : "—"}</span>
                      </div>
                      <BarraProgresso valor={d.value} corClasse={t.barra} marca={performanceGoal} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <h4 className="text-sm font-semibold text-slate-800">Precisam de revisão</h4>
            <p className="mb-3 text-xs text-slate-500">Tópicos praticados com aproveitamento abaixo da meta de {performanceGoal}%.</p>
            {piores.length === 0 ? (
              <p className="py-14 text-center text-sm text-slate-400">
                {comDados ? "Nenhum tópico abaixo da meta. Continue assim!" : "Nenhum tópico praticado ainda."}
              </p>
            ) : (
              <ul className="space-y-3">
                {piores.map((t, i) => {
                  const tom = tomAproveitamento(t.perf, performanceGoal, t.feitas);
                  return (
                    <li key={`${t.disciplina}-${t.nome}-${i}`}>
                      <div className="mb-1 flex items-start justify-between gap-3 text-sm">
                        <div className="min-w-0">
                          <p className="line-clamp-1 font-medium text-slate-800" title={t.nome}>
                            {t.nome}
                          </p>
                          <p className="text-xs text-slate-500">
                            {t.disciplina} · {t.feitas} {t.feitas === 1 ? "questão" : "questões"}
                          </p>
                        </div>
                        <span className={cn("shrink-0 font-semibold tabular-nums", tom.texto)}>{t.perf}%</span>
                      </div>
                      <BarraProgresso valor={t.perf} corClasse={tom.barra} marca={performanceGoal} className="h-1.5" />
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="rounded-xl bg-slate-50 p-4 md:col-span-2">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h4 className="text-sm font-semibold text-slate-800">Acertos e erros por tópico</h4>
                <p className="text-xs text-slate-500">O eixo mostra o número do tópico; passe o mouse para ver o nome.</p>
              </div>
              <Select value={disciplinaId} onValueChange={setDisciplinaId}>
                <SelectTrigger className="w-full bg-white sm:w-[280px]">
                  <SelectValue placeholder="Selecione uma disciplina" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosBarras} margin={{ left: -20, right: 8 }}>
                  <CartesianGrid vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ fill: "rgba(95,46,190,0.06)" }}
                    labelFormatter={(_, p) => encurtar(p?.[0]?.payload?.titulo || "", 80)}
                    contentStyle={{ fontSize: 12, borderRadius: 8, maxWidth: 320, whiteSpace: "normal" }}
                  />
                  <Bar dataKey="acertos" stackId="a" fill="#10b981" name="Acertos" />
                  <Bar dataKey="erros" stackId="a" fill="#f87171" name="Erros" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </Painel>
  );
};
