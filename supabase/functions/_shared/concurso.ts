// Extração dos dados de um concurso (datas, vagas, cargos...) a partir do
// texto de uma notícia. Usado pela Edge Function extract-concurso, que
// alimenta o botão "Preencher com IA" de /admin/concursos.

export interface ConcursoExtraido {
  titulo: string;
  dataInicioInscricao: string;
  dataFimInscricao: string;
  dataProva: string;
  prorrogado: boolean;
  niveis: string[];
  cargos: string[];
  vagas: number;
  salario: string;
  estados: string[];
}

export const NIVEIS = ["Ensino Fundamental", "Ensino Médio", "Ensino Superior"];
const UFS = [
  "AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA", "MG", "MS", "MT", "PA", "PB",
  "PE", "PI", "PR", "RJ", "RN", "RO", "RR", "RS", "SC", "SE", "SP", "TO",
];

// Limite para caber no plano gratuito do Groq (~12 mil tokens por minuto)
export const MAX_TEXTO = 14_000;

export const SYSTEM_PROMPT = `Você extrai dados estruturados de notícias e editais de concursos públicos
brasileiros. Use só o que está escrito no texto: nunca invente datas, números ou cargos.
Responda somente com um objeto JSON válido.`;

export function buildPrompt(titulo: string, texto: string, hoje: string): string {
  return `Data de hoje: ${hoje} (use para completar o ano de datas como "10 de dezembro").

Título da notícia: ${titulo}
Texto:
"""
${texto}
"""

Devolva exatamente este JSON:
{
  "titulo": "nome curto do concurso, pelo órgão, com maiúsculas corretas (ex.: \\"Prefeitura de Campinas (SP)\\", \\"TJ-SP\\", \\"INSS\\")",
  "dataInicioInscricao": "AAAA-MM-DD ou vazio",
  "dataFimInscricao": "AAAA-MM-DD ou vazio (se houve prorrogação, a data nova)",
  "dataProva": "AAAA-MM-DD da prova objetiva ou vazio",
  "prorrogado": true se o texto diz que as inscrições foram prorrogadas, senão false,
  "niveis": ["Ensino Fundamental" | "Ensino Médio" | "Ensino Superior"],
  "cargos": ["cada cargo uma vez, sem especialidades repetidas, no máximo 40"],
  "vagas": número total de vagas imediatas (some os cargos; 0 se for só cadastro reserva ou não informado),
  "salario": "maior remuneração inicial no formato \\"Até R$ 12.345,67\\", ou vazio",
  "estados": ["siglas das UFs onde há vagas; use [\\"Nacional\\"] se for para todo o país e [\\"Federal\\"] para órgão federal sem UF definida"]
}

Regras:
- Nível técnico conta como "Ensino Médio". Nível fundamental incompleto conta como "Ensino Fundamental".
- Não confunda a data de publicação da notícia com datas de inscrição ou prova.
- Se uma informação não aparece no texto, deixe vazio ([] ou "" ou 0).`;
}

/** Converte o HTML do post em texto simples, mantendo tabelas legíveis. */
export function htmlParaTexto(html: string): string {
  return (html || "")
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<\/(td|th)>/gi, " | ")
    .replace(/<\/(tr|p|li|h[1-6]|div|br)>|<br\s*\/?>/gi, "\n")
    .replace(/<li[^>]*>/gi, "- ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n")
    .trim();
}

const MESES: Record<string, number> = {
  janeiro: 1, fevereiro: 2, marco: 3, março: 3, abril: 4, maio: 5, junho: 6, julho: 7,
  agosto: 8, setembro: 9, outubro: 10, novembro: 11, dezembro: 12,
};

const pad = (n: number) => String(n).padStart(2, "0");

/** Aceita "2026-12-10", "10/12/2026", "10/12" e "10 de dezembro de 2026". */
export function normalizarData(v: unknown, anoPadrao: number): string {
  if (typeof v !== "string") return "";
  const s = v.trim().toLowerCase();
  if (!s) return "";
  let d: number | undefined, m: number | undefined, a: number | undefined;
  let r = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (r) [a, m, d] = [+r[1], +r[2], +r[3]];
  else if ((r = s.match(/^(\d{1,2})[/.-](\d{1,2})(?:[/.-](\d{2,4}))?$/))) {
    [d, m] = [+r[1], +r[2]];
    a = r[3] ? +r[3] : anoPadrao;
  } else if ((r = s.match(/^(\d{1,2})º?\s+de\s+([a-zç]+)(?:\s+de\s+(\d{4}))?/))) {
    d = +r[1];
    m = MESES[r[2]];
    a = r[3] ? +r[3] : anoPadrao;
  }
  if (!d || !m || !a) return "";
  if (a < 100) a += 2000;
  if (m < 1 || m > 12 || d < 1 || d > 31 || a < 2000 || a > 2100) return "";
  const data = new Date(Date.UTC(a, m - 1, d));
  if (data.getUTCMonth() !== m - 1) return "";
  return `${a}-${pad(m)}-${pad(d)}`;
}

