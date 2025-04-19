# Cards de Questões - Documentação

Este documento descreve a implementação dos cards "Nova Questão" e "Editar Questão" que foram redesenhados para melhorar a experiência do usuário no gerenciamento de questões.

## Visão Geral

Os cards "Nova Questão" e "Editar Questão" são componentes idênticos em termos de estrutura, diferindo apenas no propósito e nos dados exibidos. O componente principal foi completamente redesenhado para oferecer uma interface mais intuitiva, organizada em abas e com funcionalidades de pesquisa em campos-chave.

## Estrutura do Componente

O formulário está organizado em três abas principais:

1. **Metadados**: Contém os campos relacionados à identificação e classificação da questão
   - Banca (institution)
   - Órgão (organization)
   - Ano (year)
   - Cargos (role) - permite seleção múltipla
   - Disciplina (discipline)
   - Assuntos (assuntos) - permite seleção múltipla
   - Tópicos (topicos) - permite seleção múltipla
   - Nível (level)
   - Dificuldade (difficulty)
   - Tipo de Questão (questiontype)

2. **Conteúdo**: Contém os campos para o texto da questão
   - Texto/Imagem Expansível (expandablecontent)
   - Texto da Questão (content)

3. **Alternativas e Explicações**: Contém as alternativas da questão e explicações
   - Alternativas (options)
   - Explicação do Professor (teacherexplanation)
   - Resposta da BIA (aiexplanation)
   - Prompt para a IA

## Principais Melhorias

1. **Interface dividida em abas**: Melhora a organização e reduz a sobrecarga visual.

2. **Campos de pesquisa**: Todos os campos de seleção agora possuem funcionalidade de pesquisa.

3. **Campos com seleção múltipla**: 
   - Cargos (role)
   - Assuntos (assuntos)
   - Tópicos (topicos)

4. **Gerenciamento completo de opções**: Todos os campos permitem adicionar, editar e excluir opções.

5. **Dependência entre campos**:
   - Disciplinas → Assuntos → Tópicos: A hierarquia é respeitada e refletida na interface.

6. **Validação de campos**: Validação aprimorada para garantir que todos os campos obrigatórios sejam preenchidos.

7. **Uso de componentes reutilizáveis**: Novos componentes foram criados para melhorar a reutilização:
   - SearchField: Campo com pesquisa e gerenciamento de opções
   - MultiSelectField: Campo de seleção múltipla com pesquisa
   - MultiSelect: Componente base para seleção múltipla

## Componentes Principais

1. **QuestionForm**: Componente principal do formulário 

2. **SearchField**: Componente para campos com pesquisa

3. **MultiSelectField**: Componente para campos com seleção múltipla

4. **MultiSelect**: Componente base para seleção múltipla

## Como Usar

O componente QuestionForm é utilizado tanto para criar quanto para editar questões:

```tsx
// Para criar uma nova questão
<QuestionForm
  year={state.year}
  setYear={state.setYear}
  institution={state.institution}
  setInstitution={state.setInstitution}
  // ... outros campos
  onSubmit={actions.handleSaveQuestion}
  submitButtonText="Criar Questão"
/>

// Para editar uma questão existente
<QuestionForm
  year={state.year}
  setYear={state.setYear}
  institution={state.institution}
  setInstitution={state.setInstitution}
  // ... outros campos
  onSubmit={actions.handleUpdateQuestion}
  submitButtonText="Salvar Modificações"
  isEditing={true}
/>
```

## Banco de Dados

O componente trabalha exclusivamente com a tabela `public.questoes` para armazenar e recuperar os dados das questões. 