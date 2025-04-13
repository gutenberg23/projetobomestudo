const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
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
Sitemap: https://seusite.com.br/sitemap.xml`;

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

app.listen(port, () => {
  console.log(`Servidor API rodando em http://localhost:${port}`);
}); 