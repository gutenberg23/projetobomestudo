// Busca de fotos de cidades no Wikimedia Commons e na Wikipédia, direto do
// navegador (as APIs aceitam CORS com origin=*). Gratuito e sem chave.
//
// A mesma lógica roda no servidor em supabase/functions/_shared/images.ts,
// usada pela sincronização automática de RSS.

export interface CityImage {
  url: string;
  thumbUrl: string;
  pageUrl: string;
  author: string;
  license: string;
  title: string;
}

export const UF_INFO: Record<string, { nome: string; capital: string }> = {
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

const NOT_A_PHOTO = /(bandeira|bras[aã]o|flag|coat[ _]of[ _]arms|mapa|map[ _]|locator|localiza|logo|selo|escudo|hino|assinatura|signature|\.svg$|\.png$|\.gif$|\.tiff?$)/i;

const stripTags = (s: string) => s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

interface ImageInfo {
  thumburl?: string;
  url?: string;
  descriptionurl?: string;
  width?: number;
  height?: number;
  mime?: string;
  extmetadata?: Record<string, { value?: string }>;
}

const IMAGEINFO =
  "prop=imageinfo&iiprop=url|size|mime|extmetadata&iiurlwidth=1280&iiextmetadatafilter=Artist|LicenseShortName";

function toCityImage(title: string, info?: ImageInfo): CityImage | null {
  if (!info || NOT_A_PHOTO.test(title)) return null;
  if (info.mime && info.mime !== "image/jpeg") return null;
  const w = info.width || 0;
  const h = info.height || 1;
  if (w < 900 || w / h < 1.2) return null;
  const url = info.thumburl || info.url;
  if (!url) return null;
  const meta = info.extmetadata || {};
  return {
    url,
    thumbUrl: url.replace(/\/\d+px-/, "/400px-"),
    pageUrl: info.descriptionurl || url,
    author: (stripTags(meta.Artist?.value || "") || "autor desconhecido").slice(0, 120),
    license: (stripTags(meta.LicenseShortName?.value || "") || "licença livre").slice(0, 60),
    title: title.replace(/^(File|Arquivo):/, "").replace(/\.[a-z]+$/i, ""),
  };
}

async function getJson(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/** Busca fotos de uma cidade. `uf` ajuda a desambiguar (ex.: "Bonito", "MS"). */
export async function buscarFotosCidade(cidade: string, uf?: string): Promise<CityImage[]> {
  const termo = cidade.trim();
  if (!termo) return [];
  const estado = uf ? UF_INFO[uf.toUpperCase()]?.nome || "" : "";
  const resultados: CityImage[] = [];
  const vistos = new Set<string>();
  const adicionar = (img: CityImage | null) => {
    if (img && !vistos.has(img.url)) {
      vistos.add(img.url);
      resultados.push(img);
    }
  };

  // 1. Foto principal do artigo do município na Wikipédia
  try {
    const busca = encodeURIComponent(`${termo} ${estado} município`.trim());
    const data = await getJson(
      `https://pt.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&origin=*&generator=search&gsrsearch=${busca}&gsrlimit=3&prop=pageimages&piprop=name`
    );
    const pages = ((data?.query?.pages || []) as { index: number; pageimage?: string }[])
      .sort((a, b) => a.index - b.index)
      .filter((p) => p.pageimage && !NOT_A_PHOTO.test(p.pageimage));
    if (pages.length) {
      const titles = pages.map((p) => `Arquivo:${p.pageimage}`).join("|");
      const info = await getJson(
        `https://pt.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&origin=*&titles=${encodeURIComponent(titles)}&${IMAGEINFO}`
      );
      for (const p of (info?.query?.pages || []) as { title: string; imageinfo?: ImageInfo[] }[]) {
        adicionar(toCityImage(p.title, p.imageinfo?.[0]));
      }
    }
  } catch (err) {
    console.warn("Wikipédia indisponível para a busca de fotos", err);
  }

  // 2. Fotos do Wikimedia Commons
  const busca = encodeURIComponent(`${termo} ${estado} filetype:bitmap`.replace(/\s+/g, " "));
  const data = await getJson(
    `https://commons.wikimedia.org/w/api.php?action=query&format=json&formatversion=2&origin=*&generator=search&gsrnamespace=6&gsrsearch=${busca}&gsrlimit=30&${IMAGEINFO}`
  );
  const pages = ((data?.query?.pages || []) as { title: string; index: number; imageinfo?: ImageInfo[] }[])
    .sort((a, b) => a.index - b.index);
  for (const p of pages) adicionar(toCityImage(p.title, p.imageinfo?.[0]));

  return resultados.slice(0, 18);
}

/** Tenta adivinhar a cidade a partir do título ("Prefeitura de Campinas") ou do estado. */
export function sugerirCidade(titulo: string, uf?: string): string {
  const m = titulo.match(/(?:[Pp]refeitura|[Cc][aâ]mara|[Mm]unic[ií]pio|[Cc]idade)\s+(?:[Mm]unicipal\s+)?(?:de|do|da)\s+([A-ZÀ-Ý][\p{L}'’-]*(?:\s+(?:de|do|da|dos|das)?\s*[A-ZÀ-Ý][\p{L}'’-]*)*)/u);
  if (m) return m[1].trim();
  if (uf && UF_INFO[uf.toUpperCase()]) return UF_INFO[uf.toUpperCase()].capital;
  return "";
}

const PREFIXO_CREDITO = "Foto destaque:";

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * Coloca (ou troca) o parágrafo de crédito da foto no fim do conteúdo.
 * As licenças do Wikimedia (CC BY/BY-SA) exigem o nome do autor.
 */
export function aplicarCreditoFoto(conteudo: string, img: Pick<CityImage, "author" | "pageUrl" | "license">): string {
  const credito = `<p><em>${PREFIXO_CREDITO} ${escapeHtml(img.author)}, via <a href="${escapeHtml(img.pageUrl)}" target="_blank" rel="noopener noreferrer nofollow">Wikimedia Commons</a> (${escapeHtml(img.license)}).</em></p>`;
  return `${removerCreditoFoto(conteudo)}${credito}`;
}

export function removerCreditoFoto(conteudo: string): string {
  return (conteudo || "").replace(/<p>(?:(?!<\/p>).)*?Foto destaque:(?:(?!<\/p>).)*?<\/p>\s*/gs, "");
}
