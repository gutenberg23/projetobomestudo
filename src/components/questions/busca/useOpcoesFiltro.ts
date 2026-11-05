import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { ChaveFiltro, Filtros } from "./filtros";

export interface Opcao {
  valor: string;
  total: number;
}

export interface GrupoOpcoes {
  /** Nome do grupo (ex.: a disciplina dona dos assuntos). Vazio quando a lista é simples. */
  grupo: string;
  opcoes: Opcao[];
}

interface Linha {
  discipline: string | null;
  assuntos: string[] | null;
  topicos: string[] | null;
  institution: string | null;
  organization: string | null;
  year: string | number | null;
  level: string | null;
  difficulty: string | null;
}

interface Indice {
  totalQuestoes: number;
  simples: Record<"disciplines" | "institutions" | "organizations" | "years" | "educationLevels" | "difficulty", Map<string, number>>;
  assuntosPorDisciplina: Map<string, Map<string, number>>;
  topicosPorAssunto: Map<string, Map<string, number>>;
  topicosPorDisciplina: Map<string, Map<string, number>>;
}

const LOTE = 1000;
const MAX_LOTES = 60; // até 60 mil questões

let cache: Promise<Indice> | null = null;

const somar = (m: Map<string, number>, v: unknown) => {
  const s = v === null || v === undefined ? "" : String(v).trim();
  if (s) m.set(s, (m.get(s) || 0) + 1);
};

const noMapa = (m: Map<string, Map<string, number>>, chave: string) => {
  let interno = m.get(chave);
  if (!interno) {
    interno = new Map();
    m.set(chave, interno);
  }
  return interno;
};

/** O Supabase devolve no máximo mil linhas por consulta, então lê em lotes. */
async function carregarIndice(): Promise<Indice> {
  const linhas: Linha[] = [];
  for (let i = 0; i < MAX_LOTES; i++) {
    const { data, error } = await supabase
      .from("questoes")
      .select("discipline, assuntos, topicos, institution, organization, year, level, difficulty")
      .order("id")
      .range(i * LOTE, (i + 1) * LOTE - 1);
    if (error) throw error;
    linhas.push(...((data || []) as Linha[]));
    if (!data || data.length < LOTE) break;
  }

  const indice: Indice = {
    totalQuestoes: linhas.length,
    simples: {
      disciplines: new Map(),
      institutions: new Map(),
      organizations: new Map(),
      years: new Map(),
      educationLevels: new Map(),
      difficulty: new Map(),
    },
    assuntosPorDisciplina: new Map(),
    topicosPorAssunto: new Map(),
    topicosPorDisciplina: new Map(),
  };

  linhas.forEach((q) => {
    somar(indice.simples.disciplines, q.discipline);
    somar(indice.simples.institutions, q.institution);
    somar(indice.simples.organizations, q.organization);
    somar(indice.simples.years, q.year);
    somar(indice.simples.educationLevels, q.level);
    somar(indice.simples.difficulty, q.difficulty);

    const disciplina = (q.discipline || "").trim();
    const assuntos = (Array.isArray(q.assuntos) ? q.assuntos : []).filter(Boolean);
    const topicos = (Array.isArray(q.topicos) ? q.topicos : []).filter(Boolean);
    if (disciplina) {
      assuntos.forEach((a) => somar(noMapa(indice.assuntosPorDisciplina, disciplina), a));
      topicos.forEach((t) => somar(noMapa(indice.topicosPorDisciplina, disciplina), t));
    }
    assuntos.forEach((a) => topicos.forEach((t) => somar(noMapa(indice.topicosPorAssunto, String(a).trim()), t)));
  });

  return indice;
}

/** Assuntos costumam vir numerados ("1. Atos", "2. Poderes"...): ordena pelo número primeiro. */
const porNumero = (a: string, b: string) => {
  const na = parseInt(a.match(/^\d+/)?.[0] || "", 10);
  const nb = parseInt(b.match(/^\d+/)?.[0] || "", 10);
  const ta = !Number.isNaN(na);
  const tb = !Number.isNaN(nb);
  if (ta && tb && na !== nb) return na - nb;
  if (ta !== tb) return ta ? -1 : 1;
  return a.localeCompare(b, "pt-BR");
};

const paraLista = (m: Map<string, number> | undefined, ordem: (a: string, b: string) => number) =>
  Array.from(m?.entries() || [])
    .map(([valor, total]) => ({ valor, total }))
    .sort((x, y) => ordem(x.valor, y.valor));

export function useOpcoesFiltro() {
  const [indice, setIndice] = useState<Indice | null>(null);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    let ativo = true;
    if (!cache) cache = carregarIndice();
    cache
      .then((i) => ativo && setIndice(i))
      .catch((e) => {
        console.error("Erro ao carregar opções de filtro:", e);
        cache = null;
        if (ativo) setErro(true);
      });
    return () => {
      ativo = false;
    };
  }, []);

  const opcoesDe = useMemo(
    () =>
      (chave: ChaveFiltro, filtros: Filtros): GrupoOpcoes[] => {
        if (!indice) return [];
        if (chave === "topics") {
          return filtros.disciplines
            .map((d) => ({ grupo: d, opcoes: paraLista(indice.assuntosPorDisciplina.get(d), porNumero) }))
            .filter((g) => g.opcoes.length);
        }
        if (chave === "subtopics") {
          if (filtros.topics.length) {
            return filtros.topics
              .map((a) => ({ grupo: a, opcoes: paraLista(indice.topicosPorAssunto.get(a), porNumero) }))
              .filter((g) => g.opcoes.length);
          }
          return filtros.disciplines
            .map((d) => ({ grupo: d, opcoes: paraLista(indice.topicosPorDisciplina.get(d), porNumero) }))
            .filter((g) => g.opcoes.length);
        }
        if (chave === "roles") return [];
        const ordem = chave === "years" ? (a: string, b: string) => b.localeCompare(a) : (a: string, b: string) => a.localeCompare(b, "pt-BR");
        return [{ grupo: "", opcoes: paraLista(indice.simples[chave], ordem) }];
      },
    [indice]
  );

  /** Explica por que um filtro dependente está vazio. */
  const dicaVazio = (chave: ChaveFiltro, filtros: Filtros) => {
    if (chave === "topics" && !filtros.disciplines.length) return "Escolha uma disciplina primeiro";
    if (chave === "subtopics" && !filtros.disciplines.length) return "Escolha uma disciplina primeiro";
    return "Nenhuma opção disponível";
  };

  return {
    carregando: !indice && !erro,
    erro,
    totalQuestoes: indice?.totalQuestoes ?? 0,
    totalBancas: indice?.simples.institutions.size ?? 0,
    totalDisciplinas: indice?.simples.disciplines.size ?? 0,
    opcoesDe,
    dicaVazio,
  };
}
