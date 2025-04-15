import React from "react";
import { Instagram, Facebook, Twitter, Youtube, Mail, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import logoFooter from "/lovable-uploads/logo-footer.svg";
import { useSiteConfig } from "@/hooks/useSiteConfig";

export const Footer = () => {
  const { config } = useSiteConfig();

  // Formatar número de WhatsApp para uso em href
  const formatWhatsAppUrl = (number: string) => {
    const cleanNumber = number.replace(/\D/g, '');
    return `https://wa.me/${cleanNumber}`;
  };

  // Determinar se o link deve usar o componente Link do React Router ou um <a> normal
  const renderLink = (url: string, text: string) => {
    if (url.startsWith('/') && !url.startsWith('//') && !url.startsWith('/#')) {
      // URL interna - usar o React Router Link
      return (
        <Link to={url} className="text-gray-300 hover:text-[#5f2ebe] flex items-center transition-colors">
          <ChevronRight size={16} className="mr-1" />
          <span>{text}</span>
        </Link>
      );
    } else {
      // URL externa ou especial (email, telefone) - usar <a>
      return (
        <a href={url} className="text-gray-300 hover:text-[#5f2ebe] flex items-center transition-colors" target="_blank" rel="noopener noreferrer">
          <ChevronRight size={16} className="mr-1" />
          <span>{text}</span>
        </a>
      );
    }
  };

  return (
    <footer className="w-full pt-[50px] pb-[30px] px-4 text-white mt-10 bg-[#2a2438] flex justify-center">
      <div className="max-w-[1400px] w-full">
        {/* Footer Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Column 1 - Logo and About */}
          <div className="space-y-4">
            <img src={logoFooter} alt={`${config.general.siteName} Logo`} className="w-[194px] mb-4" />
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
              {config.footer.navegacao.length > 0 ? (
                config.footer.navegacao.map(link => (
                  <li key={link.id}>
                    {renderLink(link.url, link.text)}
                  </li>
                ))
              ) : (
                <>
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
                </>
              )}
            </ul>
          </div>

          {/* Column 3 - Concursos */}
          <div>
            <h3 className="text-lg font-bold mb-4">Concursos</h3>
            <ul className="space-y-2">
              {config.footer.concurso.length > 0 ? (
                config.footer.concurso.map(link => (
                  <li key={link.id}>
                    {renderLink(link.url, link.text)}
                  </li>
                ))
              ) : (
                <>
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
                </>
              )}
            </ul>
          </div>

          {/* Column 4 - Contato */}
          <div>
            <h3 className="text-lg font-bold mb-4">Contato</h3>
            {config.footer.contato.length > 0 ? (
              <ul className="space-y-3">
                {config.footer.contato.map(link => (
                  <li key={link.id}>
                    {renderLink(link.url, link.text)}
                  </li>
                ))}
              </ul>
            ) : (
              <>
                <div className="flex items-start space-x-3">
                  <Mail size={20} className="text-[#5f2ebe] mt-1 flex-shrink-0" />
                  <a href={`mailto:${config.general.contactEmail}`} className="text-gray-300 hover:text-[#5f2ebe] transition-colors">
                    {config.general.contactEmail}
                  </a>
                </div>
                {config.general.whatsappNumber && (
                  <div className="flex items-start space-x-3 mt-3">
                    <svg className="text-[#5f2ebe] w-5 h-5 mt-1 flex-shrink-0" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    <a 
                      href={formatWhatsAppUrl(config.general.whatsappNumber)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-[#5f2ebe] transition-colors"
                    >
                      WhatsApp
                    </a>
                  </div>
                )}
              </>
            )}
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
              {config.general.footerText || `© ${new Date().getFullYear()} ${config.general.siteName}. Todos os direitos reservados.`}
            </p>
            <div className="flex space-x-6">
              <a href="/termos-e-politicas" className="text-sm text-gray-400 hover:text-[#5f2ebe] transition-colors">
                Termos de Uso
              </a>
              <a href="/termos-e-politicas" className="text-sm text-gray-400 hover:text-[#5f2ebe] transition-colors">
                Política de Privacidade
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
