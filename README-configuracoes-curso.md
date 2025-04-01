# Controle de Visibilidade de Abas do Curso

Este documento descreve a implementação do sistema de controle de visibilidade das abas na página de curso (`course/:courseId`).

## Visão Geral

O sistema permite que o administrador controle a visibilidade das seguintes abas na página de curso:
- **Disciplinas**: lista de disciplinas e aulas do curso
- **Edital**: edital verticalizado do curso
- **Simulados**: simulados disponíveis para o curso

Quando uma aba é desabilitada, ela fica completamente oculta para os usuários na interface.

## Implementação Técnica

### Banco de Dados

O sistema utiliza uma tabela `configuracoes_site` no Supabase para armazenar as configurações:

```sql
CREATE TABLE IF NOT EXISTS public.configuracoes_site (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chave TEXT NOT NULL UNIQUE,
    valor JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

A tabela armazena as configurações como pares chave-valor, onde o valor é um objeto JSON. Para as configurações de abas do curso, a chave é `tabs_course` e o valor é um objeto com as propriedades:

```json
{
  "showDisciplinasTab": true,
  "showEditalTab": true,
  "showSimuladosTab": true
}
```

### Componentes Principais

1. **`useSiteConfig`**: Hook personalizado que gerencia e compartilha as configurações do site entre componentes.
   - Localização: `src/hooks/useSiteConfig.ts`

2. **`CourseConfig`**: Componente de administração para configurar a visibilidade das abas.
   - Localização: `src/pages/admin/components/configuracoes/CourseConfig.tsx`

3. **`CourseNavigation`**: Componente que exibe as abas do curso com base nas configurações.
   - Localização: `src/components/course/CourseNavigation.tsx`

4. **`CourseLayout`**: Componente principal da página de curso que renderiza o conteúdo com base na aba ativa e suas configurações de visibilidade.
   - Localização: `src/components/course/CourseLayout.tsx`

## Como Usar

### Para Administradores

1. Acesse a área administrativa do site
2. Navegue até "Configurações"
3. Selecione a aba "Configurações de Curso"
4. Use os alternadores para ativar ou desativar cada aba conforme necessário
5. Clique em "Salvar Alterações"

### Para Desenvolvedores

Para consumir as configurações de visibilidade em outros componentes:

```tsx
import { useSiteConfig } from "@/hooks/useSiteConfig";

function MeuComponente() {
  const { config, isLoading } = useSiteConfig();
  
  if (isLoading) {
    return <Spinner />;
  }
  
  const { showDisciplinasTab, showEditalTab, showSimuladosTab } = config.tabs;
  
  // Lógica baseada nas configurações
  
  return (
    // JSX do componente
  );
}
```

## Script de Criação da Tabela

Um script SQL para criar a tabela no Supabase está disponível em `scripts/create_configuracoes_site_table.sql`.

## Comportamento de Fallback

Se todas as abas forem desabilitadas, o componente `CourseNavigation` exibirá uma mensagem informando que o conteúdo está temporariamente indisponível.

Se a aba ativa for desabilitada, o sistema tentará selecionar automaticamente a primeira aba disponível na seguinte ordem: Disciplinas, Edital, Simulados. 