# Instruções para Aplicar a Migração do Banco de Dados

## Descrição
Esta atualização adiciona novas colunas à tabela `disciplinaverticalizada` para suportar os filtros personalizados por tópico de disciplina.

## Passos para Aplicar a Migração

### 1. Aplicar a Migração do Banco de Dados

Execute o script de migração:

```bash
node scripts/apply-migration-disciplina-filters.js
```

Alternativamente, você pode aplicar a migração manualmente:

```bash
npx supabase migration up --file supabase/supabase/migrations/20250428000000_add_assuntos_topicos_to_disciplinaverticalizada.sql
```

### 2. Verificar a Estrutura do Banco de Dados

Após aplicar a migração, verifique se as novas colunas foram adicionadas à tabela `disciplinaverticalizada`:

- `assuntos` (TEXT[])
- `topicos_filtro` (TEXT[])
- `disciplinas_filtro` (TEXT[])
- `bancas_filtro` (TEXT[])
- `quantidade_questoes_filtro` (INTEGER[])

### 3. Atualizar Dados Existentes (Opcional)

Se já houver dados na tabela `disciplinaverticalizada`, execute o script para garantir que as novas colunas sejam inicializadas:

```bash
node scripts/update-existing-disciplina-data.js
```

### 4. Reiniciar o Servidor de Desenvolvimento

Reinicie o servidor de desenvolvimento para garantir que as mudanças sejam carregadas:

```bash
npm run dev
```

ou

```bash
yarn dev
```

## Verificação

Após aplicar a migração, verifique se:

1. As novas colunas foram adicionadas à tabela `disciplinaverticalizada`
2. Os componentes da página de curso estão exibindo corretamente as estatísticas de acertos, erros e exercícios feitos
3. Os filtros estão funcionando corretamente na página de administração de editais

## Problemas Comuns

### Erro: "relation 'disciplinaverticalizada' does not exist"

Se você receber este erro, pode ser que a tabela ainda não exista. Neste caso, primeiro crie a tabela:

```sql
CREATE TABLE IF NOT EXISTS disciplinaverticalizada (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  topicos TEXT[],
  links TEXT[]
);
```

### Erro: "column 'assuntos' does not exist"

Certifique-se de que a migração foi aplicada corretamente. Você pode verificar as migrações aplicadas com:

```bash
npx supabase migration list
```