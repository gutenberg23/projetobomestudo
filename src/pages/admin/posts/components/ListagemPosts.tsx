import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Edit,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  Heart,
  ImageOff,
  MoreHorizontal,
  Plus,
  Rss,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BlogPost } from "@/components/blog/types";
import { GerenciadorRSS } from "./GerenciadorRSS";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPostStatus } from "@/services/blogService";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface ListagemPostsProps {
  /** Recarrega a lista (ex.: depois que o RSS cria posts). */
  onRecarregar?: () => void;
  postsFiltrados: BlogPost[];
  carregando: boolean;
  erro: string | null;
  busca: string;
  onChangeBusca: (value: string) => void;
  statusFiltro: AdminPostStatus;
  onChangeStatusFiltro: (value: AdminPostStatus) => void;
  contagens: Record<AdminPostStatus, number>;
  onIniciarCriacaoPost: () => void;
  onIniciarEdicaoPost: (post: BlogPost) => void;
  onExcluirPost: (id: string) => void;
  onToggleStatus: (id: string, isDraft: boolean) => void;
  onToggleDestaque: (post: BlogPost) => void;
  currentPage: number;
  totalPages: number;
  totalPosts: number;
  postsPerPage: number;
  onPageChange: (page: number) => void;
}

const ABAS: { id: AdminPostStatus; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "publicados", label: "Publicados" },
  { id: "rascunhos", label: "Rascunhos" },
  { id: "destaques", label: "Destaques" },
];

const paginasVisiveis = (atual: number, total: number): (number | "...")[] => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const paginas: (number | "...")[] = [1];
  const inicio = Math.max(2, atual - 1);
  const fim = Math.min(total - 1, atual + 1);
  if (inicio > 2) paginas.push("...");
  for (let i = inicio; i <= fim; i++) paginas.push(i);
  if (fim < total - 1) paginas.push("...");
  paginas.push(total);
  return paginas;
};

const dataCurta = (iso: string) => {
  try {
    return format(new Date(iso), "dd MMM yyyy", { locale: ptBR });
  } catch {
    return "";
  }
};

const LinhaPost: React.FC<{
  post: BlogPost;
  onEditar: () => void;
  onExcluir: () => void;
  onStatus: () => void;
  onDestaque: () => void;
}> = ({ post, onEditar, onExcluir, onStatus, onDestaque }) => {
  const local = [post.state, post.region && post.region !== "nacional" && !post.state ? post.region : null]
    .filter(Boolean)
    .join(" ");
  return (
    <li className="group flex items-center gap-3 px-3 py-3 transition-colors hover:bg-[#faf8ff] sm:gap-4 sm:px-4">
      <button
        type="button"
        onClick={onEditar}
        className="relative hidden h-14 w-24 shrink-0 overflow-hidden rounded-md bg-slate-100 sm:block"
        aria-label={`Editar ${post.title}`}
      >
        {post.featuredImage ? (
          <img src={post.featuredImage} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-slate-300">
            <ImageOff className="h-5 w-5" />
          </span>
        )}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <button
            type="button"
            onClick={onEditar}
            className="line-clamp-2 text-left text-sm font-semibold leading-snug text-slate-900 hover:text-[#5f2ebe]"
          >
            {post.title || <span className="italic text-slate-400">Sem título</span>}
          </button>
          {post.featured && <Star className="mt-0.5 h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" aria-label="Em destaque" />}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[11px] font-medium",
              post.isDraft ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200" : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
            )}
          >
            {post.isDraft ? "Rascunho" : "Publicado"}
          </span>
          {post.category && <span className="font-medium text-slate-600">{post.category}</span>}
          <span aria-hidden>·</span>
          <span>{post.author}</span>
          <span aria-hidden>·</span>
          <time dateTime={post.createdAt}>{dataCurta(post.createdAt)}</time>
          {local && (
            <>
              <span aria-hidden>·</span>
              <span className="uppercase">{local}</span>
            </>
          )}
        </div>
      </div>

      <div className="hidden shrink-0 items-center gap-4 text-xs tabular-nums text-slate-500 md:flex">
        <span className="flex items-center gap-1" title="Visualizações">
          <Eye className="h-3.5 w-3.5" /> {post.viewCount || 0}
        </span>
        <span className="flex items-center gap-1" title="Curtidas">
          <Heart className="h-3.5 w-3.5" /> {post.likesCount || 0}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Button type="button" variant="outline" size="sm" onClick={onEditar} className="hidden h-8 sm:inline-flex">
          <Edit className="mr-1.5 h-3.5 w-3.5" />
          Editar
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label="Mais ações">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem onClick={onEditar} className="sm:hidden">
              <Edit className="mr-2 h-4 w-4" /> Editar
            </DropdownMenuItem>
            {!post.isDraft && (
              <DropdownMenuItem asChild>
                <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" /> Ver no site
                </a>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={onStatus}>
              {post.isDraft ? <Eye className="mr-2 h-4 w-4" /> : <EyeOff className="mr-2 h-4 w-4" />}
              {post.isDraft ? "Publicar agora" : "Voltar para rascunho"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDestaque}>
              <Star className="mr-2 h-4 w-4" />
              {post.featured ? "Tirar do destaque" : "Destacar no blog"}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                navigator.clipboard
                  .writeText(`${window.location.origin}/blog/${post.slug}`)
                  .then(() => toast({ title: "Link copiado" }))
                  .catch(() => toast({ title: "Não foi possível copiar", variant: "destructive" }));
              }}
            >
              <Copy className="mr-2 h-4 w-4" /> Copiar link
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onExcluir} className="text-red-600 focus:bg-red-50 focus:text-red-700">
              <Trash2 className="mr-2 h-4 w-4" /> Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </li>
  );
};

