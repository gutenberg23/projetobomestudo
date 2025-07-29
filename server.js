import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import axios from 'axios';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const port = 3000;

// Configurar cliente do Supabase (opcional)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
let supabase = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('Supabase configurado com sucesso');
} else {
  console.log('Supabase não configurado - variáveis de ambiente não encontradas');
}

app.use(cors());
app.use(express.json());
// Servir arquivos de upload
app.use('/uploads', express.static('uploads'));

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { rootFolder, path: uploadPath } = req.body;
    const fullPath = path.join('uploads', rootFolder, uploadPath || '');
    
    // Criar diretório se não existir
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
    
    cb(null, fullPath);
  },
  filename: (req, file, cb) => {
    // Manter o nome original do arquivo
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

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
      model: "gpt-4o-mini",
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
      max_tokens: max_tokens || 16384,
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

// Endpoint para listar arquivos e pastas
app.get('/api/files', (req, res) => {
  try {
    const { path: requestPath, rootFolder } = req.query;
    const fullPath = path.join('uploads', rootFolder, requestPath || '');
    
    // Criar diretório se não existir
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      return res.json({ files: [] });
    }
    
    const items = fs.readdirSync(fullPath, { withFileTypes: true });
    const files = items.map((item, index) => {
      const itemPath = path.join(fullPath, item.name);
      const stats = fs.statSync(itemPath);
      const relativePath = path.join(requestPath || '', item.name).replace(/\\/g, '/');
      
      return {
        id: `${Date.now()}-${index}`,
        name: item.name,
        type: item.isDirectory() ? 'folder' : 'file',
        path: relativePath,
        url: item.isFile() ? `http://localhost:3000/uploads/${rootFolder}/${relativePath}` : undefined,
        size: item.isFile() ? stats.size : undefined,
        createdAt: stats.birthtime
      };
    });
    
    res.json({ files });
  } catch (error) {
    console.error('Erro ao listar arquivos:', error);
    res.status(500).json({ error: 'Erro ao listar arquivos' });
  }
});

// Endpoint para upload de arquivos
app.post('/api/files/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }
    
    const { rootFolder, path: uploadPath } = req.body;
    const relativePath = path.join(uploadPath || '', req.file.filename).replace(/\\/g, '/');
    const url = `http://localhost:3000/uploads/${rootFolder}/${relativePath}`;
    
    res.json({
      id: Date.now().toString(),
      filename: req.file.filename,
      url: url,
      size: req.file.size
    });
  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({ error: 'Erro no upload do arquivo' });
  }
});

// Endpoint para criar pasta
app.post('/api/files/folder', (req, res) => {
  try {
    const { name, path: requestPath, rootFolder } = req.body;
    const fullPath = path.join('uploads', rootFolder, requestPath || '', name);
    
    if (fs.existsSync(fullPath)) {
      return res.status(400).json({ error: 'Pasta já existe' });
    }
    
    fs.mkdirSync(fullPath, { recursive: true });
    res.json({ success: true, path: fullPath });
  } catch (error) {
    console.error('Erro ao criar pasta:', error);
    res.status(500).json({ error: 'Erro ao criar pasta' });
  }
});

// Endpoint para excluir arquivo
app.delete('/api/files/file', (req, res) => {
  try {
    const { path: filePath, rootFolder } = req.body;
    const fullPath = path.join('uploads', rootFolder, filePath);
    
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'Arquivo não encontrado' });
    }
    
    fs.unlinkSync(fullPath);
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir arquivo:', error);
    res.status(500).json({ error: 'Erro ao excluir arquivo' });
  }
});

// Endpoint para excluir pasta
app.delete('/api/files/folder', (req, res) => {
  try {
    const { path: folderPath, rootFolder } = req.body;
    const fullPath = path.join('uploads', rootFolder, folderPath);
    
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'Pasta não encontrada' });
    }
    
    // Excluir pasta recursivamente
    fs.rmSync(fullPath, { recursive: true, force: true });
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir pasta:', error);
    res.status(500).json({ error: 'Erro ao excluir pasta' });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});