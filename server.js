import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Inicializar o cliente OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, max_tokens, temperature, top_p, frequency_penalty, presence_penalty } = req.body;

    console.log('Iniciando chamada à API do OpenAI...');
    console.log('Prompt:', prompt);

    // Fazer a chamada à API do OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Você é um assistente especializado em explicar questões de concursos de forma clara e didática."
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

    console.log('Resposta recebida da API:', completion.choices[0].message.content);

    // Retornar a resposta
    res.json({
      choices: [{
        text: completion.choices[0].message.content
      }]
    });
  } catch (error) {
    console.error('Erro detalhado ao gerar resposta:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Erro ao gerar resposta da IA'
    });
  }
});

// Endpoint para proxy de conteúdo web (contornar CORS)
app.get('/api/proxy-content', async (req, res) => {
  try {
    const targetUrl = req.query.url;

    if (!targetUrl) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    // Validar se é uma URL válida
    try {
      new URL(targetUrl);
    } catch {
      return res.status(400).json({ error: 'Invalid URL' });
    }

    // Fazer a requisição para a URL alvo com axios
    const response = await axios.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      responseType: 'text',
      timeout: 15000, // Aumentar timeout para 15 segundos
    });

    res.set({
      'Content-Type': response.headers['content-type'] || 'text/html; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    });

    res.send(response.data);
  } catch (error) {
    console.error('Proxy error details:', {
      message: error.message,
      url: targetUrl,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data
      } : 'No response received'
    });

    if (axios.isAxiosError(error)) {
      res.status(error.response?.status || 500).json({ 
        error: `Failed to fetch content: ${error.message}`,
        details: error.response?.data
      });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});