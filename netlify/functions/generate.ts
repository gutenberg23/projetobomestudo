import { Handler } from '@netlify/functions';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Método não permitido' }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { prompt, max_tokens, temperature, top_p, frequency_penalty, presence_penalty } = body;

    if (!prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Prompt é obrigatório' }),
      };
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
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

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: JSON.stringify({
        choices: [{
          text: completion.choices[0].message.content
        }]
      }),
    };
  } catch (error) {
    console.error('Erro:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: JSON.stringify({ error: 'Erro interno do servidor' }),
    };
  }
}; 