import { useCallback, useEffect, useMemo, useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import "@/styles/admin.css";
import { usePermissions } from "@/hooks/usePermissions";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ADMIN_NAV, AdminNavGroup, encontrarItem, filtrarNavPorPapel, itemAtivo } from "./adminNav";

const CHAVE_COLAPSADO = "admin.sidebar.colapsado";
const CHAVE_GRUPOS = "admin.sidebar.grupos";

const lerLocal = <T,>(chave: string, padrao: T): T => {
  try {
    const v = localStorage.getItem(chave);
    return v ? (JSON.parse(v) as T) : padrao;
  } catch {
    return padrao;
  }
};

const gravarLocal = (chave: string, valor: unknown) => {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    // navegação privada: ignora
  }
};

const normalizar = (t: string) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

/** Conta envios e correções aguardando análise (só admins enxergam). */
const usePendenciasModeracao = (ativo: boolean, pathname: string) => {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!ativo) return;
    let cancelado = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;
    const contar = async (tabela: string) => {
      const { count, error } = await db.from(tabela).select("id", { count: "exact", head: true }).eq("status", "pendente");
      return error ? 0 : count || 0;
    };
    Promise.all([contar("conteudo_submissoes"), contar("teoria_correcoes")])
      .then(([a, b]) => !cancelado && setTotal(a + b))
      .catch(() => undefined);
    return () => {
      cancelado = true;
    };
    // Recalcula ao trocar de página (ex.: depois de moderar)
  }, [ativo, pathname]);

  return total;
};

interface NavProps {
  grupos: AdminNavGroup[];
  colapsado: boolean;
  gruposAbertos: Record<string, boolean>;
  alternarGrupo: (id: string) => void;
  pendencias: number;
  onNavegar?: () => void;
}

