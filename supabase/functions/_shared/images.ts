// Sugestão de imagem destaque com foto da cidade do concurso.
//
// Fontes gratuitas, nesta ordem:
//   1. Wikipédia em português: foto principal do artigo do município.
//   2. Wikimedia Commons: busca por fotos da cidade.
//   3. Unsplash, só se o secret UNSPLASH_ACCESS_KEY estiver configurado
//      (a chave é gratuita em unsplash.com/developers).
//
// As fotos do Wikimedia exigem crédito ao autor; o crédito vai junto no
// resultado para ser colocado no fim do post.

declare const Deno: { env: { get(key: string): string | undefined } };

export interface ImageSuggestion {
  url: string;
  pageUrl: string;
  author: string;
  license: string;
  source: "Wikimedia Commons" | "Unsplash";
}

const UA = "BomEstudoBot/1.0 (+https://bomestudo.com.br; imagens de notícias de concursos)";
const TIMEOUT_MS = 8_000;

// Bandeiras, brasões, mapas e logotipos não servem como foto da cidade
const NOT_A_PHOTO = /(bandeira|bras[aã]o|flag|coat[ _]of[ _]arms|mapa|map[ _]|locator|localiza|logo|selo|escudo|hino|assinatura|signature|\.svg$|\.png$|\.gif$|\.tiff?$)/i;

const UF_INFO: Record<string, { nome: string; capital: string }> = {
  AC: { nome: "Acre", capital: "Rio Branco" },
  AL: { nome: "Alagoas", capital: "Maceió" },
  AP: { nome: "Amapá", capital: "Macapá" },
  AM: { nome: "Amazonas", capital: "Manaus" },
  BA: { nome: "Bahia", capital: "Salvador" },
  CE: { nome: "Ceará", capital: "Fortaleza" },
  DF: { nome: "Distrito Federal", capital: "Brasília" },
  ES: { nome: "Espírito Santo", capital: "Vitória" },
  GO: { nome: "Goiás", capital: "Goiânia" },
  MA: { nome: "Maranhão", capital: "São Luís" },
  MT: { nome: "Mato Grosso", capital: "Cuiabá" },
  MS: { nome: "Mato Grosso do Sul", capital: "Campo Grande" },
  MG: { nome: "Minas Gerais", capital: "Belo Horizonte" },
  PA: { nome: "Pará", capital: "Belém" },
  PB: { nome: "Paraíba", capital: "João Pessoa" },
  PR: { nome: "Paraná", capital: "Curitiba" },
  PE: { nome: "Pernambuco", capital: "Recife" },
  PI: { nome: "Piauí", capital: "Teresina" },
  RJ: { nome: "Rio de Janeiro", capital: "Rio de Janeiro" },
  RN: { nome: "Rio Grande do Norte", capital: "Natal" },
  RS: { nome: "Rio Grande do Sul", capital: "Porto Alegre" },
  RO: { nome: "Rondônia", capital: "Porto Velho" },
  RR: { nome: "Roraima", capital: "Boa Vista" },
  SC: { nome: "Santa Catarina", capital: "Florianópolis" },
  SP: { nome: "São Paulo", capital: "São Paulo" },
  SE: { nome: "Sergipe", capital: "Aracaju" },
  TO: { nome: "Tocantins", capital: "Palmas" },
};

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
const stripTags = (s: string) => s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

async function getJson(url: string, headers: Record<string, string> = {}): Promise<any> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA, ...headers }, signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

interface ImageInfo {
  thumburl?: string;
  url?: string;
  descriptionurl?: string;
  width?: number;
  height?: number;
  thumbwidth?: number;
  thumbheight?: number;
  mime?: string;
  extmetadata?: Record<string, { value?: string }>;
}

/** Foto boa para destaque: JPEG, larga o bastante e na horizontal. */
function isGoodPhoto(title: string, info?: ImageInfo): boolean {
  if (!info || NOT_A_PHOTO.test(title)) return false;
  if (info.mime && info.mime !== "image/jpeg") return false;
  const w = info.width || 0;
  const h = info.height || 1;
  return w >= 900 && w / h >= 1.2;
}

function toSuggestion(info: ImageInfo): ImageSuggestion | null {
  const url = info.thumburl || info.url;
  if (!url) return null;
  const meta = info.extmetadata || {};
  const author = stripTags(meta.Artist?.value || "") || "autor desconhecido";
  const license = stripTags(meta.LicenseShortName?.value || "") || "licença livre";
  return {
    url,
    pageUrl: info.descriptionurl || url,
    author: author.slice(0, 120),
    license: license.slice(0, 60),
    source: "Wikimedia Commons",
  };
}

const IMAGEINFO = "prop=imageinfo&iiprop=url|size|mime|extmetadata&iiurlwidth=1280&iiextmetadatafilter=Artist|LicenseShortName";

