# Reescrita automática de notícias via RSS (100% gratuita)

Este guia explica como funciona a sincronização de RSS com IA, quais serviços
gratuitos ela usa e como ativar tudo. Leva uns 20 minutos.

Projeto Supabase: **`ukkatmoathxhbaelstzo`**.

---

## Como funciona agora

1. A cada 30 minutos, o próprio banco do Supabase (extensão **pg_cron**) chama
   a Edge Function **`rss-auto-sync`**.
2. A função lê os feeds ativos cadastrados em *Admin › Posts › RSS Manager*.
3. Para cada notícia nova (até 7 dias, no máximo 3 por rodada), ela abre a
   página original, extrai o texto principal (títulos, listas e tabelas) e
   manda para a IA reescrever.
4. A IA devolve título, resumo, HTML, tags, região, UF, cidade e palavras-chave.
   O HTML passa por uma limpeza de segurança (só tags de texto, links `https`).
   - **Maiúsculas:** se a IA devolver o título ou o resumo todo em minúsculas
     (ou todo em maiúsculas), a função corrige a grafia usando o texto original
     da notícia como referência ("campinas" vira "Campinas", "fgv" vira "FGV").
   - **Links:** links para o site de origem e para portais de notícias ou
     cursinhos são removidos (o texto fica, o link sai). Ficam só links úteis,
     como edital em PDF, página de inscrição e sites do órgão ou da banca. A
     lista de portais bloqueados fica em `supabase/functions/_shared/links.ts`.
   - **Foto destaque:** a função procura uma foto da cidade do concurso na
     Wikipédia e no Wikimedia Commons (gratuitos, sem chave). Sem cidade, usa a
     capital do estado; concurso federal usa Brasília. O crédito do autor da foto
     vai no fim do post, como a licença exige. No editor, o botão
     **Foto da cidade** mostra várias opções para escolher outra.
5. O post é criado no blog. Em cada feed você escolhe:
   - **Publicar sozinho desligado** (padrão): vira rascunho para revisão.
   - **Publicar sozinho ligado**: já entra publicado no site.
6. O item fica registrado em `rss_transmitidos` com o status (`publicado`,
   `rascunho` ou `erro`). Itens com erro são tentados de novo até 3 vezes. Se o
   limite gratuito da IA acabar, a rodada para e continua na próxima, sem
   perder a notícia.

O botão **Transmitir** do painel e o botão **Sincronizar agora** usam a mesma
função, então tudo roda no servidor. O navegador não precisa ficar aberto.

### O que mudou em relação à versão anterior

| Antes | Agora |
|---|---|
| Rodava no navegador do admin, só enquanto a página estava aberta | Roda no servidor, sozinho, a cada 30 min |
| Modelo `gemini-2.0-flash-exp`, que o Google já desativou | `gemini-flash-latest`, que sempre aponta para o Flash atual |
| Se o Gemini falhasse, a notícia era perdida | Reserva automática: Gemini Flash → Gemini Flash-Lite → Groq → OpenRouter |
| Usava o proxy público `allorigins.win` (lento e instável) | Busca direto do servidor |
| Mandava a página inteira como texto corrido, perdendo tabelas | Extrai só a notícia, mantendo títulos, listas, tabelas e links de edital |
| "Sincronização Automática" não marcava itens como transmitidos e podia duplicar | Cada item fica registrado, com status e número de tentativas |
| HTML da IA ia direto para o site | HTML filtrado contra scripts e links maliciosos |
| Só lia RSS 2.0 | Lê RSS 2.0, RSS 1.0 e Atom |
| Tabelas de RSS sem RLS | Só a equipe acessa |

---

## Comparação dos serviços gratuitos

### IA para reescrever

Os limites gratuitos mudam com frequência. Os números abaixo foram conferidos
em novembro de 2026; os atuais aparecem no painel de cada serviço.

| Serviço | Limite gratuito | Qualidade em PT-BR | Observações |
|---|---|---|---|
| **Google Gemini (AI Studio)** | Por projeto, visível no AI Studio. Os modelos Flash e Flash-Lite atendem com folga dezenas de notícias por dia | Excelente | O Google pode usar o conteúdo enviado no plano gratuito para melhorar os produtos. Aqui são notícias públicas, então não há problema |
| **Groq** | Llama 3.3 70B: 30 por minuto, 1.000 por dia, 12 mil tokens por minuto, 100 mil tokens por dia (≈ 15 a 20 notícias por dia) | Muito boa | Muito rápido e não guarda os dados. Ótimo como reserva |
| **OpenRouter** (modelos `:free`) | 20 por minuto e 50 por dia (1.000 por dia após uma compra única de US$ 10) | Varia por modelo | Catálogo muda toda semana. Alguns provedores treinam com os prompts |
| **Cloudflare Workers AI** | 10 mil "neurons" por dia | Razoável (modelos pequenos) | Não integrado; modelos fracos para textos longos |
| **Mistral** (plano Experiment) | Limites só no painel | Boa | Não integrado; termos de retenção pouco claros |

**Recomendação:** Gemini como principal e Groq como reserva. As duas chaves
são gratuitas e não pedem cartão. Com as duas configuradas, se o Gemini
atingir o limite do dia, o Groq assume na mesma hora.

### Agendador

