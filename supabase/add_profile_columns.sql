-- Adicionar todas as colunas necessárias para o perfil do usuário
DO $$
BEGIN
  -- Lista de colunas a serem adicionadas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'foto_perfil') THEN
    ALTER TABLE public.profiles ADD COLUMN foto_perfil TEXT;
    RAISE NOTICE 'Coluna "foto_perfil" adicionada com sucesso';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'sobrenome') THEN
    ALTER TABLE public.profiles ADD COLUMN sobrenome TEXT;
    RAISE NOTICE 'Coluna "sobrenome" adicionada com sucesso';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'nome_social') THEN
    ALTER TABLE public.profiles ADD COLUMN nome_social TEXT;
    RAISE NOTICE 'Coluna "nome_social" adicionada com sucesso';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'nascimento') THEN
    ALTER TABLE public.profiles ADD COLUMN nascimento DATE;
    RAISE NOTICE 'Coluna "nascimento" adicionada com sucesso';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'sexo') THEN
    ALTER TABLE public.profiles ADD COLUMN sexo TEXT;
    RAISE NOTICE 'Coluna "sexo" adicionada com sucesso';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'escolaridade') THEN
    ALTER TABLE public.profiles ADD COLUMN escolaridade TEXT;
    RAISE NOTICE 'Coluna "escolaridade" adicionada com sucesso';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'estado_civil') THEN
    ALTER TABLE public.profiles ADD COLUMN estado_civil TEXT;
    RAISE NOTICE 'Coluna "estado_civil" adicionada com sucesso';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'celular') THEN
    ALTER TABLE public.profiles ADD COLUMN celular TEXT;
    RAISE NOTICE 'Coluna "celular" adicionada com sucesso';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'telefone') THEN
    ALTER TABLE public.profiles ADD COLUMN telefone TEXT;
    RAISE NOTICE 'Coluna "telefone" adicionada com sucesso';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'cep') THEN
    ALTER TABLE public.profiles ADD COLUMN cep TEXT;
    RAISE NOTICE 'Coluna "cep" adicionada com sucesso';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'endereco') THEN
    ALTER TABLE public.profiles ADD COLUMN endereco TEXT;
    RAISE NOTICE 'Coluna "endereco" adicionada com sucesso';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'numero') THEN
    ALTER TABLE public.profiles ADD COLUMN numero TEXT;
    RAISE NOTICE 'Coluna "numero" adicionada com sucesso';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'bairro') THEN
    ALTER TABLE public.profiles ADD COLUMN bairro TEXT;
    RAISE NOTICE 'Coluna "bairro" adicionada com sucesso';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'complemento') THEN
    ALTER TABLE public.profiles ADD COLUMN complemento TEXT;
    RAISE NOTICE 'Coluna "complemento" adicionada com sucesso';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'estado') THEN
    ALTER TABLE public.profiles ADD COLUMN estado TEXT;
    RAISE NOTICE 'Coluna "estado" adicionada com sucesso';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'cidade') THEN
    ALTER TABLE public.profiles ADD COLUMN cidade TEXT;
    RAISE NOTICE 'Coluna "cidade" adicionada com sucesso';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'cursos_favoritos') THEN
    ALTER TABLE public.profiles ADD COLUMN cursos_favoritos TEXT[] DEFAULT '{}';
    RAISE NOTICE 'Coluna "cursos_favoritos" adicionada com sucesso';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'disciplinas_favoritos') THEN
    ALTER TABLE public.profiles ADD COLUMN disciplinas_favoritos TEXT[] DEFAULT '{}';
    RAISE NOTICE 'Coluna "disciplinas_favoritos" adicionada com sucesso';
  END IF;
  
  -- Forçar atualização do cache do schema
  NOTIFY pgrst, 'reload schema';
  
  RAISE NOTICE 'Colunas adicionadas com sucesso à tabela profiles e cache do schema atualizado';
END $$; 