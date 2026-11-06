import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  EVENTO_PROGRESSO_TEORIAS,
  buscarTeoriasConcluidas,
  faltaMigrationProgresso,
  marcarTeoria,
  type DetalheProgressoTeoria,
} from "@/lib/progressoTeorias";
import type { DisciplinaCurso, TeoriaCurso } from "./useDisciplinasCurso";

/**
 * Teorias concluídas pelo aluno entre as teorias do curso. A marca é global
 * (tabela teorias_progresso): vale em todos os cursos que usam a teoria.
 */
export function useProgressoTeorias(disciplinas: DisciplinaCurso[]) {
  const { user } = useAuth();
  const [concluidas, setConcluidas] = useState<Set<string>>(new Set());
  const [carregado, setCarregado] = useState(false);

  const ids = useMemo(() => Array.from(new Set(disciplinas.flatMap((d) => d.teorias.map((t) => t.id)))), [disciplinas]);
  const chave = ids.join(",");

  useEffect(() => {
    if (!user || ids.length === 0) {
      setConcluidas(new Set());
      setCarregado(true);
      return;
    }
    let cancelado = false;
    buscarTeoriasConcluidas(user.id, ids)
      .then((s) => !cancelado && setConcluidas(s))
      .catch((e) => {
        if (!faltaMigrationProgresso(e)) console.error("Erro ao carregar progresso das teorias:", e);
      })
      .finally(() => !cancelado && setCarregado(true));
    return () => {
      cancelado = true;
    };
    // ids muda junto com chave
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, chave]);

  // Marcas feitas em outra parte da página (ex.: barra da teoria)
  useEffect(() => {
    const ouvir = (e: Event) => {
      const d = (e as CustomEvent<DetalheProgressoTeoria>).detail;
      if (!d) return;
      setConcluidas((prev) => {
        const n = new Set(prev);
        if (d.concluida) n.add(d.teoriaId);
        else n.delete(d.teoriaId);
        return n;
      });
    };
    document.addEventListener(EVENTO_PROGRESSO_TEORIAS, ouvir);
    return () => document.removeEventListener(EVENTO_PROGRESSO_TEORIAS, ouvir);
  }, []);

  const feita = useCallback((teoriaId: string) => concluidas.has(teoriaId), [concluidas]);

  const alternar = useCallback(
    async (teoriaId: string) => {
      if (!user) {
        toast.info("Entre na sua conta para marcar teorias como concluídas.");
        return;
      }
      const quer = !concluidas.has(teoriaId);
      // Mostra na hora; volta atrás se não conseguir gravar
      setConcluidas((prev) => {
        const n = new Set(prev);
        if (quer) n.add(teoriaId);
        else n.delete(teoriaId);
        return n;
      });
      try {
        await marcarTeoria(user.id, teoriaId, quer);
      } catch (e) {
        console.error("Erro ao salvar progresso da teoria:", e);
        setConcluidas((prev) => {
          const n = new Set(prev);
          if (quer) n.delete(teoriaId);
          else n.add(teoriaId);
          return n;
        });
        toast.error(
          faltaMigrationProgresso(e)
            ? "O progresso por teoria ainda não foi ativado (falta rodar a migration 20251120000000)."
            : "Não foi possível salvar seu progresso. Tente de novo."
        );
      }
    },
    [user, concluidas]
  );

  const feitasEm = useCallback((teorias: TeoriaCurso[]) => teorias.filter((t) => concluidas.has(t.id)).length, [concluidas]);

  const totais = useMemo(() => {
    const total = ids.length;
    const feitos = ids.filter((id) => concluidas.has(id)).length;
    return { total, feitos, percentual: total > 0 ? Math.round((feitos / total) * 100) : 0 };
  }, [ids, concluidas]);

  return { concluidas, carregado, feita, alternar, feitasEm, totais, logado: !!user };
}

export type ProgressoTeorias = ReturnType<typeof useProgressoTeorias>;

/** Última teoria aberta pelo aluno a partir deste curso (só neste navegador). */
export const ultimaTeoria = {
  chave: (courseId: string) => `bomestudo:ultima-teoria:${courseId}`,
  ler(courseId: string): { disciplinaId: string; teoriaId: string } | null {
    try {
      const v = localStorage.getItem(this.chave(courseId));
      return v ? JSON.parse(v) : null;
    } catch {
      return null;
    }
  },
  salvar(courseId: string, disciplinaId: string, teoriaId: string) {
    try {
      localStorage.setItem(this.chave(courseId), JSON.stringify({ disciplinaId, teoriaId }));
    } catch {
      /* navegação privada */
    }
  },
};

/** Link da teoria aberta a partir do curso (a página mostra a barra "Voltar ao curso"). */
export const linkTeoriaNoCurso = (courseId: string, disciplinaId: string, teoria: Pick<TeoriaCurso, "slug">) =>
  `/teoria/${teoria.slug}?curso=${encodeURIComponent(courseId)}&disciplina=${encodeURIComponent(disciplinaId)}`;
