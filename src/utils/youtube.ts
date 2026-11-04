/**
 * Extrai o id de um vídeo do YouTube a partir dos formatos de link mais comuns:
 * youtube.com/watch?v=, youtu.be/, /embed/, /shorts/, /live/ e o id puro.
 */
export const youtubeId = (url: string): string | null => {
  const valor = (url || "").trim();
  if (/^[\w-]{11}$/.test(valor)) return valor;
  try {
    const u = new URL(valor.startsWith("http") ? valor : `https://${valor}`);
    const host = u.hostname.replace(/^www\.|^m\./, "");
    if (host === "youtu.be") return u.pathname.slice(1).split("/")[0] || null;
    if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
      const v = u.searchParams.get("v");
      if (v) return v;
      const m = u.pathname.match(/\/(?:embed|shorts|live|v)\/([\w-]{11})/);
      if (m) return m[1];
    }
  } catch {
    /* link inválido */
  }
  return null;
};

export const youtubeEmbed = (url: string): string | null => {
  const id = youtubeId(url);
  return id ? `https://www.youtube.com/embed/${id}` : null;
};

export const youtubeThumb = (url: string): string | null => {
  const id = youtubeId(url);
  return id ? `https://i.ytimg.com/vi/${id}/mqdefault.jpg` : null;
};
