import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import {
  Award,
  BarChart,
  Book,
  BookOpen,
  ChevronDown,
  ChevronRight,
  FileText,
  GraduationCap,
  LibraryBig,
  LogOut,
  MessageSquare,
  Newspaper,
  PlusCircle,
  Search,
  Settings,
  Shield,
  Trophy,
  X,
  type LucideIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { useAbrirLogin } from "@/components/auth/LoginObrigatorio";
import { cn } from "@/lib/utils";
import logo from "/lovable-uploads/logo.svg";

type ItemMenu = {
  to: string;
  rotulo: string;
  icone: LucideIcon;
  descricao?: string;
  visivel?: boolean;
};

const ROXO = "#5f2ebe";

const ehAtivo = (pathname: string, path: string) => {
  if (path === "/") return pathname === "/";
  if (path === "/teorias") return pathname === "/teorias" || pathname.startsWith("/teoria/");
  if (path === "/cadernos") return pathname.startsWith("/cadernos");
  if (path === "/questions") return pathname.startsWith("/questions");
  return pathname === path || pathname.startsWith(path + "/");
};

const TituloSecao = ({ children }: { children: React.ReactNode }) => (
  <p className="px-5 pt-5 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#9aa4b5]">
    {children}
  </p>
);

const LinkMenu = ({ item, ativo }: { item: ItemMenu; ativo: boolean }) => {
  const Icone = item.icone;
  return (
    <Link
      to={item.to}
      aria-current={ativo ? "page" : undefined}
      className={cn(
        "relative mx-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] transition-colors",
        ativo
          ? "bg-[#5f2ebe]/10 font-medium text-[#5f2ebe]"
          : "text-[#272f3c] hover:bg-slate-50 active:bg-slate-100"
      )}
    >
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
          ativo ? "bg-[#5f2ebe] text-white" : "bg-slate-100 text-[#67748a]"
        )}
      >
        <Icone className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate">{item.rotulo}</span>
        {item.descricao && (
          <span className="block truncate text-xs font-light text-[#67748a]">{item.descricao}</span>
        )}
      </span>
    </Link>
  );
};

interface MenuLateralProps {
  aberto: boolean;
  aoFechar: () => void;
}

/**
 * Menu lateral do site público. No celular é a navegação completa (para
 * visitantes e alunos). No computador abre pelo botão de menu de quem está
 * logado. Feito com portal simples, sem Radix, para não esbarrar no problema
 * das duas cópias de dismissable-layer.
 */
