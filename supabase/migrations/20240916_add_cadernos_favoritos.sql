-- Adicionar campo cadernos_favoritos à tabela profiles
DO $$
BEGIN
  -- Adicionar coluna cadernos_favoritos se não existir
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'cadernos_favoritos'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN cadernos_favoritos UUID[] DEFAULT '{}';
    RAISE NOTICE 'Coluna "cadernos_favoritos" adicionada com sucesso';
  ELSE
    RAISE NOTICE 'Coluna "cadernos_favoritos" já existe na tabela';
  END IF;
  
  -- Forçar atualização do cache do schema
  NOTIFY pgrst, 'reload schema';
  
  RAISE NOTICE 'Coluna cadernos_favoritos adicionada com sucesso à tabela profiles e cache do schema atualizado';
END $$; 