-- Criar bucket para uploads do sistema se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('lovable-uploads', 'Lovable Uploads', true)
ON CONFLICT (id) DO
UPDATE SET public = true;

-- Remover políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "Permitir leitura pública dos uploads" ON storage.objects;
DROP POLICY IF EXISTS "Permitir upload para usuários autenticados" ON storage.objects;
DROP POLICY IF EXISTS "Permitir atualização de uploads" ON storage.objects;
DROP POLICY IF EXISTS "Permitir exclusão de uploads" ON storage.objects;

-- Configurar políticas de acesso para o bucket de uploads
CREATE POLICY "Permitir leitura pública dos uploads"
ON storage.objects FOR SELECT
USING (bucket_id = 'lovable-uploads');

CREATE POLICY "Permitir upload para usuários autenticados"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'lovable-uploads'
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Permitir atualização de uploads"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'lovable-uploads'
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Permitir exclusão de uploads"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'lovable-uploads'
    AND auth.role() = 'authenticated'
); 