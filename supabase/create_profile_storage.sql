-- Criar bucket para fotos de perfil se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'Profile Photos', true)
ON CONFLICT (id) DO
UPDATE SET public = true;

-- Verificar se a extensão pgcrypto está habilitada
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Remover políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "Permitir leitura pública das fotos de perfil" ON storage.objects;
DROP POLICY IF EXISTS "Permitir upload de fotos para usuários autenticados" ON storage.objects;
DROP POLICY IF EXISTS "Permitir atualização de fotos próprias" ON storage.objects;
DROP POLICY IF EXISTS "Permitir exclusão de fotos próprias" ON storage.objects;

-- Configurar políticas de acesso para o bucket de fotos de perfil
CREATE POLICY "Permitir leitura pública das fotos de perfil"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-photos');

CREATE POLICY "Permitir upload de fotos para usuários autenticados"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'profile-photos'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Permitir atualização de fotos próprias"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'profile-photos'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Permitir exclusão de fotos próprias"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'profile-photos'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Também criar o bucket 'files' que é referenciado no código
INSERT INTO storage.buckets (id, name, public)
VALUES ('files', 'Files', true)
ON CONFLICT (id) DO
UPDATE SET public = true;

-- Políticas para o bucket 'files'
CREATE POLICY "Permitir leitura pública dos arquivos"
ON storage.objects FOR SELECT
USING (bucket_id = 'files');

CREATE POLICY "Permitir upload de arquivos para usuários autenticados"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'files'
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Permitir atualização de arquivos próprios"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'files'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Permitir exclusão de arquivos próprios"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'files'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
); 