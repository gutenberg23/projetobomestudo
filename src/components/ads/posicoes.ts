/**
 * Catálogo dos espaços de anúncio que existem de fato no site.
 * O admin usa esta lista para escolher a posição; os componentes do site usam
 * os mesmos códigos em <AdBanner position="..."> e <AdBannerList position="...">.
 */

export interface PosicaoAnuncio {
  codigo: string;
  /** Grupo (página) onde o espaço fica */
  pagina: string;
  /** Nome curto do espaço dentro da página */
  local: string;
  /** Rota para abrir e conferir no site */
  rota: string;
  /** Espaço que se repete numa lista (vários anúncios se revezam) */
  repete?: string;
  /** Tamanho sugerido da imagem */
  tamanho: string;
  /** Códigos antigos que agora caem neste espaço */
  aliases?: string[];
}

const LARGO = "1200 × 150 px (ou 728 × 90)";

export const POSICOES_ANUNCIO: PosicaoAnuncio[] = [
  { codigo: "dashboard_top", pagina: "Painel do aluno", local: "Topo, acima dos números", rota: "/dashboard", tamanho: LARGO },
  { codigo: "dashboard_middle", pagina: "Painel do aluno", local: "Meio da página", rota: "/dashboard", tamanho: LARGO },
  {
    codigo: "my_courses_concursos_top",
    pagina: "Meus cursos",
    local: "Acima da lista, aba Cursos",
    rota: "/my-courses",
    tamanho: LARGO,
    aliases: ["my_courses_top"],
  },
  {
    codigo: "my_courses_disciplinas_top",
    pagina: "Meus cursos",
    local: "Acima da lista, aba Disciplinas",
    rota: "/my-courses",
    tamanho: LARGO,
    aliases: ["my_courses_top"],
  },
  { codigo: "course_navigation", pagina: "Curso", local: "Abaixo das abas do curso", rota: "/explore", tamanho: LARGO },
  { codigo: "explore_top", pagina: "Explorar", local: "Topo, acima dos cards", rota: "/explore", tamanho: LARGO },
  { codigo: "questions_filters", pagina: "Questões", local: "Abaixo dos filtros", rota: "/questions", tamanho: LARGO },
  {
    codigo: "questions_list",
    pagina: "Questões",
    local: "Entre as questões",
    repete: "a cada 5 questões",
    rota: "/questions",
    tamanho: LARGO,
  },
  {
    codigo: "question_books_top",
    pagina: "Cadernos",
    local: "Topo, acima dos cadernos",
    rota: "/cadernos",
    tamanho: LARGO,
    aliases: ["cadernos_top"],
  },
  {
    codigo: "concursos_list",
    pagina: "Concursos",
    local: "Entre os concursos",
    repete: "a cada 8 concursos",
    rota: "/concursos",
    tamanho: LARGO,
  },
  { codigo: "blog_top_concursos", pagina: "Blog", local: "Topo da página inicial do blog", rota: "/blog", tamanho: LARGO },
  {
    codigo: "blog_posts_list",
    pagina: "Blog",
    local: "Entre as notícias",
    repete: "a cada 3 notícias",
    rota: "/blog",
    tamanho: LARGO,
  },
  { codigo: "blog_post_top", pagina: "Notícia", local: "Topo da notícia", rota: "/blog", tamanho: LARGO },
  {
    codigo: "blog_post_bottom",
    pagina: "Notícia",
    local: "Fim da notícia",
    rota: "/blog",
    tamanho: LARGO,
    aliases: ["blog_post_author"],
  },
  { codigo: "ranking_questoes_top", pagina: "Ranking de questões", local: "Topo", rota: "/ranking-questoes", tamanho: LARGO },
  {
    codigo: "ranking_questoes_list",
    pagina: "Ranking de questões",
    local: "Entre as posições",
    repete: "a cada 10 posições",
    rota: "/ranking-questoes",
    tamanho: LARGO,
  },
  { codigo: "ranking_comentarios_top", pagina: "Ranking de comentários", local: "Topo", rota: "/ranking-comentarios", tamanho: LARGO },
  {
    codigo: "ranking_comentarios_list",
    pagina: "Ranking de comentários",
    local: "Entre as posições",
    repete: "a cada 10 posições",
    rota: "/ranking-comentarios",
    tamanho: LARGO,
  },
];

const PorCodigo = new Map(POSICOES_ANUNCIO.map((p) => [p.codigo, p]));

/** Códigos antigos (de versões anteriores do admin) e para onde foram. */
const ANTIGOS: Record<string, string> = {
  cadernos_top: "question_books_top",
  my_courses_top: "my_courses_concursos_top",
  blog_post_author: "blog_post_bottom",
};

export const posicaoDoCodigo = (codigo: string): PosicaoAnuncio | undefined => PorCodigo.get(codigo) || PorCodigo.get(ANTIGOS[codigo]);

/** Todos os códigos que devem aparecer num espaço (o próprio e os antigos equivalentes). */
export const codigosDoEspaco = (codigo: string): string[] => {
  const p = PorCodigo.get(codigo);
  return p?.aliases?.length ? [codigo, ...p.aliases] : [codigo];
};

export const rotuloPosicao = (codigo: string) => {
  const p = posicaoDoCodigo(codigo);
  return p ? `${p.pagina} · ${p.local}` : codigo;
};

/** Páginas agrupadas, na ordem do catálogo. */
export const paginasDeAnuncio = () => Array.from(new Set(POSICOES_ANUNCIO.map((p) => p.pagina)));
