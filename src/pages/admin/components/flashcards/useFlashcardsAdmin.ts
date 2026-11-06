import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { lerTeoriasPorDisciplina, teoriasDaDisciplinaNoCurso } from "@/utils/teoriasDoCurso";
import { AVISO_MIGRATION, db, faltaMigration, linhaParaFlashcard, type Flashcard } from "@/lib/flashcards";

export interface TeoriaOpcao {
  id: string;
  nome: string;
  disciplina: string;
}

export interface CursoOpcao {
  id: string;
  titulo: string;
}

/** Lê uma tabela inteira em páginas de 1000 linhas. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function lerTudo(tabela: string, colunas: string, ordenar?: string): Promise<any[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const linhas: any[] = [];
  for (let de = 0; ; de += 1000) {
    let q = db.from(tabela).select(colunas).range(de, de + 999);
    if (ordenar) q = q.order(ordenar, { ascending: true });
    const { data, error } = await q;
    if (error) throw error;
    linhas.push(...(data || []));
    if (!data || data.length < 1000) break;
  }
  return linhas;
}

/**
 * Dados da página /admin/flashcards: cartões, teorias, cursos e o mapa
 * "teoria → cursos que a usam" (curso → disciplinas → teorias).
 */
export function useFlashcardsAdmin() {
  const [cartoes, setCartoes] = useState<Flashcard[]>([]);
  const [teorias, setTeorias] = useState<TeoriaOpcao[]>([]);
  const [cursos, setCursos] = useState<CursoOpcao[]>([]);
  const [cursosDaTeoria, setCursosDaTeoria] = useState<Record<string, string[]>>({});
  const [carregando, setCarregando] = useState(true);
  const [semMigration, setSemMigration] = useState(false);

  const carregarCartoes = useCallback(async () => {
    try {
      const linhas = await lerTudo("flashcards", "*", "created_at");
      setCartoes(linhas.map(linhaParaFlashcard));
      setSemMigration(false);
    } catch (e) {
      if (faltaMigration(e)) setSemMigration(true);
      else {
        console.error("Erro ao carregar flashcards:", e);
        toast.error("Erro ao carregar os flashcards.");
      }
      setCartoes([]);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setCarregando(true);
      try {
        const [tps, crs, dis] = await Promise.all([
          lerTudo("teorias", "id, titulo, disciplina_id"),
          lerTudo("cursos", "id, titulo, disciplinas_ids, teorias_por_disciplina"),
          lerTudo("disciplinas", "id, teorias_ids"),
          carregarCartoes(),
        ]);
        setTeorias(
          tps
            .map((t) => ({ id: String(t.id), nome: t.titulo || "Teoria sem título", disciplina: t.disciplina_id || "" }))
            .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
        );
        setCursos(crs.map((c) => ({ id: c.id, titulo: c.titulo || "Curso sem título" })).sort((a, b) => a.titulo.localeCompare(b.titulo, "pt-BR")));

        const teoriasDaDisciplina = new Map<string, string[]>(dis.map((d) => [String(d.id), d.teorias_ids || []]));
        const mapa: Record<string, Set<string>> = {};
        crs.forEach((c) => {
          const selecao = lerTeoriasPorDisciplina(c.teorias_por_disciplina);
          (c.disciplinas_ids || []).forEach((d: string) =>
            teoriasDaDisciplinaNoCurso(teoriasDaDisciplina.get(d), selecao, d).forEach((t) => {
              (mapa[t] ||= new Set()).add(c.id);
            })
          );
        });
        setCursosDaTeoria(Object.fromEntries(Object.entries(mapa).map(([t, s]) => [t, Array.from(s)])));
      } catch (e) {
        console.error("Erro ao carregar dados dos flashcards:", e);
        toast.error("Erro ao carregar teorias e cursos.");
      } finally {
        setCarregando(false);
      }
    })();
  }, [carregarCartoes]);

  const teoriaPorId = useMemo(() => new Map(teorias.map((t) => [t.id, t])), [teorias]);
  const cursoPorId = useMemo(() => new Map(cursos.map((c) => [c.id, c])), [cursos]);

  const erro = (e: unknown, padrao: string) => {
    console.error(padrao, e);
    toast.error(faltaMigration(e) ? AVISO_MIGRATION : padrao);
  };

  /** Cria vários cartões de uma vez (lotes de 500). Devolve quantos entraram. */
  const criar = async (novos: { teoriaId: string; frente: string; verso: string; tags: string[]; cursosIds: string[] }[]) => {
    // Os novos entram depois dos cartões que a teoria já tem
    const proximaOrdem: Record<string, number> = {};
    cartoes.forEach((c) => (proximaOrdem[c.teoriaId] = Math.max(proximaOrdem[c.teoriaId] ?? 0, c.ordem + 1)));
    const linhas = novos.map((n) => {
      const ordem = proximaOrdem[n.teoriaId] ?? 0;
      proximaOrdem[n.teoriaId] = ordem + 1;
      return { teoria_id: n.teoriaId, frente: n.frente, verso: n.verso, tags: n.tags, cursos_ids: n.cursosIds, ordem };
    });
    let criados = 0;
    try {
      for (let i = 0; i < linhas.length; i += 500) {
        const { data, error } = await db.from("flashcards").insert(linhas.slice(i, i + 500)).select();
        if (error) throw error;
        const lidos = (data || []).map(linhaParaFlashcard);
        criados += lidos.length;
        setCartoes((l) => [...l, ...lidos]);
      }
    } catch (e) {
      erro(e, criados ? `Só ${criados} cartões foram salvos; houve um erro no meio da importação.` : "Erro ao salvar os flashcards.");
      return criados;
    }
    return criados;
  };

  const atualizar = async (id: string, campos: Partial<Pick<Flashcard, "teoriaId" | "frente" | "verso" | "tags" | "cursosIds">>) => {
    const linha = {
      ...(campos.teoriaId !== undefined && { teoria_id: campos.teoriaId }),
      ...(campos.frente !== undefined && { frente: campos.frente }),
      ...(campos.verso !== undefined && { verso: campos.verso }),
      ...(campos.tags !== undefined && { tags: campos.tags }),
      ...(campos.cursosIds !== undefined && { cursos_ids: campos.cursosIds }),
    };
    const { error } = await db.from("flashcards").update(linha).eq("id", id);
    if (error) {
      erro(error, "Erro ao salvar o flashcard.");
      return false;
    }
    setCartoes((l) => l.map((c) => (c.id === id ? { ...c, ...campos } : c)));
    return true;
  };

  const definirCursos = async (ids: string[], cursosIds: string[]) => {
    for (let i = 0; i < ids.length; i += 150) {
      const { error } = await db.from("flashcards").update({ cursos_ids: cursosIds }).in("id", ids.slice(i, i + 150));
      if (error) {
        erro(error, "Erro ao definir os cursos.");
        await carregarCartoes();
        return false;
      }
    }
    const alvo = new Set(ids);
    setCartoes((l) => l.map((c) => (alvo.has(c.id) ? { ...c, cursosIds } : c)));
    return true;
  };

  const excluir = async (ids: string[]) => {
    for (let i = 0; i < ids.length; i += 150) {
      const { error } = await db.from("flashcards").delete().in("id", ids.slice(i, i + 150));
      if (error) {
        erro(error, "Erro ao excluir.");
        await carregarCartoes();
        return false;
      }
    }
    const alvo = new Set(ids);
    setCartoes((l) => l.filter((c) => !alvo.has(c.id)));
    return true;
  };

  return {
    cartoes,
    teorias,
    cursos,
    cursosDaTeoria,
    teoriaPorId,
    cursoPorId,
    carregando,
    semMigration,
    criar,
    atualizar,
    definirCursos,
    excluir,
  };
}

export type FlashcardsAdmin = ReturnType<typeof useFlashcardsAdmin>;
