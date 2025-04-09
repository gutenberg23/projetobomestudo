-- Adicionar campos de favoritos à tabela profiles
DO $$
BEGIN
  -- Adicionar coluna cursos_favoritos se não existir
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'cursos_favoritos'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN cursos_favoritos TEXT[] DEFAULT '{}';
    RAISE NOTICE 'Coluna "cursos_favoritos" adicionada com sucesso';
  ELSE
    RAISE NOTICE 'Coluna "cursos_favoritos" já existe na tabela';
  END IF;

  -- Adicionar coluna disciplinas_favoritos se não existir
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'disciplinas_favoritos'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN disciplinas_favoritos TEXT[] DEFAULT '{}';
    RAISE NOTICE 'Coluna "disciplinas_favoritos" adicionada com sucesso';
  ELSE
    RAISE NOTICE 'Coluna "disciplinas_favoritos" já existe na tabela';
  END IF;
END $$; 