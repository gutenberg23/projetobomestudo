import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowDownUp,
  Bot,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Eraser,
  Flag,
  GraduationCap,
  Library,
  Loader2,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import ImportQuestionsCard from "@/components/admin/questions/ImportQuestionsCard";
import CriarSimuladoModal from "@/components/admin/questions/modals/CriarSimuladoModal";
import { useQuestionManagementStore } from "@/stores/questionManagementStore";
import {
  atualizarQuestao,
  buscarQuestao,
  carregarFacetas,
  criarQuestao,
  DadosQuestao,
  excluirQuestoes,
  excluirTodasQuestoes,
  FACETAS_VAZIAS,
  Facetas,
  FILTROS_VAZIOS,
  FiltrosQuestoes,
  limparEstatisticasQuestao,
  limparTodasEstatisticas,
  listarQuestoes,
  QuestaoAdmin,
  ResumoQuestoes,
  resumoQuestoes,
} from "@/services/questoesAdminService";
import ListagemQuestoes from "./components/questoes/ListagemQuestoes";
import FormularioQuestao from "./components/questoes/FormularioQuestao";
import ErrosReportados from "./components/questoes/ErrosReportados";
import {
  contarFiltros,
  FiltrosAtivos,
  PainelFiltros,
} from "./components/questoes/PainelFiltros";

const POR_PAGINA = 20;

type Modo =
  | { tipo: "lista" }
  | { tipo: "nova" }
  | { tipo: "editar"; questao: QuestaoAdmin };

interface Confirmacao {
  titulo: string;
  descricao: React.ReactNode;
  acao: string;
  /** Texto que precisa ser digitado para liberar o botão. */
  digitar?: string;
  perigosa?: boolean;
  executar: () => Promise<void>;
}

const mensagem = (e: unknown) =>
  e instanceof Error
    ? e.message
    : typeof e === "object" && e && "message" in e
      ? String((e as { message: unknown }).message)
      : "Erro desconhecido";

