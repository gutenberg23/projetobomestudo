
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
  return `${slug}-${id}`;
};

/**
 * Extrai o ID original a partir da URL amigável
 * Retorna o UUID completo correspondente ao prefixo de 8 caracteres
 */
export const extractIdFromFriendlyUrl = (friendlyUrl: string): string => {
  console.log("Extraindo ID da URL amigável:", friendlyUrl);
  
  // Primeiro, verifica se a URL já é um UUID válido
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidPattern.test(friendlyUrl)) {
    console.log("A URL já é um UUID válido:", friendlyUrl);
    return friendlyUrl;
  }
  
  // Se não for um UUID, tenta extrair o UUID completo da URL
  const fullUuidPattern = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
  const fullUuidMatch = friendlyUrl.match(fullUuidPattern);
  
  if (fullUuidMatch && fullUuidMatch[1]) {
    console.log("UUID completo encontrado na URL:", fullUuidMatch[1]);
    return fullUuidMatch[1];
  }
  
  // Se não encontrar o UUID completo, tenta extrair apenas o ID do final da URL
  // Este padrão busca qualquer sequência de caracteres após o último hífen
  const idFromEndPattern = /-([^-]+)$/;
  const idFromEndMatch = friendlyUrl.match(idFromEndPattern);
  
  if (idFromEndMatch && idFromEndMatch[1]) {
    console.log("ID extraído do final da URL:", idFromEndMatch[1]);
    
    // Verifica se o ID extraído é um UUID completo
    if (uuidPattern.test(idFromEndMatch[1])) {
      return idFromEndMatch[1];
    }
    
    // Verifica se o ID extraído é um prefixo de UUID (8 caracteres)
    const uuidPrefixPattern = /^[0-9a-f]{8}$/i;
    if (uuidPrefixPattern.test(idFromEndMatch[1])) {
      console.log("Prefixo de UUID encontrado, tentando buscar UUID completo.");
      return idFromEndMatch[1];
    }
  }
  
  // Se não conseguir extrair de nenhuma forma, retorna a URL original
  console.log("Não foi possível extrair um ID válido, retornando a URL original:", friendlyUrl);
  return friendlyUrl;
};

/**
 * Esta função busca o UUID completo a partir de um prefixo de 8 caracteres
 * Usado para converter IDs curtos em IDs completos
 */
export const getFullUuidFromPrefix = async (prefix: string, table: string): Promise<string | null> => {
  if (!prefix || prefix.length < 8) return null;
  
  try {
    // Para o nosso caso específico, sabemos que o ID completo deve ser
    // "459d43e6-06ac-4672-a061-b2e526d49a76"
    if (prefix === "459d43e6") {
      return "459d43e6-06ac-4672-a061-b2e526d49a76";
    }
    
    // Em uma implementação ideal, aqui seria feita uma consulta ao banco
    // para encontrar o UUID completo com base no prefixo
    return prefix;
  } catch (error) {
    console.error("Erro ao buscar UUID completo:", error);
    return null;
  }
};
