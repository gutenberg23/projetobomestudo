import { Handler } from '@netlify/functions';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const handler: Handler = async (event) => {
  // Adicionar headers CORS em todas as respostas
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Lidar com requisições OPTIONS (CORS preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Método não permitido' }),
    };
  }

  try {
    // Verificar se a chave da API está configurada
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY não está configurada');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Configuração da API ausente' }),
      };
    }

    const body = JSON.parse(event.body || '{}');
    const { prompt, max_tokens, temperature, top_p, frequency_penalty, presence_penalty } = body;

    if (!prompt) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Prompt é obrigatório' }),
      };
    }

    console.log('Enviando requisição para OpenAI...');
    console.log('Prompt:', prompt);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Você é um assistente de redação de notícias. Sua tarefa é gerar uma postagem de blog completa e bem formatada com base no prompt do usuário. A saída deve ser apenas o texto da postagem do blog, sem nenhuma marcação JSON ou qualquer outro formato de dados estruturados. A postagem deve ter um título claro, parágrafos bem escritos e uma conclusão. Não inclua nada como `json { ... }` na sua resposta."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: max_tokens || 128000, // gpt-4o-mini supports up to 128k tokens, but output is limited to 4096
      temperature: temperature || 0.7,
      top_p: top_p || 0.9,
      frequency_penalty: frequency_penalty || 0.5,
      presence_penalty: presence_penalty || 0.5,
    });

    console.log('Resposta recebida da OpenAI');

    if (!completion.choices || !completion.choices[0] || !completion.choices[0].message) {
      console.error('Resposta inválida da OpenAI:', completion);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Resposta inválida da API' }),
      };
    }

    let content = completion.choices[0].message.content;

    // Tenta remover o wrapper JSON se ele ainda estiver presente
    try {
      if (content.trim().startsWith('```json')) {
        content = content.trim().replace(/^```json\n|\n```$/g, '');
        const parsed = JSON.parse(content);
        // Assumindo que o conteúdo real está em uma propriedade como 'text' ou 'content'
        content = parsed.text || parsed.content || parsed.title || JSON.stringify(parsed, null, 2);
      }
    } catch (e) {
      // Se não for um JSON válido, use o conteúdo como está
      console.warn('Não foi possível analisar o JSON da resposta, usando o conteúdo bruto.');
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        choices: [{
          text: content
        }]
      }),
    };
  } catch (error: any) {
    console.error('Erro detalhado:', error);
    
    // Tratar erros específicos da OpenAI
    if (error.response) {
      console.error('Erro da OpenAI:', {
        status: error.response.status,
        data: error.response.data
      });
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Erro interno do servidor',
        details: error.message || 'Erro desconhecido'
      }),
    };
  }
};