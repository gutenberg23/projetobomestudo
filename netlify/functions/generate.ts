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
          content: "Você é um assistente especializado em ajudar com questões de estudo."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: max_tokens || 1000,
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