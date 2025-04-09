-- Script para corrigir a estrutura da tabela profiles e recarregar o schema
DO $$
BEGIN
  -- 1. Verificar e corrigir a estrutura da tabela profiles
  
  -- Verificar se a tabela profiles existe, se não, criá-la
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles'
  ) THEN
    CREATE TABLE public.profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      email TEXT NOT NULL,
      nome TEXT NOT NULL,
      sobrenome TEXT,
      foto_url TEXT,
      foto_perfil TEXT,
      role TEXT,
      nivel TEXT,
      status TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    RAISE NOTICE 'Tabela profiles criada com sucesso';
  END IF;
  
  -- 2. Adicionar colunas necessárias se não existirem
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'foto_perfil') THEN
    ALTER TABLE public.profiles ADD COLUMN foto_perfil TEXT;
    RAISE NOTICE 'Coluna foto_perfil adicionada';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'nome_social') THEN
    ALTER TABLE public.profiles ADD COLUMN nome_social TEXT;
    RAISE NOTICE 'Coluna nome_social adicionada';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'nascimento') THEN
    ALTER TABLE public.profiles ADD COLUMN nascimento DATE;
    RAISE NOTICE 'Coluna nascimento adicionada';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'sexo') THEN
    ALTER TABLE public.profiles ADD COLUMN sexo TEXT;
    RAISE NOTICE 'Coluna sexo adicionada';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'escolaridade') THEN
    ALTER TABLE public.profiles ADD COLUMN escolaridade TEXT;
    RAISE NOTICE 'Coluna escolaridade adicionada';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'estado_civil') THEN
    ALTER TABLE public.profiles ADD COLUMN estado_civil TEXT;
    RAISE NOTICE 'Coluna estado_civil adicionada';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'celular') THEN
    ALTER TABLE public.profiles ADD COLUMN celular TEXT;
    RAISE NOTICE 'Coluna celular adicionada';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'telefone') THEN
    ALTER TABLE public.profiles ADD COLUMN telefone TEXT;
    RAISE NOTICE 'Coluna telefone adicionada';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'cep') THEN
    ALTER TABLE public.profiles ADD COLUMN cep TEXT;
    RAISE NOTICE 'Coluna cep adicionada';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'endereco') THEN
    ALTER TABLE public.profiles ADD COLUMN endereco TEXT;
    RAISE NOTICE 'Coluna endereco adicionada';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'numero') THEN
    ALTER TABLE public.profiles ADD COLUMN numero TEXT;
    RAISE NOTICE 'Coluna numero adicionada';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'bairro') THEN
    ALTER TABLE public.profiles ADD COLUMN bairro TEXT;
    RAISE NOTICE 'Coluna bairro adicionada';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'complemento') THEN
    ALTER TABLE public.profiles ADD COLUMN complemento TEXT;
    RAISE NOTICE 'Coluna complemento adicionada';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'estado') THEN
    ALTER TABLE public.profiles ADD COLUMN estado TEXT;
    RAISE NOTICE 'Coluna estado adicionada';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'cidade') THEN
    ALTER TABLE public.profiles ADD COLUMN cidade TEXT;
    RAISE NOTICE 'Coluna cidade adicionada';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'cursos_favoritos') THEN
    ALTER TABLE public.profiles ADD COLUMN cursos_favoritos TEXT[] DEFAULT '{}';
    RAISE NOTICE 'Coluna cursos_favoritos adicionada';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'disciplinas_favoritos') THEN
    ALTER TABLE public.profiles ADD COLUMN disciplinas_favoritos TEXT[] DEFAULT '{}';
    RAISE NOTICE 'Coluna disciplinas_favoritos adicionada';
  END IF;
  
  -- 3. Remover a tabela perfil se existir para evitar confusão
  DROP TABLE IF EXISTS public.perfil;
  RAISE NOTICE 'Tabela perfil excluída se existia';
  
  -- 4. Configurar permissões de acesso
  ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
  
  DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
  CREATE POLICY "Enable read access for all users" 
    ON public.profiles FOR SELECT 
    USING (true);
  
  DROP POLICY IF EXISTS "Enable update for users based on id" ON public.profiles;
  CREATE POLICY "Enable update for users based on id" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);
  
  ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
  
  -- 5. Recarregar o schema do PostgREST para aplicar as alterações
  NOTIFY pgrst, 'reload schema';
  
  RAISE NOTICE 'Estrutura da tabela profiles atualizada e schema recarregado com sucesso';
END $$; 