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