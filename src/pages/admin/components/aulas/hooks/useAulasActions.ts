import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Aula } from "../AulasTypes";
import { buscarEmLotes } from "../../cursos/composicaoCurso";

export interface TopicoResumo {
  id: string;
  nome: string;
  disciplina: string;
  questoes_ids: string[];
}

const unicos = (lista: (string | null | undefined)[]) =>
  Array.from(new Set(lista.filter((x): x is string => !!x && x.trim() !== "")));

/** Questões da aula: as dela e as dos tópicos, sem repetir. */
export const questoesDaAula = (questoesAula: string[], topicosIds: string[], topicos: Map<string, TopicoResumo>) =>
  unicos([...questoesAula, ...topicosIds.flatMap((id) => topicos.get(id)?.questoes_ids || [])]);

/**
 * Dados e ações da página de aulas.
 * Carrega aulas, tópicos e disciplinas em poucas consultas (antes eram duas
 * consultas por aula).
 */
export const useAulasActions = () => {
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [topicos, setTopicos] = useState<Map<string, TopicoResumo>>(new Map());
  /** aula → disciplinas que a usam */
  const [disciplinasDaAula, setDisciplinasDaAula] = useState<Map<string, { id: string; titulo: string }[]>>(new Map());
  const [loading, setLoading] = useState(true);

  const fetchAulas = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data, error }, { data: disciplinas }] = await Promise.all([
        supabase.from("aulas").select("*").order("created_at", { ascending: false }),
        supabase.from("disciplinas").select("id, titulo, aulas_ids"),
      ]);
      if (error) throw error;

      const idsTopicos = unicos((data || []).flatMap((a) => a.topicos_ids || []));
      const linhas = idsTopicos.length
        ? ((await buscarEmLotes("topicos", "id, nome, disciplina, questoes_ids", idsTopicos)) as unknown as TopicoResumo[])
        : [];
      const mapaTopicos = new Map(linhas.map((t) => [t.id, { ...t, questoes_ids: t.questoes_ids || [] }]));

      const usoDisciplinas = new Map<string, { id: string; titulo: string }[]>();
      for (const d of disciplinas || []) {
        for (const aulaId of d.aulas_ids || []) {
          usoDisciplinas.set(aulaId, [...(usoDisciplinas.get(aulaId) || []), { id: d.id, titulo: d.titulo }]);
        }
      }

      setTopicos(mapaTopicos);
      setDisciplinasDaAula(usoDisciplinas);
      setAulas(
        (data || []).map((aula) => {
          const topicosIds = aula.topicos_ids || [];
          return {
            id: aula.id,
            titulo: aula.titulo,
            descricao: aula.descricao || "",
            topicosIds,
            questoesIds: aula.questoes_ids || [],
            selecionada: false,
            totalQuestoes: questoesDaAula(aula.questoes_ids || [], topicosIds, mapaTopicos).length,
          };
        })
      );
    } catch (error) {
      console.error("Erro ao carregar aulas:", error);
      toast.error("Erro ao carregar as aulas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAulas();
  }, [fetchAulas]);

  /** Salva título, texto do edital e tópicos (recalcula as questões a partir dos tópicos). */
  const salvarAula = async (aula: Aula, novosTopicos?: TopicoResumo[]): Promise<boolean> => {
    try {
      const mapa = new Map(topicos);
      (novosTopicos || []).forEach((t) => mapa.set(t.id, t));
      const questoesIds = unicos(aula.topicosIds.flatMap((id) => mapa.get(id)?.questoes_ids || []));
      const { error } = await supabase
        .from("aulas")
        .update({ titulo: aula.titulo, descricao: aula.descricao, topicos_ids: aula.topicosIds, questoes_ids: questoesIds })
        .eq("id", aula.id);
      if (error) throw error;

      setTopicos(mapa);
      setAulas((lista) =>
        lista.map((a) => (a.id === aula.id ? { ...a, ...aula, questoesIds, totalQuestoes: questoesIds.length } : a))
      );
      toast.success("Aula atualizada");
      return true;
    } catch (error) {
      console.error("Erro ao atualizar aula:", error);
      toast.error("Erro ao atualizar a aula. Tente novamente.");
      return false;
    }
  };

  /**
   * Salva a nova ordem dos tópicos da aula. Nos cursos que têm a aula, os
   * tópicos dela trocam de lugar entre si, sem sair da posição no curso.
   */
  const reordenarTopicos = async (aula: Aula, novaOrdem: string[]) => {
    const anterior = aula.topicosIds;
    setAulas((lista) => lista.map((a) => (a.id === aula.id ? { ...a, topicosIds: novaOrdem } : a)));
    try {
      const { error } = await supabase.from("aulas").update({ topicos_ids: novaOrdem }).eq("id", aula.id);
      if (error) throw error;

      const { data: cursos, error: erroCursos } = await supabase
        .from("cursos")
        .select("id, topicos_ids")
        .contains("aulas_ids", [aula.id]);
      if (erroCursos) throw erroCursos;

      const daAula = new Set(novaOrdem);
      for (const curso of cursos || []) {
        const atuais: string[] = curso.topicos_ids || [];
        const fila = novaOrdem.filter((id) => atuais.includes(id));
        let k = 0;
        const novo = atuais.map((id) => (daAula.has(id) ? fila[k++] ?? id : id));
        // Tópicos da aula que ainda não estavam no curso entram no fim
        const faltando = novaOrdem.filter((id) => !atuais.includes(id));
        const { error: e } = await supabase
          .from("cursos")
          .update({ topicos_ids: [...novo, ...faltando] })
          .eq("id", curso.id);
        if (e) throw e;
      }
      toast.success("Ordem dos tópicos salva");
    } catch (error) {
      console.error("Erro ao reordenar tópicos:", error);
      setAulas((lista) => lista.map((a) => (a.id === aula.id ? { ...a, topicosIds: anterior } : a)));
      toast.error("Não foi possível salvar a nova ordem.");
    }
  };

  const excluirAula = async (id: string) => {
    try {
      const { error } = await supabase.from("aulas").delete().eq("id", id);
      if (error) throw error;
      setAulas((lista) => lista.filter((a) => a.id !== id));
      toast.success("Aula excluída");
    } catch (error) {
      console.error("Erro ao excluir aula:", error);
      toast.error("Erro ao excluir a aula. Tente novamente.");
    }
  };

  const duplicarAula = async (aula: Aula) => {
    try {
      const { data, error } = await supabase
        .from("aulas")
        .insert([
          {
            titulo: `${aula.titulo} (cópia)`,
            descricao: aula.descricao,
            topicos_ids: aula.topicosIds,
            questoes_ids: aula.questoesIds,
          },
        ])
        .select()
        .single();
      if (error) throw error;

      setAulas((lista) => [
        {
          id: data.id,
          titulo: data.titulo,
          descricao: data.descricao || "",
          topicosIds: data.topicos_ids || [],
          questoesIds: data.questoes_ids || [],
          selecionada: false,
          totalQuestoes: aula.totalQuestoes,
        },
        ...lista,
      ]);
      toast.success("Aula duplicada. A cópia está no topo da lista.");
    } catch (error) {
      console.error("Erro ao duplicar aula:", error);
      toast.error("Erro ao duplicar a aula. Tente novamente.");
    }
  };

  /** Cria uma disciplina com as aulas selecionadas, na ordem da seleção. */
  const criarDisciplina = async (titulo: string, rating: string, banca: string, aulasIds: string[]): Promise<boolean> => {
    if (!titulo.trim()) {
      toast.error("O título da disciplina é obrigatório");
      return false;
    }
    if (aulasIds.length === 0) {
      toast.error("Selecione pelo menos uma aula");
      return false;
    }
    try {
      const { data, error } = await supabase
        .from("disciplinas")
        .insert([{ titulo: titulo.trim(), descricao: rating, banca, aulas_ids: aulasIds, created_at: new Date().toISOString() }])
        .select("id, titulo");
      if (error) throw error;

      const nova = data?.[0];
      if (nova) {
        setDisciplinasDaAula((mapa) => {
          const m = new Map(mapa);
          aulasIds.forEach((id) => m.set(id, [...(m.get(id) || []), { id: nova.id, titulo: nova.titulo }]));
          return m;
        });
      }
      toast.success(`Disciplina "${titulo.trim()}" criada com ${aulasIds.length} ${aulasIds.length === 1 ? "aula" : "aulas"}`);
      return true;
    } catch (error) {
      console.error("Erro ao adicionar disciplina:", error);
      toast.error("Erro ao criar a disciplina: " + ((error as Error).message || "tente novamente."));
      return false;
    }
  };

  return {
    aulas,
    setAulas,
    topicos,
    disciplinasDaAula,
    loading,
    recarregar: fetchAulas,
    salvarAula,
    reordenarTopicos,
    excluirAula,
    duplicarAula,
    criarDisciplina,
  };
};