export const ListagemPosts: React.FC<ListagemPostsProps> = ({
  onRecarregar,
  postsFiltrados,
  carregando,
  erro,
  busca,
  onChangeBusca,
  statusFiltro,
  onChangeStatusFiltro,
  contagens,
  onIniciarCriacaoPost,
  onIniciarEdicaoPost,
  onExcluirPost,
  onToggleStatus,
  onToggleDestaque,
  currentPage,
  totalPages,
  totalPosts,
  postsPerPage,
  onPageChange,
}) => {
  const [showRSSManager, setShowRSSManager] = React.useState(false);
  const inicio = totalPosts === 0 ? 0 : (currentPage - 1) * postsPerPage + 1;
  const fim = Math.min(currentPage * postsPerPage, totalPosts);

  return (
    <div className="space-y-4">
      <AdminPageHeader
        titulo="Posts"
        descricao="Notícias e artigos do blog. As notícias que chegam pelo RSS ficam em Rascunhos até você revisar."
        acoes={
          <>
            <Button
              variant="outline"
              onClick={() => setShowRSSManager(!showRSSManager)}
              className={cn(showRSSManager && "border-[#5f2ebe]/40 bg-[#faf8ff] text-[#5f2ebe]")}
              aria-expanded={showRSSManager}
            >
              <Rss className="mr-2 h-4 w-4" />
              Feeds RSS
            </Button>
            <Button onClick={onIniciarCriacaoPost} className="bg-[#ea2be2] text-white hover:bg-[#d029d5]">
              <Plus className="mr-2 h-4 w-4" />
              Novo post
            </Button>
          </>
        }
      />

      {showRSSManager && <GerenciadorRSS onFechar={() => setShowRSSManager(false)} onPostsCriados={onRecarregar} />}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        {/* Abas de status + busca */}
        <div className="flex flex-col gap-3 border-b border-slate-100 px-3 pt-3 sm:px-4 lg:flex-row lg:items-end lg:justify-between">
          <nav className="-mb-px flex gap-1 overflow-x-auto" aria-label="Filtrar por status">
            {ABAS.map((aba) => {
              const ativa = statusFiltro === aba.id;
              return (
                <button
                  key={aba.id}
                  type="button"
                  onClick={() => onChangeStatusFiltro(aba.id)}
                  aria-current={ativa ? "page" : undefined}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 border-b-2 px-3 pb-2.5 pt-1 text-sm font-medium transition-colors",
                    ativa ? "border-[#5f2ebe] text-[#5f2ebe]" : "border-transparent text-slate-500 hover:text-slate-800"
                  )}
                >
                  {aba.label}
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[11px] tabular-nums",
                      ativa ? "bg-[#5f2ebe]/10 text-[#5f2ebe]" : "bg-slate-100 text-slate-500"
                    )}
                  >
                    {contagens[aba.id]}
                  </span>
                </button>
              );
            })}
          </nav>
          <div className="relative pb-3 lg:w-80">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              className="h-9 pl-9 pr-8"
              placeholder="Buscar por título, autor ou categoria"
              value={busca}
              onChange={(e) => onChangeBusca(e.target.value)}
              aria-label="Buscar posts"
            />
            {busca && (
              <button
                type="button"
                onClick={() => onChangeBusca("")}
                className="absolute right-2 top-2 rounded p-0.5 text-slate-400 hover:text-slate-700"
                aria-label="Limpar busca"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Lista */}
        {carregando ? (
          <ul className="divide-y divide-slate-100" aria-busy="true">
            {Array.from({ length: 6 }, (_, i) => (
              <li key={i} className="flex items-center gap-4 px-4 py-3">
                <div className="hidden h-14 w-24 animate-pulse rounded-md bg-slate-100 sm:block" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
                </div>
              </li>
            ))}
          </ul>
        ) : erro ? (
          <p className="px-4 py-12 text-center text-sm text-red-600">{erro}</p>
        ) : postsFiltrados.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-4 py-14 text-center">
            <span className="rounded-full bg-slate-100 p-3 text-slate-400">
              <FileText className="h-6 w-6" />
            </span>
            <div>
              <p className="font-medium text-slate-700">{busca ? "Nenhum post encontrado" : "Nada por aqui ainda"}</p>
              <p className="mt-1 text-sm text-slate-500">
                {busca ? `Nada com "${busca}" nesta aba.` : "Crie um post ou traga notícias pelos feeds RSS."}
              </p>
            </div>
            {busca ? (
              <Button variant="outline" size="sm" onClick={() => onChangeBusca("")}>
                Limpar busca
              </Button>
            ) : (
              <Button size="sm" onClick={onIniciarCriacaoPost} className="bg-[#ea2be2] text-white hover:bg-[#d029d5]">
                <Plus className="mr-1.5 h-4 w-4" /> Novo post
              </Button>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {postsFiltrados.map((post) => (
              <LinhaPost
                key={post.id}
                post={post}
                onEditar={() => onIniciarEdicaoPost(post)}
                onExcluir={() => onExcluirPost(post.id)}
                onStatus={() => onToggleStatus(post.id, !post.isDraft)}
                onDestaque={() => onToggleDestaque(post)}
              />
            ))}
          </ul>
        )}

        {/* Paginação */}
        {!carregando && totalPosts > 0 && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-sm text-slate-500 sm:flex-row">
            <p className="tabular-nums">
              {inicio}–{fim} de {totalPosts} {totalPosts === 1 ? "post" : "posts"}
            </p>
            {totalPages > 1 && (
              <nav className="flex items-center gap-1" aria-label="Paginação">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  disabled={currentPage === 1}
                  onClick={() => onPageChange(currentPage - 1)}
                  aria-label="Página anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {paginasVisiveis(currentPage, totalPages).map((p, i) =>
                  p === "..." ? (
                    <span key={`r${i}`} className="px-1 text-slate-400">
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      onClick={() => onPageChange(p)}
                      aria-current={p === currentPage ? "page" : undefined}
                      className={cn(
                        "h-8 min-w-8 rounded-md px-2 text-sm tabular-nums",
                        p === currentPage ? "bg-[#5f2ebe] font-semibold text-white" : "text-slate-600 hover:bg-slate-100"
                      )}
                    >
                      {p}
                    </button>
                  )
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  disabled={currentPage === totalPages}
                  onClick={() => onPageChange(currentPage + 1)}
                  aria-label="Próxima página"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </nav>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
