// API para fazer proxy de conteúdo web e contornar CORS
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const url = new URL(req.url);
    const targetUrl = url.searchParams.get('url');

    if (!targetUrl) {
      return new Response('URL parameter is required', { status: 400 });
    }

    // Validar se é uma URL válida
    try {
      new URL(targetUrl);
    } catch {
      return new Response('Invalid URL', { status: 400 });
    }

    // Fazer a requisição para a URL alvo
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
    });

    if (!response.ok) {
      return new Response(`Failed to fetch: ${response.status}`, { status: response.status });
    }

    const content = await response.text();

    return new Response(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}