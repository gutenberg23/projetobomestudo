
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
  // O padrão para IDs completos que usamos é UUID v4: 8-4-4-4-12 caracteres
  // Vamos tentar extrair o UUID completo da string, se existir
  const uuidPattern = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
  const fullUuidMatch = friendlyUrl.match(uuidPattern);
  
  if (fullUuidMatch && fullUuidMatch[1]) {
    return fullUuidMatch[1];
  }
  
  // Se não encontrar o UUID completo, tenta extrair apenas o prefixo (antigo comportamento)
  const idPart = friendlyUrl.split('-').pop();
  
  if (!idPart) {
    return friendlyUrl; // Retorna a URL original se não conseguir extrair o ID
  }
  
  // Buscar UUID completo no banco a partir do prefixo (vai ser implementado depois)
  return idPart;
};

/**
 * Esta função busca o UUID completo a partir de um prefixo de 8 caracteres
 * Usado para converter IDs curtos em IDs completos
 */
export const getFullUuidFromPrefix = async (prefix: string, table: string): Promise<string | null> => {
  if (!prefix || prefix.length < 8) return null;
  
  try {
    // Esta função seria implementada para buscar o UUID completo no banco
    // com base no prefixo, por enquanto retornamos o próprio prefixo
    return prefix;
  } catch (error) {
    console.error("Erro ao buscar UUID completo:", error);
    return null;
  }
};
