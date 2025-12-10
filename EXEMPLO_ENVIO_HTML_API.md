# Exemplo de Envio de HTML para API de Reescrita e Postagem

Esta documentação mostra como enviar conteúdo HTML para a API que reescreve automaticamente a notícia e cria um post no blog.

## Endpoint

```
POST /functions/v1/rewrite-and-post-news
```

## Cabeçalhos Necessários

```
Authorization: Bearer SEU_TOKEN_DE_ACESSO
Content-Type: application/json
```

## Corpo da Requisição

```json
{
  "htmlContent": "<html><body><h1>Título da Notícia</h1><p>Conteúdo da notícia em HTML...</p></body></html>",
  "authorName": "Nome do Autor (opcional)"
}
```

## Exemplo Completo com cURL

```bash
curl -X POST "https://seu-projeto.supabase.co/functions/v1/rewrite-and-post-news" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "htmlContent": "<html><body><h1>Novo Concurso Público</h1><p>Abertas inscrições para concurso público...</p></body></html>",
    "authorName": "Bot N8N"
  }'
```

## Exemplo em JavaScript

```javascript
// Enviar HTML para a API
async function enviarHTML(htmlContent) {
  const response = await fetch('https://seu-projeto.supabase.co/functions/v1/rewrite-and-post-news', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer SEU_TOKEN_DE_ACESSO',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      htmlContent: htmlContent,
      authorName: 'Bot N8N'
    })
  });
  
  const result = await response.json();
  console.log(result);
}
```

## Exemplo para uso no N8N

No N8N, você pode usar o nó "HTTP Request" com a seguinte configuração:

- **Method**: POST
- **URL**: `https://seu-projeto.supabase.co/functions/v1/rewrite-and-post-news`
- **Authentication**: Bearer Token (com seu token de acesso)
- **Content-Type**: application/json
- **Body Parameters**:
  - `htmlContent`: valor do HTML que você quer reescrever
  - `authorName`: "Bot N8N"

## Resposta de Sucesso

```json
{
  "success": true,
  "data": {
    "id": "uuid-do-post",
    "title": "Título do Post Gerado",
    "slug": "titulo-do-post-gerado"
  }
}
```

## Resposta de Erro

```json
{
  "error": "Mensagem de erro",
  "details": "Detalhes adicionais do erro"
}
```