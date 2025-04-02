-- Adicionar novos campos na tabela profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS sobrenome text,
ADD COLUMN IF NOT EXISTS nome_social text,
ADD COLUMN IF NOT EXISTS nascimento date,
ADD COLUMN IF NOT EXISTS sexo text,
ADD COLUMN IF NOT EXISTS escolaridade text,
ADD COLUMN IF NOT EXISTS estado_civil text,
ADD COLUMN IF NOT EXISTS celular text,
ADD COLUMN IF NOT EXISTS telefone text,
ADD COLUMN IF NOT EXISTS cep text,
ADD COLUMN IF NOT EXISTS endereco text,
ADD COLUMN IF NOT EXISTS numero text,
ADD COLUMN IF NOT EXISTS bairro text,
ADD COLUMN IF NOT EXISTS complemento text,
ADD COLUMN IF NOT EXISTS estado text,
ADD COLUMN IF NOT EXISTS cidade text,
ADD COLUMN IF NOT EXISTS foto_perfil text;

-- Criar bucket para imagens de perfil se não existir
INSERT INTO storage.buckets (id, name)
SELECT 'images', 'images'
WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'images'
);

-- Configurar políticas de acesso para o bucket de imagens
CREATE POLICY "Permitir leitura pública das imagens"
ON storage.objects FOR SELECT
USING ( bucket_id = 'images' );

CREATE POLICY "Permitir upload de imagens para usuários autenticados"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'images'
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Permitir atualização de imagens próprias"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'images'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Permitir exclusão de imagens próprias"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'images'
    AND auth.uid()::text = (storage.foldername(name))[1]
); 