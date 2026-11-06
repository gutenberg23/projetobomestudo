import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { buscarTeoriasConcluidas, faltaMigrationProgresso, marcarTeoria } from "@/lib/progressoTeorias";
import { carregarDisciplinasCurso, type DisciplinaCurso, type TeoriaCurso } from "@/components/course/disciplinas/useDisciplinasCurso";
import { linkTeoriaNoCurso, ultimaTeoria } from "@/components/course/disciplinas/useProgressoTeorias";

interface Contexto {
  tituloCurso: string;
  disciplina: DisciplinaCurso | null;
  indice: number;
  anterior?: TeoriaCurso;
  proxima?: TeoriaCurso;
}

/**
 * Barra que aparece no topo da teoria quando ela foi aberta a partir de um curso
 * (/teoria/<slug>?curso=...&disciplina=...): volta para o curso, mostra a posição
 * da teoria na disciplina, marca como concluída e leva à anterior ou à próxima.
 */
export const BarraCurso: React.FC<{ teoriaId: string; curso: string; disciplinaId?: string | null }> = ({ teoriaId, curso, disciplinaId }) => {
  const { user } = useAuth();
  const [ctx, setCtx] = useState<Contexto | null>(null);
  const [feita, setFeita] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    let cancelado = false;
    carregarDisciplinasCurso(curso)
      .then((dados) => {
        if (cancelado) return;
        const disciplina =
          dados.disciplinas.find((d) => d.id === disciplinaId && d.teorias.some((t) => t.id === teoriaId)) ||
          dados.disciplinas.find((d) => d.teorias.some((t) => t.id === teoriaId)) ||
          null;
        const indice = disciplina ? disciplina.teorias.findIndex((t) => t.id === teoriaId) : -1;
        setCtx({
          tituloCurso: dados.titulo,
          disciplina,
          indice,
          anterior: disciplina && indice > 0 ? disciplina.teorias[indice - 1] : undefined,
          proxima: disciplina && indice >= 0 ? disciplina.teorias[indice + 1] : undefined,
        });
        if (disciplina) ultimaTeoria.salvar(curso, disciplina.id, teoriaId);
      })
      // Curso não encontrado: a barra fica só com "Voltar ao curso"
      .catch(() => !cancelado && setCtx({ tituloCurso: "", disciplina: null, indice: -1 }));
    return () => {
      cancelado = true;
    };
  }, [curso, disciplinaId, teoriaId]);

  useEffect(() => {
    if (!user) {
      setFeita(false);
      return;
    }
    let cancelado = false;
    buscarTeoriasConcluidas(user.id, [teoriaId])
      .then((s) => !cancelado && setFeita(s.has(teoriaId)))
      .catch(() => undefined);
    return () => {
      cancelado = true;
    };
  }, [user, teoriaId]);

  const alternar = async () => {
    if (!user) {
      toast.info("Entre na sua conta para marcar teorias como concluídas.");
      return;
    }
    const quer = !feita;
    setFeita(quer);
    setSalvando(true);
    try {
      await marcarTeoria(user.id, teoriaId, quer);
      if (quer) toast.success("Teoria concluída!");
    } catch (e) {
      setFeita(!quer);
      toast.error(
        faltaMigrationProgresso(e)
          ? "O progresso por teoria ainda não foi ativado (falta rodar a migration 20251120000000)."
          : "Não foi possível salvar seu progresso. Tente de novo."
      );
    } finally {
      setSalvando(false);
    }
  };

  const d = ctx?.disciplina;
  const total = d?.teorias.length || 0;
  const posicao = ctx && ctx.indice >= 0 ? ctx.indice + 1 : 0;
  const quadrado =
    "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:border-[#5f2ebe]/40 hover:text-[#5f2ebe]";
  const desativado = "pointer-events-none opacity-40";

  return (
    <div className="teoria-sem-impressao sticky top-0 z-30 border-b border-[#5f2ebe]/15 bg-[#f8f5ff]/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1400px] items-center gap-2 px-[10px] py-2 sm:gap-3 md:px-[32px]">
        <Link
          to={`/course/${curso}`}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#5f2ebe] px-2.5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#4f25a0] sm:px-3.5"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="sm:hidden">Curso</span>
          <span className="hidden sm:inline">Voltar ao curso</span>
        </Link>

        <div className="min-w-0 flex-1 leading-tight">
          {/* Celular: disciplina + posição em duas linhas */}
          <div className="sm:hidden">
            {d && <p className="truncate text-[11px] text-slate-500">{d.titulo}</p>}
            {posicao > 0 && (
              <p className="text-xs font-semibold text-slate-700">
                Teoria {posicao} de {total}
              </p>
            )}
          </div>
          <p className="hidden truncate text-sm text-slate-500 sm:block">
            {ctx?.tituloCurso && <b className="font-semibold text-slate-700">{ctx.tituloCurso}</b>}
            {ctx?.tituloCurso && d && " · "}
            {d?.titulo}
          </p>
        </div>

        {posicao > 0 && (
          <div className="hidden shrink-0 items-center gap-2 text-xs tabular-nums text-slate-500 md:flex">
            Teoria {posicao} de {total}
            <div className="h-1.5 w-28 overflow-hidden rounded-full bg-[#5f2ebe]/10">
              <div className="h-full rounded-full bg-[#5f2ebe]" style={{ width: `${(posicao / total) * 100}%` }} />
            </div>
          </div>
        )}

        {d && posicao > 0 && (
          <>
            <button
              type="button"
              onClick={alternar}
              disabled={salvando}
              aria-pressed={feita}
              title={feita ? "Desmarcar como concluída" : "Marcar como concluída"}
              className={cn(
                "inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-xl border text-sm font-semibold transition-colors max-sm:w-9 sm:px-3",
                feita
                  ? "border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-600"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300"
              )}
            >
              <CheckCircle2 className="h-4 w-4" />
              <span className="hidden sm:inline">{feita ? "Concluída" : "Marcar como concluída"}</span>
            </button>
            <div className="flex shrink-0 gap-1.5">
              <Link
                to={ctx?.anterior ? linkTeoriaNoCurso(curso, d.id, ctx.anterior) : "#"}
                aria-disabled={!ctx?.anterior}
                tabIndex={ctx?.anterior ? undefined : -1}
                title={ctx?.anterior ? `Anterior: ${ctx.anterior.titulo}` : "Esta é a primeira teoria"}
                className={cn(quadrado, !ctx?.anterior && desativado)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Link>
              <Link
                to={ctx?.proxima ? linkTeoriaNoCurso(curso, d.id, ctx.proxima) : "#"}
                aria-disabled={!ctx?.proxima}
                tabIndex={ctx?.proxima ? undefined : -1}
                title={ctx?.proxima ? `Próxima: ${ctx.proxima.titulo}` : "Esta é a última teoria"}
                className={cn(quadrado, !ctx?.proxima && desativado)}
              >
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
