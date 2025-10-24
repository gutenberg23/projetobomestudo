import { supabase } from "../lib/supabase";

interface ConcursoExtractedData {
  titulo: string;
  dataInicioInscricao: string;
  dataFimInscricao: string;
  dataProva: string;
  niveis: string[];
  cargos: string[];
  vagas: number;
  salario: string;
  estados: string[];
}

/**
 * Valida e formata uma data no formato YYYY-MM-DD
 * @param date Data a ser validada
 * @returns Data formatada ou string vazia se inválida
 */
const validarData = (date: string): string => {
  if (!date) return '';
  
  // Se já estiver no formato correto, retornar como está
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }
  
  // Tentar converter para o formato correto
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch {
    return '';
  }
};

/**
 * Extrai dados de um post do blog e preenche automaticamente os campos do concurso
 * @param postId ID do post relacionado
 * @returns Dados extraídos do post formatados para preencher o formulário de concurso
 */
export const autoPreencherConcurso = async (postId: string): Promise<ConcursoExtractedData> => {
  try {
    // 1. Buscar o conteúdo do post
    const { data: postData, error: postError } = await supabase
      .from('blog_posts')
      .select('title, content, category')
      .eq('id', postId)
      .single();

    if (postError) {
      throw new Error(`Erro ao buscar post: ${postError.message}`);
    }

    if (!postData) {
      throw new Error('Post não encontrado');
    }

    // 2. Preparar o prompt para o Google Gemini
    const prompt = `
Você é um assistente especializado em extrair informações precisas de posts de concursos públicos.
Sua tarefa é analisar o conteúdo do post abaixo e extrair informações específicas em formato JSON estruturado.

INSTRUÇÕES IMPORTANTES:
1. Extraia APENAS informações que estão claramente presentes no texto
2. Se uma informação não estiver clara, deixe o campo vazio ou com valor padrão
3. Para datas, use SEMPRE o formato YYYY-MM-DD (ex: 2025-10-15)
4. Para níveis, use APENAS estes valores: "Ensino Fundamental", "Ensino Médio", "Ensino Superior"
5. Para estados, use as siglas oficiais (ex: SP, RJ, MG)
6. Para cargos, liste cada cargo individualmente
7. Para vagas, extraia o número total (some todas as vagas se houver várias categorias)
8. Para salário, extraia o MAIOR valor mencionado e formate como "R$ X.XXX,XX"

INFORMAÇÕES A EXTRAIR:
- titulo: Título do Concurso (Nome do órgão, ex: "Prefeitura do Rio de Janeiro")
- dataInicioInscricao: Data de início das inscrições (formato YYYY-MM-DD)
- dataFimInscricao: Data de término das inscrições (formato YYYY-MM-DD)
- dataProva: Data da prova (formato YYYY-MM-DD)
- niveis: Array com níveis de ensino ("Ensino Fundamental", "Ensino Médio", "Ensino Superior")
- cargos: Array com os cargos oferecidos
- vagas: Número total de vagas (número inteiro)
- salario: Maior salário oferecido (formato "R$ X.XXX,XX")
- estados: Array com siglas dos estados onde o concurso atua

POST PARA ANÁLISE:
Título: ${postData.title}
Categoria: ${postData.category}
Conteúdo: ${postData.content}

RESPONDA APENAS COM UM JSON VÁLIDO CONTENDO OS CAMPOS ACIMA. NÃO INCLUA TEXTO ADICIONAL.
EXEMPLO DE RESPOSTA ESPERADA:
{
  "titulo": "Prefeitura do Rio de Janeiro",
  "dataInicioInscricao": "2025-10-01",
  "dataFimInscricao": "2025-10-31",
  "dataProva": "2025-11-15",
  "niveis": ["Ensino Médio", "Ensino Superior"],
  "cargos": ["Professor", "Médico", "Enfermeiro"],
  "vagas": 150,
  "salario": "R$ 12.000,00",
  "estados": ["RJ"]
}
`;

    // 3. Chamar a função do Google Gemini através da Edge Function do Supabase
    const { data: aiData, error: aiError } = await supabase.functions.invoke('generate-question-explanation', {
      body: { prompt }
    });

    if (aiError) {
      throw new Error(`Erro ao chamar IA: ${aiError.message}`);
    }

    if (!aiData || !aiData.text) {
      throw new Error('Resposta inválida da IA');
    }

    // 4. Parsear a resposta JSON
    try {
      // Remover possíveis caracteres de formatação
      const cleanResponse = aiData.text
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
      
      const extractedData = JSON.parse(cleanResponse) as ConcursoExtractedData;
      
      // Validar e formatar os dados
      return {
        titulo: typeof extractedData.titulo === 'string' ? extractedData.titulo : '',
        dataInicioInscricao: validarData(extractedData.dataInicioInscricao),
        dataFimInscricao: validarData(extractedData.dataFimInscricao),
        dataProva: validarData(extractedData.dataProva),
        niveis: Array.isArray(extractedData.niveis) ? extractedData.niveis : [],
        cargos: Array.isArray(extractedData.cargos) ? extractedData.cargos : [],
        vagas: typeof extractedData.vagas === 'number' ? extractedData.vagas : 0,
        salario: typeof extractedData.salario === 'string' ? extractedData.salario : '',
        estados: Array.isArray(extractedData.estados) ? extractedData.estados : []
      };
    } catch (parseError) {
      console.error('Erro ao parsear resposta da IA:', aiData.text);
      throw new Error('Não foi possível interpretar a resposta da IA. Tente novamente.');
    }
  } catch (error) {
    console.error("Erro no auto preenchimento:", error);
    throw error instanceof Error ? error : new Error('Erro ao auto preencher dados do concurso');
  }
};