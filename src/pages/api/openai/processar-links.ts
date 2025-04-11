import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import axios from "axios";
import * as cheerio from "cheerio";

// Inicializar o cliente OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { links, prompt } = req.body;

    if (!links || !Array.isArray(links) || links.length === 0) {
      return res.status(400).json({ error: "Links são obrigatórios" });
    }

    if (!prompt) {
      return res.status(400).json({ error: "Prompt é obrigatório" });
    }

    // 1. Extrair conteúdo de cada link
    const conteudosLinks = await Promise.all(
      links.map(async (link: string) => {
        try {
          // Buscar o conteúdo HTML da página
          const response = await axios.get(link);
          const html = response.data;
          
          // Usar Cheerio para extrair o texto relevante
          const $ = cheerio.load(html);
          
          // Remover elementos não relevantes
          $("script, style, nav, footer, header, aside").remove();
          
          // Extrair o texto principal
          let texto = $("body").text();
          
          // Limpar o texto (remover espaços em branco extras)
          texto = texto.replace(/\s+/g, " ").trim();
          
          // Limitar o tamanho do texto para não exceder limites de tokens
          return {
            url: link,
            conteudo: texto.slice(0, 5000), // Limitar a 5000 caracteres por link
          };
        } catch (error) {
          console.error(`Erro ao processar link ${link}:`, error);
          return {
            url: link,
            conteudo: `Erro ao processar este link: ${(error as Error).message}`,
          };
        }
      })
    );

    // 2. Preparar o prompt para a OpenAI
    const promptCompleto = `
    Você é um assistente especializado em analisar notícias sobre concursos públicos autorizados ou previstos e criar posts informativos.
    
    Analise as seguintes notícias e ${prompt}
    
    Retorne APENAS um objeto JSON com os seguintes campos:
    {
      "titulo": "Título atrativo do post sobre o concurso",
      "resumo": "Resumo das principais informações sobre o concurso autorizado ou previsto",
      "conteudo": "Conteúdo completo do post em formato HTML, com parágrafos organizados",
      "tags": "lista de tags relevantes separadas por vírgula",
      "metaDescricao": "Descrição meta para SEO",
      "metaKeywords": "palavras-chave para SEO separadas por vírgula",
      "tempoLeitura": "tempo estimado de leitura em minutos",
      "regiao": "região do concurso (norte, nordeste, sul, sudeste, centro-oeste)",
      "estado": "sigla do estado"
    }
    
    NOTÍCIAS:
    ${conteudosLinks
      .map((item) => `URL: ${item.url}\nCONTEÚDO: ${item.conteudo}\n\n`)
      .join("---\n\n")}
    `;

    // 3. Chamar a API da OpenAI
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Você é um assistente especializado em analisar notícias sobre concursos e criar posts informativos.",
        },
        {
          role: "user",
          content: promptCompleto,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: "json_object" },
    });

    // 4. Processar a resposta da OpenAI
    const responseContent = chatCompletion.choices[0].message.content;
    if (!responseContent) {
      return res.status(500).json({ error: "Resposta vazia da OpenAI" });
    }

    let dadosPost;
    try {
      dadosPost = JSON.parse(responseContent);
    } catch (error) {
      console.error("Erro ao processar resposta JSON:", error);
      return res.status(500).json({ 
        error: "Erro ao processar resposta da IA", 
        raw: responseContent 
      });
    }

    // 5. Retornar os dados processados
    return res.status(200).json({
      success: true,
      data: dadosPost,
    });
  } catch (error: any) {
    console.error("Erro ao processar links:", error);
    return res.status(500).json({
      error: error.message || "Erro ao processar os links",
    });
  }
} 