| Opção | Custo | Prós | Contras |
|---|---|---|---|
| **pg_cron + pg_net no Supabase** | Grátis, inclusive no plano Free | Já está dentro do seu Supabase, sem conta extra; o segredo fica no Vault | Nenhum relevante. Se o projeto Free ficar 7 dias sem acesso, o Supabase pausa o projeto (o site no ar já evita isso) |
| GitHub Actions (cron) | Grátis | Simples | Atrasos de 5 a 30 min; desativa sozinho após 60 dias sem commits; segredo fica no GitHub |
| cron-job.org | Grátis | Interface amigável | Mais um serviço externo guardando seu segredo |
| Netlify Scheduled Functions | Grátis | O site já está no Netlify | Precisaria de mais uma função e de mais um segredo |

**Recomendação:** pg_cron, que já vem configurado pela migration.

---

## Passo a passo para ativar

Todos os comandos rodam no Prompt de Comando, dentro da pasta do projeto,
depois de `npx supabase login` e `npx supabase link --project-ref ukkatmoathxhbaelstzo`
(veja o guia de segurança, passo 3).

### 1. Chaves de IA (5 min)

1. **Gemini** (provavelmente você já tem): crie ou copie a chave em
   https://aistudio.google.com/apikey e rode:
   ```
   npx supabase secrets set GOOGLE_GEMINI_API_KEY=COLE_A_CHAVE
   ```
2. **Groq** (recomendado como reserva): crie uma conta em
   https://console.groq.com, gere uma chave em **API Keys** e rode:
   ```
   npx supabase secrets set GROQ_API_KEY=COLE_A_CHAVE
   ```

### 2. Segredo do agendador (3 min)

Esse segredo garante que só o seu banco consiga disparar a sincronização.

1. Gere um valor aleatório:
   ```
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
2. Grave como secret da Edge Function:
   ```
   npx supabase secrets set RSS_CRON_SECRET=COLE_O_VALOR
   ```
3. Abra https://supabase.com/dashboard/project/ukkatmoathxhbaelstzo/sql/new,
   cole o comando abaixo com **o mesmo valor** e clique em **Run**:
   ```sql
   select vault.create_secret('COLE_O_VALOR', 'rss_cron_secret');
   ```

### 3. Publicar as funções (2 min)

```
npx supabase functions deploy rss-auto-sync
npx supabase functions deploy rewrite-content
```

### 4. Aplicar a migration (3 min)

1. Abra o arquivo `supabase/migrations/20251107000000_rss_auto_sync.sql` e copie
   todo o conteúdo.
2. Cole em https://supabase.com/dashboard/project/ukkatmoathxhbaelstzo/sql/new e
   clique em **Run**.
3. Avisos (NOTICE) do tipo "already exists, skipping" são normais.

Se aparecer erro dizendo que `pg_cron` ou `pg_net` não pode ser criada, ative as
duas em **Database › Extensions** no painel e rode o arquivo de novo.

### 5. Testar (5 min)

1. No site, entre como admin e abra *Admin › Posts › RSS Manager*.
2. Clique em **Sincronizar agora**. Em até 1 a 2 minutos aparece um resumo
   ("2 post(s) criado(s), 5 já processado(s)…").
3. Confira os rascunhos na lista de posts.
4. Quando estiver satisfeito com a qualidade, ligue **Publicar sozinho** nos
   feeds em que confia.
5. Para conferir o agendador depois de 30 minutos, rode no SQL Editor:
   ```sql
   select status, return_message, start_time
   from cron.job_run_details order by start_time desc limit 5;

   select status_code, content::text, created
   from net._http_response order by created desc limit 5;
   ```
   `status_code` 200 significa que a função rodou.

---

## Ajustes opcionais

Todos são secrets (`npx supabase secrets set NOME=valor`):

| Secret | Padrão | Para quê |
|---|---|---|
| `RSS_MAX_POSTS_PER_RUN` | `3` | Posts criados por rodada. Mais que 4 pode estourar o tempo da função no plano Free |
| `RSS_ITEMS_PER_FEED` | `10` | Quantos itens mais recentes de cada feed são olhados |
| `RSS_MAX_ITEM_AGE_DAYS` | `7` | Ignora notícias mais antigas que isso |
| `RSS_AUTHOR_NAME` | `Equipe Bom Estudo` | Autor dos posts automáticos |
| `GEMINI_MODEL` | `gemini-flash-latest` | Modelo principal do Gemini |
| `GEMINI_FALLBACK_MODEL` | `gemini-flash-lite-latest` | Segundo modelo do Gemini |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` | Modelo do Groq |
| `OPENROUTER_API_KEY` e `OPENROUTER_MODEL` | (vazio) | Terceira reserva, opcional. Use um modelo terminado em `:free` |
| `AI_PROVIDERS` | `gemini,groq,openrouter` | Ordem dos provedores |
| `UNSPLASH_ACCESS_KEY` | (vazio) | Opcional. Usa o Unsplash como reserva quando o Wikimedia não tem foto da cidade. A chave é gratuita em unsplash.com/developers |

Para mudar a frequência (exemplo: de hora em hora), rode no SQL Editor:
```sql
select cron.schedule('rss-auto-sync', '0 * * * *', $$select public.invoke_rss_auto_sync();$$);
```
Para pausar: `select cron.unschedule('rss-auto-sync');`

## Um cuidado

Reescrever notícias de outros sites reduz o risco de cópia, mas não elimina.
Por isso o padrão é criar rascunhos. Ligue a publicação automática só nos feeds
de fontes oficiais ou em que você confia, e de vez em quando revise o que saiu.