export const MenuLateral = ({ aberto, aoFechar }: MenuLateralProps) => {
  const { pathname } = useLocation();
  const { user, signOut } = useAuth();
  const { config } = useSiteConfig();
  const abrirLogin = useAbrirLogin();
  const [montado, setMontado] = useState(aberto);
  const [visivel, setVisivel] = useState(false);

  const rotasRanking = ["/ranking-questoes", "/ranking-comentarios", "/ranking-contribuicoes"];
  const [rankingsAbertos, setRankingsAbertos] = useState(() =>
    rotasRanking.some((r) => pathname.startsWith(r))
  );

  // Monta, anima a entrada e desmonta depois da animação de saída
  useEffect(() => {
    if (aberto) {
      setMontado(true);
      const id = requestAnimationFrame(() => requestAnimationFrame(() => setVisivel(true)));
      return () => cancelAnimationFrame(id);
    }
    setVisivel(false);
    const t = setTimeout(() => setMontado(false), 300);
    return () => clearTimeout(t);
  }, [aberto]);

  // Esc fecha e o fundo não rola com o menu aberto
  useEffect(() => {
    if (!aberto) return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") aoFechar();
    };
    const overflowAntigo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", aoTeclar);
    return () => {
      document.body.style.overflow = overflowAntigo;
      window.removeEventListener("keydown", aoTeclar);
    };
  }, [aberto, aoFechar]);

  if (!montado) return null;

  const p = config.pages;

  const estudar: ItemMenu[] = [
    { to: "/explore", rotulo: "Estude Grátis", icone: GraduationCap, descricao: "Cursos e disciplinas", visivel: p.showExplorePage },
    { to: "/questions", rotulo: "Questões", icone: FileText, descricao: "Resolva e filtre questões", visivel: p.showQuestionsPage },
    { to: "/cadernos", rotulo: "Cadernos", icone: Book, descricao: "Listas de questões", visivel: p.showQuestionsPage && p.showQuestionBooksPage !== false },
    { to: "/teorias", rotulo: "Teorias", icone: LibraryBig, descricao: "Resumos por assunto", visivel: p.showTeoriasPage },
  ];

  const informar: ItemMenu[] = [
    { to: "/concursos", rotulo: "Concursos", icone: Search, visivel: p.showBlogPage },
    { to: "/blog", rotulo: "Blog", icone: Newspaper, visivel: p.showBlogPage },
  ];

  const minhaArea: ItemMenu[] = [
    { to: "/my-courses", rotulo: "Meus Cursos", icone: BookOpen, visivel: p.showMyCoursesPage },
    { to: "/dashboard", rotulo: "Dashboard", icone: BarChart },
    { to: "/contribuir", rotulo: "Contribuir com conteúdo", icone: PlusCircle },
  ];

  const rankings: ItemMenu[] = [
    { to: "/ranking-questoes", rotulo: "Questões", icone: FileText, visivel: p.showQuestionsPage && p.showQuestionRankingPage !== false },
    { to: "/ranking-comentarios", rotulo: "Comentários", icone: MessageSquare, visivel: p.showQuestionsPage && p.showCommentRankingPage !== false },
    { to: "/ranking-contribuicoes", rotulo: "Contribuições", icone: PlusCircle },
  ];

  const filtrar = (itens: ItemMenu[]) => itens.filter((i) => i.visivel !== false);
  const rankingsVisiveis = filtrar(rankings);
  const rankingAtivo = rankingsVisiveis.some((r) => ehAtivo(pathname, r.to));

  const iniciais = user?.nome ? user.nome.substring(0, 2).toUpperCase() : "US";

  const abrirCadastro = (aba: "entrar" | "cadastrar") => {
    aoFechar();
    abrirLogin({ aba, motivo: aba === "cadastrar" ? "salvar seu progresso" : "continuar" });
  };

  return createPortal(
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label="Menu">
      <div
        className={cn(
          "absolute inset-0 bg-black/50 transition-opacity duration-300",
          visivel ? "opacity-100" : "opacity-0"
        )}
        onClick={aoFechar}
      />

      <aside
        className={cn(
          "absolute right-0 top-0 flex h-full w-[86vw] max-w-[340px] flex-col bg-white shadow-xl transition-transform duration-300 ease-out",
          visivel ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Topo */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 px-4">
          <Link to="/" aria-label="Página inicial">
            <img src={logo} alt="Bom Estudo" className="h-6 w-auto" />
          </Link>
          <button
            onClick={aoFechar}
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#67748a] hover:bg-slate-100"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain pb-4">
          {/* Perfil ou chamada para entrar */}
          {user ? (
            <Link
              to="/settings"
              className="mx-3 mt-3 flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3 hover:bg-slate-100"
            >
              <Avatar className="h-11 w-11 border-2 border-white">
                <AvatarImage src={user.foto_perfil || undefined} />
                <AvatarFallback className="bg-[#5f2ebe]/10 text-[#5f2ebe]">{iniciais}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#272f3c]">{user.nome || "Aluno"}</p>
                <p className="truncate text-xs text-[#67748a]">{user.email}</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-[#9aa4b5]" />
            </Link>
          ) : (
            <div className="mx-3 mt-3 rounded-xl bg-[#5f2ebe]/[0.06] p-4">
              <p className="text-sm font-medium text-[#272f3c]">Estude de graça no Bom Estudo</p>
              <p className="mt-0.5 text-xs text-[#67748a]">
                Crie sua conta para salvar seu progresso, cadernos e estatísticas.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  onClick={() => abrirCadastro("cadastrar")}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-white"
                  style={{ backgroundColor: ROXO }}
                >
                  Criar conta
                </button>
                <button
                  onClick={() => abrirCadastro("entrar")}
                  className="rounded-lg border border-[#5f2ebe]/30 bg-white px-3 py-2 text-sm font-medium text-[#5f2ebe]"
                >
                  Entrar
                </button>
              </div>
            </div>
          )}

          {user && (
            <>
              <TituloSecao>Minha área</TituloSecao>
              {filtrar(minhaArea).map((item) => (
                <LinkMenu key={item.to} item={item} ativo={ehAtivo(pathname, item.to)} />
              ))}
            </>
          )}

          <TituloSecao>Estudar</TituloSecao>
          {filtrar(estudar).map((item) => (
            <LinkMenu key={item.to} item={item} ativo={ehAtivo(pathname, item.to)} />
          ))}

          {filtrar(informar).length > 0 && (
            <>
              <TituloSecao>Concursos e notícias</TituloSecao>
              {filtrar(informar).map((item) => (
                <LinkMenu key={item.to} item={item} ativo={ehAtivo(pathname, item.to)} />
              ))}
            </>
          )}

          {rankingsVisiveis.length > 0 && (
            <>
              <TituloSecao>Comunidade</TituloSecao>
              <button
                onClick={() => setRankingsAbertos((v) => !v)}
                aria-expanded={rankingsAbertos}
                className={cn(
                  "mx-2 flex w-[calc(100%-1rem)] items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[15px] transition-colors",
                  rankingAtivo && !rankingsAbertos
                    ? "bg-[#5f2ebe]/10 font-medium text-[#5f2ebe]"
                    : "text-[#272f3c] hover:bg-slate-50"
                )}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-amber-100 text-amber-600">
                  <Trophy className="h-4 w-4" />
                </span>
                <span className="flex-1">Rankings</span>
                <ChevronDown
                  className={cn("h-4 w-4 text-[#9aa4b5] transition-transform", rankingsAbertos && "rotate-180")}
                />
              </button>
              {rankingsAbertos && (
                <div className="ml-[2.1rem] mr-2 mt-0.5 border-l border-slate-200 pl-2">
                  {rankingsVisiveis.map((item) => {
                    const ativo = ehAtivo(pathname, item.to);
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        aria-current={ativo ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm",
                          ativo
                            ? "bg-[#5f2ebe]/10 font-medium text-[#5f2ebe]"
                            : "text-[#67748a] hover:bg-slate-50 hover:text-[#272f3c]"
                        )}
                      >
                        <Award className="h-3.5 w-3.5" />
                        {item.rotulo}
                      </Link>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {(user?.role === "admin" || user?.role === "jornalista") && (
            <>
              <TituloSecao>Gestão</TituloSecao>
              {user.role === "admin" && (
                <LinkMenu item={{ to: "/admin", rotulo: "Área administrativa", icone: Shield }} ativo={false} />
              )}
              {user.role === "jornalista" && (
                <LinkMenu item={{ to: "/admin/posts", rotulo: "Criar/editar posts", icone: FileText }} ativo={false} />
              )}
            </>
          )}
        </div>

        {/* Rodapé fixo */}
        {user && (
          <div className="grid shrink-0 grid-cols-2 gap-2 border-t border-slate-100 p-3">
            <Link
              to="/settings"
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm",
                ehAtivo(pathname, "/settings")
                  ? "bg-[#5f2ebe]/10 font-medium text-[#5f2ebe]"
                  : "bg-slate-50 text-[#272f3c] hover:bg-slate-100"
              )}
            >
              <Settings className="h-4 w-4" />
              Configurações
            </Link>
            <button
              onClick={() => {
                aoFechar();
                signOut();
              }}
              className="flex items-center justify-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-600 hover:bg-red-100"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </div>
        )}
      </aside>
    </div>,
    document.body
  );
};
