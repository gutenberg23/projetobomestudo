// Polyfill para o objeto process que é necessário para o Next.js
if (typeof window !== 'undefined' && typeof window.process === 'undefined') {
  window.process = {
    env: {
      NODE_ENV: 'production',
      // Adicione quaisquer outras variáveis de ambiente necessárias aqui
      NEXT_PUBLIC_BASE_PATH: ''
    }
  };
}

export {}; 