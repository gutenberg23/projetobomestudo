-- Criação do bucket para armazenamento de PDFs de posts do blog
-- Este bucket será usado para a funcionalidade de geração automática de notícias via PDF

-- Criar o bucket 'blog-pdfs' para armazenar os PDFs enviados
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-pdfs', 'blog-pdfs', true)
ON CONFLICT (id) DO NOTHING;

-- Remover políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "Permitir leitura pública de PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Permitir upload autenticado de PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Permitir atualização autenticada de PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Permitir deleção autenticada de PDFs" ON storage.objects;

-- Criar políticas de acesso para o bucket 'blog-pdfs'
-- Política para permitir leitura pública de PDFs
CREATE POLICY "Permitir leitura pública de PDFs"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'blog-pdfs');

-- Política para permitir upload autenticado de PDFs
CREATE POLICY "Permitir upload autenticado de PDFs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'blog-pdfs');

-- Política para permitir atualização autenticada de PDFs (apenas admins)
CREATE POLICY "Permitir atualização autenticada de PDFs"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'blog-pdfs' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
)
WITH CHECK (
  bucket_id = 'blog-pdfs' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);

-- Política para permitir deleção autenticada de PDFs (apenas admins)
CREATE POLICY "Permitir deleção autenticada de PDFs"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'blog-pdfs' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);

-- Garantir que o RLS esteja habilitado
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;