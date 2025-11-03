# Sistema de Gerenciamento de Teorias

## Visão Geral

Este documento descreve o novo sistema de gerenciamento de teorias que permite aos administradores criar, editar e publicar teorias educacionais com suporte a disciplinas, assuntos, tópicos e um editor de conteúdo avançado.

## Funcionalidades

### 1. Página de Listagem de Teorias (`/admin/teorias`)

- Visualização de todas as teorias criadas
- Filtro de busca por título
- Indicação de status (Rascunho/Publicado)
- Data de última atualização
- Ações para editar ou excluir teorias

### 2. Página de Edição/Criação de Teorias (`/admin/teorias/new` e `/admin/teorias/:id/edit`)

- **Campos obrigatórios:**
  - Título da teoria
  - Seleção de disciplina
  - Seleção de assunto
  - Conteúdo (editor Tiptap)

- **Campos opcionais:**
  - Seleção múltipla de tópicos
  - Campo "No Edital" (para futura utilização por IA)
  - Status (Rascunho ou Publicado)

### 3. Editor de Conteúdo (Tiptap)

- Editor WYSIWYG avançado baseado no Tiptap
- Suporte a formatação de texto (negrito, itálico, sublinhado, etc.)
- Cabeçalhos e parágrafos
- Listas ordenadas e não ordenadas
- Alinhamento de texto
- Links e imagens
- Tabelas
- Blocos de código
- Funcionalidade de pré-visualização

### 4. Sistema de Seleção Hierárquica

- **Disciplina → Assunto → Tópicos**
- Seleção hierárquica que filtra opções com base na escolha anterior
- Seleção múltipla de tópicos
- Interface intuitiva com checkboxes

## Estrutura Técnica

### Banco de Dados

Tabela `teorias` com os seguintes campos:

```sql
CREATE TABLE public.teorias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    disciplina_id UUID NOT NULL,
    assunto_id UUID NOT NULL,
    topicos_ids UUID[] DEFAULT ARRAY[]::UUID[],
    conteudo TEXT NOT NULL,
    no_edital TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Serviços

- `teoriasService.ts`: Serviço central para operações CRUD
- Tipos TypeScript definidos em `types_teoria.ts`

### Componentes

- `TeoriaEditor.tsx`: Componente principal de edição/criação
- `Teorias.tsx`: Componente de listagem

### Rotas

- `/admin/teorias` - Listagem de teorias
- `/admin/teorias/new` - Criação de nova teoria
- `/admin/teorias/:id/edit` - Edição de teoria existente

## Funcionalidades Especiais

### 1. Pré-visualização em Tempo Real

- Botão para alternar entre modo de edição e pré-visualização
- Renderização HTML do conteúdo formatado

### 2. Gerenciamento de Status

- **Rascunho**: Teoria salva mas não visível publicamente
- **Publicado**: Teoria visível para todos os usuários

### 3. Seleção Inteligente de Tópicos

- Interface de seleção com checkboxes
- Visualização dos tópicos selecionados como badges
- Possibilidade de remover tópicos selecionados

## Segurança e Permissões

- Apenas usuários autenticados podem acessar o painel administrativo
- Políticas RLS (Row Level Security) configuradas no banco de dados
- Validação de dados no frontend e backend

## Migrações

O arquivo de migração `202311021_create_teorias_table.sql` cria a tabela necessária com:
- Índices para melhor performance
- Políticas de segurança
- Trigger para atualização automática de timestamps

## Como Usar

1. Acesse o painel administrativo em `/admin/teorias`
2. Clique em "Nova Teoria" para criar uma teoria
3. Preencha os campos obrigatórios:
   - Título
   - Disciplina
   - Assunto
   - Conteúdo
4. (Opcional) Adicione tópicos, preencha o campo "No Edital" e defina o status
5. Salve como rascunho ou publique diretamente
6. Edite teorias existentes a qualquer momento através do botão de edição

## Considerações Técnicas

- O campo "No Edital" não aparece na postagem pública da teoria
- É destinado apenas para futura utilização na geração de conteúdos por IA
- O editor Tiptap oferece uma experiência rica de formatação de conteúdo
- A hierarquia disciplina → assunto → tópicos garante organização consistente