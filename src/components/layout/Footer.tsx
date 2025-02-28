
import React from "react";
import { Instagram, Facebook, Twitter, Youtube, Mail, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-[rgba(66,48,65,1)] w-full pt-[50px] pb-[30px] px-4 text-white mt-10">
      <div className="max-w-7xl mx-auto">
        {/* Footer Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Column 1 - Logo and About */}
          <div className="space-y-4">
            <img 
              src="https://cdn.builder.io/api/v1/image/assets/d6eb265de0f74f23ac89a5fae3b90a0d/d4f7b31dd1bc48e16547963f6b0cd0adc76ffe16e180c12ccfce3d8a912308a0" 
              alt="BomEstudo Logo" 
              className="w-[194px] mb-4" 
            />
            <p className="text-gray-300 text-sm">
              Plataforma de estudos online para candidatos de concursos públicos com cursos, questões comentadas e estatísticas de desempenho.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="text-white hover:text-[#ea2be2] transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-white hover:text-[#ea2be2] transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-white hover:text-[#ea2be2] transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-white hover:text-[#ea2be2] transition-colors">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Column 2 - Links de Navegação */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold mb-4">Navegação</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-[#ea2be2] flex items-center transition-colors">
                  <ChevronRight size={16} className="mr-1" />
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link to="/explore" className="text-gray-300 hover:text-[#ea2be2] flex items-center transition-colors">
                  <ChevronRight size={16} className="mr-1" />
                  <span>Explorar</span>
                </Link>
              </li>
              <li>
                <Link to="/my-courses" className="text-gray-300 hover:text-[#ea2be2] flex items-center transition-colors">
                  <ChevronRight size={16} className="mr-1" />
                  <span>Meus Cursos</span>
                </Link>
              </li>
              <li>
                <Link to="/questions" className="text-gray-300 hover:text-[#ea2be2] flex items-center transition-colors">
                  <ChevronRight size={16} className="mr-1" />
                  <span>Questões</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 - Concursos */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold mb-4">Concursos</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-[#ea2be2] flex items-center transition-colors">
                  <ChevronRight size={16} className="mr-1" />
                  <span>Banco do Brasil</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-[#ea2be2] flex items-center transition-colors">
                  <ChevronRight size={16} className="mr-1" />
                  <span>Concurso INSS</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-[#ea2be2] flex items-center transition-colors">
                  <ChevronRight size={16} className="mr-1" />
                  <span>Concurso Receita Federal</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-[#ea2be2] flex items-center transition-colors">
                  <ChevronRight size={16} className="mr-1" />
                  <span>Concurso Caixa</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4 - Contato */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold mb-4">Contato</h3>
            <div className="flex items-start space-x-3">
              <Mail size={20} className="text-[#ea2be2] mt-1 flex-shrink-0" />
              <span className="text-gray-300">contato@bomestudo.com.br</span>
            </div>
            <div className="mt-6">
              <h4 className="text-sm font-bold mb-2">Receba Novidades</h4>
              <div className="flex mt-2">
                <input 
                  type="email" 
                  placeholder="Seu e-mail" 
                  className="px-3 py-2 text-sm rounded-l-md text-gray-800 w-full focus:outline-none" 
                />
                <button className="bg-[#ea2be2] px-4 py-2 rounded-r-md hover:bg-opacity-90 transition-colors">
                  Enviar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-gray-700 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400 mb-4 md:mb-0">
              © {new Date().getFullYear()} BomEstudo. Todos os direitos reservados.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-sm text-gray-400 hover:text-[#ea2be2] transition-colors">
                Termos de Uso
              </a>
              <a href="#" className="text-sm text-gray-400 hover:text-[#ea2be2] transition-colors">
                Política de Privacidade
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
