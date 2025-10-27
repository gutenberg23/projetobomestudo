# Funcionalidade de Rastreamento de Posts RSS Transmitidos

## Descrição

Esta funcionalidade permite rastrear quais posts de feeds RSS já foram transmitidos para o blog, evitando a duplicação de conteúdo e permitindo ao administrador identificar facilmente quais posts já foram utilizados.

## Funcionamento

1. Quando um post RSS é transmitido (botão "Transmitir"), ele é registrado na tabela `rss_transmitidos`
2. Na listagem de posts RSS, os itens já transmitidos são visualmente destacados com um badge "Transmitido" e fundo azul claro
3. É possível transmitir novamente um post já transmitido, mas ele continuará marcado como tal

## Estrutura de Dados

### Tabela `rss_transmitidos`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único |
| rss_item_guid | TEXT | GUID do item RSS (único) |
| rss_item_link | TEXT | Link do item RSS |
| rss_feed_name | TEXT | Nome do feed RSS |
| blog_post_id | UUID | ID do post criado no blog (referência) |
| created_at | TIMESTAMP | Data de criação |

## Componentes

### RSSManager.tsx

- Adicionada coluna "Status" na tabela de posts
- Badge "Transmitido" para posts já processados
- Fundo azul claro para linhas de posts transmitidos
- Carregamento automático dos itens transmitidos ao abrir a listagem

### rssService.ts

- Nova função `registerTransmittedRSSItem` para registrar itens transmitidos
- Nova função `fetchAllTransmittedRSSItems` para buscar todos os itens transmitidos
- Atualização da função `handleTransmitPost` para registrar automaticamente o item

## Migração do Banco de Dados

Execute o script SQL em `scripts/create_rss_transmitidos_table.sql` para criar a tabela necessária:

```sql
-- Criação da tabela para rastrear posts RSS transmitidos
CREATE TABLE IF NOT EXISTS rss_transmitidos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rss_item_guid TEXT NOT NULL,
  rss_item_link TEXT NOT NULL,
  rss_feed_name TEXT NOT NULL,
  blog_post_id UUID REFERENCES blog_posts(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(rss_item_guid)
);

-- Adicionar índices para melhorar a performance
CREATE INDEX IF NOT EXISTS idx_rss_transmitidos_guid ON rss_transmitidos(rss_item_guid);
CREATE INDEX IF NOT EXISTS idx_rss_transmitidos_link ON rss_transmitidos(rss_item_link);
CREATE INDEX IF NOT EXISTS idx_rss_transmitidos_feed_name ON rss_transmitidos(rss_feed_name);
CREATE INDEX IF NOT EXISTS idx_rss_transmitidos_blog_post_id ON rss_transmitidos(blog_post_id);
```

## Benefícios

- Evita duplicação acidental de conteúdo
- Permite identificar rapidamente posts já utilizados
- Mantém a flexibilidade de retransmitir posts quando necessário
- Melhora a experiência do administrador ao gerenciar conteúdo RSS

## Uso

1. Acesse a página "admin/posts"
2. Clique em "RSS Manager"
3. Clique em "Sincronizar Todos" para carregar os posts
4. Na listagem, os posts já transmitidos aparecerão com destaque visual
5. Clique em "Transmitir" para processar novos posts