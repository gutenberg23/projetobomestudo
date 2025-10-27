const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');

dotenv.config();

const app = express();
const port = 3000;

// Configurar cliente do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(cors());
app.use(express.json());
// Servir arquivos estáticos da pasta public
app.use(express.static('public'));
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

// Rota dinâmica para robots.txt
app.get('/robots.txt', async (req, res) => {
  try {
    // Buscar o conteúdo do robots.txt do banco de dados
    const { data, error } = await supabase
      .from('configuracoes_site')
      .select('valor')
      .eq('chave', 'seo_config')
      .single();
    
    // Definir conteúdo padrão caso não encontre no banco
    let robotsContent = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /dashboard/
Disallow: */admin/*

# Sitemap
Sitemap: https://bomestudo.com.br/sitemap.xml`;

    // Se encontrou dados, extrair o robotsTxt
    if (data && data.valor) {
      try {
        const seoConfig = JSON.parse(data.valor);
        if (seoConfig.robotsTxt) {
          robotsContent = seoConfig.robotsTxt;
        }
      } catch (parseError) {
        console.error('Erro ao fazer parse do valor da configuração:', parseError);
      }
    }
    
    // Retornar o conteúdo como texto plano
    res.setHeader('Content-Type', 'text/plain');
    res.send(robotsContent);
  } catch (error) {
    console.error('Erro ao buscar robots.txt:', error);
    res.status(500).send('Erro ao buscar configurações do robots.txt');
  }
});

// Rota dinâmica para sitemap.xml
app.get('/sitemap.xml', async (req, res) => {
  try {
    // Importar a função de geração de sitemap
    const { generateSitemapXML } = await import('./src/services/sitemapService');
    
    // Gerar o conteúdo do sitemap
    const sitemapContent = await generateSitemapXML();
    
    // Retornar o conteúdo como XML
    res.setHeader('Content-Type', 'application/xml');
    res.send(sitemapContent);
  } catch (error) {
    console.error('Erro ao gerar sitemap.xml:', error);
    res.status(500).send('Erro ao gerar sitemap');
  }
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
    const targetUrl = req.query.url as string;
    console.log('Proxy request for URL:', targetUrl);

    if (!targetUrl) {
      console.log('Missing URL parameter');
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    // Validar se é uma URL válida
    try {
      new URL(targetUrl);
    } catch {
      console.log('Invalid URL format:', targetUrl);
      return res.status(400).json({ error: 'Invalid URL' });
    }

    // Fazer a requisição para a URL alvo com timeout e retry
    const fetch = (await import('node-fetch')).default;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos timeout
    
    try {
      console.log('Fetching content from:', targetUrl);
      const response = await fetch(targetUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
          'Sec-Ch-Ua-Mobile': '?0',
          'Sec-Ch-Ua-Platform': '"Windows"',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Upgrade-Insecure-Requests': '1',
        },
        follow: 5 // Seguir até 5 redirects
      });
      
      clearTimeout(timeoutId);
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        console.log(`Failed to fetch content: ${response.status} ${response.statusText}`);
        return res.status(response.status).json({ 
          error: `Failed to fetch: ${response.status} ${response.statusText}` 
        });
      }

      const content = await response.text();
      console.log('Content length:', content.length);
      
      // Verificar se o conteúdo não está vazio
      if (!content || content.trim().length === 0) {
        console.log('Empty content received');
        return res.status(204).json({ error: 'Empty content received' });
      }

      res.set({
        'Content-Type': 'text/html; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      });

      res.send(content);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('Fetch error:', fetchError);
      
      if (fetchError.name === 'AbortError') {
        return res.status(408).json({ error: 'Request timeout' });
      }
      
      throw fetchError;
    }
  } catch (error) {
    console.error('Proxy error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// Atualizar o endpoint update-robots-txt para salvar apenas no banco de dados
app.post('/api/update-robots-txt', async (req, res) => {
  try {
    // Verificar autenticação (simplificado)
    // Em produção, você deve implementar autenticação adequada aqui
    
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Conteúdo não fornecido' });
    }

    // Buscar a configuração atual
    const { data } = await supabase
      .from('configuracoes_site')
      .select('valor')
      .eq('chave', 'seo_config')
      .single();
    
    let seoConfig = { robotsTxt: '' };
    if (data && data.valor) {
      try {
        seoConfig = JSON.parse(data.valor);
      } catch (error) {
        console.error('Erro ao fazer parse da configuração:', error);
      }
    }
    
    // Atualizar apenas o campo robotsTxt
    seoConfig.robotsTxt = content;
    
    // Salvar de volta no banco
    const { error } = await supabase
      .from('configuracoes_site')
      .upsert({
        chave: 'seo_config',
        valor: JSON.stringify(seoConfig),
        updated_at: new Date().toISOString()
      }, { onConflict: 'chave' });
    
    if (error) {
      console.error('Erro ao atualizar configuração:', error);
      return res.status(500).json({ error: 'Erro ao atualizar configuração' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar robots.txt:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Erro ao atualizar arquivo robots.txt'
    });
  }
});

// Endpoint para listar arquivos e pastas
app.get('/api/files', (req, res) => {
  try {
    const { path: requestPath, rootFolder } = req.query;
    const fullPath = path.join('uploads', rootFolder as string, requestPath as string || '');
    
    // Criar diretório se não existir
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      return res.json({ files: [] });
    }
    
    const items = fs.readdirSync(fullPath, { withFileTypes: true });
    const files = items.map((item, index) => {
      const itemPath = path.join(fullPath, item.name);
      const stats = fs.statSync(itemPath);
      const relativePath = path.join(requestPath as string || '', item.name).replace(/\\/g, '/');
      
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
  console.log(`Servidor API rodando em http://localhost:${port}`);
});