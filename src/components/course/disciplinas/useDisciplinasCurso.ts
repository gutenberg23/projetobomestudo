import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { extractIdFromFriendlyUrl } from "@/utils/slug-utils";

/** Um tópico (vídeo + materiais) de uma aula. */
export interface TopicoCurso {
  id: string;
  nome: string;
  videoUrl: string | null;
  abrirEmNovaGuia: boolean;
  professorNome: string | null;
  pdfUrl: string | null;
  teoriaId: string | null;
  mapaUrl: string | null;
  resumoUrl: string | null;
  musicaUrl: string[];
  resumoAudioUrl: string[];
  cadernoQuestoesUrl: string | null;
  temQuestoes: boolean;
}

export interface AulaCurso {
  id: string;
  titulo: string;
  /** Trecho do edital coberto pela aula */
  descricao: string;
  topicos: TopicoCurso[];
}

export interface DisciplinaCurso {
  id: string;
  titulo: string;
  /** Rating de 1 a 10 dado no admin (quanto a disciplina pesa na prova) */
  relevancia: number | null;
  aulas: AulaCurso[];
}

const LOTE = 150;

/** Linha crua do banco (as tabelas de conteúdo não estão todas nos tipos gerados). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Linha = Record<string, any>;

/** Busca linhas por id em lotes (evita URL longa demais) e devolve um mapa por id. */
async function buscarPorIds(tabela: string, ids: string[], colunas = "*") {
  const mapa = new Map<string, Linha>();
  const unicos = Array.from(new Set(ids.filter(Boolean)));
  for (let i = 0; i < unicos.length; i += LOTE) {
    const parte = unicos.slice(i, i + LOTE);
    // Algumas tabelas (topicos) não estão nos tipos gerados do Supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).from(tabela).select(colunas).in("id", parte);
    if (error) throw error;
    ((data || []) as Linha[]).forEach((linha) => mapa.set(linha.id, linha));
  }
  return mapa;
}

const listaDeUrls = (v: unknown): string[] =>
  typeof v === "string" && v.trim() ? v.split(",").map((s) => s.trim()).filter(Boolean) : [];

const temItens = (v: unknown) =>
  Array.isArray(v) ? v.length > 0 : typeof v === "string" ? v.trim() !== "" && v !== "{}" : !!v && typeof v === "object" && Object.keys(v as object).length > 0;

const paraTopico = (t: Linha): TopicoCurso => ({
  id: t.id,
  nome: t.nome || "Tópico sem título",
  videoUrl: t.video_url || null,
  abrirEmNovaGuia: t.abrir_em_nova_guia === true,
  professorNome: t.professor_nome || null,
  pdfUrl: t.pdf_url || null,
  teoriaId: t.teoria_id || null,
  mapaUrl: t.mapa_url || null,
  resumoUrl: t.resumo_url || null,
  musicaUrl: listaDeUrls(t.musica_url),
  resumoAudioUrl: listaDeUrls(t.resumo_audio_url),
  cadernoQuestoesUrl: t.caderno_questoes_url || null,
  temQuestoes: temItens(t.questoes_ids),
});

export interface DadosDisciplinasCurso {
  /** ID real do curso (ou da disciplina avulsa) */
  realId: string;
  isCurso: boolean;
  disciplinas: DisciplinaCurso[];
  linhasDisciplinas: Linha[];
}

async function montarDisciplinasCurso(courseId: string): Promise<DadosDisciplinasCurso> {
  const realId = extractIdFromFriendlyUrl(courseId);
  const { data: curso } = await supabase.from("cursos").select("id, disciplinas_ids").eq("id", realId).maybeSingle();

  let linhasDisciplinas: Linha[] = [];
  let isCurso = true;
  if (curso) {
    const ids: string[] = curso.disciplinas_ids || [];
    const mapa = await buscarPorIds("disciplinas", ids);
    linhasDisciplinas = ids.map((id) => mapa.get(id)).filter((d): d is Linha => !!d);
  } else {
    const { data: disciplina } = await supabase.from("disciplinas").select("*").eq("id", realId).maybeSingle();
    if (!disciplina) throw new Error("Conteúdo não encontrado");
    linhasDisciplinas = [disciplina];
    isCurso = false;
  }

  const aulas = await buscarPorIds(
    "aulas",
    linhasDisciplinas.flatMap((d) => d.aulas_ids || [])
  );
  const topicos = await buscarPorIds(
    "topicos",
    Array.from(aulas.values()).flatMap((a) => a.topicos_ids || [])
  );

  const montadas: DisciplinaCurso[] = linhasDisciplinas.map((d) => {
    const rating = parseInt(d.descricao, 10);
    return {
      id: d.id,
      titulo: d.titulo,
      relevancia: Number.isNaN(rating) ? null : rating,
      aulas: (d.aulas_ids || [])
        .map((id: string) => aulas.get(id))
        .filter((a): a is Linha => !!a)
        .map((a) => ({
          id: a.id,
          titulo: a.titulo,
          descricao: a.descricao || "",
          topicos: (a.topicos_ids || [])
            .map((id: string) => topicos.get(id))
            .filter((t): t is Linha => !!t)
            .map(paraTopico),
        })),
    };
  });

  // Mesma ordem de antes: disciplinas de maior rating primeiro (estável para empates)
  montadas.sort((a, b) => (b.relevancia ?? 0) - (a.relevancia ?? 0));
  return { realId, isCurso, disciplinas: montadas, linhasDisciplinas };
}

/**
 * A aba Disciplinas e a aba Flashcards usam os mesmos dados. Guardamos a
 * consulta por um minuto para as duas não buscarem tudo duas vezes.
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
 * Carrega as disciplinas do curso (ou a disciplina avulsa) com aulas e tópicos.
 * Faz poucas consultas (uma por tabela) e respeita a ordem definida no admin:
 * aulas na ordem de aulas_ids e tópicos na ordem de topicos_ids. As disciplinas
 * seguem ordenadas pelo rating (maior primeiro), como antes.
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
