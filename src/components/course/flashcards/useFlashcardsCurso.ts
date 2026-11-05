import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { buscarFlashcardsDosTopicos, db, disponivelNoCurso, faltaMigration, type Flashcard } from "@/lib/flashcards";
import { carregarDisciplinasCurso, type AulaCurso, type DisciplinaCurso, type TopicoCurso } from "../disciplinas/useDisciplinasCurso";

export type Resultado = "lembrei" | "esqueci";

export interface ProgressoCartao {
  acertos: number;
  erros: number;
  ultimo: Resultado;
}

/** Tópico com os cartões que valem para este curso. */
export interface TopicoFlashcards {
  topico: TopicoCurso;
  aula: AulaCurso;
  disciplina: DisciplinaCurso;
  cartoes: Flashcard[];
}

export interface AulaFlashcards {
  aula: AulaCurso;
  topicos: TopicoFlashcards[];
}

export interface DisciplinaFlashcards {
  disciplina: DisciplinaCurso;
  aulas: AulaFlashcards[];
}

const LOTE = 150;

/**
 * Flashcards do curso, organizados por disciplina → aula → tópico, e o
 * progresso do aluno em cada cartão. Um cartão vale para o curso quando o
 * tópico está no curso e o cartão não foi restrito a outros cursos.
 */
export function useFlashcardsCurso(courseId: string | undefined) {
  const { user } = useAuth();
  const [estrutura, setEstrutura] = useState<DisciplinaFlashcards[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [progresso, setProgresso] = useState<Record<string, ProgressoCartao>>({});

  useEffect(() => {
    if (!courseId) return;
    let cancelado = false;
    setCarregando(true);

    (async () => {
      try {
        const dados = await carregarDisciplinasCurso(courseId);
        const topicosIds = dados.disciplinas.flatMap((d) => d.aulas.flatMap((a) => a.topicos.map((t) => t.id)));
        const cartoes = await buscarFlashcardsDosTopicos(topicosIds);
        const cursoId = dados.isCurso ? dados.realId : null;
        const porTopico = new Map<string, Flashcard[]>();
        cartoes
          .filter((c) => disponivelNoCurso(c, cursoId))
          .forEach((c) => {
            const l = porTopico.get(c.topicoId) || [];
            l.push(c);
            porTopico.set(c.topicoId, l);
          });

        // Um mesmo tópico pode estar em duas aulas: aparece nas duas
        const montada: DisciplinaFlashcards[] = dados.disciplinas
          .map((d) => ({
            disciplina: d,
            aulas: d.aulas
              .map((a) => ({
                aula: a,
                topicos: a.topicos
                  .filter((t) => porTopico.has(t.id))
                  .map((t) => ({ topico: t, aula: a, disciplina: d, cartoes: porTopico.get(t.id)! })),
              }))
              .filter((a) => a.topicos.length > 0),
          }))
          .filter((d) => d.aulas.length > 0);

        if (!cancelado) setEstrutura(montada);
      } catch (e) {
        // Sem a migration a aba simplesmente não aparece
        if (!faltaMigration(e)) console.error("Erro ao carregar flashcards do curso:", e);
        if (!cancelado) setEstrutura([]);
      } finally {
        if (!cancelado) setCarregando(false);
      }
    })();

    return () => {
      cancelado = true;
    };
  }, [courseId]);

  const todosCartoes = useMemo(() => {
    const vistos = new Map<string, Flashcard>();
    estrutura.forEach((d) => d.aulas.forEach((a) => a.topicos.forEach((t) => t.cartoes.forEach((c) => vistos.set(c.id, c)))));
    return Array.from(vistos.values());
  }, [estrutura]);

  // Progresso do aluno (só logado)
  useEffect(() => {
    if (!user || todosCartoes.length === 0) {
      setProgresso({});
      return;
    }
    let cancelado = false;
    (async () => {
      const mapa: Record<string, ProgressoCartao> = {};
      const ids = todosCartoes.map((c) => c.id);
      for (let i = 0; i < ids.length; i += LOTE) {
        const { data, error } = await db
          .from("flashcards_progresso")
          .select("flashcard_id, acertos, erros, ultimo")
          .eq("user_id", user.id)
          .in("flashcard_id", ids.slice(i, i + LOTE));
        if (error) {
          if (!faltaMigration(error)) console.error("Erro ao carregar progresso dos flashcards:", error);
          return;
        }
        (data || []).forEach((r: { flashcard_id: string; acertos: number; erros: number; ultimo: Resultado }) => {
          mapa[r.flashcard_id] = { acertos: r.acertos, erros: r.erros, ultimo: r.ultimo };
        });
      }
      if (!cancelado) setProgresso(mapa);
    })();
    return () => {
      cancelado = true;
    };
  }, [user, todosCartoes]);

  /** Quantos cartões cada tópico tem neste curso (para o botão da aba Disciplinas). */
  const contagemPorTopico = useMemo(() => {
    const c: Record<string, number> = {};
    estrutura.forEach((d) => d.aulas.forEach((a) => a.topicos.forEach((t) => (c[t.topico.id] = t.cartoes.length))));
    return c;
  }, [estrutura]);

  const registrar = useCallback(
    async (cartaoId: string, resultado: Resultado) => {
      setProgresso((p) => {
        const atual = p[cartaoId] || { acertos: 0, erros: 0, ultimo: resultado };
        return {
          ...p,
          [cartaoId]: {
            acertos: atual.acertos + (resultado === "lembrei" ? 1 : 0),
            erros: atual.erros + (resultado === "esqueci" ? 1 : 0),
            ultimo: resultado,
          },
        };
      });
      if (!user) return;
      const { error } = await db.rpc("registrar_revisao_flashcard", { p_flashcard_id: cartaoId, p_lembrei: resultado === "lembrei" });
      if (error && !faltaMigration(error)) {
        console.error("Erro ao salvar revisão do flashcard:", error);
        toast.error("Não foi possível salvar seu progresso agora.");
      }
    },
    [user]
  );

  const zerar = useCallback(
    async (cartoesIds: string[]) => {
      setProgresso((p) => {
        const n = { ...p };
        cartoesIds.forEach((id) => delete n[id]);
        return n;
      });
      if (!user) return;
      for (let i = 0; i < cartoesIds.length; i += LOTE) {
        const { error } = await db.from("flashcards_progresso").delete().eq("user_id", user.id).in("flashcard_id", cartoesIds.slice(i, i + LOTE));
        if (error) {
          console.error("Erro ao reiniciar progresso dos flashcards:", error);
          toast.error("Não foi possível reiniciar o progresso.");
          return;
        }
      }
    },
    [user]
  );

  return {
    estrutura,
    carregando,
    total: todosCartoes.length,
    temFlashcards: todosCartoes.length > 0,
    contagemPorTopico,
    progresso,
    registrar,
    zerar,
    logado: !!user,
  };
}

export type FlashcardsCurso = ReturnType<typeof useFlashcardsCurso>;
