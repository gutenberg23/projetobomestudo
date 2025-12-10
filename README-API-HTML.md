# API de Reescrita e Postagem de Notícias via HTML

Esta funcionalidade permite reescrever notícias em HTML automaticamente utilizando inteligência artificial e postar diretamente no blog.

## Como Funciona

1. Um conteúdo HTML é enviado para a API
2. A IA do Google Gemini analisa o conteúdo HTML
3. A IA reescreve o conteúdo como uma postagem completa com título, resumo, conteúdo formatado, tags, etc.
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
supabase functions deploy rewrite-and-post-news
```

### 3. Configurar permissões

A função precisa de permissões para inserir dados na tabela `blog_posts`. Certifique-se de que as políticas de segurança permitem isso.

## Uso

Veja o arquivo `EXEMPLO_ENVIO_HTML_API.md` para detalhes sobre como enviar HTML para a API.

## Estrutura da Função

- `supabase/functions/rewrite-and-post-news/index.ts` - Código principal da função
- `supabase/functions/rewrite-and-post-news/import_map.json` - Mapeamento de imports

## Personalização

Você pode personalizar o comportamento da IA modificando as instruções do sistema (`systemInstruction`) e o schema de resposta (`blogPostSchema`) no arquivo `index.ts`.

## Integração com N8N

A API foi projetada especificamente para integração com N8N. Configure um fluxo no N8N que:

1. Recebe conteúdo HTML (por webhook, scraping, etc.)
2. Envia para esta API
3. Processa a resposta

## Limitações

- O tamanho máximo do conteúdo HTML depende dos limites da função Supabase
- O tempo de processamento pode variar conforme a complexidade do conteúdo
- A qualidade do post gerado depende da clareza e organização do conteúdo HTML de entrada