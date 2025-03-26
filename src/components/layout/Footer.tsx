
import React from "react";
import { Link } from "react-router-dom";
import logo from "/lovable-uploads/logo-footer.svg";

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-1">
          <img src={logo} alt="BomEstudo" className="h-12 mb-4" />
          <p className="text-gray-400 text-sm">
            A sua plataforma de estudos para concursos públicos com conteúdo de qualidade.
          </p>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-4">Links Rápidos</h3>
          <ul className="space-y-2">
            <li>
              <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                Página Inicial
              </Link>
            </li>
            <li>
              <Link to="/explore" className="text-gray-400 hover:text-white transition-colors">
                Estude Grátis
              </Link>
            </li>
            <li>
              <Link to="/questions" className="text-gray-400 hover:text-white transition-colors">
                Questões
              </Link>
            </li>
            <li>
              <Link to="/blog" className="text-gray-400 hover:text-white transition-colors">
                Blog
              </Link>
            </li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-4">Suporte</h3>
          <ul className="space-y-2">
            <li>
              <Link to="/termos-e-politicas" className="text-gray-400 hover:text-white transition-colors">
                Termos de Uso
              </Link>
            </li>
            <li>
              <Link to="/termos-e-politicas" className="text-gray-400 hover:text-white transition-colors">
                Política de Privacidade
              </Link>
            </li>
            <li>
              <a href="mailto:contato@bomestudo.com.br" className="text-gray-400 hover:text-white transition-colors">
                Contato
              </a>
            </li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-4">Redes Sociais</h3>
          <div className="flex space-x-4">
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-400 hover:text-white transition-colors"
            >
              Instagram
            </a>
            <a 
              href="https://youtube.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-400 hover:text-white transition-colors"
            >
              YouTube
            </a>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} BomEstudo. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
};
