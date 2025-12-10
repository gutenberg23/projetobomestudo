# API de Criação de Posts via PDF

Esta funcionalidade permite criar posts no blog automaticamente a partir de arquivos PDF, utilizando inteligência artificial para extrair e formatar o conteúdo.

## Como Funciona

1. Um PDF é enviado para a API
2. A IA do Google Gemini analisa o conteúdo do PDF
3. A IA gera um post completo com título, resumo, conteúdo formatado, tags, etc.
4. O post é automaticamente criado no banco de dados do blog

## Implantação

### 1. Configurar variáveis de ambiente

Certifique-se de que as seguintes variáveis de ambiente estão configuradas no seu projeto Supabase:

- `GOOGLE_GEMINI_API_KEY` - Chave de API do Google Gemini
- `SUPABASE_URL` - URL do seu projeto Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Chave de serviço do Supabase

### 2. Implantar a função

Execute o seguinte comando na raiz do projeto:

```bash
supabase functions deploy create-blog-post-from-pdf
```

### 3. Configurar permissões

A função precisa de permissões para inserir dados na tabela `blog_posts`. Certifique-se de que as políticas de segurança permitem isso.

## Uso

Veja o arquivo `EXEMPLO_ENVIO_PDF_API.md` para detalhes sobre como enviar PDFs para a API.

## Estrutura da Função

- `supabase/functions/create-blog-post-from-pdf/index.ts` - Código principal da função
- `supabase/functions/create-blog-post-from-pdf/import_map.json` - Mapeamento de imports

## Personalização

Você pode personalizar o comportamento da IA modificando as instruções do sistema (`systemInstruction`) e o schema de resposta (`blogPostSchema`) no arquivo `index.ts`.

## Testes

Use o script `test-api-pdf.js` para testar a função localmente:

```bash
node test-api-pdf.js caminho/para/seu-arquivo.pdf
```

## Integração com N8N

A API foi projetada especificamente para integração com N8N. Configure um fluxo no N8N que:

1. Recebe um PDF (por webhook, email, etc.)
2. Converte o PDF para base64
3. Envia para esta API
4. Processa a resposta

## Limitações

- O tamanho máximo do PDF depende dos limites da função Supabase (atualmente 50MB)
- O tempo de processamento pode variar conforme a complexidade do PDF
- A qualidade do post gerado depende da clareza e organização do conteúdo no PDF