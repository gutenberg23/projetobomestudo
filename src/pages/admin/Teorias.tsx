import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  CopyPlus,
  Edit,
  ExternalLink,
  Eye,
  EyeOff,
  FileQuestion,
  Link2,
  ListTree,
  Map as MapIcon,
  MessageSquareWarning,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Video,
  X,
} from "lucide-react";
import { AdminPageHeader, FluxoConteudo } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { teoriasService, type TeoriaResumoAdmin } from "@/services/teoriasService";
import { listarCorrecoes } from "@/services/correcoesTeoria";
import { teoriaPath } from "@/utils/teoriaUrl";
import { cn } from "@/lib/utils";

type Aba = "todas" | "publicadas" | "rascunhos";
type Ordem = "recentes" | "titulo" | "disciplina";

const ABAS: { id: Aba; label: string }[] = [
  { id: "todas", label: "Todas" },
  { id: "publicadas", label: "Publicadas" },
  { id: "rascunhos", label: "Rascunhos" },
];

const POR_PAGINA = 25;

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

const dataCurta = (iso?: string) => {
  try {
    return iso ? format(new Date(iso), "dd MMM yyyy", { locale: ptBR }) : "";
  } catch {
    return "";
  }
};

const normalizar = (s: string) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

const temFiltroQuestoes = (t: TeoriaResumoAdmin) =>
  !!t.questoes_filtros && Object.values(t.questoes_filtros).some((v) => Array.isArray(v) && v.length > 0);

/** Ícone com número, para os materiais da teoria. */
const Recurso = ({ icone: Icone, n, titulo }: { icone: typeof Video; n: number; titulo: string }) => (
  <span
    title={titulo}
    className={cn("inline-flex items-center gap-1 tabular-nums", n > 0 ? "text-slate-600" : "text-slate-300")}
  >
    <Icone className="h-3.5 w-3.5" />
    {n}
  </span>
);

