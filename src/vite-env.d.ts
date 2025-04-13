/// <reference types="vite/client" />

// Adicionar definição para suporte ao shim do router Next.js
declare module 'next/router' {
  import { useRouter, Router } from '../lib/next-router-shim';
  export { useRouter, Router };
  export default { useRouter, Router };
}
