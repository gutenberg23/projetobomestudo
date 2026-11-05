import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Disciplina } from "./DisciplinasTypes";
import { buscarEmLotes, calcularComposicaoCurso } from "../cursos/composicaoCurso";

export interface AulaResumo {
  id: string;
  titulo: string;
  topicos_ids: string[];
  questoes_ids: string[];
}

const unicos = (lista: (string | null | undefined)[]) =>
  Array.from(new Set(lista.filter((x): x is string => !!x && x.trim() !== "")));

/**
 * Dados e ações da página de disciplinas, com consultas em lote
 * (antes eram várias consultas por disciplina e por aula).
 */
export const useDisciplinas = () => {
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [aulas, setAulas] = useState<Map<string, AulaResumo>>(new Map());
  const [questoesTopico, setQuestoesTopico] = useState<Map<string, string[]>>(new Map());
  const [cursosDaDisciplina, setCursosDaDisciplina] = useState<Map<string, { id: string; titulo: string }[]>>(new Map());
  const [loading, setLoading] = useState(true);

  /** Tópicos e questões de uma disciplina a partir das aulas. */
  const totais = useCallback(
    (aulasIds: string[], mapaAulas: Map<string, AulaResumo>, mapaTopicos: Map<string, string[]>) => {
      const lista = aulasIds.map((id) => mapaAulas.get(id)).filter((a): a is AulaResumo => !!a);
      const topicosIds = unicos(lista.flatMap((a) => a.topicos_ids));
      const questoes = unicos([...lista.flatMap((a) => a.questoes_ids), ...topicosIds.flatMap((id) => mapaTopicos.get(id) || [])]);
      return { topicosIds, totalQuestoes: questoes.length };
    },
    []
  );

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data, error }, { data: perfis }, { data: cursos }] = await Promise.all([
        supabase.from("disciplinas").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("disciplinas_favoritos"),
        supabase.from("cursos").select("id, titulo, disciplinas_ids"),
      ]);
      if (error) throw error;

      // Disciplinas unificadas em outra ficam fora da lista
      const ativas = (data || []).filter((d) => !(d as { unificada_em?: string | null }).unificada_em);
      const idsAulas = unicos(ativas.flatMap((d) => d.aulas_ids || []));
      const linhasAulas = idsAulas.length
        ? ((await buscarEmLotes("aulas", "id, titulo, topicos_ids, questoes_ids", idsAulas)) as unknown as AulaResumo[])
        : [];
      const mapaAulas = new Map(
        linhasAulas.map((a) => [a.id, { ...a, topicos_ids: a.topicos_ids || [], questoes_ids: a.questoes_ids || [] }])
      );
      const idsTopicos = unicos(linhasAulas.flatMap((a) => a.topicos_ids || []));
      const linhasTopicos = idsTopicos.length ? await buscarEmLotes("topicos", "id, questoes_ids", idsTopicos) : [];
      const mapaTopicos = new Map(linhasTopicos.map((t) => [t.id, (t.questoes_ids || []) as string[]]));

      const favoritos: Record<string, number> = {};
      (perfis || []).forEach((p) =>
        (p.disciplinas_favoritos || []).forEach((id: string) => (favoritos[id] = (favoritos[id] || 0) + 1))
      );

      const uso = new Map<string, { id: string; titulo: string }[]>();
      (cursos || []).forEach((c) =>
        (c.disciplinas_ids || []).forEach((id: string) => uso.set(id, [...(uso.get(id) || []), { id: c.id, titulo: c.titulo }]))
      );

      setAulas(mapaAulas);
      setQuestoesTopico(mapaTopicos);
      setCursosDaDisciplina(uso);
      setDisciplinas(
        ativas.map((d) => {
          const aulasIds = d.aulas_ids || [];
          const t = totais(aulasIds, mapaAulas, mapaTopicos);
          return {
            id: d.id,
            titulo: d.titulo,
            descricao: d.descricao || "",
            banca: d.banca || "",
            aulasIds,
            topicosIds: t.topicosIds,
            totalQuestoes: t.totalQuestoes,
            favoritos: favoritos[d.id] || 0,
          };
        })
      );
    } catch (error) {
      console.error("Erro ao buscar disciplinas:", error);
      toast.error("Erro ao carregar as disciplinas");
    } finally {
      setLoading(false);
    }
  }, [totais]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  /** Atualiza título, rating, banca e aulas. `novasAulas` traz aulas que não estavam carregadas. */
  const salvar = async (disc: Disciplina, novasAulas: AulaResumo[] = []): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("disciplinas")
        .update({ titulo: disc.titulo, descricao: disc.descricao, banca: disc.banca || null, aulas_ids: disc.aulasIds })
        .eq("id", disc.id);
      if (error) throw error;

      const mapaAulas = new Map(aulas);
      novasAulas.forEach((a) => mapaAulas.set(a.id, a));
      // Tópicos das aulas novas que ainda não temos
      const faltando = unicos(novasAulas.flatMap((a) => a.topicos_ids)).filter((id) => !questoesTopico.has(id));
      const mapaTopicos = new Map(questoesTopico);
      if (faltando.length) {
        (await buscarEmLotes("topicos", "id, questoes_ids", faltando)).forEach((t) =>
          mapaTopicos.set(t.id, (t.questoes_ids || []) as string[])
        );
      }
      const t = totais(disc.aulasIds, mapaAulas, mapaTopicos);
      setAulas(mapaAulas);
      setQuestoesTopico(mapaTopicos);
      setDisciplinas((lista) => lista.map((d) => (d.id === disc.id ? { ...d, ...disc, ...t } : d)));
      toast.success("Disciplina atualizada");
      return true;
    } catch (error) {
      console.error("Erro ao atualizar disciplina:", error);
      toast.error("Erro ao atualizar a disciplina");
      return false;
    }
  };

  /** Salva a nova ordem das aulas da disciplina. */
  const reordenarAulas = async (disc: Disciplina, ordem: string[]) => {
    const anterior = disc.aulasIds;
    setDisciplinas((lista) => lista.map((d) => (d.id === disc.id ? { ...d, aulasIds: ordem } : d)));
    const { error } = await supabase.from("disciplinas").update({ aulas_ids: ordem }).eq("id", disc.id);
    if (error) {
      console.error("Erro ao reordenar aulas:", error);
      setDisciplinas((lista) => lista.map((d) => (d.id === disc.id ? { ...d, aulasIds: anterior } : d)));
      toast.error("Não foi possível salvar a nova ordem.");
    } else {
      toast.success("Ordem das aulas salva");
    }
  };

  const excluir = async (id: string) => {
    try {
      const { error } = await supabase.from("disciplinas").delete().eq("id", id);
      if (error) throw error;
      setDisciplinas((lista) => lista.filter((d) => d.id !== id));
      toast.success("Disciplina excluída");
    } catch (error) {
      console.error("Erro ao excluir disciplina:", error);
      toast.error("Erro ao excluir a disciplina");
    }
  };

  /** Cria um curso com as disciplinas na ordem dada (aulas, tópicos e questões entram juntos). */
  const criarCurso = async (titulo: string, cargo: string, informacoes: string, disciplinasIds: string[]): Promise<boolean> => {
    if (!titulo.trim()) {
      toast.error("O título do curso é obrigatório");
      return false;
    }
    if (disciplinasIds.length === 0) {
      toast.error("Selecione pelo menos uma disciplina");
      return false;
    }
    try {
      const composicao = await calcularComposicaoCurso(disciplinasIds);
      const { data, error } = await supabase
        .from("cursos")
        .insert([{ titulo: titulo.trim(), descricao: cargo, informacoes_curso: informacoes, ...composicao }])
        .select("id, titulo");
      if (error) throw error;
      const novo = data?.[0];
      if (novo) {
        setCursosDaDisciplina((mapa) => {
          const m = new Map(mapa);
          disciplinasIds.forEach((id) => m.set(id, [...(m.get(id) || []), { id: novo.id, titulo: novo.titulo }]));
          return m;
        });
      }
      toast.success(
        `Curso criado com ${composicao.disciplinas_ids.length} disciplinas, ${composicao.aulas_ids.length} aulas, ` +
          `${composicao.topicos_ids.length} tópicos e ${composicao.questoes_ids.length} questões.`
      );
      return true;
    } catch (error) {
      console.error("Erro ao adicionar curso:", error);
      toast.error("Erro ao criar o curso");
      return false;
    }
  };

  /** Junta disciplinas repetidas na principal (função unificar_disciplinas no banco). */
  const unificar = async (principalId: string, repetidasIds: string[]): Promise<boolean> => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any).rpc("unificar_disciplinas", {
        p_principal: principalId,
        p_repetidas: repetidasIds,
      });
      if (error) throw error;
      const r = (data || {}) as { aulas?: number; cursos?: number };
      toast.success(
        `Disciplinas unificadas: ${r.aulas ?? 0} aulas na principal, ${r.cursos ?? 0} ${r.cursos === 1 ? "curso atualizado" : "cursos atualizados"}.`
      );
      await carregar();
      return true;
    } catch (error) {
      console.error("Erro ao unificar disciplinas:", error);
      const msg = (error as { message?: string })?.message || "";
      toast.error(
        /unificar_disciplinas|function|schema cache/i.test(msg)
          ? "A função de unificar ainda não existe no banco. Rode a migration 20251111000000 no SQL Editor."
          : msg || "Erro ao unificar as disciplinas"
      );
      return false;
    }
  };

  return {
    unificar,
    disciplinas,
    aulas,
    cursosDaDisciplina,
    loading,
    recarregar: carregar,
    salvar,
    reordenarAulas,
    excluir,
    criarCurso,
  };
};
