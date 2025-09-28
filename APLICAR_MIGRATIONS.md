# Instruções para aplicar as migrations manualmente

## Passos para aplicar as migrations

1. Acesse o painel do Supabase em https://app.supabase.com
2. Selecione seu projeto
3. Vá para a seção "SQL Editor" no menu lateral
4. Execute as seguintes migrations na ordem:

### Migration 1: Adicionar colunas de assuntos e tópicos
```sql
-- Adicionar colunas de assuntos e tópicos à tabela disciplinaverticalizada
ALTER TABLE public.disciplinaverticalizada
ADD COLUMN IF NOT EXISTS assuntos TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS topicos_filtro TEXT[] DEFAULT '{}';
```

### Migration 2: Adicionar colunas para filtros de disciplina e banca
```sql
-- Adicionar colunas para filtros de disciplina e banca à tabela disciplinaverticalizada
ALTER TABLE public.disciplinaverticalizada
ADD COLUMN IF NOT EXISTS disciplinas_filtro TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS bancas_filtro TEXT[] DEFAULT '{}';
```

5. Após executar as migrations, verifique se as colunas foram adicionadas corretamente executando:
```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'disciplinaverticalizada'
ORDER BY ordinal_position;
```

6. Se todas as colunas estiverem presentes, a implementação estará completa.