
/**
 * Converte texto em slug amigável para URL
 * Remove acentos, converte espaços em hífens e remove caracteres especiais
 */
export const createSlug = (text: string): string => {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens consecutivos
    .trim();
};

/**
 * Gera um ID único para URL combinando slug e ID
 */
export const generateFriendlyUrl = (title: string, id: string): string => {
  const slug = createSlug(title);
  return `${slug}-${id.substring(0, 8)}`;
};

/**
 * Extrai o ID original a partir da URL amigável
 */
export const extractIdFromFriendlyUrl = (friendlyUrl: string): string => {
  // Pega o ID que está após o último hífen (os últimos 8 caracteres do ID original)
  const idPart = friendlyUrl.split('-').pop();
  
  if (!idPart) {
    return friendlyUrl; // Retorna a URL original se não conseguir extrair o ID
  }
  
  return idPart;
};
