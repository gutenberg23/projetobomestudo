# Funcionalidade de Filtros por Disciplina

## Descrição
Esta atualização adiciona a funcionalidade de filtros personalizados para cada tópico de disciplina na página de administração de editais. Agora é possível definir filtros específicos de assuntos e tópicos para cada tópico de disciplina, que são salvos no banco de dados e podem ser utilizados para gerar links diretos para questões filtradas.

## Alterações Realizadas

### 1. Banco de Dados
- Adicionadas duas novas colunas na tabela `disciplinaverticalizada`:
  - `assuntos`: Array de strings contendo os assuntos selecionados
  - `topicos_filtro`: Array de strings contendo os tópicos selecionados

### 2. Componentes
- Criado novo componente `DisciplinaFiltersModal` para exibir o painel de filtros em um popup
- Atualizado `DisciplinaForm` para incluir botão de filtros ao lado de cada tópico
- Adicionado ícone de filtro para cada campo de tópico

### 3. Tipos
- Atualizado interface `Disciplina` para incluir as novas propriedades `assuntos` e `topicos_filtro`

### 4. Hooks
- Atualizado `useEditalActions` para salvar e carregar as novas colunas

## Como Usar

1. Acesse a página de administração de editais (`/admin/edital`)
2. No card "Adicionar Disciplina", preencha os campos obrigatórios
3. Para cada tópico adicionado, clique no botão de filtro (ícone) ao lado do campo de link
4. No popup que abrirá, selecione os filtros desejados (assuntos e tópicos)
5. Clique em "Configurar" para gerar o link e salvar os filtros no banco de dados

## Estrutura dos Dados

Cada tópico agora possui:
- `topico`: Nome do tópico
- `link`: Link gerado com os filtros aplicados
- `assuntos`: Array com os assuntos selecionados
- `topicos_filtro`: Array com os tópicos selecionados

## Migração do Banco de Dados

A migração `20250428000000_add_assuntos_topicos_to_disciplinaverticalizada.sql` foi criada para adicionar as novas colunas à tabela existente.

Para aplicar a migração:
```bash
npx supabase migration up
```

## Considerações Técnicas

- Os filtros são salvos como arrays separados para permitir consultas mais eficientes
- O link gerado contém os parâmetros dos filtros aplicados para acesso direto
- A interface foi mantida intuitiva e fácil de usar