const formatarReais = (n: number) =>
  n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Padroniza o salário como "Até R$ 12.345,67". */
export function normalizarSalario(v: unknown): string {
  if (typeof v === "number" && v > 0) return `Até R$ ${formatarReais(v)}`;
  if (typeof v !== "string") return "";
  const s = v.trim();
  if (!s) return "";
  const m = s.match(/(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d{1,2}))?/);
  if (!m) return s.slice(0, 60);
  const valor = parseFloat(`${m[1].replace(/\./g, "")}.${m[2] || "0"}`);
  if (!valor || valor < 100) return s.slice(0, 60);
  return `Até R$ ${formatarReais(valor)}`;
}

function normalizarNiveis(v: unknown): string[] {
  const lista = Array.isArray(v) ? v : typeof v === "string" ? v.split(/[,;/]/) : [];
  const out = new Set<string>();
  for (const item of lista) {
    const s = String(item).toLowerCase();
    if (/fundamental/.test(s)) out.add("Ensino Fundamental");
    else if (/m[ée]dio|t[ée]cnico/.test(s)) out.add("Ensino Médio");
    else if (/superior|gradua/.test(s)) out.add("Ensino Superior");
  }
  return NIVEIS.filter((n) => out.has(n));
}

function normalizarEstados(v: unknown): string[] {
  const lista = Array.isArray(v) ? v : typeof v === "string" ? v.split(/[,;/ ]+/) : [];
  const out: string[] = [];
  for (const item of lista) {
    const s = String(item).trim();
    const uf = s.toUpperCase();
    let valor = "";
    if (UFS.includes(uf)) valor = uf;
    else if (/^nacional$/i.test(s)) valor = "Nacional";
    else if (/^federal$/i.test(s)) valor = "Federal";
    if (valor && !out.includes(valor)) out.push(valor);
  }
  return out;
}

function normalizarCargos(v: unknown): string[] {
  const lista = Array.isArray(v) ? v : typeof v === "string" ? v.split(/[,;\n]/) : [];
  const vistos = new Set<string>();
  const out: string[] = [];
  for (const item of lista) {
    const nome = String(typeof item === "object" && item ? (item as { nome?: string }).nome ?? "" : item)
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 120);
    const chave = nome.toLowerCase();
    if (!nome || vistos.has(chave)) continue;
    vistos.add(chave);
    out.push(nome);
    if (out.length >= 60) break;
  }
  return out;
}

function normalizarVagas(v: unknown): number {
  const n = typeof v === "number" ? v : parseInt(String(v ?? "").replace(/\D/g, ""), 10);
  return Number.isFinite(n) && n > 0 && n < 1_000_000 ? Math.round(n) : 0;
}

export function normalizarConcurso(raw: Record<string, unknown>, hoje = new Date()): ConcursoExtraido {
  const ano = hoje.getFullYear();
  const inicio = normalizarData(raw.dataInicioInscricao, ano);
  // "10/11 a 05/01" ou prova em fevereiro: a data cai no ano seguinte
  const depoisDe = (data: string, referencia: string) => {
    if (!data || !referencia || data >= referencia) return data;
    let candidata = `${referencia.slice(0, 4)}${data.slice(4)}`;
    if (candidata < referencia) candidata = `${+referencia.slice(0, 4) + 1}${data.slice(4)}`;
    return candidata;
  };
  const fim = depoisDe(normalizarData(raw.dataFimInscricao, ano), inicio);
  const prova = depoisDe(normalizarData(raw.dataProva, ano), fim || inicio);
  return {
    titulo: typeof raw.titulo === "string" ? raw.titulo.replace(/\s+/g, " ").trim().slice(0, 160) : "",
    dataInicioInscricao: inicio,
    dataFimInscricao: fim,
    dataProva: prova,
    prorrogado: raw.prorrogado === true || raw.prorrogado === "true",
    niveis: normalizarNiveis(raw.niveis),
    cargos: normalizarCargos(raw.cargos),
    vagas: normalizarVagas(raw.vagas),
    salario: normalizarSalario(raw.salario),
    estados: normalizarEstados(raw.estados),
  };
}