const Questoes: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [aba, setAba] = useState<"questoes" | "erros">("questoes");
  const [modo, setModo] = useState<Modo>({ tipo: "lista" });

  // Lista
  const [filtros, setFiltros] = useState<FiltrosQuestoes>(FILTROS_VAZIOS);
  const [buscaDigitada, setBuscaDigitada] = useState("");
  const [pagina, setPagina] = useState(1);
  const [itens, setItens] = useState<QuestaoAdmin[]>([]);
  const [total, setTotal] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erroLista, setErroLista] = useState<string | null>(null);
  const [selecionadas, setSelecionadas] = useState<Set<string>>(new Set());

  // Apoio
  const [facetas, setFacetas] = useState<Facetas>(FACETAS_VAZIAS);
  const [resumo, setResumo] = useState<ResumoQuestoes | null>(null);
  const [painelFiltros, setPainelFiltros] = useState(false);
  const [importando, setImportando] = useState(false);
  const [simulado, setSimulado] = useState(false);
  const [confirmacao, setConfirmacao] = useState<Confirmacao | null>(null);
  const [textoConfirmacao, setTextoConfirmacao] = useState("");
  const [executando, setExecutando] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const setDropdownData = useQuestionManagementStore((s) => s.setDropdownData);
  const pedido = useRef(0);

  // ----- Carregamento -----
  const carregarLista = useCallback(async () => {
    const meu = ++pedido.current;
    setCarregando(true);
    setErroLista(null);
    try {
      const { itens, total } = await listarQuestoes(
        filtros,
        pagina,
        POR_PAGINA,
      );
      if (meu !== pedido.current) return;
      setItens(itens);
      setTotal(total);
      // Página além do fim (ex.: depois de excluir) volta para a última
      if (itens.length === 0 && total > 0 && pagina > 1)
        setPagina(Math.ceil(total / POR_PAGINA));
    } catch (e) {
      if (meu !== pedido.current) return;
      setErroLista(mensagem(e));
    } finally {
      if (meu === pedido.current) setCarregando(false);
    }
  }, [filtros, pagina]);

  const carregarResumo = useCallback(() => {
    resumoQuestoes().then(setResumo, (e) =>
      console.error("Erro ao contar questões:", e),
    );
  }, []);

  const carregarOpcoes = useCallback(() => {
    carregarFacetas().then(
      (f) => {
        setFacetas(f);
        // Outras telas (simulados, cadernos) ainda leem estas listas do store
        setDropdownData({
          years: f.anos,
          institutions: f.bancas,
          organizations: f.orgaos,
          roles: f.cargos,
          disciplines: f.disciplinas,
          levels: f.niveis,
          difficulties: f.dificuldades,
          questionTypes: f.tipos,
          assuntos: f.assuntos,
          topicos: f.topicos,
        });
      },
      (e) => console.error("Erro ao carregar opções dos filtros:", e),
    );
  }, [setDropdownData]);

  useEffect(() => {
    carregarLista();
  }, [carregarLista]);

  useEffect(() => {
    carregarResumo();
    carregarOpcoes();
  }, [carregarResumo, carregarOpcoes]);

  // Busca com atraso para não consultar a cada tecla
  useEffect(() => {
    const t = setTimeout(() => {
      setFiltros((f) =>
        f.busca === buscaDigitada ? f : { ...f, busca: buscaDigitada },
      );
      setPagina(1);
    }, 350);
    return () => clearTimeout(t);
  }, [buscaDigitada]);

  // Links: /admin/questoes?editar=<id> e ?nova=1
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get("editar") || params.get("edit");
    const nova = params.get("nova");
    if (!id && !nova) return;
    navigate("/admin/questoes", { replace: true });
    if (nova) setModo({ tipo: "nova" });
    else if (id) abrirEdicaoPorId(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  useEffect(() => {
    document.querySelector(".admin-content")?.scrollTo({ top: 0 });
  }, [modo.tipo]);

  const aplicarFiltros = (f: FiltrosQuestoes) => {
    setFiltros(f);
    setPagina(1);
    setSelecionadas(new Set());
  };

  // ----- Ações -----
  const abrirEdicaoPorId = async (id: string) => {
    try {
      const q = await buscarQuestao(id);
      if (!q) {
        toast({
          title: "Questão não encontrada",
          description: "Ela pode ter sido excluída.",
          variant: "destructive",
        });
        return;
      }
      setModo({ tipo: "editar", questao: q });
    } catch (e) {
      toast({
        title: "Erro ao abrir a questão",
        description: mensagem(e),
        variant: "destructive",
      });
    }
  };

  const salvarQuestao = async (dados: DadosQuestao): Promise<boolean> => {
    if (!user?.id) {
      toast({
        title: "Faça login novamente para salvar",
        variant: "destructive",
      });
      return false;
    }
    setSalvando(true);
    try {
      if (modo.tipo === "editar") {
        const atualizada = await atualizarQuestao(modo.questao.id, dados);
        setItens((l) =>
          l.map((q) => (q.id === atualizada.id ? atualizada : q)),
        );
        setModo({ tipo: "editar", questao: atualizada });
        toast({ title: "Questão salva" });
      } else {
        await criarQuestao(dados, user.id);
        toast({ title: "Questão criada" });
        carregarLista();
      }
      carregarResumo();
      carregarOpcoes();
      return true;
    } catch (e) {
      toast({
        title: "Erro ao salvar a questão",
        description: mensagem(e),
        variant: "destructive",
      });
      return false;
    } finally {
      setSalvando(false);
    }
  };

  const confirmar = (c: Confirmacao) => {
    setTextoConfirmacao("");
    setConfirmacao(c);
  };

  const executarConfirmacao = async () => {
    if (!confirmacao) return;
    setExecutando(true);
    try {
      await confirmacao.executar();
      setConfirmacao(null);
    } catch (e) {
      toast({
        title: "Não foi possível concluir",
        description: mensagem(e),
        variant: "destructive",
      });
    } finally {
      setExecutando(false);
    }
  };

  const pedirExclusao = (ids: string[], aoConcluir?: () => void) =>
    confirmar({
      titulo:
        ids.length === 1
          ? "Excluir esta questão?"
          : `Excluir ${ids.length} questões?`,
      descricao:
        "As respostas e estatísticas ligadas a elas também deixam de aparecer. Essa ação não pode ser desfeita.",
      acao: "Excluir",
      perigosa: true,
      executar: async () => {
        await excluirQuestoes(ids);
        setSelecionadas((s) => {
          const n = new Set(s);
          ids.forEach((id) => n.delete(id));
          return n;
        });
        toast({
          title:
            ids.length === 1
              ? "Questão excluída"
              : `${ids.length} questões excluídas`,
        });
        aoConcluir?.();
        carregarLista();
        carregarResumo();
      },
    });

  const zerarEstatisticas = async (id: string) => {
    await limparEstatisticasQuestao(id);
    window.dispatchEvent(
      new CustomEvent("questionStatsCleared", { detail: { questionId: id } }),
    );
    toast({ title: "Estatísticas zeradas" });
  };

  const pedirZerarEstatisticas = (q: QuestaoAdmin) =>
    confirmar({
      titulo: "Zerar estatísticas da questão?",
      descricao:
        "Os acertos, erros e respostas dos alunos nesta questão serão apagados.",
      acao: "Zerar",
      executar: () => zerarEstatisticas(q.id),
    });

  const copiarId = (id: string) =>
    navigator.clipboard?.writeText(id).then(
      () => toast({ title: "ID copiado", description: id }),
      () => toast({ title: "Não foi possível copiar", variant: "destructive" }),
    );

  const alternarSelecao = (id: string) =>
    setSelecionadas((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const selecionarPagina = (marcar: boolean) =>
    setSelecionadas((s) => {
      const n = new Set(s);
      itens.forEach((q) => (marcar ? n.add(q.id) : n.delete(q.id)));
      return n;
    });

  const totalPaginas = Math.max(1, Math.ceil(total / POR_PAGINA));
  const nFiltros = contarFiltros(filtros);
  const filtrando = nFiltros > 0 || Boolean(filtros.busca);
  const selecionadasLista = useMemo(() => [...selecionadas], [selecionadas]);

  const dialogoConfirmacao = (
    <Dialog
      open={Boolean(confirmacao)}
      onOpenChange={(v) => !v && !executando && setConfirmacao(null)}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{confirmacao?.titulo}</DialogTitle>
          <DialogDescription asChild>
            <div className="text-sm text-slate-500">
              {confirmacao?.descricao}
            </div>
          </DialogDescription>
        </DialogHeader>
        {confirmacao?.digitar && (
          <div className="space-y-1.5">
            <label
              htmlFor="texto-confirmacao"
              className="text-sm text-slate-600"
            >
              Digite{" "}
              <strong className="font-mono text-slate-900">
                {confirmacao.digitar}
              </strong>{" "}
              para confirmar
            </label>
            <Input
              id="texto-confirmacao"
              value={textoConfirmacao}
              onChange={(e) => setTextoConfirmacao(e.target.value)}
              autoComplete="off"
              autoFocus
            />
          </div>
        )}
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => setConfirmacao(null)}
            disabled={executando}
          >
            Cancelar
          </Button>
          <Button
            variant={confirmacao?.perigosa ? "destructive" : "default"}
            onClick={executarConfirmacao}
            disabled={
              executando ||
              Boolean(
                confirmacao?.digitar &&
                textoConfirmacao.trim() !== confirmacao.digitar,
              )
            }
            className={cn(
              !confirmacao?.perigosa &&
                "bg-[#5f2ebe] text-white hover:bg-[#4a1f9c]",
            )}
          >
            {executando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmacao?.acao}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // ----- Formulário -----
  if (modo.tipo !== "lista") {
    return (
      <>
        <FormularioQuestao
          key={modo.tipo === "editar" ? modo.questao.id : "nova"}
          questaoInicial={modo.tipo === "editar" ? modo.questao : null}
          facetas={facetas}
          salvando={salvando}
          onSalvar={salvarQuestao}
          onCancelar={() => setModo({ tipo: "lista" })}
          onExcluir={(id) =>
            pedirExclusao([id], () => setModo({ tipo: "lista" }))
          }
          onLimparEstatisticas={async (id) => {
            try {
              await zerarEstatisticas(id);
            } catch (e) {
              toast({
                title: "Erro ao zerar estatísticas",
                description: mensagem(e),
                variant: "destructive",
              });
            }
          }}
        />
        {dialogoConfirmacao}
      </>
    );
  }

  // ----- Lista -----
  const cartoes = [
    {
      rotulo: "Questões",
      valor: resumo?.total,
      icone: <Library className="h-4 w-4" />,
      ativo: aba === "questoes" && !filtrando,
      onClick: () => {
        setAba("questoes");
        setBuscaDigitada("");
        aplicarFiltros(FILTROS_VAZIOS);
      },
    },
    {
      rotulo: "Sem explicação da IA",
      valor: resumo?.semExplicacaoIA,
      icone: <Bot className="h-4 w-4" />,
      ativo: aba === "questoes" && filtros.semExplicacaoIA,
      onClick: () => {
        setAba("questoes");
        aplicarFiltros({
          ...filtros,
          semExplicacaoIA: !filtros.semExplicacaoIA,
        });
      },
    },
    {
      rotulo: "Sem comentário do professor",
      valor: resumo?.semComentarioProfessor,
      icone: <GraduationCap className="h-4 w-4" />,
      ativo: aba === "questoes" && filtros.semComentarioProfessor,
      onClick: () => {
        setAba("questoes");
        aplicarFiltros({
          ...filtros,
          semComentarioProfessor: !filtros.semComentarioProfessor,
        });
      },
    },
    {
      rotulo: "Erros reportados",
      valor: resumo?.errosPendentes,
      icone: <Flag className="h-4 w-4" />,
      ativo: aba === "erros",
      alerta: (resumo?.errosPendentes || 0) > 0,
      onClick: () => setAba("erros"),
    },
  ];

  return (
    <div className="space-y-4">
      <AdminPageHeader
        titulo="Questões"
        descricao="Banco de questões do site: cadastre, revise, gere explicações com IA e acompanhe os erros reportados pelos alunos."
        acoes={
          <>
            <Button variant="outline" onClick={() => setImportando(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Importar CSV
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Mais ações">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuItem
                  onClick={() => {
                    carregarLista();
                    carregarResumo();
                    carregarOpcoes();
                  }}
                >
                  <RefreshCw className="mr-2 h-4 w-4" /> Atualizar dados
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    confirmar({
                      titulo: "Zerar as estatísticas de todas as questões?",
                      descricao:
                        "Todos os acertos, erros e respostas registrados pelos alunos serão apagados.",
                      acao: "Zerar tudo",
                      digitar: "ZERAR",
                      perigosa: true,
                      executar: async () => {
                        await limparTodasEstatisticas();
                        window.dispatchEvent(
                          new CustomEvent("questionStatsCleared", {
                            detail: { questionId: "all" },
                          }),
                        );
                        toast({
                          title: "Estatísticas de todas as questões zeradas",
                        });
                      },
                    })
                  }
                  className="text-amber-700 focus:bg-amber-50 focus:text-amber-800"
                >
                  <Eraser className="mr-2 h-4 w-4" /> Zerar todas as
                  estatísticas
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    confirmar({
                      titulo: "Excluir TODAS as questões?",
                      descricao: (
                        <>
                          Isso apaga as{" "}
                          <strong>{resumo?.total ?? "todas as"}</strong>{" "}
                          questões do banco. Cadernos, simulados e aulas que
                          usam essas questões ficarão vazios. Não tem como
                          desfazer.
                        </>
                      ),
                      acao: "Excluir todas",
                      digitar: "EXCLUIR TUDO",
                      perigosa: true,
                      executar: async () => {
                        await excluirTodasQuestoes();
                        setSelecionadas(new Set());
                        toast({ title: "Todas as questões foram excluídas" });
                        carregarLista();
                        carregarResumo();
                        carregarOpcoes();
                      },
                    })
                  }
                  className="text-red-600 focus:bg-red-50 focus:text-red-700"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Excluir todas as questões
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              onClick={() => setModo({ tipo: "nova" })}
              className="bg-[#ea2be2] text-white hover:bg-[#d029d5]"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nova questão
            </Button>
          </>
        }
      />

      {/* Resumo */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cartoes.map((c) => (
          <button
            key={c.rotulo}
            type="button"
            onClick={c.onClick}
            aria-pressed={c.ativo}
            className={cn(
              "flex items-center gap-3 rounded-xl border bg-white px-4 py-3 text-left shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-colors",
              c.ativo
                ? "border-[#5f2ebe] ring-1 ring-[#5f2ebe]/30"
                : "border-slate-200 hover:border-[#5f2ebe]/40",
            )}
          >
            <span
              className={cn(
                "rounded-lg p-2",
                c.alerta
                  ? "bg-amber-50 text-amber-600"
                  : c.ativo
                    ? "bg-[#5f2ebe] text-white"
                    : "bg-[#5f2ebe]/[0.07] text-[#5f2ebe]",
              )}
            >
              {c.icone}
            </span>
            <span className="min-w-0">
              <span className="block text-xl font-bold tabular-nums leading-tight text-slate-900">
                {c.valor === undefined ? (
                  <span className="inline-block h-5 w-10 animate-pulse rounded bg-slate-100" />
                ) : (
                  c.valor.toLocaleString("pt-BR")
                )}
              </span>
              <span className="block truncate text-xs text-slate-500">
                {c.rotulo}
              </span>
            </span>
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-3 pt-3 sm:px-4 lg:flex-row lg:items-end lg:justify-between">
          <nav className="-mb-px flex gap-1" aria-label="Seções">
            {[
              {
                id: "questoes" as const,
                label: "Questões",
                n: aba === "questoes" ? total : resumo?.total,
              },
              {
                id: "erros" as const,
                label: "Erros reportados",
                n: resumo?.errosPendentes,
              },
            ].map((a) => {
              const ativa = aba === a.id;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setAba(a.id)}
                  aria-current={ativa ? "page" : undefined}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 border-b-2 px-3 pb-2.5 pt-1 text-sm font-medium transition-colors",
                    ativa
                      ? "border-[#5f2ebe] text-[#5f2ebe]"
                      : "border-transparent text-slate-500 hover:text-slate-800",
                  )}
                >
                  {a.label}
                  {a.n !== undefined && (
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[11px] tabular-nums",
                        a.id === "erros" && a.n > 0
                          ? "bg-amber-100 text-amber-700"
                          : ativa
                            ? "bg-[#5f2ebe]/10 text-[#5f2ebe]"
                            : "bg-slate-100 text-slate-500",
                      )}
                    >
                      {a.n.toLocaleString("pt-BR")}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
          {aba === "questoes" && (
            <div className="flex gap-2 pb-3">
              <div className="relative flex-1 lg:w-80">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  className="h-9 pl-9 pr-8"
                  placeholder="Buscar no enunciado ou pelo ID"
                  value={buscaDigitada}
                  onChange={(e) => setBuscaDigitada(e.target.value)}
                  aria-label="Buscar questões"
                />
                {buscaDigitada && (
                  <button
                    type="button"
                    onClick={() => setBuscaDigitada("")}
                    className="absolute right-2 top-2 rounded p-0.5 text-slate-400 hover:text-slate-700"
                    aria-label="Limpar busca"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Button
                variant="outline"
                className={cn(
                  "h-9 gap-1.5",
                  nFiltros > 0 && "border-[#5f2ebe]/40 text-[#5f2ebe]",
                )}
                onClick={() => setPainelFiltros(!painelFiltros)}
                aria-expanded={painelFiltros}
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Filtros</span>
                {nFiltros > 0 && (
                  <span className="rounded-full bg-[#5f2ebe] px-1.5 text-[11px] font-semibold text-white">
                    {nFiltros}
                  </span>
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 shrink-0"
                title={
                  filtros.ordem === "recentes"
                    ? "Mais recentes primeiro"
                    : "Mais antigas primeiro"
                }
                aria-label="Inverter ordem"
                onClick={() =>
                  aplicarFiltros({
                    ...filtros,
                    ordem:
                      filtros.ordem === "recentes" ? "antigas" : "recentes",
                  })
                }
              >
                <ArrowDownUp className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {aba === "erros" ? (
          <ErrosReportados
            onEditarQuestao={abrirEdicaoPorId}
            onMudou={carregarResumo}
          />
        ) : (
          <>
            {painelFiltros && (
              <div className="border-b border-slate-100 bg-slate-50/60 px-3 py-4 sm:px-4">
                <PainelFiltros
                  filtros={filtros}
                  facetas={facetas}
                  onChange={aplicarFiltros}
                />
              </div>
            )}
            <FiltrosAtivos
              filtros={filtros}
              onChange={aplicarFiltros}
              onLimpar={() =>
                aplicarFiltros({
                  ...FILTROS_VAZIOS,
                  busca: filtros.busca,
                  ordem: filtros.ordem,
                })
              }
            />

            {selecionadas.size > 0 && (
              <div className="flex flex-wrap items-center gap-2 border-b border-[#5f2ebe]/20 bg-[#faf8ff] px-3 py-2 sm:px-4">
                <span className="text-sm font-medium text-[#4a2396]">
                  {selecionadas.size}{" "}
                  {selecionadas.size === 1 ? "selecionada" : "selecionadas"}
                </span>
                <button
                  type="button"
                  className="text-xs text-slate-500 hover:text-slate-800"
                  onClick={() => setSelecionadas(new Set())}
                >
                  Limpar seleção
                </button>
                <span className="flex-1" />
                <Button
                  size="sm"
                  onClick={() => setSimulado(true)}
                  className="h-8 bg-[#5f2ebe] text-white hover:bg-[#4a1f9c]"
                >
                  <ClipboardList className="mr-1.5 h-4 w-4" /> Criar simulado
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => pedirExclusao(selecionadasLista)}
                  className="h-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="mr-1.5 h-4 w-4" /> Excluir
                </Button>
              </div>
            )}

            {erroLista ? (
              <div className="flex flex-col items-center gap-3 px-4 py-14 text-center">
                <p className="font-medium text-slate-700">
                  Não foi possível carregar as questões
                </p>
                <p className="max-w-md text-sm text-slate-500">{erroLista}</p>
                <Button variant="outline" size="sm" onClick={carregarLista}>
                  Tentar de novo
                </Button>
              </div>
            ) : carregando && itens.length === 0 ? (
              <ul className="divide-y divide-slate-100" aria-busy="true">
                {Array.from({ length: 6 }, (_, i) => (
                  <li key={i} className="flex items-start gap-3 px-4 py-4">
                    <div className="mt-1 h-4 w-4 animate-pulse rounded bg-slate-100" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100" />
                      <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                      <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
                    </div>
                  </li>
                ))}
              </ul>
            ) : itens.length === 0 ? (
              <div className="flex flex-col items-center gap-3 px-4 py-14 text-center">
                <span className="rounded-full bg-slate-100 p-3 text-slate-400">
                  <Library className="h-6 w-6" />
                </span>
                <div>
                  <p className="font-medium text-slate-700">
                    {filtrando
                      ? "Nenhuma questão encontrada"
                      : "Nenhuma questão cadastrada"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {filtrando
                      ? "Tente outra busca ou tire alguns filtros."
                      : "Cadastre a primeira questão ou importe várias de um CSV."}
                  </p>
                </div>
                {filtrando ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setBuscaDigitada("");
                      aplicarFiltros(FILTROS_VAZIOS);
                    }}
                  >
                    Limpar busca e filtros
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => setModo({ tipo: "nova" })}
                    className="bg-[#ea2be2] text-white hover:bg-[#d029d5]"
                  >
                    <Plus className="mr-1.5 h-4 w-4" /> Nova questão
                  </Button>
                )}
              </div>
            ) : (
              <div
                className={cn("transition-opacity", carregando && "opacity-60")}
              >
                <ListagemQuestoes
                  questoes={itens}
                  selecionadas={selecionadas}
                  onSelecionar={alternarSelecao}
                  onSelecionarPagina={selecionarPagina}
                  onEditar={(q) => setModo({ tipo: "editar", questao: q })}
                  onExcluir={(q) => pedirExclusao([q.id])}
                  onLimparEstatisticas={pedirZerarEstatisticas}
                  onCopiarId={copiarId}
                  busca={filtros.busca}
                />
              </div>
            )}

            {!erroLista && total > 0 && (
              <div className="flex flex-col gap-2 border-t border-slate-100 px-4 py-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  {((pagina - 1) * POR_PAGINA + 1).toLocaleString("pt-BR")}–
                  {Math.min(pagina * POR_PAGINA, total).toLocaleString("pt-BR")}{" "}
                  de {total.toLocaleString("pt-BR")}{" "}
                  {total === 1 ? "questão" : "questões"}
                  {carregando && (
                    <Loader2 className="ml-2 inline h-3.5 w-3.5 animate-spin" />
                  )}
                </span>
                {totalPaginas > 1 && (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8"
                      disabled={pagina <= 1}
                      onClick={() => setPagina(pagina - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="sr-only sm:not-sr-only sm:ml-1">
                        Anterior
                      </span>
                    </Button>
                    <span className="px-2 tabular-nums">
                      {pagina} / {totalPaginas}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8"
                      disabled={pagina >= totalPaginas}
                      onClick={() => setPagina(pagina + 1)}
                    >
                      <span className="sr-only sm:not-sr-only sm:mr-1">
                        Próxima
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Importar */}
      <Dialog open={importando} onOpenChange={setImportando}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Importar questões de um CSV</DialogTitle>
            <DialogDescription>
              As questões do arquivo são adicionadas ao banco. As imagens são
              copiadas para o Storage.
            </DialogDescription>
          </DialogHeader>
          <ImportQuestionsCard
            semCartao
            onQuestionsImported={() => {
              setImportando(false);
              setPagina(1);
              carregarLista();
              carregarResumo();
              carregarOpcoes();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Simulado com as selecionadas */}
      {simulado && (
        <CriarSimuladoModal
          isOpen={simulado}
          onClose={() => {
            setSimulado(false);
          }}
          selectedQuestions={selecionadasLista}
        />
      )}

      {dialogoConfirmacao}
    </div>
  );
};

export default Questoes;
