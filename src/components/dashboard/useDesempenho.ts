import { useCallback, useEffect, useMemo, useState } from "react";
import { format, startOfDay, subDays } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

/**
 * Dados do /dashboard: respostas do aluno no período (e no período anterior,
 * para comparar), agrupadas por dia e por disciplina > assunto > tópico.
 * O filtro de banca vale para a página inteira.
 */

export interface Resposta {
  questao_id: string;
  is_correta: boolean;
  created_at: string;
  banca: string;
  disciplina: string;
  pares: Array<{ assunto: string; topico: string }>;
}

export interface Contagem {
  total: number;
  acertos: number;
  erros: number;
  aproveitamento: number;
}

export interface NoTopico extends Contagem {
  nome: string;
}
export interface NoAssunto extends Contagem {
  nome: string;
  topicos: NoTopico[];
}
export interface NoDisciplina extends Contagem {
  nome: string;
  assuntos: NoAssunto[];
}

export interface PontoGrafico {
  chave: string;
  rotulo: string;
  rotuloLongo: string;
  acertos: number;
  erros: number;
}

export interface ResultadoSimulado {
  id: string;
  simuladoId: string;
  titulo: string;
  total: number;
  acertos: number;
  erros: number;
  aproveitamento: number;
  data: string;
}

const LOTE = 1000;

const contar = (lista: Resposta[]): Contagem => {
  const acertos = lista.filter((r) => r.is_correta).length;
  const total = lista.length;
  return { total, acertos, erros: total - acertos, aproveitamento: total ? Math.round((acertos / total) * 100) : 0 };
};

const lista = (v: unknown): string[] =>
  (Array.isArray(v) ? v : v ? [v] : []).map((x) => String(x ?? "").trim()).filter(Boolean);

/** Mesma regra de antes: assuntos e tópicos casam pela posição; se não, todos vão para o primeiro assunto. */
const montarPares = (assuntos: string[], topicos: string[]) => {
  const a = assuntos.length ? assuntos : ["Sem assunto"];
  const t = topicos.length ? topicos : ["Sem tópico"];
  if (a.length === t.length) return t.map((topico, i) => ({ assunto: a[i], topico }));
  return t.map((topico) => ({ assunto: a[0], topico }));
};

const agrupar = <T,>(itens: T[], chave: (i: T) => string) => {
  const m = new Map<string, T[]>();
  itens.forEach((i) => {
    const k = chave(i);
    if (!m.has(k)) m.set(k, []);
    m.get(k)!.push(i);
  });
  return m;
};

export function montarArvore(respostas: Resposta[]): NoDisciplina[] {
  return Array.from(agrupar(respostas, (r) => r.disciplina)).map(([nome, rs]) => {
    // Cada resposta conta uma vez por assunto/tópico em que aparece
    const porAssunto = new Map<string, Map<string, Resposta[]>>();
    rs.forEach((r) => {
      const vistos = new Set<string>();
      r.pares.forEach(({ assunto, topico }) => {
        const k = `${assunto}\u0000${topico}`;
        if (vistos.has(k)) return;
        vistos.add(k);
        if (!porAssunto.has(assunto)) porAssunto.set(assunto, new Map());
        const t = porAssunto.get(assunto)!;
        if (!t.has(topico)) t.set(topico, []);
        t.get(topico)!.push(r);
      });
    });
    const assuntos: NoAssunto[] = Array.from(porAssunto).map(([nomeAssunto, topicos]) => {
      const doAssunto = new Set<Resposta>();
      topicos.forEach((l) => l.forEach((r) => doAssunto.add(r)));
      return {
        nome: nomeAssunto,
        ...contar(Array.from(doAssunto)),
        topicos: Array.from(topicos)
          .map(([nomeTopico, l]) => ({ nome: nomeTopico, ...contar(l) }))
          .sort((a, b) => b.total - a.total || a.nome.localeCompare(b.nome)),
      };
    });
    return {
      nome,
      ...contar(rs),
      assuntos: assuntos.sort((a, b) => b.total - a.total || a.nome.localeCompare(b.nome)),
    };
  });
}

async function buscarRespostas(alunoId: string, desde: Date) {
  const todas: Array<Record<string, unknown>> = [];
  for (let de = 0; ; de += LOTE) {
    const { data, error } = await supabase
      .from("respostas_alunos")
      .select("questao_id, is_correta, opcao_id, banca, disciplina, assuntos, topicos, created_at")
      .eq("aluno_id", alunoId)
      .gte("created_at", desde.toISOString())
      .order("created_at", { ascending: true })
      .range(de, de + LOTE - 1);
    if (error) throw error;
    todas.push(...((data as Array<Record<string, unknown>>) || []));
    if (!data || data.length < LOTE) break;
  }
  return todas;
}

async function buscarQuestoes(ids: string[]) {
  const mapa = new Map<string, Record<string, unknown>>();
  for (let i = 0; i < ids.length; i += 150) {
    const { data, error } = await supabase
      .from("questoes")
      .select("id, discipline, institution, assuntos, topicos")
      .in("id", ids.slice(i, i + 150));
    if (error) throw error;
    (data || []).forEach((q) => mapa.set(q.id, q as Record<string, unknown>));
  }
  return mapa;
}

