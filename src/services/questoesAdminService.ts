import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import { QuestionItemType, QuestionOption } from "@/components/admin/questions/types";

/** Questão como a página /admin/questoes trabalha. */
export interface QuestaoAdmin extends QuestionItemType {
  createdAt: string | null;
  updatedAt: string | null;
}

export type DadosQuestao = Omit<QuestaoAdmin, "id" | "createdAt" | "updatedAt">;

export interface FiltrosQuestoes {
  busca: string;
  disciplinas: string[];
  assuntos: string[];
  topicos: string[];
  bancas: string[];
  orgaos: string[];
  cargos: string[];
  anos: string[];
  niveis: string[];
  dificuldades: string[];
  tipos: string[];
  semExplicacaoIA: boolean;
  semComentarioProfessor: boolean;
  ordem: "recentes" | "antigas";
}

export const FILTROS_VAZIOS: FiltrosQuestoes = {
  busca: "",
  disciplinas: [],
  assuntos: [],
  topicos: [],
  bancas: [],
  orgaos: [],
  cargos: [],
  anos: [],
  niveis: [],
  dificuldades: [],
  tipos: [],
  semExplicacaoIA: false,
  semComentarioProfessor: false,
  ordem: "recentes",
};

/** Valores já usados nas questões, para os filtros e campos do formulário. */
export interface Facetas {
  anos: string[];
  bancas: string[];
  orgaos: string[];
  cargos: string[];
  disciplinas: string[];
  niveis: string[];
  dificuldades: string[];
  tipos: string[];
  assuntos: string[];
  topicos: string[];
  /** disciplina → assuntos usados com ela */
  assuntosPorDisciplina: Record<string, string[]>;
  /** assunto → tópicos usados com ele */
  topicosPorAssunto: Record<string, string[]>;
}

export const FACETAS_VAZIAS: Facetas = {
  anos: [],
  bancas: [],
  orgaos: [],
  cargos: [],
  disciplinas: [],
  niveis: [],
  dificuldades: [],
  tipos: [],
  assuntos: [],
  topicos: [],
  assuntosPorDisciplina: {},
  topicosPorAssunto: {},
};

