# Projeto Bom Estudo

## Como configurar o ambiente

1. Crie uma conta no [Supabase](https://supabase.com)
2. Crie um novo projeto
3. No painel de controle do projeto, vá em Project Settings > API
4. Copie a URL do projeto e a chave anônima
5. Crie um arquivo `.env` na raiz do projeto baseado no `.env.example`
6. Substitua os valores das variáveis de ambiente com suas credenciais
7. No Supabase, crie um bucket chamado 'blog-images' em Storage > New Bucket
8. Configure as permissões do bucket para permitir uploads públicos
9. No Supabase, crie um bucket chamado 'blog-pdfs' em Storage > New Bucket
10. Configure as permissões do bucket 'blog-pdfs' para permitir uploads públicos

## Como editar este código?

Existem várias formas de editar sua aplicação.

**Use Lovable**

Simplesmente visite o [Lovable Project](https://lovable.dev/projects/3b2748fe-92f8-4127-b236-d58173b6010d) e comece a fazer prompts.

As mudanças feitas via Lovable serão commitadas automaticamente para este repositório.

**Use seu IDE preferido**

Se você quiser trabalhar localmente usando seu próprio IDE, você pode clonar este repositório e fazer push das mudanças. As mudanças feitas por push também serão refletidas no Lovable.

O único requisito é ter o Node.js & npm instalados - [instale com nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Siga estes passos:

```sh
# Passo 1: Clone o repositório usando a URL Git do projeto.
git clone <SUA_GIT_URL>

# Passo 2: Navegue até o diretório do projeto.
cd <NOME_DO_SEU_PROJETO>

# Passo 3: Instale as dependências necessárias.
npm i

# Passo 4: Inicie o servidor de desenvolvimento com auto-reloading e preview instantâneo.
npm run dev
```

**Edite um arquivo diretamente no GitHub**

- Navegue até o arquivo desejado.
- Clique no botão "Edit" (ícone de lápis) no canto superior direito da visualização do arquivo.
- Faça suas mudanças e commite as alterações.

**Use GitHub Codespaces**

- Navegue até a página principal do seu repositório.
- Clique no botão "Code" (botão verde) próximo ao canto superior direito.
- Selecione a aba "Codespaces".
- Clique em "New codespace" para lançar um novo ambiente Codespace.
- Edite os arquivos diretamente dentro do Codespace e commite e faça push das suas mudanças quando terminar.

## Quais tecnologias são usadas para este projeto?

Este projeto é construído com .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Como posso implantar este projeto?

Simplesmente abra [Lovable](https://lovable.dev/projects/3b2748fe-92f8-4127-b236-d58173b6010d) e clique em Share -> Publish.

## Eu quero usar um domínio personalizado - isso é possível?

Não suportamos domínios personalizados (ainda). Se você quiser implantar seu projeto sob seu próprio domínio, recomendamos usar o Netlify. Visite nossa documentação para mais detalhes: [Domínios personalizados](https://docs.lovable.dev/tips-tricks/custom-domain/)