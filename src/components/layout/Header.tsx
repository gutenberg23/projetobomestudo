import { Menu, FileText, Newspaper, Trophy, Book, Search } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "../ui/button";
import { useAuth } from "@/hooks/useAuth";
import logo from "/lovable-uploads/logo.svg";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { cn } from "@/lib/utils";
import { useState, useEffect, useCallback } from "react";
import { MenuLateral } from "./MenuLateral";

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { config } = useSiteConfig();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Fecha a sidebar quando a rota muda
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  const fecharMenu = useCallback(() => setIsSidebarOpen(false), []);
  
  // Função para verificar se o link corresponde à página atual
  const isActive = (path: string) => {
    // Verificação mais precisa considerando rotas aninhadas
    if (path === '/') {
      return location.pathname === '/';
    }
    // Para teorias, verificar se está na página de teorias ou em uma teoria específica
    if (path === '/teorias') {
      return location.pathname === '/teorias' || location.pathname.startsWith('/teoria/');
    }
    return location.pathname.startsWith(path);
  };
  
  // Função para gerar a classe do link com base no estado ativo
  const getLinkClasses = (path: string) => {
    return cn(
      "flex items-center gap-1 transition-colors text-sm md:text-base",
      isActive(path) 
        ? "text-[#5f2ebe] font-medium bg-[#5f2ebe]/10 px-3 py-1.5 rounded-md" 
        : "text-[#67748a] hover:text-[#5f2ebe] font-extralight"
    );
  };
  
  return (
    <header className="bg-white/90 backdrop-blur-sm min-h-[64px] md:min-h-[88px] w-full flex items-center justify-center flex-wrap border-b border-[rgba(247,248,250,1)] px-[10px] md:px-[32px]">
      <div className="max-w-[1400px] w-full flex items-center justify-between">
        <div className="flex min-h-[64px] md:min-h-[88px] flex-col items-start justify-center w-[140px] md:w-[230px] py-3 md:py-[21px]">
          <Link to="/">
            <img loading="lazy" src={logo} alt="Bom Estudo" className="aspect-[8.06] w-[130px] md:w-[230px] object-contain" />
          </Link>
        </div>

        <div className="hidden md:flex items-center space-x-6 mr-6">
          {config.pages.showBlogPage && (
            <Link to="/blog" className={getLinkClasses("/blog")}>
              <Newspaper className="w-4 h-4 px-px" />
              <span className="text-sm md:text-base">Blog</span>
            </Link>
          )}
          {config.pages.showQuestionsPage && (
            <Link to="/questions" className={getLinkClasses("/questions")}>
              <FileText className="w-4 h-4" />
              <span className="text-sm md:text-base">Questões</span>
            </Link>
          )}
          {config.pages.showQuestionsPage && (
            <Link to="/cadernos" className={getLinkClasses("/cadernos")}>
              <Book className="w-4 h-4" />
              <span className="text-sm md:text-base">Cadernos</span>
            </Link>
          )}
          {config.pages.showExplorePage && (
            <Link to="/explore" className={getLinkClasses("/explore")}>
              <Trophy className="w-4 h-4" />
              <span className="text-sm md:text-base">Estude Grátis</span>
            </Link>
          )}
          <Link to="/concursos" className={getLinkClasses("/concursos")}>
            <Search className="w-4 h-4" />
            <span className="text-sm md:text-base">Concursos</span>
          </Link>
        </div>

        <div className="flex items-center gap-2.5">
          {!user ? <Button variant="outline" onClick={() => navigate("/login")} className="h-9 px-3 md:h-10 md:px-4 text-sm md:text-base">
              Entrar
            </Button> : null}

          {/* Visitantes: o menu só aparece no celular (no computador os links já estão no topo) */}
          <button 
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Abrir menu"
            aria-expanded={isSidebarOpen}
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-full cursor-pointer text-gray-700 hover:bg-slate-100",
              !user && "md:hidden"
            )}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      <MenuLateral aberto={isSidebarOpen} aoFechar={fecharMenu} />
    </header>
  );
};