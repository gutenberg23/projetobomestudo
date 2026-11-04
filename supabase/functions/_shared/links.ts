// Regras de links das notícias reescritas.
//
// O post não deve apontar para o site de onde a notícia foi tirada nem para
// outros portais de notícias ou cursinhos. Ficam só os links úteis ao
// candidato: edital, página de inscrição, site do órgão ou da banca.

// Portais de notícias de concursos e cursinhos (concorrentes). Subdomínios
// também contam, então "blog.exemplo.com.br" casa com "exemplo.com.br".
const NEWS_HOSTS = [
  "pciconcursos.com.br",
  "folhadirigida.com.br",
  "folha.qconcursos.com",
  "qconcursos.com",
  "estrategiaconcursos.com.br",
  "estrategia.com",
  "grancursosonline.com.br",
  "gran.com.br",
  "direcaoconcursos.com.br",
  "concursosnobrasil.com",
  "concursosnobrasil.com.br",
  "jcconcursos.com.br",
  "jcconcursos.uol.com.br",
  "noticiasconcursos.com.br",
  "concursospublicos.blog.br",
  "concursosnoticias.com.br",
  "acheconcursos.com.br",
  "concursosabertos.com.br",
  "novaconcursos.com.br",
  "apostilasopcao.com.br",
  "alfaconcursos.com.br",
  "focusconcursos.com.br",
  "casadoconcurseiro.com.br",
  "aprovaconcursos.com.br",
  "tecconcursos.com.br",
  "concursoseempregos.com.br",
  "g1.globo.com",
  "uol.com.br",
  "correiobraziliense.com.br",
  "metropoles.com",
  "news.google.com",
  "feedproxy.google.com",
  "feedburner.com",
];

export function hostOf(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "";
  }
}

const matchesHost = (host: string, base: string) => host === base || host.endsWith(`.${base}`);

/**
 * true quando o link não deve ir para o post: aponta para o site de origem
 * (ou outro subdomínio dele) ou para um portal de notícias/cursinho.
 */
export function isBlockedLink(href: string, sourceUrl?: string): boolean {
  const host = hostOf(href);
  if (!host) return true;
  const source = sourceUrl ? hostOf(sourceUrl) : "";
  if (source) {
    if (matchesHost(host, source)) return true;
    // "noticias.portal.com.br" e "portal.com.br" são o mesmo site. Não vale
    // para domínios públicos (gov.br, jus.br...), em que o "raiz" é de todos.
    const publico = /\.(gov|leg|jus|mp|def|mil|edu)\.br$/.test(source);
    const sourceRoot = source.split(".").slice(-3).join(".");
    if (!publico && sourceRoot.split(".").length === 3 && /\.(com|net|org)\.br$/.test(sourceRoot) && matchesHost(host, sourceRoot)) {
      return true;
    }
  }
  return NEWS_HOSTS.some((h) => matchesHost(host, h));
}
