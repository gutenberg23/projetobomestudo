# Exemplo de Envio de PDF para API de Criação de Post

Esta documentação mostra como enviar um arquivo PDF para a API que gera automaticamente um post no blog.

## Endpoint

```
POST /functions/v1/create-blog-post-from-pdf
```

## Cabeçalhos Necessários

```
Authorization: Bearer SEU_TOKEN_DE_ACESSO
Content-Type: application/json
```

## Corpo da Requisição

```json
{
  "pdfBase64": "BASE64_DO_SEU_PDF_AQUI",
  "mimeType": "application/pdf",
  "authorName": "Nome do Autor (opcional)"
}
```

## Exemplo Completo com cURL

```bash
curl -X POST "https://seu-projeto.supabase.co/functions/v1/create-blog-post-from-pdf" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "pdfBase64": "JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxvZwog...",
    "mimeType": "application/pdf",
    "authorName": "Bot N8N"
  }'
```

## Exemplo em JavaScript

```javascript
// Converter arquivo PDF para base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Remover o prefixo "data:application/pdf;base64,"
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
}

// Enviar PDF para a API
async function enviarPDF(pdfFile) {
  const pdfBase64 = await fileToBase64(pdfFile);
  
  const response = await fetch('https://seu-projeto.supabase.co/functions/v1/create-blog-post-from-pdf', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer SEU_TOKEN_DE_ACESSO',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      pdfBase64: pdfBase64,
      mimeType: 'application/pdf',
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
- **URL**: `https://seu-projeto.supabase.co/functions/v1/create-blog-post-from-pdf`
- **Authentication**: Bearer Token (com seu token de acesso)
- **Content-Type**: application/json
- **Body Parameters**:
  - `pdfBase64`: valor da expressão que converte seu PDF para base64
  - `mimeType`: "application/pdf"
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