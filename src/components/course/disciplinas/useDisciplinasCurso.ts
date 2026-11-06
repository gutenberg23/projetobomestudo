import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { extractIdFromFriendlyUrl } from "@/utils/slug-utils";
import { TeoriasPorDisciplina, lerTeoriasPorDisciplina, teoriasDaDisciplinaNoCurso } from "@/utils/teoriasDoCurso";
import { lerRelevancias, notaValida, type RelevanciaPorDisciplina } from "@/utils/relevanciaDoCurso";

/** Uma teoria da disciplina, com o que basta para a lista (sem o texto). */
export interface TeoriaCurso {
  id: string;
  /** Parte amigável da URL (/teoria/<slug>); sem slug, o próprio id */
  slug: string;
  titulo: string;
  /** Assunto da teoria (classificação das questões), usado para agrupar a lista */
  assunto: string;
  /** Disciplina das questões (ex.: "Língua Portuguesa") */
  disciplinaQuestoes: string | null;
  temVideo: boolean;
  temQuestoes: boolean;
  temMapa: boolean;
  /** Filtros de questões da teoria (para as estatísticas) */
  filtrosQuestoes: Record<string, string[]>;
}

export interface DisciplinaCurso {
  id: string;
  titulo: string;
  /** Nota de 1 a 10 dada no curso (quanto a disciplina pesa neste concurso) */
  relevancia: number | null;
  teorias: TeoriaCurso[];
}

const LOTE = 150;

/** Linha crua do banco (as tabelas de conteúdo não estão todas nos tipos gerados). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Linha = Record<string, any>;

/** Busca linhas por id em lotes (evita URL longa demais) e devolve um mapa por id. */
export async function buscarPorIds(tabela: string, ids: string[], colunas = "*") {
  const mapa = new Map<string, Linha>();
  const unicos = Array.from(new Set(ids.filter(Boolean)));
  for (let i = 0; i < unicos.length; i += LOTE) {
    const parte = unicos.slice(i, i + LOTE);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).from(tabela).select(colunas).in("id", parte);
    if (error) throw error;
    ((data || []) as Linha[]).forEach((linha) => mapa.set(String(linha.id), linha));
  }
  return mapa;
}

/** Colunas da teoria usadas na lista (o texto fica de fora: é pesado). */
export const COLUNAS_TEORIA_LISTA =
  "id, slug, titulo, status, disciplina_id, assunto_id, questoes_filtros, questoes_link, videoaulas, videoaulas_nova_guia, mapas_mentais";

const temItens = (v: unknown) => Array.isArray(v) && v.some((x) => typeof x === "string" && x.trim() !== "");

const lerFiltros = (v: unknown): Record<string, string[]> => {
  const r: Record<string, string[]> = {};
  if (!v || typeof v !== "object" || Array.isArray(v)) return r;
  Object.entries(v as Record<string, unknown>).forEach(([k, lista]) => {
    if (Array.isArray(lista)) {
      const ok = lista.filter((x): x is string => typeof x === "string" && x.trim() !== "");
      if (ok.length) r[k] = ok;
    }
  });
  return r;
};

export const paraTeoria = (t: Linha): TeoriaCurso => {
  const filtros = lerFiltros(t.questoes_filtros);
  return {
    id: String(t.id),
    slug: t.slug || String(t.id),
    titulo: t.titulo || "Teoria sem título",
    assunto: typeof t.assunto_id === "string" ? t.assunto_id.trim() : "",
    disciplinaQuestoes: typeof t.disciplina_id === "string" && t.disciplina_id.trim() ? t.disciplina_id.trim() : null,
    temVideo: temItens(t.videoaulas) || temItens(t.videoaulas_nova_guia),
    temQuestoes: Object.keys(filtros).length > 0 || (typeof t.questoes_link === "string" && t.questoes_link.trim() !== ""),
    temMapa: temItens(t.mapas_mentais),
    filtrosQuestoes: filtros,
  };
};

/** Teorias publicadas, na ordem dos ids pedidos. */
export async function buscarTeoriasPorIds(ids: string[]): Promise<Map<string, TeoriaCurso>> {
  const linhas = await buscarPorIds("teorias", ids, COLUNAS_TEORIA_LISTA);
  const mapa = new Map<string, TeoriaCurso>();
  linhas.forEach((l, id) => {
    // Rascunhos não aparecem para o aluno (e a RLS já os esconde de quem não é da equipe)
    if (l.status && l.status !== "published") return;
    mapa.set(id, paraTeoria(l));
  });
  return mapa;
}

export interface DadosDisciplinasCurso {
  /** ID real do curso (ou da disciplina avulsa) */
  realId: string;
  isCurso: boolean;
  /** Título do curso (ou da disciplina avulsa) */
  titulo: string;
  disciplinas: DisciplinaCurso[];
  linhasDisciplinas: Linha[];
}