const NavegacaoLateral = ({ grupos, colapsado, gruposAbertos, alternarGrupo, pendencias, onNavegar }: NavProps) => {
  const location = useLocation();
  const [filtro, setFiltro] = useState("");

  const gruposVisiveis = useMemo(() => {
    const termo = normalizar(filtro.trim());
    if (!termo) return grupos;
    return grupos
      .map((g) => ({
        ...g,
        items: g.items.filter((i) =>
          normalizar(`${i.label} ${i.descricao || ""} ${i.palavras || ""} ${g.label}`).includes(termo)
        ),
      }))
      .filter((g) => g.items.length > 0);
  }, [grupos, filtro]);

  return (
    <nav className="flex-1 overflow-y-auto px-3 py-3 scrollbar-thin" aria-label="Menu do admin">
      {!colapsado && (
        <div className="relative mb-3">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Filtrar menu"
            className="w-full rounded-md border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-7 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5f2ebe]/30 focus:border-[#5f2ebe]/40"
          />
          {filtro && (
            <button
              onClick={() => setFiltro("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label="Limpar filtro"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      {gruposVisiveis.length === 0 && <p className="px-2 text-sm text-slate-500">Nada encontrado.</p>}

      <ul className="space-y-4">
        {gruposVisiveis.map((grupo) => {
          const aberto = colapsado || !!filtro || gruposAbertos[grupo.id] !== false;
          return (
            <li key={grupo.id}>
              {colapsado ? (
                <div className="mx-auto mb-1 h-px w-6 bg-slate-200" aria-hidden />
              ) : (
                <button
                  onClick={() => alternarGrupo(grupo.id)}
                  className="flex w-full items-center justify-between px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-600"
                  aria-expanded={aberto}
                >
                  {grupo.label}
                  {aberto ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                </button>
              )}
              {aberto && (
                <ul className="space-y-0.5">
                  {grupo.items.map((item) => {
                    const ativo = itemAtivo(item.path, location.pathname);
                    const contador = item.badge === "moderacao" ? pendencias : 0;
                    const Icone = item.icon;
                    return (
                      <li key={item.path}>
                        <Link
                          to={item.path}
                          onClick={onNavegar}
                          title={colapsado ? item.label : item.descricao}
                          aria-current={ativo ? "page" : undefined}
                          className={cn(
                            "group relative flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors",
                            colapsado && "justify-center",
                            ativo
                              ? "bg-[#5f2ebe]/10 font-medium text-[#5f2ebe]"
                              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                          )}
                        >
                          {ativo && !colapsado && (
                            <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-[#5f2ebe]" aria-hidden />
                          )}
                          <Icone className={cn("h-[18px] w-[18px] shrink-0", ativo ? "text-[#5f2ebe]" : "text-slate-400 group-hover:text-slate-600")} />
                          {!colapsado && <span className="flex-1 truncate">{item.label}</span>}
                          {contador > 0 &&
                            (colapsado ? (
                              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#ea2be2]" aria-label={`${contador} pendentes`} />
                            ) : (
                              <span className="rounded-full bg-[#ea2be2] px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
                                {contador > 99 ? "99+" : contador}
                              </span>
                            ))}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isJornalista, isAdmin } = usePermissions();
  const { user, profile, signOut } = useAuth();

  const [colapsado, setColapsado] = useState<boolean>(() => lerLocal(CHAVE_COLAPSADO, false));
  const [gruposAbertos, setGruposAbertos] = useState<Record<string, boolean>>(() => lerLocal(CHAVE_GRUPOS, {}));
  const [menuMobile, setMenuMobile] = useState(false);
  const [paleta, setPaleta] = useState(false);

  const grupos = useMemo(() => filtrarNavPorPapel(ADMIN_NAV, isJornalista()), [isJornalista]);
  const atual = encontrarItem(location.pathname, grupos);
  const pendencias = usePendenciasModeracao(isAdmin(), location.pathname);

  useEffect(() => gravarLocal(CHAVE_COLAPSADO, colapsado), [colapsado]);
  useEffect(() => gravarLocal(CHAVE_GRUPOS, gruposAbertos), [gruposAbertos]);

  // Garante que o grupo da página atual esteja aberto
  useEffect(() => {
    if (atual && gruposAbertos[atual.grupo.id] === false) {
      setGruposAbertos((g) => ({ ...g, [atual.grupo.id]: true }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Título da aba
  useEffect(() => {
    document.title = atual ? `${atual.item.label} · Admin Bom Estudo` : "Admin Bom Estudo";
  }, [atual]);

  // Ctrl/Cmd + K abre a navegação rápida
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaleta((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const alternarGrupo = useCallback(
    (id: string) => setGruposAbertos((g) => ({ ...g, [id]: g[id] === false })),
    []
  );

  const nomeUsuario = profile?.nome || user?.email?.split("@")[0] || "Admin";
  const foto = profile?.foto_perfil || profile?.foto_url || undefined;

  const sair = async () => {
    await signOut();
    navigate("/admin/login");
  };

  const marca = (compacta: boolean) => (
    <Link to="/admin" className="flex items-center gap-2 min-w-0" onClick={() => setMenuMobile(false)}>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#5f2ebe] to-[#ea2be2] text-sm font-bold text-white">
        BE
      </span>
      {!compacta && (
        <span className="truncate">
          <span className="block text-sm font-semibold leading-tight text-[#272f3c]">Bom Estudo</span>
          <span className="block text-[11px] leading-tight text-slate-400">Painel administrativo</span>
        </span>
      )}
    </Link>
  );

  return (
    <div className="admin-shell flex h-screen bg-[#f6f7fb] font-inter text-[#272f3c]">
      {/* Sidebar desktop */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r border-slate-200 bg-white transition-[width] duration-200",
          colapsado ? "w-[68px]" : "w-[248px]"
        )}
      >
        <div className={cn("flex h-14 items-center border-b border-slate-100 px-3", colapsado ? "justify-center" : "justify-between")}>
          {marca(colapsado)}
          {!colapsado && (
            <button
              onClick={() => setColapsado(true)}
              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              title="Recolher menu"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          )}
        </div>
        {colapsado && (
          <button
            onClick={() => setColapsado(false)}
            className="mx-auto mt-2 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            title="Expandir menu"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>
        )}
        <NavegacaoLateral
          grupos={grupos}
          colapsado={colapsado}
          gruposAbertos={gruposAbertos}
          alternarGrupo={alternarGrupo}
          pendencias={pendencias}
        />
        <div className={cn("border-t border-slate-100 p-3", colapsado && "flex justify-center")}>
          <Link
            to="/"
            className={cn("flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slate-500 hover:bg-slate-100 hover:text-[#5f2ebe]", colapsado && "justify-center")}
            title="Voltar ao site"
          >
            <ExternalLink className="h-4 w-4" />
            {!colapsado && "Voltar ao site"}
          </Link>
        </div>
      </aside>

      {/* Sidebar mobile */}
      <Sheet open={menuMobile} onOpenChange={setMenuMobile}>
        <SheetContent side="left" className="flex w-[280px] flex-col p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
          <div className="flex h-14 items-center border-b border-slate-100 px-4">{marca(false)}</div>
          <NavegacaoLateral
            grupos={grupos}
            colapsado={false}
            gruposAbertos={gruposAbertos}
            alternarGrupo={alternarGrupo}
            pendencias={pendencias}
            onNavegar={() => setMenuMobile(false)}
          />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Barra superior */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur md:px-6">
          <button
            onClick={() => setMenuMobile(true)}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 md:hidden"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="min-w-0 flex-1">
            {atual && (
              <p className="flex items-center gap-1 truncate text-sm text-slate-500">
                <span className="hidden sm:inline">{atual.grupo.label}</span>
                <ChevronRight className="hidden h-3.5 w-3.5 sm:inline" />
                <Link to={atual.item.path} className="truncate font-medium text-[#272f3c] hover:text-[#5f2ebe]">
                  {atual.item.label}
                </Link>
              </p>
            )}
          </div>

          <button
            onClick={() => setPaleta(true)}
            className="hidden items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-400 hover:border-slate-300 hover:text-slate-600 sm:flex"
          >
            <Search className="h-4 w-4" />
            <span className="hidden lg:inline">Ir para...</span>
            <kbd className="rounded border border-slate-200 bg-white px-1.5 text-[10px] font-medium text-slate-500">Ctrl K</kbd>
          </button>
          <button
            onClick={() => setPaleta(true)}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 sm:hidden"
            aria-label="Buscar página"
          >
            <Search className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={foto} alt={nomeUsuario} />
              <AvatarFallback className="bg-[#5f2ebe]/10 text-xs font-semibold text-[#5f2ebe]">
                {nomeUsuario.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="hidden max-w-[140px] truncate text-sm font-medium lg:inline">{nomeUsuario}</span>
            <button
              onClick={sair}
              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-600"
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        <main className="admin-content flex-1 overflow-auto">
          <div className="mx-auto w-full max-w-[1400px] px-4 py-6 md:px-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Navegação rápida */}
      <CommandDialog open={paleta} onOpenChange={setPaleta}>
        <CommandInput placeholder="Ir para página do admin..." />
        <CommandList>
          <CommandEmpty>Nenhuma página encontrada.</CommandEmpty>
          {grupos.map((g) => (
            <CommandGroup key={g.id} heading={g.label}>
              {g.items.map((item) => {
                const Icone = item.icon;
                return (
                  <CommandItem
                    key={item.path}
                    value={`${item.label} ${item.descricao || ""} ${item.palavras || ""}`}
                    onSelect={() => {
                      setPaleta(false);
                      navigate(item.path);
                    }}
                  >
                    <Icone className="mr-2 text-slate-400" />
                    <span>{item.label}</span>
                    {item.descricao && <span className="ml-2 text-xs text-slate-400">{item.descricao}</span>}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </div>
  );
};

export default AdminLayout;