type LinhaQuestao = {
  id: string;
  year: string | null;
  institution: string | null;
  organization: string | null;
  role: string[] | null;
  discipline: string | null;
  level: string | null;
  difficulty: string | null;
  questiontype: string | null;
  content: string | null;
  teacherexplanation: string | null;
  aiexplanation: string | null;
  expandablecontent: string | null;
  options: Json | null;
  assuntos: string[] | null;
  topicos: string[] | null;
  created_at: string | null;
  updated_at: string | null;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function lerAlternativas(options: Json | null | undefined): QuestionOption[] {
  if (!Array.isArray(options)) return [];
  return options.map((o) => {
    const opt = (o || {}) as Record<string, unknown>;
    return {
      id: typeof opt.id === "string" && opt.id ? opt.id : novoIdAlternativa(),
      text: typeof opt.text === "string" ? opt.text : "",
      isCorrect: Boolean(opt.isCorrect),
    };
  });
}

export const novoIdAlternativa = () => `option-${Math.random().toString(36).slice(2, 11)}`;

function paraQuestao(q: LinhaQuestao): QuestaoAdmin {
  return {
    id: q.id,
    year: q.year || "",
    institution: q.institution || "",
    organization: q.organization || "",
    role: Array.isArray(q.role) ? q.role : [],
    discipline: q.discipline || "",
    level: q.level || "",
    difficulty: q.difficulty || "",
    questionType: q.questiontype || "",
    content: q.content || "",
    teacherExplanation: q.teacherexplanation || "",
    aiExplanation: q.aiexplanation || "",
    expandableContent: q.expandablecontent || "",
    options: lerAlternativas(q.options),
    assuntos: q.assuntos || [],
    topicos: q.topicos || [],
    createdAt: q.created_at,
    updatedAt: q.updated_at,
  };
}

function paraLinha(d: DadosQuestao) {
  return {
    year: d.year.trim(),
    institution: d.institution.trim(),
    organization: d.organization.trim(),
    role: d.role,
    discipline: d.discipline.trim(),
    level: d.level || "",
    difficulty: d.difficulty || "",
    questiontype: d.questionType,
    content: d.content,
    teacherexplanation: d.teacherExplanation || "",
    aiexplanation: d.aiExplanation || "",
    expandablecontent: d.expandableContent || "",
    options: d.options.map(({ id, text, isCorrect }) => ({ id, text, isCorrect })) as unknown as Json,
    assuntos: d.assuntos,
    topicos: d.topicos,
  };
}

/** Lista uma página de questões com os filtros aplicados no banco. */
export async function listarQuestoes(
  filtros: FiltrosQuestoes,
  pagina: number,
  porPagina: number
): Promise<{ itens: QuestaoAdmin[]; total: number }> {
  let q = supabase.from("questoes").select("*", { count: "exact" });

  const busca = filtros.busca.trim();
  if (busca) {
    if (UUID.test(busca)) q = q.eq("id", busca);
    else q = q.ilike("content", `%${busca.replace(/[%_\\]/g, (c) => `\\${c}`)}%`);
  }
  if (filtros.disciplinas.length) q = q.in("discipline", filtros.disciplinas);
  if (filtros.bancas.length) q = q.in("institution", filtros.bancas);
  if (filtros.orgaos.length) q = q.in("organization", filtros.orgaos);
  if (filtros.anos.length) q = q.in("year", filtros.anos);
  if (filtros.niveis.length) q = q.in("level", filtros.niveis);
  if (filtros.dificuldades.length) q = q.in("difficulty", filtros.dificuldades);
  if (filtros.tipos.length) q = q.in("questiontype", filtros.tipos);
  if (filtros.cargos.length) q = q.overlaps("role", filtros.cargos);
  if (filtros.assuntos.length) q = q.overlaps("assuntos", filtros.assuntos);
  if (filtros.topicos.length) q = q.overlaps("topicos", filtros.topicos);
  if (filtros.semExplicacaoIA) q = q.or("aiexplanation.is.null,aiexplanation.eq.");
  if (filtros.semComentarioProfessor) q = q.eq("teacherexplanation", "");

  const inicio = (pagina - 1) * porPagina;
  const { data, error, count } = await q
    .order("created_at", { ascending: filtros.ordem === "antigas", nullsFirst: false })
    .order("id", { ascending: true })
    .range(inicio, inicio + porPagina - 1);
  if (error) throw error;
  return { itens: (data as LinhaQuestao[]).map(paraQuestao), total: count ?? 0 };
}

export interface ResumoQuestoes {
  total: number;
  semExplicacaoIA: number;
  semComentarioProfessor: number;
  errosPendentes: number;
}

export async function resumoQuestoes(): Promise<ResumoQuestoes> {
  const contagem = () => supabase.from("questoes").select("id", { count: "exact", head: true });
  const [total, semIA, semProfessor, erros] = await Promise.all([
    contagem(),
    contagem().or("aiexplanation.is.null,aiexplanation.eq."),
    contagem().eq("teacherexplanation", ""),
    supabase.from("questoes_erros_reportados").select("id", { count: "exact", head: true }).eq("status", "pendente"),
  ]);
  if (total.error) throw total.error;
  return {
    total: total.count ?? 0,
    semExplicacaoIA: semIA.count ?? 0,
    semComentarioProfessor: semProfessor.count ?? 0,
    errosPendentes: erros.count ?? 0,
  };
}

const ordenar = (lista: Iterable<string>) =>
  [...new Set(lista)].filter((v) => typeof v === "string" && v.trim()).sort((a, b) => a.localeCompare(b, "pt-BR"));

/**
 * Lê os metadados de todas as questões (em lotes de 1.000, o limite do
 * Supabase) para montar as opções dos filtros e dos campos do formulário.
 */
export async function carregarFacetas(): Promise<Facetas> {
  const LOTE = 1000;
  const linhas: Pick<LinhaQuestao, "year" | "institution" | "organization" | "role" | "discipline" | "level" | "difficulty" | "questiontype" | "assuntos" | "topicos">[] = [];
  for (let inicio = 0; ; inicio += LOTE) {
    const { data, error } = await supabase
      .from("questoes")
      .select("year, institution, organization, role, discipline, level, difficulty, questiontype, assuntos, topicos")
      .order("id", { ascending: true })
      .range(inicio, inicio + LOTE - 1);
    if (error) throw error;
    linhas.push(...(data || []));
    if (!data || data.length < LOTE || inicio > 200_000) break;
  }

  const assuntosPorDisciplina: Record<string, Set<string>> = {};
  const topicosPorAssunto: Record<string, Set<string>> = {};
  for (const l of linhas) {
    const assuntos = Array.isArray(l.assuntos) ? l.assuntos.filter(Boolean) : [];
    const topicos = Array.isArray(l.topicos) ? l.topicos.filter(Boolean) : [];
    if (l.discipline) {
      const set = (assuntosPorDisciplina[l.discipline] ||= new Set());
      assuntos.forEach((a) => set.add(a));
    }
    for (const a of assuntos) {
      const set = (topicosPorAssunto[a] ||= new Set());
      topicos.forEach((t) => set.add(t));
    }
  }
  const paraListas = (m: Record<string, Set<string>>) =>
    Object.fromEntries(Object.entries(m).map(([k, v]) => [k, ordenar(v)]));

  return {
    anos: ordenar(linhas.map((l) => l.year || "")).sort((a, b) => b.localeCompare(a)),
    bancas: ordenar(linhas.map((l) => l.institution || "")),
    orgaos: ordenar(linhas.map((l) => l.organization || "")),
    cargos: ordenar(linhas.flatMap((l) => (Array.isArray(l.role) ? l.role : []))),
    disciplinas: ordenar(linhas.map((l) => l.discipline || "")),
    niveis: ordenar(linhas.map((l) => l.level || "")),
    dificuldades: ordenar(linhas.map((l) => l.difficulty || "")),
    tipos: ordenar(linhas.map((l) => l.questiontype || "")),
    assuntos: ordenar(linhas.flatMap((l) => l.assuntos || [])),
    topicos: ordenar(linhas.flatMap((l) => l.topicos || [])),
    assuntosPorDisciplina: paraListas(assuntosPorDisciplina),
    topicosPorAssunto: paraListas(topicosPorAssunto),
  };
}

export async function buscarQuestao(id: string): Promise<QuestaoAdmin | null> {
  const { data, error } = await supabase.from("questoes").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? paraQuestao(data as LinhaQuestao) : null;
}

export async function criarQuestao(dados: DadosQuestao, userId: string): Promise<QuestaoAdmin> {
  const agora = new Date().toISOString();
  const { data, error } = await supabase
    .from("questoes")
    .insert({ id: crypto.randomUUID(), user_id: userId, ...paraLinha(dados), created_at: agora, updated_at: agora })
    .select("*")
    .single();
  if (error) throw error;
  return paraQuestao(data as LinhaQuestao);
}

export async function atualizarQuestao(id: string, dados: DadosQuestao): Promise<QuestaoAdmin> {
  const { data, error } = await supabase
    .from("questoes")
    .update({ ...paraLinha(dados), updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return paraQuestao(data as LinhaQuestao);
}

export async function excluirQuestoes(ids: string[]): Promise<void> {
  if (!ids.length) return;
  const { error } = await supabase.from("questoes").delete().in("id", ids);
  if (error) throw error;
}

export async function excluirTodasQuestoes(): Promise<void> {
  const { error } = await supabase.from("questoes").delete().gte("id", "");
  if (error) throw error;
}

export async function limparEstatisticasQuestao(id: string): Promise<void> {
  const { error } = await supabase.rpc("clear_question_stats", { question_id: id });
  if (error) throw error;
}

export async function limparTodasEstatisticas(): Promise<void> {
  const { error } = await supabase.rpc("clear_all_question_stats");
  if (error) throw error;
}

/* ---------------------------------------------------------------- IA ---- */

export interface PedidoExplicacao {
  enunciado: string;
  textoApoio?: string;
  tipo: string;
  alternativas: { letra: string; texto: string; correta: boolean }[];
  disciplina?: string;
  banca?: string;
  orgao?: string;
  ano?: string;
  assuntos?: string[];
  topicos?: string[];
  explicacaoExistente?: string;
}

/** Gera a explicação pela Edge Function, com a IA gratuita (Gemini/Groq). */
export async function gerarExplicacaoIA(questao: PedidoExplicacao, instrucoes?: string): Promise<{ html: string; provider?: string }> {
  const { data, error } = await supabase.functions.invoke("generate-question-explanation", {
    body: { questao, instrucoes: instrucoes || undefined },
  });
  if (error) {
    const ctx = (error as { context?: Response }).context;
    if (ctx && typeof ctx.json === "function") {
      try {
        const body = await ctx.clone().json();
        if (body?.error) throw new Error(String(body.error));
      } catch (e) {
        if (e instanceof Error && e.message && !/JSON/.test(e.message)) throw e;
      }
      if (ctx.status === 404) throw new Error("A função generate-question-explanation não está publicada no Supabase.");
    }
    throw new Error(error.message || "Erro ao chamar a IA");
  }
  if (!data?.text) throw new Error(data?.error || "Resposta inválida da IA");
  return { html: String(data.text), provider: data.provider };
}

/* ------------------------------------------------- Erros reportados ---- */

export interface ErroReportado {
  id: string;
  questaoId: string;
  descricao: string;
  status: string;
  createdAt: string;
  autor: string;
  questao?: { content: string; discipline: string; institution: string; year: string } | null;
}

export async function listarErrosReportados(status: "pendente" | "ignorado" | "resolvido"): Promise<ErroReportado[]> {
  const { data, error } = await supabase
    .from("questoes_erros_reportados")
    .select("id, questao_id, descricao, status, created_at, user_id, questao:questao_id (content, discipline, institution, year)")
    .eq("status", status)
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  const ids = [...new Set((data || []).map((e) => e.user_id).filter(Boolean))];
  const { data: perfis } = ids.length
    ? await supabase.from("profiles").select("id, nome, email").in("id", ids)
    : { data: [] as { id: string; nome: string | null; email: string | null }[] };
  const nomes = new Map((perfis || []).map((p) => [p.id, p.nome || p.email || ""]));
  return (data || []).map((e) => ({
    id: e.id,
    questaoId: e.questao_id,
    descricao: e.descricao,
    status: e.status,
    createdAt: e.created_at,
    autor: nomes.get(e.user_id) || "Usuário desconhecido",
    questao: (e as unknown as { questao: ErroReportado["questao"] }).questao,
  }));
}

export async function atualizarStatusErro(id: string, status: "pendente" | "ignorado" | "resolvido"): Promise<void> {
  const { error } = await supabase
    .from("questoes_erros_reportados")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}