async function montarDisciplinasCurso(courseId: string): Promise<DadosDisciplinasCurso> {
  const realId = extractIdFromFriendlyUrl(courseId);
  const { data: curso } = await supabase.from("cursos").select("*").eq("id", realId).maybeSingle();

  let linhasDisciplinas: Linha[] = [];
  let isCurso = true;
  let titulo = "";
  // Teorias escolhidas para o curso em cada disciplina (sem chave = todas)
  let selecao: TeoriasPorDisciplina = {};
  // Nota de cada disciplina neste curso. null = migration ainda não rodada (usa a nota antiga da disciplina)
  let relevancias: RelevanciaPorDisciplina | null = {};
  if (curso) {
    const ids: string[] = curso.disciplinas_ids || [];
    const mapa = await buscarPorIds("disciplinas", ids);
    linhasDisciplinas = ids.map((id) => mapa.get(id)).filter((d): d is Linha => !!d);
    selecao = lerTeoriasPorDisciplina((curso as Linha).teorias_por_disciplina);
    relevancias = "relevancia_por_disciplina" in curso ? lerRelevancias((curso as Linha).relevancia_por_disciplina) : null;
    titulo = (curso as Linha).titulo || "";
  } else {
    let { data: disciplina } = await supabase.from("disciplinas").select("*").eq("id", realId).maybeSingle();
    if (!disciplina) throw new Error("Conteúdo não encontrado");
    // Disciplina unificada em outra: mostra o conteúdo da principal no link antigo
    const principalId = (disciplina as Linha).unificada_em;
    if (principalId) {
      const { data: principal } = await supabase.from("disciplinas").select("*").eq("id", principalId).maybeSingle();
      if (principal) disciplina = { ...principal, id: disciplina.id };
    }
    linhasDisciplinas = [disciplina];
    isCurso = false;
    titulo = (disciplina as Linha).titulo || "";
  }
  const teoriasNoCurso = (d: Linha): string[] => teoriasDaDisciplinaNoCurso(d.teorias_ids, selecao, String(d.id));

  const teorias = await buscarTeoriasPorIds(linhasDisciplinas.flatMap(teoriasNoCurso));

  const montadas: DisciplinaCurso[] = linhasDisciplinas.map((d) => {
    return {
      id: String(d.id),
      titulo: d.titulo,
      relevancia: relevancias ? relevancias[String(d.id)] ?? null : notaValida(d.descricao),
      teorias: teoriasNoCurso(d)
        .map((id) => teorias.get(id))
        .filter((t): t is TeoriaCurso => !!t),
    };
  });

  // Disciplinas de maior relevância primeiro (estável para empates)
  montadas.sort((a, b) => (b.relevancia ?? 0) - (a.relevancia ?? 0));
  return { realId, isCurso, titulo, disciplinas: montadas, linhasDisciplinas };
}

/**
 * Várias partes da página do curso (aba Disciplinas, Flashcards, Estatísticas e a barra
 * da teoria) usam os mesmos dados. Guardamos a consulta por um minuto.
 */
const cache = new Map<string, { em: number; promessa: Promise<DadosDisciplinasCurso> }>();
const VALIDADE_MS = 60_000;

export function carregarDisciplinasCurso(courseId: string): Promise<DadosDisciplinasCurso> {
  const atual = cache.get(courseId);
  if (atual && Date.now() - atual.em < VALIDADE_MS) return atual.promessa;
  const promessa = montarDisciplinasCurso(courseId);
  cache.set(courseId, { em: Date.now(), promessa });
  promessa.catch(() => cache.delete(courseId));
  return promessa;
}

/**
 * Carrega as disciplinas do curso (ou a disciplina avulsa) com as teorias de cada uma,
 * na ordem definida no admin. As disciplinas seguem ordenadas pela relevância no curso (maior primeiro).
 */
export function useDisciplinasCurso(courseId: string | undefined, onCarregado?: (linhasDisciplinas: Linha[]) => void) {
  const [disciplinas, setDisciplinas] = useState<DisciplinaCurso[]>([]);
  const [isCurso, setIsCurso] = useState(true);
  const [realId, setRealId] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    if (!courseId) return;
    let cancelado = false;
    setCarregando(true);
    setErro(false);

    carregarDisciplinasCurso(courseId)
      .then((dados) => {
        if (cancelado) return;
        setIsCurso(dados.isCurso);
        setRealId(dados.realId);
        setDisciplinas(dados.disciplinas);
        onCarregado?.(dados.linhasDisciplinas);
      })
      .catch((e) => {
        console.error("Erro ao carregar disciplinas do curso:", e);
        if (!cancelado) {
          setErro(true);
          setDisciplinas([]);
        }
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
    // onCarregado é um callback estável do CourseLayout
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  return { disciplinas, isCurso, realId, carregando, erro };
}
