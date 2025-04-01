import React from "react";
import { Instagram, Facebook, Twitter, Youtube, Mail, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import logoFooter from "/lovable-uploads/logo-footer.svg";
import { useSiteConfig } from "@/hooks/useSiteConfig";

export const Footer = () => {
  const { config } = useSiteConfig();

  return (
    <footer className="w-full pt-[50px] pb-[30px] px-4 text-white mt-10 bg-[#2a2438]">
      {/* Footer Top Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        {/* Column 1 - Logo and About */}
        <div className="space-y-4">
          <img src={logoFooter} alt="BomEstudo Logo" className="w-[194px] mb-4" />
          <p className="text-gray-300 text-sm">
            Plataforma de estudos online para candidatos de concursos públicos com cursos, questões comentadas e estatísticas de desempenho.
          </p>
          <div className="flex space-x-4 pt-2">
            <a href="#" className="text-white hover:text-[#5f2ebe] transition-colors">
              <Instagram size={20} />
            </a>
            <a href="#" className="text-white hover:text-[#5f2ebe] transition-colors">
              <Facebook size={20} />
            </a>
            <a href="#" className="text-white hover:text-[#5f2ebe] transition-colors">
              <Twitter size={20} />
            </a>
            <a href="#" className="text-white hover:text-[#5f2ebe] transition-colors">
              <Youtube size={20} />
            </a>
          </div>
        </div>

        {/* Column 2 - Links de Navegação */}
        <div>
          <h3 className="text-lg font-bold mb-4">Navegação</h3>
          <ul className="space-y-2">
            <li>
              <Link to="/" className="text-gray-300 hover:text-[#5f2ebe] flex items-center transition-colors">
                <ChevronRight size={16} className="mr-1" />
                <span>Home</span>
              </Link>
            </li>
            {config.pages.showExplorePage && (
              <li>
                <Link to="/explore" className="text-gray-300 hover:text-[#5f2ebe] flex items-center transition-colors">
                  <ChevronRight size={16} className="mr-1" />
                  <span>Explorar</span>
                </Link>
              </li>
            )}
            {config.pages.showMyCoursesPage && (
              <li>
                <Link to="/my-courses" className="text-gray-300 hover:text-[#5f2ebe] flex items-center transition-colors">
                  <ChevronRight size={16} className="mr-1" />
                  <span>Meus Cursos</span>
                </Link>
              </li>
            )}
            {config.pages.showQuestionsPage && (
              <li>
                <Link to="/questions" className="text-gray-300 hover:text-[#5f2ebe] flex items-center transition-colors">
                  <ChevronRight size={16} className="mr-1" />
                  <span>Questões</span>
                </Link>
              </li>
            )}
          </ul>
        </div>

        {/* Column 3 - Concursos */}
        <div>
          <h3 className="text-lg font-bold mb-4">Concursos</h3>
          <ul className="space-y-2">
            <li>
              <a href="#" className="text-gray-300 hover:text-[#5f2ebe] flex items-center transition-colors">
                <ChevronRight size={16} className="mr-1" />
                <span>Banco do Brasil</span>
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-300 hover:text-[#5f2ebe] flex items-center transition-colors">
                <ChevronRight size={16} className="mr-1" />
                <span>Concurso INSS</span>
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-300 hover:text-[#5f2ebe] flex items-center transition-colors">
                <ChevronRight size={16} className="mr-1" />
                <span>Concurso Receita Federal</span>
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-300 hover:text-[#5f2ebe] flex items-center transition-colors">
                <ChevronRight size={16} className="mr-1" />
                <span>Concurso Caixa</span>
              </a>
            </li>
          </ul>
        </div>

        {/* Column 4 - Contato */}
        <div>
          <h3 className="text-lg font-bold mb-4">Contato</h3>
          <div className="flex items-start space-x-3">
            <Mail size={20} className="text-[#5f2ebe] mt-1 flex-shrink-0" />
            <span className="text-gray-300">contato@bomestudo.com.br</span>
          </div>
          <div className="mt-6">
            <h4 className="text-sm font-bold mb-2">Receba Novidades</h4>
            <div className="flex mt-2">
              <input type="email" placeholder="Seu e-mail" className="px-3 py-2 text-sm rounded-l-md text-gray-800 w-full focus:outline-none focus:ring-2 focus:ring-[#5f2ebe]/50 focus:border-[#5f2ebe]" />
              <button className="px-4 py-2 rounded-r-md hover:bg-opacity-90 transition-colors bg-[#5f2ebe] text-white">
                Enviar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="border-t border-gray-700 pt-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400 mb-4 md:mb-0">
            © {new Date().getFullYear()} BomEstudo. Todos os direitos reservados.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-sm text-gray-400 hover:text-[#5f2ebe] transition-colors">
              Termos de Uso
            </a>
            <a href="#" className="text-sm text-gray-400 hover:text-[#5f2ebe] transition-colors">
              Política de Privacidade
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
