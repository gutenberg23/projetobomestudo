-- Criar bucket para imagens do blog se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'Blog Images', true)
ON CONFLICT (id) DO
UPDATE SET public = true;

-- Remover políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "Permitir leitura pública das imagens do blog" ON storage.objects;
DROP POLICY IF EXISTS "Permitir upload de imagens do blog para usuários autenticados" ON storage.objects;
DROP POLICY IF EXISTS "Permitir atualização de imagens do blog" ON storage.objects;
DROP POLICY IF EXISTS "Permitir exclusão de imagens do blog" ON storage.objects;

-- Configurar políticas de acesso para o bucket de imagens do blog
CREATE POLICY "Permitir leitura pública das imagens do blog"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-images');

CREATE POLICY "Permitir upload de imagens do blog para usuários autenticados"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'blog-images'
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Permitir atualização de imagens do blog"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'blog-images'
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Permitir exclusão de imagens do blog"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'blog-images'
    AND auth.role() = 'authenticated'
); 