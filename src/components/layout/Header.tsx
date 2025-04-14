import { Menu, FileText, BookOpen, Settings, LogOut, Newspaper, Trophy, Shield, Book, BarChart, Search } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { useAuth } from "@/hooks/useAuth";
import logo from "/lovable-uploads/logo.svg";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { cn } from "@/lib/utils";

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { config } = useSiteConfig();
  
  // Função para verificar se o link corresponde à página atual
  const isActive = (path: string) => {
    // Verificação mais precisa considerando rotas aninhadas
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };
  
  // Função para gerar a classe do link com base no estado ativo
  const getLinkClasses = (path: string) => {
    return cn(
      "flex items-center gap-1 transition-colors",
      isActive(path) 
        ? "text-[#5f2ebe] font-medium bg-[#5f2ebe]/10 px-3 py-1.5 rounded-md" 
        : "text-[#67748a] hover:text-[#5f2ebe] font-extralight"
    );
  };
  
  // Mesma função para os links mobile
  const getMobileLinkClasses = (path: string) => {
    return cn(
      "px-4 py-3 text-sm font-light flex items-center gap-2",
      isActive(path)
        ? "text-[#5f2ebe] bg-[#5f2ebe]/10"
        : "text-gray-700 hover:bg-slate-50 hover:text-[#5f2ebe]"
    );
  };

  return (
    <header className="bg-white/90 backdrop-blur-sm min-h-[88px] w-full flex items-center justify-center flex-wrap border-b border-[rgba(247,248,250,1)] z-40 px-4">
      <div className="max-w-[1400px] w-full flex items-center justify-between">
        <div className="flex min-h-[88px] flex-col items-stretch justify-center w-[230px] py-[21px]">
          <Link to="/">
            <img loading="lazy" src={logo} alt="Company Logo" className="aspect-[8.06] w-[230px] md:w-[230px] w-[120px] object-contain" />
          </Link>
        </div>

        <div className="hidden md:flex items-center space-x-4 mr-6">
          {config.pages.showBlogPage && (
            <Link to="/blog" className={getLinkClasses("/blog")}>
              <Newspaper className="w-4 h-4 px-px" />
              <span>Blog</span>
            </Link>
          )}
          {config.pages.showQuestionsPage && (
            <Link to="/questions" className={getLinkClasses("/questions")}>
              <FileText className="w-4 h-4" />
              <span>Questões</span>
            </Link>
          )}
          {config.pages.showQuestionsPage && (
            <Link to="/cadernos" className={getLinkClasses("/cadernos")}>
              <Book className="w-4 h-4" />
              <span>Cadernos</span>
            </Link>
          )}
          {config.pages.showExplorePage && (
            <Link to="/explore" className={getLinkClasses("/explore")}>
              <Trophy className="w-4 h-4" />
              <span>Estude Grátis</span>
            </Link>
          )}
          <Link to="/concursos" className={getLinkClasses("/concursos")}>
            <Search className="w-4 h-4" />
            <span>Concursos</span>
          </Link>
        </div>

        <div className="flex items-center gap-2.5">
          {!user ? <Button variant="outline" onClick={() => navigate("/login")} className="mr-2">
              Entrar
            </Button> : null}

          <Popover>
            <PopoverTrigger asChild>
              <button className={`flex items-center justify-center w-10 h-10 rounded-full border-2 border-white cursor-pointer ${!user ? 'hidden' : ''}`}>
                <Menu className="w-6 h-6 text-gray-700" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0 border border-gray-100">
              {user ? <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-[50px] h-[50px] border-2 border-white">
                      <AvatarImage src={user.foto_perfil || "https://github.com/shadcn.png"} />
                      <AvatarFallback>{user.nome ? user.nome.substring(0, 2).toUpperCase() : "US"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900">{user.nome || "Usuário"}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </div> : null}
              <nav className="flex flex-col">
                {config.pages.showMyCoursesPage && (
                  <Link to="/my-courses" className={getMobileLinkClasses("/my-courses")}>
                    <BookOpen className="w-4 h-4" />
                    Meus Cursos
                  </Link>
                )}
                <Link to="/dashboard" className={getMobileLinkClasses("/dashboard")}>
                  <BarChart className="w-4 h-4" />
                  Dashboard
                </Link>
                {/* Mostra o link "Cadernos de Questões" apenas no modo mobile */}
                {config.pages.showQuestionsPage && (
                  <div className="md:hidden">
                    <Link to="/cadernos" className={getMobileLinkClasses("/cadernos")}>
                      <Book className="w-4 h-4" />
                      Cadernos de Questões
                    </Link>
                  </div>
                )}
                <Link to="/settings" className={getMobileLinkClasses("/settings")}>
                  <Settings className="w-4 h-4" />
                  Configurações
                </Link>
                {user?.role === "admin" && (
                  <Link to="/admin" className={getMobileLinkClasses("/admin")}>
                    <Shield className="w-4 h-4" />
                    Área Administrativa
                  </Link>
                )}
                {user?.role === "jornalista" && (
                  <Link to="/admin/posts" className={getMobileLinkClasses("/admin/posts")}>
                    <FileText className="w-4 h-4" />
                    Criar/Editar Posts
                  </Link>
                )}
                <div className="md:hidden border-t border-gray-100">
                  {config.pages.showBlogPage && (
                    <Link to="/blog" className={getMobileLinkClasses("/blog")}>
                      <Newspaper className="w-4 h-4" />
                      Blog
                    </Link>
                  )}
                  {config.pages.showQuestionsPage && (
                    <Link to="/questions" className={getMobileLinkClasses("/questions")}>
                      <FileText className="w-4 h-4" />
                      Questões
                    </Link>
                  )}
                  {config.pages.showExplorePage && (
                    <Link to="/explore" className={getMobileLinkClasses("/explore")}>
                      <Trophy className="w-4 h-4" />
                      Estude Grátis
                    </Link>
                  )}
                  <Link to="/concursos" className={getMobileLinkClasses("/concursos")}>
                    <Search className="w-4 h-4" />
                    Concursos
                  </Link>
                </div>
                {user ? <div className="border-t border-gray-100">
                    <button onClick={signOut} className="w-full text-left px-4 py-3 text-sm font-light text-red-600 hover:bg-slate-50 flex items-center gap-2">
                      <LogOut className="w-4 h-4" />
                      Sair
                    </button>
                  </div> : null}
              </nav>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
};
