import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { buscarFlashcardsDasTeorias, db, disponivelNoCurso, faltaMigration, type Flashcard } from "@/lib/flashcards";
import { carregarDisciplinasCurso, type DisciplinaCurso, type TeoriaCurso } from "../disciplinas/useDisciplinasCurso";

export type Resultado = "lembrei" | "esqueci";

export interface ProgressoCartao {
  acertos: number;
  erros: number;
  ultimo: Resultado;
}

/** Teoria com os cartões que valem para este curso. */
export interface TeoriaFlashcards {
  teoria: TeoriaCurso;
  disciplina: DisciplinaCurso;
  cartoes: Flashcard[];
}

/** Teorias seguidas do mesmo assunto, como na aba Disciplinas. */
export interface GrupoFlashcards {
  id: string;
  /** Assunto das teorias (vazio = sem assunto) */
  titulo: string;
  teorias: TeoriaFlashcards[];
}

export interface DisciplinaFlashcards {
  disciplina: DisciplinaCurso;
  grupos: GrupoFlashcards[];
}

const LOTE = 150;

/**
 * Flashcards do curso, organizados por disciplina → assunto → teoria, e o
 * progresso do aluno em cada cartão. Um cartão vale para o curso quando a
 * teoria está no curso e o cartão não foi restrito a outros cursos.
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
        const teoriasIds = dados.disciplinas.flatMap((d) => d.teorias.map((t) => t.id));
        const cartoes = await buscarFlashcardsDasTeorias(teoriasIds);
        const cursoId = dados.isCurso ? dados.realId : null;
        const porTeoria = new Map<string, Flashcard[]>();
        cartoes
          .filter((c) => c.teoriaId && disponivelNoCurso(c, cursoId))
          .forEach((c) => {
            const l = porTeoria.get(c.teoriaId!) || [];
            l.push(c);
            porTeoria.set(c.teoriaId!, l);
          });

        const montada: DisciplinaFlashcards[] = dados.disciplinas
          .map((d) => {
            const grupos: GrupoFlashcards[] = [];
            d.teorias
              .filter((t) => porTeoria.has(t.id))
              .forEach((t) => {
                const item = { teoria: t, disciplina: d, cartoes: porTeoria.get(t.id)! };
                const ult = grupos[grupos.length - 1];
                if (ult && ult.titulo === t.assunto) ult.teorias.push(item);
                else grupos.push({ id: `${d.id}-${grupos.length}`, titulo: t.assunto, teorias: [item] });
              });
            return { disciplina: d, grupos };
          })
          .filter((d) => d.grupos.length > 0);

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
    estrutura.forEach((d) => d.grupos.forEach((g) => g.teorias.forEach((t) => t.cartoes.forEach((c) => vistos.set(c.id, c)))));
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
    progresso,
    registrar,
    zerar,
    logado: !!user,
  };
}

export type FlashcardsCurso = ReturnType<typeof useFlashcardsCurso>;
