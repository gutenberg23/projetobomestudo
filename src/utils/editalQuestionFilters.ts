/**
 * Filtros de questões usados pelos tópicos do edital verticalizado.
 *
 * O link de cada tópico (ex.: /questions?disciplines=[...]&topics=[...]) é a
 * fonte da verdade: as estatísticas do edital devem contar exatamente as
 * questões que o aluno vê ao clicar nesse link. As colunas de filtro da
 * tabela disciplinaverticalizada (disciplinas_filtro, assuntos, topicos_filtro,
 * bancas_filtro) só são usadas quando o tópico não tem um link de questões.
 */

export interface QuestionFilterSet {
  q: string;
  disciplines: string[];
  topics: string[]; // coluna questoes.assuntos
  subtopics: string[]; // coluna questoes.topicos
  institutions: string[]; // coluna questoes.institution (banca)
  organizations: string[];
  roles: string[];
  years: string[];
  educationLevels: string[];
  difficulty: string[];
}

export interface QuestionMeta {
  discipline?: string | null;
  institution?: string | null;
  organization?: string | null;
  role?: string[] | string | null;
  year?: string | number | null;
  level?: string | null;
  difficulty?: string | null;
  assuntos?: string[] | null;
  topicos?: string[] | null;
  content?: string | null;
}

const LIST_KEYS = [
  'disciplines',
  'topics',
  'subtopics',
  'institutions',
  'organizations',
  'roles',
  'years',
  'educationLevels',
  'difficulty',
] as const;

type ListKey = (typeof LIST_KEYS)[number];

export const emptyFilterSet = (): QuestionFilterSet => ({
  q: '',
  disciplines: [],
  topics: [],
  subtopics: [],
  institutions: [],
  organizations: [],
  roles: [],
  years: [],
  educationLevels: [],
  difficulty: [],
});

const cleanList = (values: unknown[]): string[] =>
  values
    .map(v => (v === null || v === undefined ? '' : String(v).trim()))
    .filter(v => v.length > 0);

/**
 * Converte o valor de uma coluna de filtro em lista.
 * Aceita array, string separada por "|" (formato gravado pelo admin)
 * ou string JSON.
 */
export const splitFilterValue = (raw: unknown): string[] => {
  if (raw === null || raw === undefined) return [];
  if (Array.isArray(raw)) {
    return cleanList(raw.flatMap(item => (typeof item === 'string' ? item.split('|') : [item])));
  }
  const text = String(raw).trim();
  if (!text) return [];
  if (text.startsWith('[')) {
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) return cleanList(parsed);
    } catch {
      // segue para o split
    }
  }
  return cleanList(text.split('|'));
};

/**
 * Detecta valores de filtro corrompidos por um bug antigo do admin, em que
 * "Coesão" virava "C|o|e|s|ã|o" ao editar a disciplina.
 */
export const looksCorrupted = (values: string[]): boolean =>
  values.length > 2 && values.every(v => v.length <= 1);

/** Lê um parâmetro do link do mesmo jeito que a página /questions. */
const readListParam = (params: URLSearchParams, key: string): string[] => {
  const value = params.get(key);
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return cleanList(parsed);
    return cleanList([parsed]);
  } catch {
    return cleanList(value.split(','));
  }
};

/**
 * Extrai os filtros de um link de questões. Retorna null quando o link
 * não aponta para a página /questions.
 */
export const parseQuestionsLink = (link: string | null | undefined): QuestionFilterSet | null => {
  if (!link || typeof link !== 'string') return null;
  const trimmed = link.trim();
  if (!trimmed) return null;

  let url: URL;
  try {
    url = new URL(trimmed, 'https://bomestudo.local');
  } catch {
    return null;
  }

  if (!url.pathname.replace(/\/+$/, '').endsWith('/questions')) return null;

  const filters = emptyFilterSet();
  filters.q = (url.searchParams.get('q') || '').trim();
  LIST_KEYS.forEach(key => {
    filters[key] = readListParam(url.searchParams, key);
  });
  return filters;
};

/** Monta os filtros a partir das colunas de filtro da disciplina. */
export const filtersFromColumns = (
  disciplina: {
    disciplinas_filtro?: unknown[] | null;
    assuntos?: unknown[] | null;
    topicos_filtro?: unknown[] | null;
    bancas_filtro?: unknown[] | null;
  },
  index: number
): QuestionFilterSet => {
  const filters = emptyFilterSet();
  const pick = (column?: unknown[] | null) => {
    const values = splitFilterValue(column?.[index]);
    return looksCorrupted(values) ? [] : values;
  };
  filters.disciplines = pick(disciplina.disciplinas_filtro);
  filters.topics = pick(disciplina.assuntos);
  filters.subtopics = pick(disciplina.topicos_filtro);
  filters.institutions = pick(disciplina.bancas_filtro);
  return filters;
};

export const hasAnyFilter = (filters: QuestionFilterSet): boolean =>
  !!filters.q || LIST_KEYS.some(key => filters[key].length > 0);

/** Filtros efetivos de um tópico: o link primeiro, as colunas depois. */
export const resolveTopicFilters = (
  link: string | null | undefined,
  disciplina: Parameters<typeof filtersFromColumns>[0],
  index: number
): QuestionFilterSet => {
  const fromLink = parseQuestionsLink(link);
  if (fromLink && hasAnyFilter(fromLink)) return fromLink;
  return filtersFromColumns(disciplina, index);
};

const norm = (value: unknown): string =>
  String(value ?? '')
    .normalize('NFC')
    .trim()
    .toLowerCase();

const toList = (value: unknown): string[] => {
  if (value === null || value === undefined) return [];
  if (Array.isArray(value)) return value.map(norm).filter(Boolean);
  const single = norm(value);
  return single ? [single] : [];
};

const matchesAny = (wanted: string[], actual: unknown): boolean => {
  if (wanted.length === 0) return true;
  const actualValues = new Set(toList(actual));
  if (actualValues.size === 0) return false;
  return wanted.some(w => actualValues.has(norm(w)));
};

/**
 * Diz se uma questão aparece na página /questions com estes filtros.
 * Mesma regra da página: filtros diferentes se combinam com E, e os
 * valores de um mesmo filtro se combinam com OU.
 */
export const questionMatchesFilters = (filters: QuestionFilterSet, meta: QuestionMeta): boolean => {
  const checks: Array<[ListKey, unknown]> = [
    ['disciplines', meta.discipline],
    ['institutions', meta.institution],
    ['organizations', meta.organization],
    ['roles', meta.role],
    ['years', meta.year],
    ['educationLevels', meta.level],
    ['difficulty', meta.difficulty],
    ['topics', meta.assuntos],
    ['subtopics', meta.topicos],
  ];

  for (const [key, actual] of checks) {
    if (!matchesAny(filters[key], actual)) return false;
  }

  if (filters.q) {
    if (!norm(meta.content).includes(norm(filters.q))) return false;
  }

  return true;
};
