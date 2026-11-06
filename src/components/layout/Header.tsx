import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart,
  BookOpen,
  BookMarked,
  ChevronDown,
  CircleUserRound,
  FileText,
  LogIn,
  LogOut,
  Menu,
  MessageSquare,
  PlusCircle,
  Settings,
  Shield,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { useAbrirLogin } from "@/components/auth/LoginObrigatorio";
import { cn } from "@/lib/utils";
import logo from "/lovable-uploads/logo.svg";
import { MenuLateral } from "./MenuLateral";

const ehAtivo = (pathname: string, path: string) => {
  if (path === "/") return pathname === "/";
  if (path === "/teorias") return pathname === "/teorias" || pathname.startsWith("/teoria/");
  return pathname === path || pathname.startsWith(path + "/");
};

/**
 * Topo do site público.
 * - Computador (lg+): links principais no centro (incluindo Notícias) e, à direita,
 *   Meus Cursos + avatar com menu (Cadernos e rankings ficam nesse menu), ou,
 *   para visitantes, um ícone de conta com o mesmo menu + Entrar + Criar conta.
 * - Celular e tablet: logo, Entrar (visitante) e botão que abre o MenuLateral.
 */
export const Header = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, signOut } = useAuth();
  const { config } = useSiteConfig();
  const abrirLogin = useAbrirLogin();
  const [menuAberto, setMenuAberto] = useState(false);
  const [rolou, setRolou] = useState(false);

  useEffect(() => {
    setMenuAberto(false);
  }, [pathname]);

  useEffect(() => {
    const aoRolar = () => setRolou(window.scrollY > 4);
    aoRolar();
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, []);

  const fecharMenu = useCallback(() => setMenuAberto(false), []);

  const p = config.pages;

  const principais = [
    { to: "/explore", rotulo: "Estude Grátis", visivel: p.showExplorePage },
    { to: "/questions", rotulo: "Questões", visivel: p.showQuestionsPage },
    { to: "/teorias", rotulo: "Teorias", visivel: p.showTeoriasPage },
    { to: "/concursos", rotulo: "Concursos", visivel: p.showBlogPage },
    { to: "/blog", rotulo: "Notícias", visivel: p.showBlogPage },
  ].filter((i) => i.visivel !== false);

  const mostrarCadernos = p.showQuestionsPage !== false && p.showQuestionBooksPage !== false;

  const rankings = [
    { to: "/ranking-questoes", rotulo: "Ranking de questões", icone: FileText, visivel: p.showQuestionsPage && p.showQuestionRankingPage !== false },
    { to: "/ranking-comentarios", rotulo: "Ranking de comentários", icone: MessageSquare, visivel: p.showQuestionsPage && p.showCommentRankingPage !== false },
    { to: "/ranking-contribuicoes", rotulo: "Ranking de contribuições", icone: PlusCircle, visivel: true },
  ].filter((i) => i.visivel);

  // Itens que antes ficavam no topo ("Cadernos" e o menu "Mais") e agora vivem no menu da conta.
  const itensExtras = (
    <>
      {mostrarCadernos && (
        <DropdownMenuItem asChild>
          <Link
            to="/cadernos"
            className={cn("cursor-pointer gap-2", ehAtivo(pathname, "/cadernos") && "text-[#5f2ebe] font-medium")}
          >
            <BookMarked className="h-4 w-4 text-[#67748a]" />
            Cadernos
          </Link>
        </DropdownMenuItem>
      )}
      {rankings.length > 0 && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-[11px] font-semibold uppercase tracking-wider text-[#9aa4b5]">
            Rankings
          </DropdownMenuLabel>
          {rankings.map((r) => {
            const Icone = r.icone;
            return (
              <DropdownMenuItem key={r.to} asChild>
                <Link
                  to={r.to}
                  className={cn("cursor-pointer gap-2", ehAtivo(pathname, r.to) && "text-[#5f2ebe] font-medium")}
                >
                  <Icone className="h-4 w-4 text-[#67748a]" />
                  {r.rotulo}
                </Link>
              </DropdownMenuItem>
            );
          })}
        </>
      )}
    </>
  );

  const extrasAtivo = ehAtivo(pathname, "/cadernos") || rankings.some((r) => ehAtivo(pathname, r.to));

  const classeLink = (ativo: boolean) =>
    cn(
      "relative flex h-16 items-center px-1 text-[15px] transition-colors",
      "after:absolute after:inset-x-1 after:bottom-0 after:h-[3px] after:rounded-t-full after:transition-colors",
      ativo
        ? "font-medium text-[#5f2ebe] after:bg-[#5f2ebe]"
        : "text-[#67748a] hover:text-[#272f3c] after:bg-transparent"
    );

  const iniciais = user?.nome ? user.nome.substring(0, 2).toUpperCase() : "US";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-sm px-[10px] md:px-[32px] transition-shadow",
        rolou ? "border-slate-200/70 shadow-[0_1px_8px_rgba(15,23,42,0.06)]" : "border-[rgba(247,248,250,1)]"
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between gap-4">
        <Link to="/" className="shrink-0" aria-label="Página inicial">
          <img src={logo} alt="Bom Estudo" className="h-6 w-auto md:h-auto md:w-[170px] md:aspect-[8.06] object-contain" />
        </Link>

        {/* Links principais (computador) */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8" aria-label="Principal">
          {principais.map((item) => {
            const ativo = ehAtivo(pathname, item.to);
            return (
              <Link key={item.to} to={item.to} className={classeLink(ativo)} aria-current={ativo ? "page" : undefined}>
                {item.rotulo}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          {user ? (
            <>
              {p.showMyCoursesPage && (
                <Link
                  to="/my-courses"
                  className={cn(
                    "hidden lg:inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                    ehAtivo(pathname, "/my-courses")
                      ? "bg-[#5f2ebe] text-white"
                      : "bg-[#5f2ebe]/10 text-[#5f2ebe] hover:bg-[#5f2ebe]/15"
                  )}
                >
                  <BookOpen className="h-4 w-4" />
                  Meus Cursos
                </Link>
              )}
              <Link
                to="/dashboard"
                title="Dashboard"
                aria-label="Dashboard"
                className={cn(
                  "hidden lg:flex h-10 w-10 items-center justify-center rounded-full transition-colors",
                  ehAtivo(pathname, "/dashboard") ? "bg-[#5f2ebe]/10 text-[#5f2ebe]" : "text-[#67748a] hover:bg-slate-100"
                )}
              >
                <BarChart className="h-5 w-5" />
              </Link>

              <DropdownMenu modal={false}>
                <DropdownMenuTrigger
                  className={cn(
                    "hidden lg:flex items-center gap-1 rounded-full p-0.5 pr-1.5 outline-none hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-[#5f2ebe]/40",
                    extrasAtivo && "ring-2 ring-[#5f2ebe]/30"
                  )}
                  aria-label="Menu da conta"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.foto_perfil || undefined} />
                    <AvatarFallback className="bg-[#5f2ebe]/10 text-sm text-[#5f2ebe]">{iniciais}</AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-4 w-4 text-[#67748a]" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 max-h-[calc(100vh-5rem)] overflow-y-auto">
                  <DropdownMenuLabel className="font-normal">
                    <p className="truncate text-sm font-medium text-[#272f3c]">{user.nome || "Aluno"}</p>
                    <p className="truncate text-xs text-[#67748a]">{user.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer gap-2">
                      <BarChart className="h-4 w-4 text-[#67748a]" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/contribuir" className="cursor-pointer gap-2">
                      <PlusCircle className="h-4 w-4 text-[#67748a]" />
                      Contribuir com conteúdo
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="cursor-pointer gap-2">
                      <Settings className="h-4 w-4 text-[#67748a]" />
                      Configurações
                    </Link>
                  </DropdownMenuItem>
                  {itensExtras}
                  {(user.role === "admin" || user.role === "jornalista") && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to={user.role === "admin" ? "/admin" : "/admin/posts"} className="cursor-pointer gap-2">
                          <Shield className="h-4 w-4 text-[#67748a]" />
                          {user.role === "admin" ? "Área administrativa" : "Criar/editar posts"}
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => signOut()} className="cursor-pointer gap-2 text-red-600 focus:text-red-600">
                    <LogOut className="h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              {(mostrarCadernos || rankings.length > 0) && (
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger
                    className={cn(
                      "hidden lg:flex items-center gap-1 rounded-full p-1 pr-1.5 outline-none hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-[#5f2ebe]/40",
                      extrasAtivo ? "text-[#5f2ebe]" : "text-[#67748a]"
                    )}
                    aria-label="Mais opções"
                    title="Cadernos e rankings"
                  >
                    <CircleUserRound className="h-8 w-8" strokeWidth={1.5} />
                    <ChevronDown className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 max-h-[calc(100vh-5rem)] overflow-y-auto">
                    <DropdownMenuLabel className="font-normal">
                      <p className="text-sm font-medium text-[#272f3c]">Visitante</p>
                      <p className="text-xs text-[#67748a]">Entre para salvar seu progresso</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {itensExtras}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => navigate("/login")} className="cursor-pointer gap-2">
                      <LogIn className="h-4 w-4 text-[#67748a]" />
                      Entrar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => abrirLogin({ aba: "cadastrar", motivo: "salvar seu progresso" })}
                      className="cursor-pointer gap-2 text-[#5f2ebe] focus:text-[#5f2ebe]"
                    >
                      <PlusCircle className="h-4 w-4" />
                      Criar conta grátis
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <button
                onClick={() => navigate("/login")}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-[#272f3c] hover:bg-slate-50 lg:border-0 lg:px-3 lg:py-2 lg:text-[15px] lg:text-[#67748a] lg:hover:text-[#272f3c] lg:hover:bg-transparent"
              >
                Entrar
              </button>
              <button
                onClick={() => abrirLogin({ aba: "cadastrar", motivo: "salvar seu progresso" })}
                className="hidden lg:inline-flex rounded-lg bg-[#5f2ebe] px-4 py-2 text-sm font-medium text-white hover:bg-[#5126a3]"
              >
                Criar conta grátis
              </button>
            </>
          )}

          {/* Celular e tablet: abre o menu lateral */}
          <button
            onClick={() => setMenuAberto(true)}
            aria-label="Abrir menu"
            aria-expanded={menuAberto}
            className="flex lg:hidden h-10 w-10 items-center justify-center rounded-full text-gray-700 hover:bg-slate-100"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      <MenuLateral aberto={menuAberto} aoFechar={fecharMenu} />
    </header>
  );
};
