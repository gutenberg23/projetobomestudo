# Correção para o Erro ao Salvar 'Lei Seca'

## Problema
Ao tentar salvar uma 'Lei Seca', ocorre o seguinte erro:
```
Could not find the 'cursos_ids' column of 'leis_secas' in the schema cache
```

## Causa
A migração que adiciona a coluna [cursos_ids](file://c:\Users\galmeida\Desktop\projetobomestudo\src\pages\admin\LeisSecasAdmin.tsx#L21-L21) à tabela [leis_secas](file://c:\Users\galmeida\Desktop\projetobomestudo\src\integrations\supabase\types.ts#L798-L848) não foi aplicada corretamente ao banco de dados, mesmo estando presente nos arquivos de migração.

## Solução

### Passo 1: Aplicar a migração manualmente
Execute o script `FIX_LEIS_SECAS_MIGRATION.sql` no banco de dados como administrador:

```sql
-- Adicionar coluna para múltiplos cursos em leis secas
ALTER TABLE public.leis_secas 
ADD COLUMN IF NOT EXISTS cursos_ids UUID[];

-- Atualizar dados existentes para garantir compatibilidade
UPDATE public.leis_secas 
SET cursos_ids = ARRAY[curso_id]::UUID[]
WHERE cursos_ids IS NULL OR cursos_ids = '{}';
```

### Passo 2: Verificar se a coluna foi adicionada
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'leis_secas' AND column_name = 'cursos_ids';
```

### Passo 3: Regenerar os tipos TypeScript (se possível)
Se tiver acesso ao ambiente de desenvolvimento com as credenciais corretas:
```bash
npx supabase gen types typescript --project-id seu-project-id > src/integrations/supabase/types.ts
```

### Passo 4: Reiniciar a aplicação
Após aplicar a migração, reinicie a aplicação para garantir que o cache do esquema seja atualizado.

## Arquivos modificados
1. `src/integrations/supabase/types.ts` - Adicionada a definição da coluna [cursos_ids](file://c:\Users\galmeida\Desktop\projetobomestudo\src\pages\admin\LeisSecasAdmin.tsx#L21-L21)
2. `supabase/migrations/20251010005500_add_cursos_ids_to_leis_secas.sql` - Migração original
3. `supabase/migrations/20251010005700_fix_leis_secas_cursos_ids.sql` - Migração de correção

## Verificação
Após aplicar a correção, tente salvar uma 'Lei Seca' novamente. O erro não deve mais ocorrer.