/** Foto principal do artigo do município na Wikipédia. */
async function fromWikipedia(city: string, uf: string): Promise<ImageSuggestion | null> {
  const estado = UF_INFO[uf]?.nome || "";
  const search = encodeURIComponent(`${city} ${estado} município`.trim());
  const data = await getJson(
    `https://pt.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&generator=search&gsrsearch=${search}&gsrlimit=5&prop=pageimages&piprop=name`,
  );
  const pages = ((data?.query?.pages || []) as { title: string; index: number; pageimage?: string }[])
    .sort((a, b) => a.index - b.index);
  const wanted = norm(city);
  const page = pages.find((p) => p.pageimage && norm(p.title).startsWith(wanted));
  if (!page?.pageimage || NOT_A_PHOTO.test(page.pageimage)) return null;

  const info = await getJson(
    `https://pt.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&titles=${encodeURIComponent(`Arquivo:${page.pageimage}`)}&${IMAGEINFO}`,
  );
  const ii: ImageInfo | undefined = info?.query?.pages?.[0]?.imageinfo?.[0];
  return isGoodPhoto(page.pageimage, ii) ? toSuggestion(ii!) : null;
}

/** Busca de fotos da cidade no Wikimedia Commons. */
export async function searchCommons(query: string, limit = 20): Promise<ImageSuggestion[]> {
  const search = encodeURIComponent(`${query} filetype:bitmap`);
  const data = await getJson(
    `https://commons.wikimedia.org/w/api.php?action=query&format=json&formatversion=2&generator=search&gsrnamespace=6&gsrsearch=${search}&gsrlimit=${limit}&${IMAGEINFO}`,
  );
  const pages = ((data?.query?.pages || []) as { title: string; index: number; imageinfo?: ImageInfo[] }[])
    .sort((a, b) => a.index - b.index);
  return pages
    .filter((p) => isGoodPhoto(p.title, p.imageinfo?.[0]))
    .map((p) => toSuggestion(p.imageinfo![0]))
    .filter((s): s is ImageSuggestion => !!s);
}

async function fromUnsplash(query: string): Promise<ImageSuggestion | null> {
  const key = (Deno.env.get("UNSPLASH_ACCESS_KEY") || "").trim();
  if (!key) return null;
  const data = await getJson(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&orientation=landscape&per_page=1`,
    { Authorization: `Client-ID ${key}`, "Accept-Version": "v1" },
  );
  const photo = data?.results?.[0];
  if (!photo?.urls?.regular) return null;
  // As regras do Unsplash pedem para registrar o uso da foto
  if (photo.links?.download_location) {
    getJson(photo.links.download_location, { Authorization: `Client-ID ${key}` }).catch(() => {});
  }
  return {
    url: photo.urls.regular,
    pageUrl: `${photo.links?.html || "https://unsplash.com"}?utm_source=bom_estudo&utm_medium=referral`,
    author: String(photo.user?.name || "autor no Unsplash").slice(0, 120),
    license: "Licença Unsplash",
    source: "Unsplash",
  };
}

/**
 * Escolhe a cidade da foto: a cidade informada pela IA, a capital do estado
 * para concursos estaduais, Brasília para concursos federais.
 */
export function pickCity(city: string, uf: string, region: string): { city: string; uf: string } | null {
  const c = (city || "").trim();
  const u = (uf || "").trim().toUpperCase();
  if (c) return { city: c, uf: u };
  if (UF_INFO[u]) return { city: UF_INFO[u].capital, uf: u };
  if (region === "federal") return { city: "Brasília", uf: "DF" };
  return null;
}

export async function findCityImage(city: string, uf: string, region: string): Promise<ImageSuggestion | null> {
  const alvo = pickCity(city, uf, region);
  if (!alvo) return null;
  const estado = UF_INFO[alvo.uf]?.nome || "";
  const tentativas: (() => Promise<ImageSuggestion | null>)[] = [
    () => fromWikipedia(alvo.city, alvo.uf),
    async () => (await searchCommons(`${alvo.city} ${estado}`.trim()))[0] || null,
    () => fromUnsplash(`${alvo.city} ${estado || "Brasil"}`),
  ];
  for (const tentar of tentativas) {
    try {
      const found = await tentar();
      if (found) return found;
    } catch (err) {
      console.warn("[imagem] falha ao buscar foto da cidade", alvo.city, String(err));
    }
  }
  return null;
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Parágrafo de crédito da foto, colocado no fim do post. */
export function creditHtml(img: ImageSuggestion): string {
  return `<p><em>Foto destaque: ${escapeHtml(img.author)}, via <a href="${escapeHtml(img.pageUrl)}" target="_blank" rel="noopener noreferrer nofollow">${img.source}</a> (${escapeHtml(img.license)}).</em></p>`;
}
