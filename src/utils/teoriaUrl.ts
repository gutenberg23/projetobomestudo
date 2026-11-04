/**
 * URL pública de uma teoria. Usa o slug amigável quando existe; links antigos
 * por id continuam funcionando, porque a página redireciona para o slug.
 */
export const teoriaPath = (teoria: { id?: string | null; slug?: string | null }): string =>
  `/teoria/${teoria.slug || teoria.id || ""}`;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isUuid = (valor: string): boolean => UUID_RE.test(valor);
