
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: Usuário tentou acessar rota inexistente:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6f8fa]">
      <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
        <h1 className="text-4xl font-bold mb-4 text-[#272f3c]">404</h1>
        <p className="text-xl text-[#67748a] mb-4">Oops! Conteúdo não encontrado</p>
        <p className="text-sm text-[#67748a] mb-6">
          A página ou conteúdo que você está procurando não está disponível.
          {location.pathname.includes('/course/') && " Verifique se o curso existe e está ativo."}
        </p>
        <Link 
          to="/" 
          className="text-[#5f2ebe] hover:text-[#5f2ebe]/80 font-medium underline"
        >
          Voltar para Página Inicial
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
