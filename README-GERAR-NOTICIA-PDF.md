# Funcionalidade de Geração Automática de Notícias via PDF

## Descrição

Esta funcionalidade permite gerar automaticamente postagens de blog com base em arquivos PDF contendo informações sobre concursos públicos. Ao fazer upload de um PDF e clicar no botão "Gerar Notícia", o sistema utiliza a inteligência artificial do Google Gemini para analisar o conteúdo do PDF e preencher automaticamente os campos do formulário de criação de post.

## Como Usar

1. Acesse a página de criação de posts (`/admin/posts`)
2. Na seção "Gerar Notícia via PDF", clique em "Selecionar PDF"
3. Escolha um arquivo PDF contendo informações sobre concursos públicos
4. Após o upload ser concluído, clique no botão "Gerar Notícia"
5. Aguarde o processamento (isso pode levar alguns segundos)
6. Os campos do formulário serão preenchidos automaticamente com as informações extraídas
7. Revise as informações e faça ajustes se necessário
8. Publique o post

## Campos Preenchidos Automaticamente

- **Título**: Título atraente e informativo para a postagem
- **Resumo**: Resumo conciso da postagem (máximo 240 caracteres)
- **Categoria**: Categoria principal da notícia (ex: 'Concursos')
- **Conteúdo**: Conteúdo completo da postagem em formato HTML
- **Região**: Região do Brasil do concurso
- **Estado**: Estado brasileiro do concurso (sigla maiúscula)
- **Tags**: Lista de 3 a 5 tags relevantes
- **Meta Descrição**: Meta descrição otimizada para SEO (máximo 160 caracteres)
- **Palavras-chave**: Lista de 3 a 5 palavras-chave para SEO

## Requisitos Técnicos

- Conta configurada no Google Gemini com API key
- Variável de ambiente `GOOGLE_GEMINI_API_KEY` configurada no Supabase
- Função Edge do Supabase `generate-question-explanation` implantada
- Bucket `blog-pdfs` criado no Storage do Supabase

## Estrutura do Código

- Componente: `src/pages/admin/posts/components/formulario/FormularioPDF.tsx`
- Migration: `supabase/migrations/20251104000000_create_blog_pdfs_bucket.sql`

## Como Funciona

1. O usuário faz upload de um PDF
2. O PDF é armazenado no bucket `blog-pdfs` do Supabase
3. A URL do PDF é enviada para o Google Gemini através da função Edge do Supabase
4. A IA analisa o conteúdo e gera uma postagem de blog completa em formato JSON
5. O sistema recebe a resposta e preenche os campos do formulário
6. Os dados são validados antes de serem aplicados ao formulário

## Personalização

O prompt enviado para o Google Gemini pode ser ajustado no componente `FormularioPDF.tsx` para modificar o comportamento da IA.