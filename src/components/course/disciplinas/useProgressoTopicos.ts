import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { extractIdFromFriendlyUrl } from "@/utils/slug-utils";
import type { DisciplinaCurso, Linha } from "./useDisciplinasCurso";

type Concluidos = Record<string, string[]>;

/**
 * Tópicos concluídos do aluno no curso (user_course_progress.subjects_data.completed_sections,
 * no mesmo formato de antes: { [aulaId]: topicoIds[] }).
 *
 * Um único dono para a aba inteira: carrega uma vez e grava só as aulas alteradas, relendo a
 * linha antes de gravar para não apagar o que outras partes do site salvaram.
 */
export function useProgressoTopicos(courseId: string | undefined, disciplinas: DisciplinaCurso[]) {
  const { user } = useAuth();
  const [concluidos, setConcluidos] = useState<Concluidos>({});
  const [carregado, setCarregado] = useState(false);
  const alteradas = useRef<Set<string>>(new Set());
  const ultimo = useRef<Concluidos>({});
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const realId = courseId ? extractIdFromFriendlyUrl(courseId) : "";

  useEffect(() => {
    ultimo.current = concluidos;
  }, [concluidos]);

  useEffect(() => {
    if (!user || !realId) {
      setConcluidos({});
      setCarregado(true);
      return;
    }
    let cancelado = false;
    (async () => {
      const { data } = await supabase
        .from("user_course_progress")
        .select("subjects_data")
        .eq("user_id", user.id)
        .eq("course_id", realId)
        .maybeSingle();
      if (cancelado) return;
      const sd = data?.subjects_data as Linha | null;
      const cs = sd && typeof sd === "object" && !Array.isArray(sd) ? sd.completed_sections : null;
      const limpo: Concluidos = {};
      if (cs && typeof cs === "object") {
        Object.entries(cs).forEach(([aula, ids]) => {
          if (Array.isArray(ids)) limpo[aula] = ids.filter((x) => typeof x === "string");
        });
      }
      setConcluidos(limpo);
      setCarregado(true);
    })();
    return () => {
      cancelado = true;
    };
  }, [user, realId]);

  const gravar = useCallback(async () => {
    if (!user || !realId || alteradas.current.size === 0) return;
    const aulas = Array.from(alteradas.current);
    alteradas.current.clear();
    try {
      const { data: atual, error } = await supabase
        .from("user_course_progress")
        .select("id, subjects_data")
        .eq("user_id", user.id)
        .eq("course_id", realId)
        .maybeSingle();
      if (error && error.code !== "PGRST116") throw error;

      const bruto = atual?.subjects_data;
      const sd: Linha = bruto && typeof bruto === "object" && !Array.isArray(bruto) ? { ...(bruto as Linha) } : {};
      sd.completed_sections = { ...(sd.completed_sections || {}) };
      aulas.forEach((a) => {
        sd.completed_sections[a] = ultimo.current[a] || [];
      });

      const agora = new Date().toISOString();
      const res = atual
        ? await supabase.from("user_course_progress").update({ subjects_data: sd, updated_at: agora }).eq("id", atual.id)
        : await supabase
            .from("user_course_progress")
            .insert({ user_id: user.id, course_id: realId, subjects_data: sd, created_at: agora, updated_at: agora });
      if (res.error) throw res.error;
    } catch (e) {
      console.error("Erro ao salvar progresso:", e);
      aulas.forEach((a) => alteradas.current.add(a));
      toast.error("Não foi possível salvar seu progresso. Tente de novo.");
    }
  }, [user, realId]);

  // Grava o que faltar ao sair da aba
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      gravar();
    },
    [gravar]
  );

  const totais = useMemo(() => {
    let total = 0;
    let feitos = 0;
    disciplinas.forEach((d) =>
      d.aulas.forEach((a) => {
        const set = new Set(concluidos[a.id] || []);
        total += a.topicos.length;
        feitos += a.topicos.filter((t) => set.has(t.id)).length;
      })
    );
    return { total, feitos, percentual: total > 0 ? Math.round((feitos / total) * 100) : 0 };
  }, [disciplinas, concluidos]);

  // Mantém o resumo de progresso do cabeçalho do curso em dia
  useEffect(() => {
    if (!carregado || !user || totais.total === 0) return;
    document.dispatchEvent(
      new CustomEvent("sectionsUpdated", {
        detail: { courseId: realId, totalCompleted: totais.feitos, totalSections: totais.total, timestamp: Date.now() },
      })
    );
  }, [totais, carregado, user, realId]);

  const definirAula = useCallback(
    (aulaId: string, ids: string[]) => {
      if (!user) {
        toast.info("Entre na sua conta para marcar tópicos como concluídos.");
        return;
      }
      setConcluidos((prev) => ({ ...prev, [aulaId]: ids }));
      alteradas.current.add(aulaId);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(gravar, 600);
    },
    [user, gravar]
  );

  const alternar = useCallback(
    (aulaId: string, topicoId: string, marcar?: boolean) => {
      const atual = ultimo.current[aulaId] || [];
      const tem = atual.includes(topicoId);
      const quer = marcar ?? !tem;
      if (quer === tem) return;
      definirAula(aulaId, quer ? [...atual, topicoId] : atual.filter((x) => x !== topicoId));
    },
    [definirAula]
  );

  const feito = useCallback((aulaId: string, topicoId: string) => (concluidos[aulaId] || []).includes(topicoId), [concluidos]);

  /** Quantos tópicos da aula estão concluídos (ignora ids de tópicos que saíram da aula). */
  const feitosNaAula = useCallback(
    (aula: { id: string; topicos: { id: string }[] }) => {
      const set = new Set(concluidos[aula.id] || []);
      return aula.topicos.filter((t) => set.has(t.id)).length;
    },
    [concluidos]
  );

  return { concluidos, carregado, totais, alternar, definirAula, feito, feitosNaAula, logado: !!user };
}

export type ProgressoTopicos = ReturnType<typeof useProgressoTopicos>;

/** Primeiro tópico não concluído do curso, na ordem das disciplinas e aulas. */
export function proximoPendente(disciplinas: DisciplinaCurso[], p: Pick<ProgressoTopicos, "feito">) {
  for (const d of disciplinas)
    for (const a of d.aulas)
      for (const t of a.topicos) if (!p.feito(a.id, t.id)) return { disciplina: d, aula: a, topico: t };
  return null;
}

/** Último tópico aberto pelo aluno neste curso (só neste navegador). */
export const ultimoTopico = {
  chave: (courseId: string) => `bomestudo:ultimo-topico:${courseId}`,
  ler(courseId: string): { aulaId: string; topicoId: string } | null {
    try {
      const v = localStorage.getItem(this.chave(courseId));
      return v ? JSON.parse(v) : null;
    } catch {
      return null;
    }
  },
  salvar(courseId: string, aulaId: string, topicoId: string) {
    try {
      localStorage.setItem(this.chave(courseId), JSON.stringify({ aulaId, topicoId }));
    } catch {
      /* navegação privada */
    }
  },
};
