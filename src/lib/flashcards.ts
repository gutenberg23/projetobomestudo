import { supabase } from "@/integrations/supabase/client";

/*
 * Flashcards: tipos, leitura de CSV (formato do Anki) e acesso ao banco.
 * As tabelas não estão nos tipos gerados do Supabase, por isso o cast.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const db = supabase as any;

export interface Flashcard {
  id: string;
  /** Teoria dona do cartão (cartões antigos sem teoria ficam com "") */
  teoriaId: string;
  frente: string;
  verso: string;
  tags: string[];
  /** Vazio = aparece em todos os cursos que usam o tópico */
  cursosIds: string[];
  ordem: number;
  createdAt?: string;
}

/** Cartão sendo editado (ainda pode não ter id). */
export interface FlashcardRascunho {
  id?: string;
  frente: string;
  verso: string;
  tags?: string[];
  cursosIds?: string[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const linhaParaFlashcard = (r: any): Flashcard => ({
  id: r.id,
  teoriaId: r.teoria_id ? String(r.teoria_id) : "",
  frente: r.frente || "",
  verso: r.verso || "",
  tags: r.tags || [],
  cursosIds: r.cursos_ids || [],
  ordem: r.ordem ?? 0,
  createdAt: r.created_at,
});

/** Erro de "tabela não existe" (migration ainda não aplicada). */
export const faltaMigration = (error: unknown) => {
  const e = error as { code?: string; message?: string } | null;
  if (!e) return false;
  return (
    e.code === "42P01" ||
    e.code === "PGRST205" ||
    (/flashcards/i.test(e.message || "") && /exist|schema cache|find/i.test(e.message || ""))
  );
};

export const AVISO_MIGRATION = "Falta rodar as migrations de flashcards (20251112000000 e 20251120000000) no SQL Editor do Supabase.";

/** O cartão aparece no curso? (vazio = todos os cursos com o tópico) */
export const disponivelNoCurso = (f: Pick<Flashcard, "cursosIds">, cursoId: string | null) =>
  f.cursosIds.length === 0 || (!!cursoId && f.cursosIds.includes(cursoId));

const LOTE = 150;

/** Busca os flashcards de várias teorias, na ordem definida. */
export async function buscarFlashcardsDasTeorias(teoriasIds: string[]): Promise<Flashcard[]> {
  const ids = Array.from(new Set(teoriasIds.filter(Boolean)));
  const todos: Flashcard[] = [];
  for (let i = 0; i < ids.length; i += LOTE) {
    const { data, error } = await db
      .from("flashcards")
      .select("*")
      .in("teoria_id", ids.slice(i, i + LOTE))
      .order("ordem", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw error;
    todos.push(...(data || []).map(linhaParaFlashcard));
  }
  return todos;
}

/**
 * Salva a lista de flashcards de um tópico (campo do formulário de tópicos):
 * apaga os que saíram, atualiza os existentes e cria os novos, na ordem da lista.
 * Os cursos de cada cartão não mudam aqui (são definidos em /admin/flashcards).
 */
export async function salvarFlashcardsDoTopico(topicoId: string, cartoes: FlashcardRascunho[]) {
  const validos = cartoes
    .map((c) => ({ ...c, frente: c.frente.trim(), verso: c.verso.trim() }))
    .filter((c) => c.frente && c.verso);

  const { data: atuais, error: erroLeitura } = await db.from("flashcards").select("id").eq("topico_id", topicoId);
  if (erroLeitura) throw erroLeitura;

  const manter = new Set(validos.filter((c) => c.id).map((c) => c.id as string));
  const remover = ((atuais || []) as { id: string }[]).map((r) => r.id).filter((id) => !manter.has(id));
  if (remover.length) {
    const { error } = await db.from("flashcards").delete().in("id", remover);
    if (error) throw error;
  }

  for (let i = 0; i < validos.length; i++) {
    const c = validos[i];
    const base = { frente: c.frente, verso: c.verso, tags: c.tags || [], ordem: i };
    if (c.id) {
      const { error } = await db.from("flashcards").update(base).eq("id", c.id);
      if (error) throw error;
    }
  }
  const novos = validos
    .map((c, i) => ({ c, i }))
    .filter(({ c }) => !c.id)
    .map(({ c, i }) => ({ topico_id: topicoId, frente: c.frente, verso: c.verso, tags: c.tags || [], cursos_ids: c.cursosIds || [], ordem: i }));
  if (novos.length) {
    const { error } = await db.from("flashcards").insert(novos);
    if (error) throw error;
  }
  return validos.length;
}

/* ------------------------------------------------------------------ */
/* CSV (compatível com a exportação "Notas em texto simples" do Anki)  */
/* ------------------------------------------------------------------ */

export interface LinhaImportada {
  linha: number;
  frente: string;
  verso: string;
  tags: string[];
  /** Coluna opcional "teoria" (ID, slug ou título exato da teoria) */
  topico?: string;
  erro?: string;
}

export interface ResultadoCsv {
  linhas: LinhaImportada[];
  separador: string;
  temCabecalho: boolean;
}

const NOMES_SEPARADOR: Record<string, string> = {
  tab: "\t",
  comma: ",",
  semicolon: ";",
  pipe: "|",
  space: " ",
  colon: ":",
};

const semAcento = (t: string) =>
  (t || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();

/** Divide o texto em linhas e colunas respeitando aspas ("campo, com vírgula" e "" como aspas). */
export function dividirCsv(texto: string, sep: string): string[][] {
  const linhas: string[][] = [];
  let campo = "";
  let linha: string[] = [];
  let aspas = false;
  for (let i = 0; i < texto.length; i++) {
    const ch = texto[i];
    if (aspas) {
      if (ch === '"') {
        if (texto[i + 1] === '"') {
          campo += '"';
          i++;
        } else aspas = false;
      } else campo += ch;
      continue;
    }
    if (ch === '"' && campo === "") {
      aspas = true;
    } else if (ch === sep) {
      linha.push(campo);
      campo = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && texto[i + 1] === "\n") i++;
      linha.push(campo);
      linhas.push(linha);
      linha = [];
      campo = "";
    } else campo += ch;
  }
  if (campo !== "" || linha.length) {
    linha.push(campo);
    linhas.push(linha);
  }
  return linhas;
}

/** Escolhe o separador mais provável olhando as primeiras linhas (tab > ; > ,). */
const detectarSeparador = (amostra: string) => {
  const linhas = amostra.split(/\r?\n/).filter((l) => l.trim()).slice(0, 10);
  const contar = (s: string) => linhas.reduce((n, l) => n + (l.split(s).length - 1), 0);
  if (contar("\t") > 0) return "\t";
  const pv = contar(";");
  const v = contar(",");
  if (pv > 0 && pv >= linhas.length) return ";";
  if (v > 0) return ",";
  return pv > 0 ? ";" : "\t";
};

const COLUNAS = {
  frente: ["frente", "front", "pergunta", "question", "frente do cartao", "anverso", "texto"],
  verso: ["verso", "back", "resposta", "answer", "tras", "extra"],
  tags: ["tags", "tag", "etiquetas", "marcadores"],
  topico: ["teoria", "teoria_id", "id da teoria", "topico", "topico_id", "topic"],
};

/** Tira marcações do Anki que não fazem sentido no site ([sound:...]). */
const limparCampo = (t: string) => t.replace(/\[sound:[^\]]*\]/g, "").trim();

/**
 * Lê um CSV/TSV de flashcards.
 * Aceita: cabeçalhos do Anki (#separator:tab, #html:true, #tags column:3),
 * linha de títulos opcional (frente, verso, tags, teoria) e colunas sem título
 * na ordem frente, verso, tags.
 */
export function lerCsvFlashcards(textoBruto: string): ResultadoCsv {
  let texto = textoBruto.replace(/^\uFEFF/, "");
  let sep: string | null = null;
  let colTags: number | null = null;

  // Cabeçalhos do Anki no começo do arquivo
  const linhasBrutas = texto.split(/\r?\n/);
  let pular = 0;
  for (const l of linhasBrutas) {
    if (!l.startsWith("#")) break;
    pular++;
    const m = l.match(/^#([a-z ]+):(.*)$/i);
    if (!m) continue;
    const chave = m[1].trim().toLowerCase();
    const valor = m[2].trim();
    if (chave === "separator") sep = NOMES_SEPARADOR[valor.toLowerCase()] ?? (valor.length === 1 ? valor : null);
    if (chave === "tags column") colTags = Math.max(0, parseInt(valor, 10) - 1);
  }
  if (pular) texto = linhasBrutas.slice(pular).join("\n");
  const separador = sep ?? detectarSeparador(texto);

  const tabela = dividirCsv(texto, separador).filter((cols) => cols.some((c) => c.trim() !== ""));
  if (tabela.length === 0) return { linhas: [], separador, temCabecalho: false };

  // Linha de títulos?
  const primeira = tabela[0].map(semAcento);
  const achar = (nomes: string[]) => primeira.findIndex((c) => nomes.includes(c));
  const temCabecalho = achar(COLUNAS.frente) >= 0 && achar(COLUNAS.verso) >= 0;
  const idx = temCabecalho
    ? { frente: achar(COLUNAS.frente), verso: achar(COLUNAS.verso), tags: achar(COLUNAS.tags), topico: achar(COLUNAS.topico) }
    : { frente: 0, verso: 1, tags: colTags ?? 2, topico: -1 };
  if (temCabecalho && colTags !== null && idx.tags < 0) idx.tags = colTags;

  const corpo = temCabecalho ? tabela.slice(1) : tabela;
  const linhas: LinhaImportada[] = corpo.map((cols, i) => {
    const frente = limparCampo(cols[idx.frente] ?? "");
    const verso = limparCampo(cols[idx.verso] ?? "");
    const tagsTexto = idx.tags >= 0 ? cols[idx.tags] ?? "" : "";
    const tags = Array.from(new Set(tagsTexto.split(/[\s,]+/).map((t) => t.trim()).filter(Boolean)));
    const topico = idx.topico >= 0 ? (cols[idx.topico] ?? "").trim() || undefined : undefined;
    const erro = !frente ? "Frente vazia" : !verso ? "Verso vazio" : undefined;
    return { linha: i + 1 + (temCabecalho ? 1 : 0) + pular, frente, verso, tags, topico, erro };
  });

  return { linhas, separador, temCabecalho };
}

const aspasCsv = (t: string) => (/[",\n\r;]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t);

/** Gera um CSV (vírgula) que pode ser importado aqui de novo ou no Anki. */
export function gerarCsvFlashcards(cartoes: { frente: string; verso: string; tags: string[]; teoriaId?: string }[]) {
  const linhas = [["frente", "verso", "tags", "teoria"].join(",")];
  cartoes.forEach((c) => linhas.push([c.frente, c.verso, c.tags.join(" "), c.teoriaId || ""].map(aspasCsv).join(",")));
  return "\uFEFF" + linhas.join("\r\n");
}

/** Texto tem marcação HTML (cartões vindos do Anki)? */
export const temHtml = (t: string) => /<\/?[a-z][\s\S]*?>/i.test(t);

/** Versão em texto puro (para listas e buscas). */
export const textoSimples = (t: string) =>
  temHtml(t)
    ? t
        .replace(/<br\s*\/?>/gi, " ")
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/\s+/g, " ")
        .trim()
    : t;