async function buscarSimulados(alunoId: string): Promise<ResultadoSimulado[]> {
  const { data: resultados, error } = await supabase
    .from("user_simulado_results")
    .select("*")
    .eq("user_id", alunoId)
    .order("created_at", { ascending: false });
  if (error || !resultados?.length) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rs = resultados as any[];
  const ids = Array.from(new Set(rs.map((r) => r.simulado_id).filter(Boolean)));
  const { data: simulados } = ids.length
    ? await supabase.from("simulados").select("id, titulo, questoes_ids").in("id", ids)
    : { data: [] };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const porId = new Map((simulados as any[] | null)?.map((s) => [s.id, s]) || []);

  return rs.map((r) => {
    const s = porId.get(r.simulado_id);
    const acertos = Number(r.acertos ?? r.correct_answers) || 0;
    const erros = Number(r.erros ?? r.wrong_answers) || 0;
    const total = Number(s?.questoes_ids?.length) || Number(r.total_questions) || acertos + erros;
    return {
      id: r.id,
      simuladoId: r.simulado_id,
      titulo: s?.titulo || "Simulado",
      total,
      acertos,
      erros,
      aproveitamento: total ? Math.round((acertos / total) * 100) : 0,
      data: r.created_at,
    };
  });
}

export function useDesempenho(alunoId: string | undefined, dias: number) {
  const [respostas, setRespostas] = useState<Resposta[]>([]);
  const [simulados, setSimulados] = useState<ResultadoSimulado[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [versao, setVersao] = useState(0);
  const [banca, setBanca] = useState("todas");

  const inicio = useMemo(() => startOfDay(subDays(new Date(), dias - 1)), [dias]);
  const inicioAnterior = useMemo(() => subDays(inicio, dias), [inicio, dias]);

  useEffect(() => {
    if (!alunoId) return;
    let cancelado = false;
    setCarregando(true);
    setErro(null);
    (async () => {
      try {
        const [brutas, sims] = await Promise.all([buscarRespostas(alunoId, inicioAnterior), buscarSimulados(alunoId)]);
        const ids = Array.from(new Set(brutas.map((r) => String(r.questao_id))));
        const questoes = await buscarQuestoes(ids);
        const prontas: Resposta[] = brutas.map((r) => {
          const q = questoes.get(String(r.questao_id)) || {};
          const assuntos = lista(r.assuntos).length ? lista(r.assuntos) : lista(q.assuntos);
          const topicos = lista(r.topicos).length ? lista(r.topicos) : lista(q.topicos);
          return {
            questao_id: String(r.questao_id),
            is_correta: !!r.is_correta,
            created_at: String(r.created_at),
            banca: String(r.banca || q.institution || "Sem banca").trim(),
            disciplina: String(q.discipline || r.disciplina || "Sem disciplina").trim(),
            pares: montarPares(assuntos, topicos),
          };
        });
        if (cancelado) return;
        setRespostas(prontas);
        setSimulados(sims);
      } catch (e) {
        console.error("Erro ao carregar o desempenho:", e);
        if (!cancelado) setErro("Não foi possível carregar suas estatísticas. Tente novamente mais tarde.");
      } finally {
        if (!cancelado) setCarregando(false);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [alunoId, inicioAnterior, versao]);

  const recarregar = useCallback(() => setVersao((v) => v + 1), []);

  const doPeriodo = useMemo(() => respostas.filter((r) => new Date(r.created_at) >= inicio), [respostas, inicio]);

  /** Bancas do período, da mais respondida para a menos. */
  const bancas = useMemo(() => {
    const m = new Map<string, number>();
    doPeriodo.forEach((r) => m.set(r.banca, (m.get(r.banca) || 0) + 1));
    return Array.from(m)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([nome, total]) => ({ nome, total }));
  }, [doPeriodo]);

  useEffect(() => {
    if (banca !== "todas" && !bancas.some((b) => b.nome === banca)) setBanca("todas");
  }, [bancas, banca]);

  const daBanca = useCallback((r: Resposta) => banca === "todas" || r.banca === banca, [banca]);
  const atuais = useMemo(() => doPeriodo.filter(daBanca), [doPeriodo, daBanca]);
  const anteriores = useMemo(
    () => respostas.filter((r) => new Date(r.created_at) < inicio && daBanca(r)),
    [respostas, inicio, daBanca]
  );

  const resumo = useMemo(() => contar(atuais), [atuais]);
  const resumoAnterior = useMemo(() => contar(anteriores), [anteriores]);

  const grafico = useMemo<PontoGrafico[]>(() => {
    const porMes = dias > 90;
    const pontos = new Map<string, PontoGrafico>();
    if (porMes) {
      for (let i = 11; i >= 0; i--) {
        const d = new Date();
        d.setDate(1);
        d.setMonth(d.getMonth() - i);
        const chave = format(d, "yyyy-MM");
        const mes = d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
        pontos.set(chave, { chave, rotulo: mes, rotuloLongo: d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }), acertos: 0, erros: 0 });
      }
    } else {
      for (let i = dias - 1; i >= 0; i--) {
        const d = subDays(new Date(), i);
        const chave = format(d, "yyyy-MM-dd");
        pontos.set(chave, { chave, rotulo: format(d, "dd/MM"), rotuloLongo: format(d, "dd/MM/yyyy"), acertos: 0, erros: 0 });
      }
    }
    atuais.forEach((r) => {
      const p = pontos.get(format(new Date(r.created_at), porMes ? "yyyy-MM" : "yyyy-MM-dd"));
      if (!p) return;
      if (r.is_correta) p.acertos++;
      else p.erros++;
    });
    return Array.from(pontos.values());
  }, [atuais, dias]);

  const diasEstudados = useMemo(() => new Set(atuais.map((r) => format(new Date(r.created_at), "yyyy-MM-dd"))).size, [atuais]);

  const arvore = useMemo(() => montarArvore(atuais), [atuais]);

  return {
    carregando,
    erro,
    recarregar,
    banca,
    setBanca,
    bancas,
    resumo,
    resumoAnterior,
    grafico,
    diasEstudados,
    arvore,
    simulados,
  };
}
