import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpenCheck, CalendarCheck, GraduationCap, ListChecks, Sparkles, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { generateFriendlyUrl } from "@/utils/slug-utils";

interface CursoDivulgado {
  id: string;
  titulo: string;
  cargo: string;
  disciplinas: number;
  questoes: number;
  questoesIds: string[];
}

const numero = (n: number) => n.toLocaleString("pt-BR");

const RECURSOS = [
  { icone: BookOpenCheck, texto: "Aulas e teoria de cada disciplina" },
  { icone: Target, texto: "Questões separadas para o cargo" },
  { icone: ListChecks, texto: "Edital verticalizado para marcar o que já estudou" },
  { icone: CalendarCheck, texto: "Simulados e ciclo de estudos" },
];

/** Convite no fim do post para estudar grátis nos cursos vinculados (um botão por cargo). */
export const EstudeGratisPost = ({ cursosIds }: { cursosIds?: string[] }) => {
  const [cursos, setCursos] = useState<CursoDivulgado[]>([]);
  const chave = (cursosIds || []).join(",");

  useEffect(() => {
    const ids = chave ? chave.split(",") : [];
    if (!ids.length) {
      setCursos([]);
      return;
    }
    let vivo = true;
    supabase
      .from("cursos")
      .select("id, titulo, descricao, disciplinas_ids, questoes_ids")
      .in("id", ids)
      .then(({ data, error }) => {
        if (!vivo) return;
        if (error) {
          console.error("Erro ao carregar cursos do post:", error);
          return;
        }
        const porId = new Map((data || []).map((c) => [c.id, c]));
        // Mantém a ordem escolhida no admin e ignora cursos excluídos
        setCursos(
          ids
            .map((id) => porId.get(id))
            .filter((c): c is NonNullable<typeof c> => !!c)
            .map((c) => ({
              id: c.id,
              titulo: c.titulo,
              cargo: (c.descricao || "").trim(),
              disciplinas: (c.disciplinas_ids || []).length,
              questoes: (c.questoes_ids || []).length,
              questoesIds: c.questoes_ids || [],
            }))
        );
      });
    return () => {
      vivo = false;
    };
  }, [chave]);

  if (!cursos.length) return null;

  const varios = cursos.length > 1;
  // Questões em comum entre cargos contam uma vez só
  const totalQuestoes = new Set(cursos.flatMap((c) => c.questoesIds)).size;

  return (
    <section
      aria-labelledby="estude-gratis-titulo"
      className="not-prose relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-[#5f2ebe] via-[#6b34d1] to-[#8a3ff0] p-5 text-white shadow-[0_10px_30px_-12px_rgba(95,46,190,0.6)] md:p-7"
    >
      {/* Brilhos decorativos */}
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-[#ea2be2]/30 blur-3xl" />

      <div className="relative">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
          <Sparkles className="h-3.5 w-3.5" />
          100% gratuito
        </span>

        <h2 id="estude-gratis-titulo" className="mt-3 text-xl font-bold leading-tight md:text-2xl">
          Vai prestar este concurso? Estude de graça com a gente!
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/85 md:text-base">
          Montamos {varios ? "um curso para cada cargo" : "um curso completo"} com tudo o que você precisa para se preparar
          {totalQuestoes > 0 ? `, com ${numero(totalQuestoes)} questões já separadas para você treinar` : ""}.
        </p>

        <ul className="mt-4 grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
          {RECURSOS.map(({ icone: Icone, texto }) => (
            <li key={texto} className="flex items-center gap-2 text-white/90">
              <Icone className="h-4 w-4 shrink-0 text-[#ffd6fb]" />
              {texto}
            </li>
          ))}
        </ul>

        {varios && <p className="mt-5 text-sm font-semibold text-white">Escolha o seu cargo e comece agora:</p>}

        <div className={varios ? "mt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-2" : "mt-5 grid grid-cols-1 gap-2.5"}>
          {cursos.map((c) => {
            const detalhes = [
              c.disciplinas > 0 ? `${c.disciplinas} ${c.disciplinas === 1 ? "disciplina" : "disciplinas"}` : "",
              c.questoes > 0 ? `${numero(c.questoes)} questões` : "",
            ].filter(Boolean);
            return (
              <Link
                key={c.id}
                to={`/course/${generateFriendlyUrl(c.titulo, c.id)}`}
                className="group flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-[#272f3c] shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#5f2ebe]"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f1ebfc] text-[#5f2ebe]">
                  <GraduationCap className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] font-semibold uppercase tracking-wide text-[#8a6bd1]">
                    {varios ? "Estudar para" : "Começar a estudar"}
                  </span>
                  <span className="block font-semibold leading-snug">{c.cargo || c.titulo}</span>
                  {detalhes.length > 0 && <span className="block text-xs text-[#67748a]">{detalhes.join(" · ")}</span>}
                </span>
                <ArrowRight className="h-5 w-5 shrink-0 text-[#5f2ebe] transition-transform group-hover:translate-x-1" />
              </Link>
            );
          })}
        </div>

        <p className="mt-4 text-xs text-white/75">Sem pagar nada. Crie sua conta grátis para salvar o seu progresso.</p>
      </div>
    </section>
  );
};
