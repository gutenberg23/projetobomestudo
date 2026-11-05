import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import type { EstadoBusca } from "./filtros";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Linha = Record<string, any>;

/** Limita a lista de ids enviada na URL da consulta. */
export const MAX_IDS_RESTRICAO = 400;

export interface Restricao {
  /** Só estas questões (ex.: as que o aluno errou). */
  incluir?: string[];
  /** Todas, menos estas (ex.: as que o aluno já resolveu). */
  excluir?: string[];
}

const opcoes = (options: Json | null) =>
  Array.isArray(options)
    ? (options as Linha[]).map((o, i) => ({
        id: o?.id || `opcao-${i}`,
        text: o?.text || "",
        isCorrect: Boolean(o?.isCorrect),
      }))
    : [];

export const paraQuestao = (q: Linha) => ({
  id: q.id,
  year: q.year,
  institution: q.institution,
  organization: q.organization,
  role: Array.isArray(q.role) ? q.role.join(", ") : q.role,
  discipline: q.discipline,
  level: q.level,
  educationLevel: q.level,
  difficulty: q.difficulty,
  questionType: q.questiontype,
  content: q.content,
  teacherExplanation: q.teacherexplanation,
  aiExplanation: q.aiexplanation || "",
  expandableContent: q.expandablecontent || "",
  options: opcoes(q.options),
  topicos: Array.isArray(q.topicos) ? q.topicos : [],
  topics: Array.isArray(q.topicos) ? q.topicos : [],
  assuntos: Array.isArray(q.assuntos) ? q.assuntos : [],
});

export type QuestaoLista = ReturnType<typeof paraQuestao>;

/** Busca uma página de questões com os filtros da URL (E entre filtros, OU dentro de cada filtro). */
export function useBuscaQuestoes(estado: EstadoBusca, restricao?: Restricao | null, pausar = false) {
  const [questoes, setQuestoes] = useState<QuestaoLista[]>([]);
  const [total, setTotal] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);
  const [foraDoLimite, setForaDoLimite] = useState(false);

  const chave = JSON.stringify([estado, restricao]);

  useEffect(() => {
    if (pausar) return;
    let ativo = true;
    (async () => {
      setCarregando(true);
      setErro(false);
      setForaDoLimite(false);
      try {
        const { filtros: f, q, pagina, porPagina, ordem } = estado;
        if (restricao?.incluir && restricao.incluir.length === 0) {
          if (ativo) {
            setQuestoes([]);
            setTotal(0);
          }
          return;
        }

        let consulta = supabase.from("questoes").select("*", { count: "exact" });
        if (q) consulta = consulta.ilike("content", `%${q}%`);
        if (f.disciplines.length) consulta = consulta.in("discipline", f.disciplines);
        if (f.institutions.length) consulta = consulta.in("institution", f.institutions);
        if (f.organizations.length) consulta = consulta.in("organization", f.organizations);
        if (f.years.length) consulta = consulta.in("year", f.years);
        if (f.educationLevels.length) consulta = consulta.in("level", f.educationLevels);
        if (f.difficulty.length) consulta = consulta.in("difficulty", f.difficulty);
        if (f.roles.length) consulta = consulta.overlaps("role", f.roles);
        if (f.topics.length) consulta = consulta.overlaps("assuntos", f.topics);
        if (f.subtopics.length) consulta = consulta.overlaps("topicos", f.subtopics);
        if (restricao?.incluir?.length) consulta = consulta.in("id", restricao.incluir.slice(0, MAX_IDS_RESTRICAO));
        if (restricao?.excluir?.length) {
          consulta = consulta.not("id", "in", `(${restricao.excluir.slice(0, MAX_IDS_RESTRICAO).join(",")})`);
        }

        if (ordem === "ano") consulta = consulta.order("year", { ascending: false }).order("created_at", { ascending: false, nullsFirst: false });
        else consulta = consulta.order("created_at", { ascending: ordem === "antigas", nullsFirst: false });
        consulta = consulta.order("id");

        const inicio = (pagina - 1) * porPagina;
        const { data, error, count } = await consulta.range(inicio, inicio + porPagina - 1);
        if (error && error.code === "PGRST103") {
          // Página além do fim (ex.: link antigo com page=50): quem chama volta para a primeira.
          if (ativo) setForaDoLimite(true);
          return;
        }
        if (error) throw error;
        if (!ativo) return;
        setQuestoes((data || []).map(paraQuestao));
        setTotal(count ?? 0);
      } catch (e) {
        console.error("Erro ao carregar questões:", e);
        if (ativo) {
          setErro(true);
          setQuestoes([]);
          setTotal(0);
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    })();
    return () => {
      ativo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave, pausar]);

  return { questoes, total, carregando, erro, foraDoLimite };
}
