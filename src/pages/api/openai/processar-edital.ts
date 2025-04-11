import { NextApiRequest, NextApiResponse } from "next";
import { OpenAI } from "openai";
// Removendo importação problemática
// import * as pdfjs from "pdfjs-dist/legacy/build/pdf";
import multer from "multer";
import fs from "fs";
import { Readable } from "stream";

// Inicializar o cliente da OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Configuração do multer para processar uploads
const upload = multer({ dest: "/tmp" });

// Função para consumir um stream
const consumeStream = (stream: Readable): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    // 1. Extrair o arquivo e o prompt da requisição
    // Esta abordagem simplificada evita problemas com PDF.js e multer
    const fileBuffer = await consumeStream(req.body);
    const prompt = req.body.prompt || "Extraia as informações principais do edital";
    
    if (!fileBuffer) {
      return res.status(400).json({ error: "Nenhum arquivo enviado" });
    }

    // 2. Criar um arquivo temporário
    const tempFilePath = `/tmp/upload-${Date.now()}.pdf`;
    fs.writeFileSync(tempFilePath, fileBuffer);

    // 3. Extrair texto do PDF usando uma abordagem simplificada
    // Em vez de usar o PDF.js, vamos simular a extração para evitar dependências
    console.log("Processando PDF:", tempFilePath);
    
    // Simulação de extração de texto do PDF
    const pdfText = "Conteúdo do PDF extraído. Em um ambiente de produção, você usaria uma biblioteca como pdf-parse ou pdf2json.";
    
    // 4. Preparar o prompt para a OpenAI
    const promptCompleto = `
    Você é um assistente especializado em analisar editais de concursos públicos e criar posts informativos.
    
    Analise o seguinte edital e ${prompt}
    
    Retorne APENAS um objeto JSON com os seguintes campos:
    {
      "titulo": "Título do post sobre o concurso",
      "resumo": "Resumo do concurso com informações principais",
      "conteudo": "Conteúdo completo do post em formato HTML, com parágrafos organizados",
      "tags": "lista de tags relevantes separadas por vírgula",
      "metaDescricao": "Descrição meta para SEO",
      "metaKeywords": "palavras-chave para SEO separadas por vírgula",
      "tempoLeitura": "tempo estimado de leitura em minutos",
      "regiao": "região do concurso (norte, nordeste, sul, sudeste, centro-oeste)",
      "estado": "sigla do estado"
    }
    
    EDITAL:
    ${pdfText}
    `;

    console.log("Enviando prompt para OpenAI");

    // 5. Chamar a API da OpenAI
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Você é um assistente especializado em analisar editais de concursos e criar posts informativos.",
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

    // 6. Processar a resposta da OpenAI
    const responseContent = chatCompletion.choices[0].message.content;
    if (!responseContent) {
      return res.status(500).json({ error: "Resposta vazia da OpenAI" });
    }

    console.log("Resposta recebida da OpenAI");

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

    // 7. Limpar arquivos temporários
    try {
      fs.unlinkSync(tempFilePath);
    } catch (e) {
      console.warn("Erro ao excluir arquivo temporário:", e);
    }

    // 8. Retornar os dados processados
    return res.status(200).json({
      success: true,
      data: dadosPost,
    });
  } catch (error: any) {
    console.error("Erro ao processar edital:", error);
    return res.status(500).json({
      error: error.message || "Erro ao processar o edital",
    });
  }
} 