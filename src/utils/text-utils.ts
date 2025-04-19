/**
 * Utilitários para manipulação de texto
 */

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
 * Prepara conteúdo HTML para exibição segura, tratando caracteres especiais
 * e garantindo que glifos matemáticos sejam preservados.
 */
export const prepareHtmlContent = (html: string): string => {
  if (!html) return '';
  
  try {
    // Normalizar o texto para garantir consistência de caracteres especiais
    const normalized = normalizeSpecialChars(html);
    
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