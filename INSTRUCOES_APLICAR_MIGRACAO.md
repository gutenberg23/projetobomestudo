# Instruções para Aplicar a Migração

## Problema Identificado
A tabela `disciplinaverticalizada` não existe no banco de dados, por isso os links não estão aparecendo na página do curso.

## Solução Implementada
Modifiquei o código para usar a tabela `disciplinas` existente e adicionar os campos necessários.

## Passos para Aplicar a Migração

### 1. Acesse o Painel do Supabase
- Vá para: https://ukkatmoathxhbaelstzo.supabase.co
- Faça login na sua conta
- Vá para a seção "SQL Editor"

### 2. Execute o Script SQL
Copie e cole o seguinte script no SQL Editor e execute:

```sql
-- Verificar estrutura atual da tabela disciplinas
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'disciplinas' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Adicionar campos necessários à tabela disciplinas
DO $$
BEGIN
    -- Adicionar campo topicos se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'disciplinas' 
        AND column_name = 'topicos'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.disciplinas ADD COLUMN topicos TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Campo topicos adicionado à tabela disciplinas';
    ELSE
        RAISE NOTICE 'Campo topicos já existe na tabela disciplinas';
    END IF;

    -- Adicionar campo links se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'disciplinas' 
        AND column_name = 'links'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.disciplinas ADD COLUMN links TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Campo links adicionado à tabela disciplinas';
    ELSE
        RAISE NOTICE 'Campo links já existe na tabela disciplinas';
    END IF;

    -- Adicionar campo importancia se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'disciplinas' 
        AND column_name = 'importancia'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.disciplinas ADD COLUMN importancia INTEGER[] DEFAULT '{}';
        RAISE NOTICE 'Campo importancia adicionado à tabela disciplinas';
    ELSE
        RAISE NOTICE 'Campo importancia já existe na tabela disciplinas';
    END IF;
END $$;

-- Criar tabela cursoverticalizado se não existir
CREATE TABLE IF NOT EXISTS public.cursoverticalizado (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  curso_id TEXT NOT NULL,
  disciplinas_ids TEXT[] DEFAULT '{}',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Criar função update_updated_at_column se não existir
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Adicionar trigger para cursoverticalizado
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_cursoverticalizado_updated_at'
        AND event_object_table = 'cursoverticalizado'
    ) THEN
        CREATE TRIGGER update_cursoverticalizado_updated_at
        BEFORE UPDATE ON public.cursoverticalizado
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE 'Trigger adicionado à tabela cursoverticalizado';
    ELSE
        RAISE NOTICE 'Trigger já existe na tabela cursoverticalizado';
    END IF;
END $$;

-- Verificar estrutura final
SELECT 'disciplinas' as tabela, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'disciplinas' 
AND table_schema = 'public'
UNION ALL
SELECT 'cursoverticalizado' as tabela, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'cursoverticalizado' 
AND table_schema = 'public'
ORDER BY tabela, column_name;
```

### 3. Verificar se a Migração Foi Aplicada
Após executar o script, você deve ver:
- Mensagens de sucesso indicando que os campos foram adicionados
- A estrutura final das tabelas mostrando os novos campos

### 4. Testar a Funcionalidade
1. Acesse a página administrativa: `/admin/edital`
2. Crie uma nova disciplina com links nos tópicos
3. Acesse a página do curso: `/course/:CourseId`
4. Vá para a aba "Edital"
5. Verifique se os links aparecem na coluna "Link" da tabela

## Arquivos Modificados
- `src/pages/admin/components/edital/hooks/useEditalActions.ts`
- `src/components/course/hooks/useEditorializedData.ts`
- `src/components/course/components/SubjectTable.tsx`
- `src/integrations/supabase/types.ts`

## Status
✅ Código modificado e pronto
⏳ Aguardando aplicação da migração no banco de dados
