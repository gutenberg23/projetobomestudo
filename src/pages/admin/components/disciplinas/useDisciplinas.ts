import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Disciplina } from "./DisciplinasTypes";
import { faltaColunaDisciplinaQuestoes } from "../shared/CampoDisciplinaQuestoes";

export interface TeoriaResumo {
  id: string;
  titulo: string;
  /** Assunto (classificação das questões) */
  assunto: string;
  /** Disciplina das questões em que a teoria foi classificada */
  disciplinaQuestoes: string;
  publicada: boolean;
}

/** Todas as teorias (só os campos da listagem), em páginas de 1.000. */
export async function carregarTeoriasResumo(): Promise<TeoriaResumo[]> {
  const lista: TeoriaResumo[] = [];
  for (let de = 0; ; de += 1000) {
    const { data, error } = await supabase
      .from("teorias")
      .select("id, titulo, assunto_id, disciplina_id, status")
      .order("titulo", { ascending: true })
      .range(de, de + 999);
    if (error) throw error;
    (data || []).forEach((t) =>
      lista.push({
        id: String(t.id),
        titulo: t.titulo || "Teoria sem título",
        assunto: t.assunto_id || "",
        disciplinaQuestoes: t.disciplina_id || "",
        publicada: t.status === "published",
      })
    );
    if (!data || data.length < 1000) break;
  }
  return lista;
}

/** A coluna teorias_ids ainda não existe (migration 20251120000000 não rodada). */
export const faltaColunaTeorias = (error: unknown) => {
  const e = error as { code?: string; message?: string } | null;
  return !!e && (e.code === "PGRST204" || e.code === "42703") && /teorias_ids/i.test(e.message || "");
};
export const AVISO_MIGRATION_TEORIAS = "Rode a migration 20251120000000_disciplinas_teorias.sql no SQL Editor do Supabase para montar disciplinas com teorias.";

/** Dados e ações da página de disciplinas. */
export const useDisciplinas = () => {
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [teorias, setTeorias] = useState<Map<string, TeoriaResumo>>(new Map());
  const [cursosDaDisciplina, setCursosDaDisciplina] = useState<Map<string, { id: string; titulo: string }[]>>(new Map());
  const [loading, setLoading] = useState(true);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data, error }, { data: perfis }, { data: cursos }, listaTeorias] = await Promise.all([
        supabase.from("disciplinas").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("disciplinas_favoritos"),
        supabase.from("cursos").select("id, titulo, disciplinas_ids"),
        carregarTeoriasResumo(),
      ]);
      if (error) throw error;

      // Disciplinas unificadas em outra ficam fora da lista
      const ativas = (data || []).filter((d) => !(d as { unificada_em?: string | null }).unificada_em);

      const favoritos: Record<string, number> = {};
      (perfis || []).forEach((p) =>
        (p.disciplinas_favoritos || []).forEach((id: string) => (favoritos[id] = (favoritos[id] || 0) + 1))
      );

      const uso = new Map<string, { id: string; titulo: string }[]>();
      (cursos || []).forEach((c) =>
        (c.disciplinas_ids || []).forEach((id: string) => uso.set(id, [...(uso.get(id) || []), { id: c.id, titulo: c.titulo }]))
      );

      setTeorias(new Map(listaTeorias.map((t) => [t.id, t])));
      setCursosDaDisciplina(uso);
      setDisciplinas(
        ativas.map((d) => {
          const linha = d as typeof d & { disciplina_questoes?: string | null; teorias_ids?: string[] | null };
          return {
            id: d.id,
            titulo: d.titulo,
            descricao: d.descricao || "",
            banca: d.banca || "",
            disciplinaQuestoes: linha.disciplina_questoes || "",
            teoriasIds: (linha.teorias_ids || []).filter(Boolean),
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
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  /** Grava título, rating, banca, disciplina das questões e teorias (cria a disciplina se ela ainda não tem id). */
  const salvar = async (disc: Disciplina): Promise<boolean> => {
    try {
      const campos = {
        titulo: disc.titulo,
        descricao: disc.descricao,
        banca: disc.banca || null,
        teorias_ids: disc.teoriasIds,
        disciplina_questoes: disc.disciplinaQuestoes || null,
      };
      // teorias_ids e disciplina_questoes ainda não estão nos tipos gerados
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tabela = (supabase as any).from("disciplinas");
      let resultado = disc.id ? await tabela.update(campos).eq("id", disc.id).select("id").single() : await tabela.insert([campos]).select("id").single();
      if (faltaColunaDisciplinaQuestoes(resultado.error)) {
        // Migration 20251114000000 ainda não rodada: salva o resto e avisa
        const { disciplina_questoes: _ignorada, ...semQuestoes } = campos;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const t2 = (supabase as any).from("disciplinas");
        resultado = disc.id ? await t2.update(semQuestoes).eq("id", disc.id).select("id").single() : await t2.insert([semQuestoes]).select("id").single();
        if (!resultado.error) toast.warning("A disciplina das questões não foi salva: rode a migration 20251114000000_disciplina_questoes.sql no Supabase.");
      }
      if (resultado.error) throw resultado.error;

      const salva = { ...disc, id: disc.id || String(resultado.data?.id) };
      setDisciplinas((lista) => (disc.id ? lista.map((d) => (d.id === disc.id ? { ...d, ...salva } : d)) : [{ ...salva, favoritos: 0 }, ...lista]));
      toast.success(disc.id ? "Disciplina atualizada" : "Disciplina criada");
      return true;
    } catch (error) {
      console.error("Erro ao salvar disciplina:", error);
      toast.error(faltaColunaTeorias(error) ? AVISO_MIGRATION_TEORIAS : "Erro ao salvar a disciplina");
      return false;
    }
  };

  /** Salva a nova ordem das teorias da disciplina. */
  const reordenarTeorias = async (disc: Disciplina, ordem: string[]) => {
    const anterior = disc.teoriasIds;
    setDisciplinas((lista) => lista.map((d) => (d.id === disc.id ? { ...d, teoriasIds: ordem } : d)));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("disciplinas").update({ teorias_ids: ordem }).eq("id", disc.id);
    if (error) {
      console.error("Erro ao reordenar teorias:", error);
      setDisciplinas((lista) => lista.map((d) => (d.id === disc.id ? { ...d, teoriasIds: anterior } : d)));
      toast.error(faltaColunaTeorias(error) ? AVISO_MIGRATION_TEORIAS : "Não foi possível salvar a nova ordem.");
    } else {
      toast.success("Ordem das teorias salva");
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

  /** Cria um curso com as disciplinas na ordem dada (todas as teorias de cada uma entram). */
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
      const composicao = { disciplinas_ids: Array.from(new Set(disciplinasIds)) };
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
      const nTeorias = new Set(disciplinasIds.flatMap((id) => disciplinas.find((d) => d.id === id)?.teoriasIds || [])).size;
      toast.success(`Curso criado com ${composicao.disciplinas_ids.length} disciplinas e ${nTeorias} teorias.`);
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
      const r = (data || {}) as { teorias?: number; cursos?: number };
      toast.success(
        `Disciplinas unificadas: ${r.teorias ?? 0} teorias na principal, ${r.cursos ?? 0} ${r.cursos === 1 ? "curso atualizado" : "cursos atualizados"}.`
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
    teorias,
    cursosDaDisciplina,
    loading,
    recarregar: carregar,
    salvar,
    reordenarTeorias,
    excluir,
    criarCurso,
  };
};
