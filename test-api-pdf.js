/**
 * Script para testar a API de criação de post a partir de PDF
 * 
 * Uso:
 * node test-api-pdf.js caminho/para/arquivo.pdf
 */

const fs = require('fs');
const path = require('path');

// Verificar se foi passado um caminho de arquivo
if (process.argv.length < 3) {
  console.error('Uso: node test-api-pdf.js <caminho-do-arquivo-pdf>');
  process.exit(1);
}

const pdfPath = process.argv[2];

// Verificar se o arquivo existe
if (!fs.existsSync(pdfPath)) {
  console.error(`Arquivo não encontrado: ${pdfPath}`);
  process.exit(1);
}

// Verificar se é um arquivo PDF
if (path.extname(pdfPath).toLowerCase() !== '.pdf') {
  console.error('O arquivo deve ser um PDF');
  process.exit(1);
}

// Ler o arquivo PDF e converter para base64
const pdfBuffer = fs.readFileSync(pdfPath);
const pdfBase64 = pdfBuffer.toString('base64');

// Configurações - substitua pelos seus valores reais
const SUPABASE_URL = 'https://seu-projeto.supabase.co';
const SUPABASE_TOKEN = 'seu-token-de-acesso-aqui';

// Dados para enviar
const requestData = {
  pdfBase64: pdfBase64,
  mimeType: 'application/pdf',
  authorName: 'Teste API'
};

// Enviar requisição para a API
fetch(`${SUPABASE_URL}/functions/v1/create-blog-post-from-pdf`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${SUPABASE_TOKEN}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(requestData)
})
.then(response => {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
})
.then(data => {
  console.log('Resposta da API:');
  console.log(JSON.stringify(data, null, 2));
})
.catch(error => {
  console.error('Erro ao chamar a API:', error);
});