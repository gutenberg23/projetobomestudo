# Funcionalidade de Auto Preenchimento de Concursos

## Descrição

Esta funcionalidade permite preencher automaticamente os campos de um concurso com base nas informações extraídas de um post relacionado do blog. Ao selecionar um post e clicar no botão "Auto Preencher", o sistema utiliza a inteligência artificial do Google Gemini para analisar o conteúdo do post e extrair as informações relevantes.

## Campos Preenchidos Automaticamente

- **Título do Concurso**: Nome do órgão (ex: Prefeitura do Rio de Janeiro)
- **Data de Início**: Data de início das inscrições
- **Data de Término**: Data de término das inscrições
- **Data da Prova**: Data de realização da prova
- **Níveis**: Níveis de ensino (Ensino Fundamental, Médio, Superior)
- **Cargos**: Cargos oferecidos no concurso
- **Vagas**: Número total de vagas
- **Salário**: Maior salário oferecido
- **Estados**: Estados onde o concurso atua

## Como Usar

1. Acesse a página de administração de concursos (`/admin/concursos`)
2. Crie um novo concurso ou edite um existente
3. Selecione um "Post Relacionado" na seção correspondente
4. Após selecionar o post, o botão "Auto Preencher" será habilitado
5. Clique no botão "Auto Preencher"
6. Aguarde o processamento (isso pode levar alguns segundos)
7. Os campos do formulário serão preenchidos automaticamente com as informações extraídas
8. Revise as informações e faça ajustes se necessário
9. Salve o concurso

## Requisitos Técnicos

- Conta configurada no Google Gemini com API key
- Variável de ambiente `GOOGLE_GEMINI_API_KEY` configurada no Supabase
- Função Edge do Supabase `generate-question-explanation` implantada

## Estrutura do Código

- **Serviço**: `src/services/autoPreencherConcursoService.ts`
- **Componente**: `src/pages/admin/components/concursos/FormularioConcurso.tsx`

## Como Funciona

1. O usuário seleciona um post relacionado
2. Ao clicar em "Auto Preencher", o sistema busca o conteúdo completo do post
3. O conteúdo é enviado para o Google Gemini através da função Edge do Supabase
4. A IA analisa o conteúdo e extrai as informações estruturadas
5. O sistema recebe a resposta e preenche os campos do formulário
6. Os dados são validados antes de serem aplicados ao formulário

## Personalização

O prompt enviado para a IA pode ser modificado no arquivo `src/services/autoPreencherConcursoService.ts` para melhorar a precisão da extração de acordo com o formato dos posts do seu blog.