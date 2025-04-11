// Removendo importação não utilizada
// import { supabase } from "@/lib/supabase";

interface OpenAIResponse {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Extrai conteúdo de um PDF usando a OpenAI
 */
export const processarEditalPDF = async (
  file: File,
  prompt: string
): Promise<OpenAIResponse> => {
  try {
    // Versão simulada para desenvolvimento
    // Isso evita a necessidade de upload para o Storage
    const simulateAPIResponse = async () => {
      console.log("Processando arquivo:", file.name);
      
      // Leitura básica do arquivo para mostrar que estamos processando
      try {
        const reader = new FileReader();
        reader.readAsText(file);
        await new Promise(resolve => {
          reader.onload = resolve;
          reader.onerror = () => {
            console.error("Erro ao ler arquivo");
            resolve(null);
          };
        });
        console.log("Arquivo lido com sucesso, processando conteúdo...");
      } catch (error) {
        console.warn("Erro ao ler arquivo:", error);
      }
      
      // Simulação de processamento pela IA com um atraso mais realista
      console.log("Simulando processamento pela IA...");
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const dadosGerados = {
        titulo: `Concurso ${file.name.split('.')[0]}`,
        resumo: "Resumo gerado automaticamente com base no edital do concurso.",
        conteudo: `<p>Conteúdo gerado com base no edital ${file.name}.</p>
                   <p>Este é um conteúdo simulado para desenvolvimento.</p>
                   <p>Em produção, o texto seria extraído do PDF e processado pela API OpenAI.</p>
                   <p>O prompt utilizado foi: "${prompt}"</p>`,
        tags: "concurso, edital, simulado",
        metaDescricao: "Informações sobre o concurso extraídas automaticamente do edital",
        metaKeywords: "concurso, edital, vagas, pdf",
        tempoLeitura: "5 min",
        regiao: "sudeste",
        estado: "RJ"
      };
      
      console.log("Dados gerados:", dadosGerados);
      
      return {
        success: true,
        data: dadosGerados
      };
    };
    
    // Em produção, você implementaria o código abaixo para processar o arquivo
    // com a OpenAI, sem necessidade de upload para o Supabase Storage
    /*
    // 1. Ler o arquivo como ArrayBuffer
    const fileBuffer = await file.arrayBuffer();
    
    // 2. Processar o PDF localmente ou enviar para um serviço de processamento
    // Exemplo de código para enviar para uma API própria
    const formData = new FormData();
    formData.append('file', file);
    formData.append('prompt', prompt);
    
    const response = await fetch("/api/analisar-pdf", {
      method: "POST",
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || "Erro ao processar o edital"
      };
    }
    
    const result = await response.json();
    return {
      success: true,
      data: result.data
    };
    */
    
    const resultado = await simulateAPIResponse();
    console.log("Resultado final:", resultado);
    return resultado;
    
  } catch (error: any) {
    console.error("Erro ao processar edital:", error);
    return {
      success: false,
      error: error.message || "Erro desconhecido ao processar o edital",
    };
  }
};

/**
 * Processa links de notícias usando a OpenAI
 */
export const processarLinks = async (
  links: string[],
  prompt: string
): Promise<OpenAIResponse> => {
  try {
    // Filtrar links vazios
    const linksValidos = links.filter((link) => link.trim() !== "");

    if (linksValidos.length === 0) {
      return {
        success: false,
        error: "Nenhum link válido fornecido",
      };
    }

    // Versão simulada para desenvolvimento
    const simulateAPIResponse = async () => {
      console.log("Processando links:", linksValidos);
      
      // Simulação de acesso e processamento de links
      for (const link of linksValidos) {
        console.log("Simulando acesso ao link:", link);
        try {
          // Tentativa simulada de acessar o link
          await new Promise(resolve => setTimeout(resolve, 200));
          console.log("Link acessado com sucesso:", link);
        } catch (error) {
          console.warn("Erro ao acessar link (simulado):", link);
        }
      }
      
      // Simulação de processamento pela IA
      console.log("Simulando processamento pela IA...");
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const dadosGerados = {
        titulo: "Novo Concurso Autorizado - Dados Processados por IA",
        resumo: "Resumo gerado automaticamente com base nas notícias analisadas.",
        conteudo: `<p>Conteúdo gerado com base na análise dos seguintes links:</p>
                   <ul>
                     ${linksValidos.map(link => `<li><a href="${link}" target="_blank">${link}</a></li>`).join('')}
                   </ul>
                   <p>Este é um conteúdo simulado para desenvolvimento.</p>
                   <p>Em produção, o texto seria extraído dos links e processado pela API OpenAI.</p>
                   <p>O prompt utilizado foi: "${prompt}"</p>`,
        tags: "concurso, autorizado, simulado",
        metaDescricao: "Informações sobre concurso autorizado extraídas de notícias",
        metaKeywords: "concurso, autorizado, vagas, previsão",
        tempoLeitura: "3 min",
        regiao: "nordeste",
        estado: "CE"
      };
      
      console.log("Dados gerados:", dadosGerados);
      
      return {
        success: true,
        data: dadosGerados
      };
    };
    
    const resultado = await simulateAPIResponse();
    console.log("Resultado final:", resultado);
    return resultado;
    
  } catch (error: any) {
    console.error("Erro ao processar links:", error);
    return {
      success: false,
      error: error.message || "Erro desconhecido ao processar os links",
    };
  }
}; 