// Shim para simular o useRouter do Next.js
import { useLocation, useNavigate, useParams } from 'react-router-dom';

// Emular o hook useRouter do Next.js
export function useRouter() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  return {
    pathname: location.pathname,
    asPath: location.pathname + location.search, // Similar ao Next.js asPath
    query: Object.fromEntries(new URLSearchParams(location.search)),
    route: location.pathname,
    events: {
      on: (event, callback) => {
        // Emular os eventos do router Next.js
        // Normalmente não são necessários, mas podemos adicionar depois
        console.warn(`Next.js router event '${event}' não é totalmente suportado neste shim`);
        return () => {}; // Retorna uma função noop para desinscrição
      },
      off: (event, callback) => {
        console.warn(`Next.js router event '${event}' não é totalmente suportado neste shim`);
      }
    },
    push: (url) => navigate(url),
    replace: (url) => navigate(url, { replace: true }),
    back: () => navigate(-1),
    forward: () => navigate(1),
    reload: () => window.location.reload(),
    ...params
  };
}

// Se precisar de Router como um objeto
export const Router = {
  events: {
    on: () => {},
    off: () => {},
    emit: () => {}
  }
};

export default { useRouter, Router }; 