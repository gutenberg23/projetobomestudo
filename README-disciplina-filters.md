# Funcionalidade de Filtros por Disciplina

## Descrição
Esta atualização adiciona a funcionalidade de filtros personalizados para cada tópico de disciplina na página de administração de editais. Agora é possível definir filtros específicos de assuntos e tópicos para cada tópico de disciplina, que são salvos no banco de dados e podem ser utilizados para gerar links diretos para questões filtradas.

## Alterações Realizadas

### 1. Banco de Dados
- Adicionadas novas colunas na tabela `disciplinaverticalizada`:
  - `assuntos`: Array de strings contendo os assuntos selecionados
  - `topicos_filtro`: Array de strings contendo os tópicos selecionados
  - `disciplinas_filtro`: Array de strings contendo as disciplinas selecionadas
  - `bancas_filtro`: Array de strings contendo as bancas selecionadas
  - `quantidade_questoes_filtro`: Array de números contendo a quantidade de questões por tópico
- Adicionada coluna `assuntos` na tabela `respostas_alunos`
- Criada migração para corrigir possíveis dados mal formatados em colunas de array

### 2. Componentes
- Criado novo componente `DisciplinaFiltersModal` para exibir o painel de filtros em um popup
- Atualizado `DisciplinaForm` para incluir botão de filtros ao lado de cada tópico
- Adicionado ícone de filtro para cada campo de tópico
- Atualizado `TopicRow` e `TotalsRow` para buscar estatísticas da tabela `respostas_alunos` em vez dos links

### 3. Tipos
- Atualizado interface `Disciplina` para incluir as novas propriedades `assuntos`, `topicos_filtro`, `disciplinas_filtro`, `bancas_filtro` e `quantidade_questoes_filtro`
- Atualizado tipos do Supabase para incluir as novas colunas

### 4. Hooks
- Atualizado `useEditalActions` para salvar e carregar as novas colunas
- Atualizado `useSubjectImportanceStats` para buscar estatísticas da tabela `respostas_alunos` com base nos filtros

## Como Usar

1. Acesse a página de administração de editais (`/admin/edital`)
2. No card "Adicionar Disciplina", preencha os campos obrigatórios
3. Para cada tópico adicionado, clique no botão de filtro (ícone) ao lado do campo de link
4. No popup que abrirá, selecione os filtros desejados (assuntos, tópicos, disciplinas e bancas)
5. Clique em "Configurar" para gerar o link e salvar os filtros no banco de dados

## Estrutura dos Dados

Cada tópico agora possui:
- `topico`: Nome do tópico
- `link`: Link gerado com os filtros aplicados
- `assuntos`: Array com os assuntos selecionados
- `topicos_filtro`: Array com os tópicos selecionados
- `disciplinas_filtro`: Array com as disciplinas selecionadas
- `bancas_filtro`: Array com as bancas selecionadas

## Migração do Banco de Dados

Foram criadas três migrações:
1. `20250428000000_add_assuntos_topicos_to_disciplinaverticalizada.sql` - Adiciona colunas à tabela `disciplinaverticalizada`
2. `20250428000001_add_assuntos_to_respostas_alunos.sql` - Adiciona coluna `assuntos` à tabela `respostas_alunos`
3. `20250428000002_fix_array_data_format.sql` - Corrige possíveis dados mal formatados em colunas de array

Para aplicar as migrações:
```bash
node scripts/apply-migration-disciplina-filters.js
```

Ou manualmente:
```bash
npx supabase migration up --file supabase/supabase/migrations/20250428000000_add_assuntos_topicos_to_disciplinaverticalizada.sql
npx supabase migration up --file supabase/supabase/migrations/20250428000001_add_assuntos_to_respostas_alunos.sql
npx supabase migration up --file supabase/supabase/migrations/20250428000002_fix_array_data_format.sql
```

## Considerações Técnicas

- Os filtros são salvos como arrays separados para permitir consultas mais eficientes
- O link gerado contém os parâmetros dos filtros aplicados para acesso direto
- As estatísticas de acertos, erros e exercícios feitos agora são buscadas diretamente da tabela `respostas_alunos` com base nos filtros aplicados
- A interface foi mantida intuitiva e fácil de usar
- Foram adicionadas verificações para filtrar valores vazios e formatar corretamente os arrays antes de fazer consultas