# Teorias - Documentação

## Visão Geral

A funcionalidade de "Teorias" é uma nova seção do site que permite aos usuários acessar aulas detalhadas com teorias e conceitos importantes para seus estudos. Esta seção é semelhante ao blog, mas com funcionalidades específicas para aprendizado.

## Estrutura de Páginas

### 1. Página Principal de Teorias (`/teorias`)
- Lista todas as teorias disponíveis
- Permite busca por título, categoria ou tags
- Exibe teorias em formato de cards com informações resumidas
- Inclui paginação para navegação

### 2. Página Individual de Teoria (`/teoria/:slug`)
- Exibe o conteúdo completo de uma teoria
- Inclui menu superior com opções:
  - Aula em texto (padrão)
  - Questões
  - Videoaula
  - Mapa mental
  - Estrutura
- Ícones na parte superior esquerda:
  - Reportar erro
  - Adicionar notas (salvo apenas para o usuário)
  - Marcar texto (como uma caneta marcadora)
- Funcionalidade de salvar teoria
- Seção de conteúdo relacionado

## Funcionalidades do Usuário

### Salvamento de Teorias
- Usuários podem salvar teorias para acesso rápido
- Teorias salvas são armazenadas localmente (para demonstração)
- Em implementação futura, serão salvas no banco de dados

### Anotações e Marcações
- Ícones permitem:
  - Reportar erros no conteúdo
  - Adicionar notas pessoais em parágrafos
  - Marcar texto como importante
- Todas as anotações são salvas apenas para o usuário logado

## Administração

### Gerenciamento de Teorias
- Acesso através do painel administrativo em `/admin/teorias`
- Permite criar, editar e excluir teorias
- Campos disponíveis:
  - Título
  - Autor
  - Categoria
  - Tags
  - Conteúdo (HTML)
  - Status (Rascunho/Publicado)

### Configuração de Visibilidade
- A página de teorias pode ser ativada/desativada através das configurações do site
- Localização: Admin > Configurações > Configurações de Visibilidade de Páginas
- Opção: "Página de Teorias"

## Integração com o Sistema

### Rotas
- `/teorias` - Página principal de teorias
- `/teoria/:slug` - Página individual de teoria
- `/admin/teorias` - Painel administrativo para gerenciamento

### Componentes
- `Teorias.tsx` - Página principal de teorias
- `TeoriaPost.tsx` - Página individual de teoria
- `TeoriasAdmin.tsx` - Painel administrativo

### Navegação
- Link adicionado ao menu principal (visível quando a página está ativa)
- Link adicionado ao menu mobile
- Link adicionado ao menu administrativo em "Blog e Notícias"

## Próximos Passos

1. **Integração com Banco de Dados**
   - Criar tabela para armazenamento de teorias
   - Implementar API para CRUD de teorias
   - Conectar frontend às APIs

2. **Funcionalidades Avançadas**
   - Implementar sistema de anotações e marcações
   - Adicionar funcionalidade de reportar erros
   - Criar seções de "Questões", "Videoaula", "Mapa mental" e "Estrutura"

3. **Melhorias na Interface**
   - Adicionar filtros por categoria
   - Implementar sistema de busca avançada
   - Adicionar ordenação por diferentes critérios

## Estrutura de Arquivos

```
src/
├── pages/
│   ├── Teorias.tsx          # Página principal de teorias
│   ├── TeoriaPost.tsx       # Página individual de teoria
│   └── admin/
│       └── Teorias.tsx      # Painel administrativo
├── components/
│   └── layout/
│       └── Header.tsx       # Atualizado para incluir link
└── App.tsx                  # Rotas adicionadas
```