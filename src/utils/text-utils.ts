/**
 * Utilitários para manipulação de texto
 */

/**
 * Remove acentos e caracteres especiais de um texto, substituindo-os por suas versões não acentuadas.
 * Útil para geração de slugs e URLs amigáveis.
 */
export const removeAccents = (text: string): string => {
  if (!text) return '';
  
  return text
    .normalize('NFD') // Normaliza para decompor caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Remove os acentos
    .replace(/ç/g, 'c')
    .replace(/Ç/g, 'C');
};

/**
 * Normaliza caracteres especiais, incluindo glifos matemáticos e símbolos.
 * Útil para garantir a consistência na exibição de textos com caracteres especiais.
 */
export const normalizeSpecialChars = (text: string): string => {
  if (!text) return '';
  
  try {
    // Aplicar normalização Unicode para garantir consistência
    // NFC é a forma de normalização canônica composta
    return text.normalize('NFC');
  } catch (e) {
    console.error('Erro ao normalizar texto:', e);
    return text;
  }
};

/**
 * Normaliza texto para melhor correspondência, removendo espaços extras e caracteres especiais
 */
export const normalizeTextForMatching = (text: string): string => {
  if (!text) return '';
  
  return text
    .normalize('NFC') // Normalização Unicode
    .replace(/\s+/g, ' ') // Substituir múltiplos espaços por um único espaço
    .trim(); // Remover espaços no início e fim
};

/**
 * Escapa texto para uso em expressões regulares
 */
export const escapeRegExp = (text: string): string => {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Aplica destaques diretamente no HTML
 */
export const applyHighlightsToHtml = (html: string, highlights: Array<{id: string, text: string, color: string, note?: string}> = []): string => {
  if (!html || highlights.length === 0) return html;
  
  try {
    // Trabalhar com uma cópia do HTML
    let result = html;
    
    // Processar cada destaque
    highlights.forEach(highlight => {
      const normalizedText = normalizeTextForMatching(highlight.text);
      if (!normalizedText) return;
      
      // Criar uma expressão regular para encontrar o texto
      // Esta é uma abordagem mais flexível que lida com espaços e quebras de linha
      const escapedText = escapeRegExp(normalizedText)
        .replace(/\s+/g, '[\\s\\n\\r\\t]*');
      
      // Criar o elemento de marcação
      const idAttr = ` data-highlight-id="${highlight.id}"`;
      const noteAttr = highlight.note ? ` data-note="${highlight.note.replace(/"/g, '&quot;')}"` : '';
      const markElement = `<mark style="background-color: ${highlight.color}; padding: 2px 4px; border-radius: 2px;"${idAttr}${noteAttr}>$1</mark>`;
      
      // Aplicar a substituição
      const regex = new RegExp(`(${escapedText})`, 'g');
      result = result.replace(regex, markElement);
    });
    
    return result;
  } catch (e) {
    console.error('Erro ao aplicar highlights ao HTML:', e);
    return html;
  }
};

/**
 * Prepara conteúdo HTML para exibição segura, tratando caracteres especiais
 * e garantindo que glifos matemáticos sejam preservados.
 * @param html Conteúdo HTML original
 */
export const prepareHtmlContent = (html: string): string => {
  if (!html) return '';
  
  try {
    // Normalizar o texto para garantir consistência de caracteres especiais
    let normalized = normalizeSpecialChars(html);
    
    // Aqui poderíamos adicionar outras transformações se necessário
    
    return normalized;
  } catch (e) {
    console.error('Erro ao preparar conteúdo HTML:', e);
    return html;
  }
};

/**
 * Converte símbolos matemáticos em texto para representações HTML.
 * Útil para sistemas que não suportam diretamente símbolos Unicode.
 */
export const mathSymbolsToHtml = (text: string): string => {
  if (!text) return '';
  
  try {
    return text
      // Operadores básicos
      .replace(/±/g, '&plusmn;')
      .replace(/×/g, '&times;')
      .replace(/÷/g, '&divide;')
      
      // Símbolos matemáticos
      .replace(/√/g, '&radic;')
      .replace(/∑/g, '&sum;')
      .replace(/∫/g, '&int;')
      .replace(/∞/g, '&infin;')
      .replace(/≈/g, '&asymp;')
      .replace(/≠/g, '&ne;')
      .replace(/≤/g, '&le;')
      .replace(/≥/g, '&ge;')
      
      // Letras gregas comuns
      .replace(/α/g, '&alpha;')
      .replace(/β/g, '&beta;')
      .replace(/γ/g, '&gamma;')
      .replace(/Γ/g, '&Gamma;')
      .replace(/δ/g, '&delta;')
      .replace(/Δ/g, '&Delta;')
      .replace(/π/g, '&pi;')
      .replace(/Π/g, '&Pi;')
      .replace(/σ/g, '&sigma;')
      .replace(/Σ/g, '&Sigma;')
      .replace(/θ/g, '&theta;')
      .replace(/Θ/g, '&Theta;');
  } catch (e) {
    console.error('Erro ao converter símbolos matemáticos:', e);
    return text;
  }
}; 