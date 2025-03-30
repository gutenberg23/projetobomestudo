import { createServer } from 'http';
import { parse } from 'url';
import fetch from 'node-fetch';

const server = createServer(async (req, res) => {
  try {
    const { query } = parse(req.url || '', true);
    const imageUrl = query.url;

    if (!imageUrl) {
      console.error('URL da imagem não fornecida');
      res.writeHead(400);
      res.end('URL da imagem não fornecida');
      return;
    }

    console.log('Tentando baixar imagem:', imageUrl);

    // Fazer o download da imagem
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'Referer': 'https://arquivos.infra-questoes.grancursosonline.com.br/',
        'Origin': 'https://arquivos.infra-questoes.grancursosonline.com.br',
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.ok) {
      console.error('Erro na resposta:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      throw new Error(`Falha ao baixar imagem: ${response.status} ${response.statusText}`);
    }

    // Verificar se o conteúdo é realmente uma imagem
    const contentType = response.headers.get('content-type');
    console.log('Content-Type da resposta:', contentType);

    if (!contentType?.startsWith('image/')) {
      console.error('Conteúdo não é uma imagem:', contentType);
      throw new Error('O conteúdo retornado não é uma imagem');
    }

    // Obter o buffer da imagem
    const buffer = await response.arrayBuffer();
    console.log('Tamanho do buffer:', buffer.byteLength, 'bytes');

    // Retornar a imagem com o tipo de conteúdo correto
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(Buffer.from(buffer));
    console.log('Imagem enviada com sucesso');
  } catch (error) {
    console.error('Erro detalhado ao processar imagem:', error);
    res.writeHead(500);
    res.end(`Erro ao processar imagem: ${error.message}`);
  }
});

// Tratamento de erros do servidor
server.on('error', (error) => {
  console.error('Erro no servidor:', error);
});

server.listen(3001, () => {
  console.log('Servidor de proxy de imagens rodando na porta 3001');
}); 