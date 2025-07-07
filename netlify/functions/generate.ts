import { Handler } from '@netlify/functions';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 15000, // Aumentar timeout para 15 segundos
    maxRetries: 0, // Sem retentativas para evitar timeout
  });

export const handler: Handler = async (event) => {
  // Adicionar headers CORS em todas as respostas
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Log para debug
  console.log('Function invoked:', {
    method: event.httpMethod,
    hasBody: !!event.body,
    timestamp: new Date().toISOString()
  });

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
    const { prompt, max_tokens, temperature, top_p, frequency_penalty, presence_penalty } = JSON.parse(event.body || '{}');

    if (!prompt) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Prompt é obrigatório' }),
      };
    }

    // Validar tamanho do prompt para evitar timeouts
    if (prompt.length > 15000) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Prompt muito longo',
          details: 'O prompt deve ter no máximo 15.000 caracteres para evitar timeouts.'
        }),
      };
    }

    console.log('Enviando requisição para OpenAI...');
    console.log('Prompt length:', prompt?.length || 0);
    console.log('Max tokens:', max_tokens || 1000);

    // Configuração otimizada para reduzir tempo de resposta
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Reescreva artigos de forma concisa e direta."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: Math.min(max_tokens || 1000, 4000), // Limitar tokens para reduzir tempo
      temperature: temperature || 0.3, // Reduzir temperatura para respostas mais rápidas
      top_p: top_p || 0.9,
      frequency_penalty: frequency_penalty || 0.5,
      presence_penalty: presence_penalty || 0.5,
      timeout: 15000, // Aumentar timeout para 15 segundos
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

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        choices: [{
          text: completion.choices[0].message.content
        }]
      }),
    };
  } catch (error: any) {
    console.error('Erro detalhado:', {
      message: error.message,
      name: error.name,
      code: error.code,
      type: error.type,
      timestamp: new Date().toISOString()
    });
    
    // Tratar erros específicos
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      console.error('Timeout na requisição para OpenAI');
      return {
        statusCode: 408,
        headers,
        body: JSON.stringify({ 
          error: 'Timeout na requisição',
          details: 'A requisição demorou mais que o esperado. Tente novamente com um prompt menor.'
        }),
      };
    }
    
    // Tratar erros específicos da OpenAI
    if (error.response) {
      console.error('Erro da OpenAI:', {
        status: error.response.status,
        data: error.response.data
      });
      
      return {
        statusCode: error.response.status || 500,
        headers,
        body: JSON.stringify({ 
          error: 'Erro da API OpenAI',
          details: error.response.data?.error?.message || error.message
        }),
      };
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