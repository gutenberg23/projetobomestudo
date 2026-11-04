import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { AlertTriangle, Check, Clock, Lightbulb, LogIn, Minus, Plus, RotateCcw, Scale } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { extractIdFromFriendlyUrl } from "@/utils/slug-utils";
import { cn } from "@/lib/utils";
import { DisciplinaItem, CicloDisciplina } from "./DisciplinaItem";
import { CicloChart } from "./CicloChart";
import { formatTimeValue } from "./utils";
import { BarraProgresso, CabecalhoAba, Carregando, EstadoVazio, Painel } from "../ui";

interface CicloTabProps {
  courseId?: string;
  subjects: CicloDisciplina[];
}

const CORES = ["#5f2ebe", "#ea2be2", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6", "#f97316", "#64748b", "#ec4899", "#84cc16"];
const corPadrao = (i: number) => CORES[i % CORES.length];
const arredondar5min = (h: number) => Math.round(h * 12) / 12;

interface Estado {
  disciplinas: CicloDisciplina[];
  totalHoras: number;
}

const fotografia = (e: Estado) =>
  JSON.stringify({
    t: e.totalHoras,
    d: e.disciplinas.map((d) => [d.id, !!d.ativo, Math.round((d.horasDedicadas || 0) * 60), d.cor]),
  });

export const CicloTab: React.FC<CicloTabProps> = ({ courseId, subjects: disciplinasCurso }) => {
  const { user } = useAuth();
  const [estado, setEstado] = useState<Estado>({ disciplinas: [], totalHoras: 40 });
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const salvo = useRef<string>("");
  const [versaoSalva, setVersaoSalva] = useState(0);

  useEffect(() => {
    if (!user?.id || !courseId || disciplinasCurso.length === 0) {
      setCarregando(false);
      return;
    }
    let cancelado = false;

    const carregar = async () => {
      setCarregando(true);
      try {
        const realId = extractIdFromFriendlyUrl(courseId);
        const { data, error } = await supabase
          .from("ciclos_estudo")
          .select("*")
          .eq("user_id", user.id)
          .eq("curso_id", realId)
          .maybeSingle();
        if (error) throw error;

        const totalHoras = Number(data?.total_horas) || 40;
        type Salva = { id: string; ativo?: boolean; horasDedicadas?: number; cor?: string };
        const salvas: Salva[] = Array.isArray(data?.disciplinas) ? (data!.disciplinas as unknown as Salva[]) : [];
        const porId = new Map(disciplinasCurso.map((d) => [d.id, d]));
        const padrao = arredondar5min(totalHoras / disciplinasCurso.length);

        // Mantém a ordem que o aluno salvou; disciplinas novas do curso entram no fim
        const lista: CicloDisciplina[] = [];
        salvas.forEach((s) => {
          const d = porId.get(s.id);
          if (!d) return;
          porId.delete(s.id);
          lista.push({
            ...d,
            ativo: s.ativo !== undefined ? s.ativo : true,
            horasDedicadas: typeof s.horasDedicadas === "number" ? s.horasDedicadas : padrao,
            cor: s.cor || corPadrao(lista.length),
          });
        });
        disciplinasCurso.forEach((d) => {
          if (!porId.has(d.id)) return;
          lista.push({ ...d, ativo: true, horasDedicadas: padrao, cor: corPadrao(lista.length) });
        });

        if (cancelado) return;
        const novo = { disciplinas: lista, totalHoras };
        setEstado(novo);
        // Ciclo nunca salvo: começa "sujo", para o aluno salvar a primeira versão
        salvo.current = data ? fotografia(novo) : "";
        setVersaoSalva((v) => v + 1);
      } catch (e) {
        console.error("Erro ao carregar ciclo:", e);
        toast.error("Erro ao carregar o ciclo de estudos");
      } finally {
        if (!cancelado) setCarregando(false);
      }
    };
    carregar();
    return () => {
      cancelado = true;
    };
  }, [user?.id, courseId, disciplinasCurso]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const sujo = useMemo(() => fotografia(estado) !== salvo.current, [estado, versaoSalva]);

  useEffect(() => {
    if (!sujo) return;
    const aviso = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", aviso);
    return () => window.removeEventListener("beforeunload", aviso);
  }, [sujo]);

  const ativas = estado.disciplinas.filter((d) => d.ativo);
  const planejado = ativas.reduce((a, d) => a + (d.horasDedicadas || 0), 0);
  const diferenca = Math.round((planejado - estado.totalHoras) * 60);
  const maxHoras = Math.max(estado.totalHoras, ...estado.disciplinas.map((d) => d.horasDedicadas || 0), 1);

  const mudarDisciplina = (id: string, campos: Partial<CicloDisciplina>) =>
    setEstado((e) => ({ ...e, disciplinas: e.disciplinas.map((d) => (d.id === id ? { ...d, ...campos } : d)) }));

  const mover = useCallback((de: number, para: number) => {
    setEstado((e) => {
      if (para < 0 || para >= e.disciplinas.length) return e;
      const lista = [...e.disciplinas];
      const [item] = lista.splice(de, 1);
      lista.splice(para, 0, item);
      return { ...e, disciplinas: lista };
    });
  }, []);

  const mudarTotal = (v: number) => setEstado((e) => ({ ...e, totalHoras: Math.max(1, Math.min(112, Math.round(v))) }));

  const distribuirIgual = () => {
    if (ativas.length === 0) return;
    const cada = arredondar5min(estado.totalHoras / ativas.length);
    setEstado((e) => ({ ...e, disciplinas: e.disciplinas.map((d) => (d.ativo ? { ...d, horasDedicadas: cada } : d)) }));
  };

  // Ajusta todas as ativas na mesma proporção para fechar a meta semanal
  const ajustarProporcional = () => {
    if (planejado <= 0) return distribuirIgual();
    const fator = estado.totalHoras / planejado;
    setEstado((e) => ({
      ...e,
      disciplinas: e.disciplinas.map((d) => (d.ativo ? { ...d, horasDedicadas: arredondar5min((d.horasDedicadas || 0) * fator) } : d)),
    }));
  };

  const descartar = () => {
    if (!salvo.current) return;
    const s = JSON.parse(salvo.current) as { t: number; d: [string, boolean, number, string][] };
    const porId = new Map(estado.disciplinas.map((d) => [d.id, d]));
    setEstado({
      totalHoras: s.t,
      disciplinas: s.d.map(([id, ativo, min, cor]) => ({ ...porId.get(id)!, ativo, horasDedicadas: min / 60, cor })).filter((d) => d.id),
    });
  };

  const salvar = async () => {
    if (!user?.id || !courseId) return;
    setSalvando(true);
    try {
      const realId = extractIdFromFriendlyUrl(courseId);
      const disciplinas = estado.disciplinas.map((d) => ({
        id: d.id,
        ativo: d.ativo,
        horasDedicadas: d.horasDedicadas,
        cor: d.cor,
      }));
      const agora = new Date().toISOString();
      const { data: existente, error: erroBusca } = await supabase
        .from("ciclos_estudo")
        .select("id")
        .eq("user_id", user.id)
        .eq("curso_id", realId)
        .maybeSingle();
      if (erroBusca) throw erroBusca;

      const { error } = existente
        ? await supabase
            .from("ciclos_estudo")
            .update({ disciplinas, total_horas: estado.totalHoras, ultima_atualizacao: agora })
            .eq("id", existente.id)
        : await supabase.from("ciclos_estudo").insert([
            {
              user_id: user.id,
              curso_id: realId,
              disciplinas,
              total_horas: estado.totalHoras,
              data_criacao: agora,
              ultima_atualizacao: agora,
            },
          ]);
      if (error) throw error;

      salvo.current = fotografia(estado);
      setVersaoSalva((v) => v + 1);
      toast.success("Ciclo de estudos salvo!");
    } catch (e) {
      console.error("Erro ao salvar ciclo:", e);
      toast.error("Não foi possível salvar o ciclo. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  };

  if (!user) {
    return (
      <EstadoVazio
        icone={RotateCcw}
        titulo="Monte seu ciclo de estudos"
        texto="Distribua suas horas da semana entre as disciplinas do curso e estude em sequência, sem depender de dias fixos. Entre na sua conta para começar."
        acao={
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-lg bg-[#5f2ebe] px-4 py-2 text-sm font-medium text-white hover:bg-[#4f25a0]"
          >
            <LogIn className="h-4 w-4" /> Entrar
          </Link>
        }
      />
    );
  }

  if (carregando) return <Carregando texto="Carregando seu ciclo..." />;

  if (estado.disciplinas.length === 0) {
    return (
      <EstadoVazio
        icone={RotateCcw}
        titulo="Nenhuma disciplina para o ciclo"
        texto="Este curso ainda não tem disciplinas cadastradas. Quando tiver, você poderá montar seu ciclo de estudos aqui."
      />
    );
  }

  const percentual = (h: number) => (planejado > 0 ? Math.round((h / planejado) * 100) : 0);
  let pos = 0;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-5 pb-5">
        <CabecalhoAba
          titulo="Ciclo de estudos"
          descricao="Defina quantas horas por semana você estuda e quanto desse tempo vai para cada disciplina. Estude na ordem do ciclo e, ao chegar ao fim, recomece."
        />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-4">
            {/* Meta semanal e distribuição */}
            <Painel className="p-4 md:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Horas de estudo por semana</p>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => mudarTotal(estado.totalHoras - 1)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:border-slate-300"
                      aria-label="Menos uma hora"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <div className="flex items-baseline gap-1">
                      <input
                        type="number"
                        min={1}
                        max={112}
                        value={estado.totalHoras}
                        onChange={(e) => mudarTotal(Number(e.target.value) || 1)}
                        className="w-16 rounded-lg border border-slate-200 bg-white py-1 text-center text-2xl font-bold tabular-nums text-slate-900 outline-none focus:border-[#5f2ebe]/50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                        aria-label="Horas por semana"
                      />
                      <span className="text-sm text-slate-500">h</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => mudarTotal(estado.totalHoras + 1)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:border-slate-300"
                      aria-label="Mais uma hora"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="mt-1.5 text-xs text-slate-500">≈ {formatTimeValue(arredondar5min(estado.totalHoras / 7))} por dia</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={distribuirIgual}
                    disabled={ativas.length === 0}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:border-[#5f2ebe]/40 hover:text-[#5f2ebe] disabled:opacity-50"
                  >
                    <Scale className="h-4 w-4" /> Dividir igualmente
                  </button>
                  {diferenca !== 0 && planejado > 0 && (
                    <button
                      type="button"
                      onClick={ajustarProporcional}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:border-[#5f2ebe]/40 hover:text-[#5f2ebe]"
                    >
                      <Clock className="h-4 w-4" /> Ajustar para {estado.totalHoras}h
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="text-slate-600">
                    Planejado: <b className="font-semibold text-slate-900">{formatTimeValue(planejado)}</b> de {estado.totalHoras}h
                  </span>
                  <span
                    className={cn(
                      "flex items-center gap-1 text-xs font-medium",
                      diferenca === 0 ? "text-emerald-600" : diferenca > 0 ? "text-amber-600" : "text-slate-500"
                    )}
                  >
                    {diferenca === 0 ? (
                      <>
                        <Check className="h-3.5 w-3.5" /> Fechou a meta
                      </>
                    ) : diferenca > 0 ? (
                      <>
                        <AlertTriangle className="h-3.5 w-3.5" /> {formatTimeValue(diferenca / 60)} acima
                      </>
                    ) : (
                      <>{formatTimeValue(-diferenca / 60)} livres</>
                    )}
                  </span>
                </div>
                <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  {ativas.map((d) => (
                    <div
                      key={d.id}
                      className="h-full"
                      style={{
                        width: `${((d.horasDedicadas || 0) / Math.max(planejado, estado.totalHoras)) * 100}%`,
                        backgroundColor: d.cor,
                      }}
                      title={`${d.titulo}: ${formatTimeValue(d.horasDedicadas || 0)}`}
                    />
                  ))}
                </div>
              </div>
            </Painel>

            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-semibold text-slate-700">
                Disciplinas <span className="font-normal text-slate-400">({ativas.length} de {estado.disciplinas.length} no ciclo)</span>
              </h3>
              <span className="hidden text-xs text-slate-400 sm:block">Arraste ou use as setas para mudar a ordem</span>
            </div>

            <div className="space-y-2.5">
              {estado.disciplinas.map((d, i) => (
                <DisciplinaItem
                  key={d.id}
                  index={i}
                  subject={d}
                  posicao={d.ativo ? ++pos : null}
                  total={estado.disciplinas.length}
                  maxHoras={maxHoras}
                  percentual={percentual(d.horasDedicadas || 0)}
                  onToggleActive={(id) => mudarDisciplina(id, { ativo: !estado.disciplinas.find((x) => x.id === id)?.ativo })}
                  onUpdateHoras={(id, h) => mudarDisciplina(id, { horasDedicadas: h })}
                  onMove={mover}
                />
              ))}
            </div>
          </div>

          <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
            <Painel className="p-4 md:p-5">
              <h3 className="text-sm font-semibold text-slate-800">Distribuição da semana</h3>
              <CicloChart subjects={ativas} totalHoras={planejado} />
            </Painel>
            <Painel className="flex gap-3 bg-amber-50/60 p-4 text-sm text-slate-600">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <p>
                Dê mais tempo às disciplinas com mais peso na prova e às que você tem mais dificuldade. Se um dia não der para estudar, siga de onde
                parou: no ciclo, nenhuma disciplina fica para trás.
              </p>
            </Painel>
          </div>
        </div>

        {/* Barra de salvar */}
        <div className="sticky bottom-0 z-20 -mx-[10px] border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur md:mx-0 md:rounded-xl md:border md:shadow-[0_-4px_16px_rgba(16,24,40,0.06)]">
          <div className="flex items-center justify-between gap-3">
            <p className={cn("flex items-center gap-1.5 text-sm", sujo ? "text-amber-700" : "text-slate-500")}>
              {sujo ? <span className="h-2 w-2 shrink-0 rounded-full bg-amber-500" /> : <Check className="h-4 w-4 text-emerald-600" />}
              <span className="truncate">{sujo ? (salvo.current ? "Alterações não salvas" : "Ciclo ainda não salvo") : "Ciclo salvo"}</span>
            </p>
            <div className="flex shrink-0 gap-2">
              {sujo && salvo.current && (
                <button
                  type="button"
                  onClick={descartar}
                  disabled={salvando}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  Descartar
                </button>
              )}
              <button
                type="button"
                onClick={salvar}
                disabled={!sujo || salvando}
                className="rounded-lg bg-[#5f2ebe] px-4 py-2 text-sm font-medium text-white hover:bg-[#4f25a0] disabled:opacity-50"
              >
                {salvando ? "Salvando..." : "Salvar ciclo"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
};
