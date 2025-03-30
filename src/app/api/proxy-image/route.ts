import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return new NextResponse('URL da imagem não fornecida', { status: 400 });
    }

    // Fazer o download da imagem
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'Referer': 'https://arquivos.infra-questoes.grancursosonline.com.br/',
        'Origin': 'https://arquivos.infra-questoes.grancursosonline.com.br'
      }
    });

    if (!response.ok) {
      throw new Error(`Falha ao baixar imagem: ${response.statusText}`);
    }

    // Verificar se o conteúdo é realmente uma imagem
    const contentType = response.headers.get('content-type');
    if (!contentType?.startsWith('image/')) {
      throw new Error('O conteúdo retornado não é uma imagem');
    }

    // Obter o buffer da imagem
    const buffer = await response.arrayBuffer();

    // Retornar a imagem com o tipo de conteúdo correto
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    console.error('Erro ao processar imagem:', error);
    return new NextResponse('Erro ao processar imagem', { status: 500 });
  }
} 