const LinhaTeoria = ({
  teoria,
  professor,
  correcoesPendentes,
  onEditar,
  onAlternarStatus,
  onDuplicar,
  onExcluir,
}: {
  teoria: TeoriaResumoAdmin;
  professor?: string;
  correcoesPendentes: number;
  onEditar: () => void;
  onAlternarStatus: () => void;
  onDuplicar: () => void;
  onExcluir: () => void;
}) => {
  const publicada = teoria.status === "published";
  const caminho = teoriaPath(teoria);
  const copiarLink = () => {
    navigator.clipboard
      .writeText(`${window.location.origin}${caminho}`)
      .then(() => toast.success("Link copiado"))
      .catch(() => toast.error("Não foi possível copiar o link"));
  };

  return (
    <li className="group flex items-center gap-3 px-3 py-3 transition-colors hover:bg-[#faf8ff] sm:gap-4 sm:px-4">
      <span
        className={cn(
          "hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg sm:flex",
          publicada ? "bg-[#5f2ebe]/10 text-[#5f2ebe]" : "bg-slate-100 text-slate-400"
        )}
        aria-hidden
      >
        <BookOpen className="h-5 w-5" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onEditar}
            className="line-clamp-2 text-left text-sm font-semibold leading-snug text-slate-900 hover:text-[#5f2ebe]"
          >
            {teoria.titulo || <span className="italic text-slate-400">Sem título</span>}
          </button>
          {correcoesPendentes > 0 && (
            <Link
              to="/admin/moderacao?aba=correcoes"
              className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-medium text-orange-700 ring-1 ring-orange-200 hover:bg-orange-100"
              title="Correções sugeridas por leitores aguardando revisão"
            >
              <MessageSquareWarning className="h-3 w-3" />
              {correcoesPendentes} {correcoesPendentes === 1 ? "correção" : "correções"}
            </Link>
          )}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[11px] font-medium",
              publicada
                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                : "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
            )}
          >
            {publicada ? "Publicada" : "Rascunho"}
          </span>
          {teoria.disciplina_id && <span className="font-medium text-slate-600">{teoria.disciplina_id}</span>}
          {teoria.assunto_id && (
            <>
              <span aria-hidden>›</span>
              <span className="max-w-[18rem] truncate">{teoria.assunto_id}</span>
            </>
          )}
          {professor && (
            <>
              <span aria-hidden>·</span>
              <span>{professor}</span>
            </>
          )}
          <span aria-hidden>·</span>
          <time dateTime={teoria.updated_at} title="Última atualização">
            {dataCurta(teoria.updated_at)}
          </time>
        </div>
      </div>

      <div className="hidden items-center gap-3 text-xs md:flex">
        <Recurso icone={ListTree} n={teoria.topicos_ids?.length || 0} titulo="Tópicos" />
        <Recurso icone={Video} n={teoria.videoaulas?.length || 0} titulo="Videoaulas" />
        <Recurso icone={MapIcon} n={teoria.mapas_mentais?.length || 0} titulo="Mapas mentais" />
        <span title={temFiltroQuestoes(teoria) ? "Questões configuradas" : "Sem filtro de questões"}>
          <FileQuestion className={cn("h-3.5 w-3.5", temFiltroQuestoes(teoria) ? "text-slate-600" : "text-slate-300")} />
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Button variant="ghost" size="sm" onClick={onEditar} className="hidden text-slate-600 sm:inline-flex">
          <Edit className="mr-1.5 h-4 w-4" />
          Editar
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500" aria-label="Mais ações">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem onClick={onEditar} className="sm:hidden">
              <Edit className="mr-2 h-4 w-4" /> Editar
            </DropdownMenuItem>
            {publicada && (
              <DropdownMenuItem asChild>
                <a href={caminho} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" /> Ver no site
                </a>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={copiarLink}>
              <Link2 className="mr-2 h-4 w-4" /> Copiar link
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onAlternarStatus}>
              {publicada ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
              {publicada ? "Voltar para rascunho" : "Publicar"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDuplicar}>
              <CopyPlus className="mr-2 h-4 w-4" /> Duplicar
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

const selectClasse =
  "h-9 rounded-md border border-input bg-white px-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#5f2ebe]/30";

const TeoriasAdmin = () => {
  const navigate = useNavigate();
  const [teorias, setTeorias] = useState<TeoriaResumoAdmin[]>([]);
  const [professores, setProfessores] = useState<Record<string, string>>({});
  const [pendentes, setPendentes] = useState<Record<string, number>>({});
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [aba, setAba] = useState<Aba>("todas");
  const [busca, setBusca] = useState("");
  const [disciplina, setDisciplina] = useState("");
  const [ordem, setOrdem] = useState<Ordem>("recentes");
  const [pagina, setPagina] = useState(1);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const [lista, profs] = await Promise.all([
        teoriasService.getTeorias(),
        supabase.from("professores").select("id, nome_completo"),
      ]);
      setTeorias(lista);
      setProfessores(Object.fromEntries((profs.data || []).map((p) => [p.id, p.nome_completo])));
    } catch {
      setErro("Não foi possível carregar as teorias. Tente recarregar a página.");
    } finally {
      setCarregando(false);
    }
    // Correções pendentes: sem a migration, simplesmente não aparecem
    listarCorrecoes("pendente")
      .then((lista) => {
        const cont: Record<string, number> = {};
        lista.forEach((c) => (cont[c.teoria_id] = (cont[c.teoria_id] || 0) + 1));
        setPendentes(cont);
      })
      .catch(() => setPendentes({}));
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const disciplinas = useMemo(
    () => Array.from(new Set(teorias.map((t) => t.disciplina_id).filter(Boolean))).sort((a, b) => a.localeCompare(b, "pt-BR")),
    [teorias]
  );

  const contagens = useMemo(() => {
    const base = disciplina ? teorias.filter((t) => t.disciplina_id === disciplina) : teorias;
    return {
      todas: base.length,
      publicadas: base.filter((t) => t.status === "published").length,
      rascunhos: base.filter((t) => t.status !== "published").length,
    };
  }, [teorias, disciplina]);

  const filtradas = useMemo(() => {
    const termo = normalizar(busca.trim());
    const lista = teorias.filter((t) => {
      if (aba === "publicadas" && t.status !== "published") return false;
      if (aba === "rascunhos" && t.status === "published") return false;
      if (disciplina && t.disciplina_id !== disciplina) return false;
      if (!termo) return true;
      const alvo = normalizar(
        [t.titulo, t.slug, t.disciplina_id, t.assunto_id, professores[t.professor_id || ""], ...(t.topicos_ids || [])].join(" ")
      );
      return alvo.includes(termo);
    });
    if (ordem === "titulo") lista.sort((a, b) => a.titulo.localeCompare(b.titulo, "pt-BR"));
    if (ordem === "disciplina")
      lista.sort(
        (a, b) =>
          (a.disciplina_id || "").localeCompare(b.disciplina_id || "", "pt-BR") ||
          (a.assunto_id || "").localeCompare(b.assunto_id || "", "pt-BR") ||
          a.titulo.localeCompare(b.titulo, "pt-BR")
      );
    return lista;
  }, [teorias, aba, disciplina, busca, ordem, professores]);

  useEffect(() => setPagina(1), [aba, disciplina, busca, ordem]);

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const visiveis = filtradas.slice((paginaAtual - 1) * POR_PAGINA, paginaAtual * POR_PAGINA);
  const inicio = filtradas.length === 0 ? 0 : (paginaAtual - 1) * POR_PAGINA + 1;
  const fim = Math.min(paginaAtual * POR_PAGINA, filtradas.length);
  const totalPendentes = Object.values(pendentes).reduce((a, b) => a + b, 0);
  const filtrosAtivos = !!busca || !!disciplina;

  const alternarStatus = async (t: TeoriaResumoAdmin) => {
    const novo = t.status === "published" ? "draft" : "published";
    try {
      await teoriasService.updateTeoria(t.id, { status: novo });
      setTeorias((lista) =>
        lista.map((x) => (x.id === t.id ? { ...x, status: novo, updated_at: new Date().toISOString() } : x))
      );
      toast.success(novo === "published" ? "Teoria publicada" : "Teoria voltou para rascunho");
    } catch {
      toast.error("Não foi possível mudar o status");
    }
  };

  const duplicar = async (t: TeoriaResumoAdmin) => {
    try {
      const original = await teoriasService.getTeoriaById(t.id);
      const copia = await teoriasService.createTeoria({
        titulo: `${original.titulo} (cópia)`,
        slug: "",
        disciplina_id: original.disciplina_id,
        assunto_id: original.assunto_id,
        topicos_ids: original.topicos_ids || [],
        conteudo: original.conteudo || "",
        no_edital: original.no_edital || "",
        status: "draft",
        professor_id: original.professor_id,
        questoes_filtros: original.questoes_filtros,
        questoes_link: original.questoes_link,
        videoaulas: original.videoaulas || [],
        mapas_mentais: original.mapas_mentais || [],
      });
      toast.success("Cópia criada como rascunho");
      if (copia?.id) navigate(`/admin/teorias/${copia.id}/edit`);
    } catch {
      toast.error("Não foi possível duplicar a teoria");
    }
  };

  const excluir = async (t: TeoriaResumoAdmin) => {
    const aviso =
      t.status === "published"
        ? `Excluir "${t.titulo}"? Ela está publicada: o link deixa de funcionar e os tópicos que apontam para ela ficam sem aula em texto.`
        : `Excluir "${t.titulo}"? Esta ação não pode ser desfeita.`;
    if (!window.confirm(aviso)) return;
    try {
      await teoriasService.deleteTeoria(t.id);
      setTeorias((lista) => lista.filter((x) => x.id !== t.id));
      toast.success("Teoria excluída");
    } catch {
      toast.error("Não foi possível excluir a teoria");
    }
  };

  const limparFiltros = () => {
    setBusca("");
    setDisciplina("");
  };

  return (
    <div className="space-y-4">
      <AdminPageHeader
        titulo="Teorias"
        descricao="Aulas em texto. Depois de publicada, escolha a teoria no campo “Link da aula em texto” do tópico."
        acoes={
          <Button onClick={() => navigate("/admin/teorias/new")} className="bg-[#ea2be2] text-white hover:bg-[#d029d5]">
            <Plus className="mr-2 h-4 w-4" />
            Nova teoria
          </Button>
        }
      >
        <FluxoConteudo atual="teorias" />
      </AdminPageHeader>

      {totalPendentes > 0 && (
        <Link
          to="/admin/moderacao?aba=correcoes"
          className="flex items-center gap-3 rounded-xl border border-orange-200 bg-orange-50/70 px-4 py-3 text-sm text-orange-800 transition-colors hover:bg-orange-50"
        >
          <MessageSquareWarning className="h-5 w-5 shrink-0" />
          <span className="flex-1">
            <strong className="font-semibold">
              {totalPendentes} {totalPendentes === 1 ? "correção sugerida" : "correções sugeridas"}
            </strong>{" "}
            por leitores {totalPendentes === 1 ? "aguarda" : "aguardam"} revisão.
          </span>
          <span className="font-medium underline-offset-2 hover:underline">Revisar</span>
        </Link>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        {/* Abas de status + filtros */}
        <div className="flex flex-col gap-3 border-b border-slate-100 px-3 pt-3 sm:px-4 xl:flex-row xl:items-end xl:justify-between">
          <nav className="-mb-px flex gap-1 overflow-x-auto" aria-label="Filtrar por status">
            {ABAS.map((a) => {
              const ativa = aba === a.id;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setAba(a.id)}
                  aria-current={ativa ? "page" : undefined}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 border-b-2 px-3 pb-2.5 pt-1 text-sm font-medium transition-colors",
                    ativa ? "border-[#5f2ebe] text-[#5f2ebe]" : "border-transparent text-slate-500 hover:text-slate-800"
                  )}
                >
                  {a.label}
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[11px] tabular-nums",
                      ativa ? "bg-[#5f2ebe]/10 text-[#5f2ebe]" : "bg-slate-100 text-slate-500"
                    )}
                  >
                    {contagens[a.id]}
                  </span>
                </button>
              );
            })}
          </nav>
          <div className="flex flex-col gap-2 pb-3 sm:flex-row sm:items-center">
            <select
              value={disciplina}
              onChange={(e) => setDisciplina(e.target.value)}
              className={cn(selectClasse, "sm:max-w-[14rem]")}
              aria-label="Filtrar por disciplina"
            >
              <option value="">Todas as disciplinas</option>
              {disciplinas.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <select
              value={ordem}
              onChange={(e) => setOrdem(e.target.value as Ordem)}
              className={selectClasse}
              aria-label="Ordenar"
            >
              <option value="recentes">Atualizadas por último</option>
              <option value="titulo">Título (A–Z)</option>
              <option value="disciplina">Disciplina e assunto</option>
            </select>
            <div className="relative sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                className="h-9 pl-9 pr-8"
                placeholder="Buscar por título, assunto, tópico..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                aria-label="Buscar teorias"
              />
              {busca && (
                <button
                  type="button"
                  onClick={() => setBusca("")}
                  className="absolute right-2 top-2 rounded p-0.5 text-slate-400 hover:text-slate-700"
                  aria-label="Limpar busca"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Lista */}
        {carregando ? (
          <ul className="divide-y divide-slate-100" aria-busy="true">
            {Array.from({ length: 6 }, (_, i) => (
              <li key={i} className="flex items-center gap-4 px-4 py-3">
                <div className="hidden h-10 w-10 animate-pulse rounded-lg bg-slate-100 sm:block" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
                  <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100" />
                </div>
              </li>
            ))}
          </ul>
        ) : erro ? (
          <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
            <p className="text-sm text-red-600">{erro}</p>
            <Button variant="outline" size="sm" onClick={carregar}>
              Tentar de novo
            </Button>
          </div>
        ) : visiveis.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-4 py-14 text-center">
            <span className="rounded-full bg-slate-100 p-3 text-slate-400">
              <BookOpen className="h-6 w-6" />
            </span>
            <div>
              <p className="font-medium text-slate-700">{filtrosAtivos ? "Nenhuma teoria encontrada" : "Nada por aqui ainda"}</p>
              <p className="mt-1 text-sm text-slate-500">
                {filtrosAtivos ? "Tente outra busca ou limpe os filtros." : "Crie a primeira aula em texto."}
              </p>
            </div>
            {filtrosAtivos ? (
              <Button variant="outline" size="sm" onClick={limparFiltros}>
                Limpar filtros
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => navigate("/admin/teorias/new")}
                className="bg-[#ea2be2] text-white hover:bg-[#d029d5]"
              >
                <Plus className="mr-1.5 h-4 w-4" /> Nova teoria
              </Button>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {visiveis.map((t) => (
              <LinhaTeoria
                key={t.id}
                teoria={t}
                professor={t.professor_id ? professores[t.professor_id] : undefined}
                correcoesPendentes={pendentes[t.id] || 0}
                onEditar={() => navigate(`/admin/teorias/${t.id}/edit`)}
                onAlternarStatus={() => alternarStatus(t)}
                onDuplicar={() => duplicar(t)}
                onExcluir={() => excluir(t)}
              />
            ))}
          </ul>
        )}

        {/* Paginação */}
        {!carregando && !erro && filtradas.length > 0 && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-sm text-slate-500 sm:flex-row">
            <p className="tabular-nums">
              {inicio}–{fim} de {filtradas.length} {filtradas.length === 1 ? "teoria" : "teorias"}
            </p>
            {totalPaginas > 1 && (
              <nav className="flex items-center gap-1" aria-label="Paginação">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  disabled={paginaAtual === 1}
                  onClick={() => setPagina(paginaAtual - 1)}
                  aria-label="Página anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {paginasVisiveis(paginaAtual, totalPaginas).map((p, i) =>
                  p === "..." ? (
                    <span key={`r${i}`} className="px-1 text-slate-400">
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPagina(p)}
                      aria-current={p === paginaAtual ? "page" : undefined}
                      className={cn(
                        "h-8 min-w-8 rounded-md px-2 text-sm tabular-nums",
                        p === paginaAtual ? "bg-[#5f2ebe] font-semibold text-white" : "text-slate-600 hover:bg-slate-100"
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
                  disabled={paginaAtual === totalPaginas}
                  onClick={() => setPagina(paginaAtual + 1)}
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

export default TeoriasAdmin;
