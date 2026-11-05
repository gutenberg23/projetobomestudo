import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, CalendarClock, Copy, Edit, ExternalLink, Eye, Globe, MessageSquareWarning, Pause, Play, Plus, Radio, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  AbasContagem,
  CampoBusca,
  CartoesResumo,
  EstadoVazio,
  Etiqueta,
  FiltrosBarra,
  ListaEsqueleto,
  MenuAcoes,
  PainelListagem,
  RodapePaginacao,
  botaoPrimario,
  normalizar,
  selectClasse,
} from "@/components/admin/ui/listagem";
import { ConfirmarAcao } from "@/components/admin/ui/dialogos";
import { ROTULO_SITUACAO, TOM_SITUACAO, situacaoVeiculacao, textoPeriodo, textoPrazo, type SituacaoVeiculacao } from "@/components/admin/ui/periodo";
import { PAGINAS_POPUP, PAGINA_TODAS, paginaConhecida, rotuloPagina } from "@/components/popups/paginas";
import { popupsService } from "@/services/popupsService";
import { cn } from "@/lib/utils";
import EditorPopup, { FormPopup, novoFormPopup } from "./EditorPopup";

interface PopupAdmin {
  id: string;
  created_at: string | null;
  titulo: string;
  conteudo: string | null;
  imagem_url: string | null;
  link_destino: string | null;
  data_inicio: string;
  data_fim: string;
  pagina: string;
  ativo: boolean | null;
  ordem: number | null;
}

type Aba = "todos" | SituacaoVeiculacao;
const POR_PAGINA = 20;

const textoPuro = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const porPrioridade = (a: PopupAdmin, b: PopupAdmin) =>
  (a.ordem ?? 0) - (b.ordem ?? 0) ||
  Number(a.pagina === PAGINA_TODAS) - Number(b.pagina === PAGINA_TODAS) ||
  (b.created_at || "").localeCompare(a.created_at || "");

export default function Popups() {
  const [popups, setPopups] = useState<PopupAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [aba, setAba] = useState<Aba>("todos");
  const [pagina, setPagina] = useState("");
  const [busca, setBusca] = useState("");
  const [pag, setPag] = useState(1);
  const [editor, setEditor] = useState<{ id?: string; inicial: FormPopup } | null>(null);
  const [excluindo, setExcluindo] = useState<PopupAdmin | null>(null);

  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      setPopups(((await popupsService.getAll()) || []) as PopupAdmin[]);
    } catch (error) {
      console.error("Erro ao buscar popups:", error);
      toast.error("Não foi possível carregar os popups");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  /** Popup no ar que fica atrás de outro com prioridade na mesma página. */
  const naFila = useCallback(
    (p: PopupAdmin) => {
      const concorrentes = popups
        .filter((x) => situacaoVeiculacao(x) === "no_ar" && (x.pagina === p.pagina || x.pagina === PAGINA_TODAS || p.pagina === PAGINA_TODAS))
        .sort(porPrioridade);
      const primeiro = concorrentes[0];
      return primeiro && primeiro.id !== p.id ? primeiro : null;
    },
    [popups]
  );

  const base = useMemo(() => {
    const termo = normalizar(busca.trim());
    return popups.filter((p) => {
      if (pagina && p.pagina !== pagina) return false;
      return !termo || normalizar(`${p.titulo} ${textoPuro(p.conteudo || "")}`).includes(termo);
    });
  }, [popups, busca, pagina]);

  const contagem = useMemo(() => {
    const c: Record<Aba, number> = { todos: base.length, no_ar: 0, agendado: 0, pausado: 0, encerrado: 0 };
    base.forEach((p) => c[situacaoVeiculacao(p)]++);
    return c;
  }, [base]);

  const filtrados = useMemo(() => {
    const ordemSit: Record<SituacaoVeiculacao, number> = { no_ar: 0, agendado: 1, pausado: 2, encerrado: 3 };
    return base
      .filter((p) => aba === "todos" || situacaoVeiculacao(p) === aba)
      .sort((a, b) => ordemSit[situacaoVeiculacao(a)] - ordemSit[situacaoVeiculacao(b)] || (b.created_at || "").localeCompare(a.created_at || ""));
  }, [base, aba]);

  useEffect(() => setPag(1), [aba, pagina, busca]);
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const pagAtual = Math.min(pag, totalPaginas);
  const visiveis = filtrados.slice((pagAtual - 1) * POR_PAGINA, pagAtual * POR_PAGINA);

  const geral = useMemo(() => {
    const c = { no_ar: 0, agendado: 0, pausado: 0, encerrado: 0 };
    popups.forEach((p) => c[situacaoVeiculacao(p)]++);
    const paginas = new Set(popups.filter((p) => situacaoVeiculacao(p) === "no_ar").map((p) => p.pagina));
    return { ...c, paginas: paginas.has(PAGINA_TODAS) ? "Todas" : String(paginas.size) };
  }, [popups]);

  const abrirEdicao = (p: PopupAdmin) =>
    setEditor({
      id: p.id,
      inicial: {
        titulo: p.titulo,
        conteudo: p.conteudo || "",
        imagem_url: p.imagem_url || "",
        link_destino: p.link_destino || "",
        data_inicio: p.data_inicio,
        data_fim: p.data_fim,
        pagina: p.pagina,
        ativo: p.ativo === true,
        ordem: p.ordem ?? 0,
      },
    });
  const duplicar = (p: PopupAdmin) => {
    abrirEdicao(p);
    setEditor((e) => e && { inicial: { ...e.inicial, titulo: `${p.titulo} (cópia)`, ativo: false } });
  };

  const salvar = async (f: FormPopup) => {
    const dados = {
      ...f,
      conteudo: f.conteudo.trim() || undefined,
      imagem_url: f.imagem_url || undefined,
      link_destino: f.link_destino || undefined,
    };
    try {
      if (editor?.id) {
        // Campos esvaziados precisam ir como null para apagar no banco
        await popupsService.update(editor.id, {
          ...dados,
          conteudo: (dados.conteudo ?? null) as string | undefined,
          imagem_url: (dados.imagem_url ?? null) as string | undefined,
          link_destino: (dados.link_destino ?? null) as string | undefined,
        });
        toast.success("Popup atualizado");
      } else {
        await popupsService.create(dados);
        toast.success(f.ativo ? "Popup criado" : "Popup criado (pausado)");
      }
      carregar();
      return true;
    } catch (error) {
      console.error("Erro ao salvar popup:", error);
      toast.error("Não foi possível salvar o popup");
      return false;
    }
  };

  const alternar = async (p: PopupAdmin) => {
    const ativo = !(p.ativo === true);
    setPopups((l) => l.map((x) => (x.id === p.id ? { ...x, ativo } : x)));
    try {
      await popupsService.update(p.id, { ativo });
      toast.success(ativo ? "Popup ativado" : "Popup pausado");
    } catch {
      setPopups((l) => l.map((x) => (x.id === p.id ? { ...x, ativo: !ativo } : x)));
      toast.error("Não foi possível alterar o popup");
    }
  };

  const excluir = async () => {
    if (!excluindo) return;
    try {
      await popupsService.delete(excluindo.id);
      setPopups((l) => l.filter((x) => x.id !== excluindo.id));
      toast.success("Popup excluído");
    } catch {
      toast.error("Não foi possível excluir o popup");
    }
  };

  const linkPrevia = (p: PopupAdmin) => {
    const rota = PAGINAS_POPUP.find((x) => x.codigo === p.pagina)?.rota || "/";
    return `${rota}?previa_popup=${p.id}`;
  };

  const filtroAtivo = !!busca || !!pagina || aba !== "todos";

  return (
    <div className="space-y-4">
      <AdminPageHeader
        titulo="Popups"
        descricao="Avisos que abrem por cima das páginas do site. Abre um por vez, uma vez por visita, e o aluno pode pedir para não ver de novo."
        acoes={
          <Button onClick={() => setEditor({ inicial: novoFormPopup(pagina || "home") })} className={botaoPrimario}>
            <Plus className="mr-2 h-4 w-4" />
            Novo popup
          </Button>
        }
      />

      <CartoesResumo
        carregando={loading}
        itens={[
          { rotulo: "No ar agora", valor: geral.no_ar, icone: Radio, tom: "verde" },
          { rotulo: "Agendados", valor: geral.agendado, icone: CalendarClock, tom: "roxo" },
          { rotulo: "Pausados", valor: geral.pausado, icone: Pause, tom: "cinza" },
          { rotulo: "Páginas com popup", valor: geral.paginas, icone: Globe, tom: "rosa", detalhe: `${geral.encerrado} encerrado${geral.encerrado === 1 ? "" : "s"}` },
        ]}
      />

      <PainelListagem
        barra={
          <>
            <AbasContagem<Aba>
              abas={[
                { id: "todos", label: "Todos", n: contagem.todos },
                { id: "no_ar", label: "No ar", n: contagem.no_ar },
                { id: "agendado", label: "Agendados", n: contagem.agendado },
                { id: "pausado", label: "Pausados", n: contagem.pausado },
                { id: "encerrado", label: "Encerrados", n: contagem.encerrado },
              ]}
              ativa={aba}
              onChange={setAba}
            />
            <FiltrosBarra>
              <select value={pagina} onChange={(e) => setPagina(e.target.value)} className={cn(selectClasse, "sm:max-w-[13rem]")} aria-label="Filtrar por página">
                <option value="">Todas as páginas</option>
                {PAGINAS_POPUP.map((p) => (
                  <option key={p.codigo} value={p.codigo}>
                    {p.codigo === PAGINA_TODAS ? "Só os de todas as páginas" : p.rotulo}
                  </option>
                ))}
              </select>
              <CampoBusca valor={busca} onChange={setBusca} placeholder="Buscar no título ou texto" rotulo="Buscar popups" className="sm:w-60" />
            </FiltrosBarra>
          </>
        }
        rodape={!loading && <RodapePaginacao pagina={pagAtual} porPagina={POR_PAGINA} total={filtrados.length} onPagina={setPag} singular="popup" plural="popups" />}
      >
        {loading ? (
          <ListaEsqueleto />
        ) : visiveis.length === 0 ? (
          <EstadoVazio
            icone={MessageSquareWarning}
            titulo={filtroAtivo ? "Nenhum popup encontrado" : "Nenhum popup cadastrado"}
            texto={filtroAtivo ? "Tente outra busca, outra página ou outra aba." : "Use popups para avisos rápidos: edital publicado, promoção, novidade no site."}
            acao={
              filtroAtivo ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setBusca("");
                    setPagina("");
                    setAba("todos");
                  }}
                >
                  Limpar filtros
                </Button>
              ) : (
                <Button size="sm" onClick={() => setEditor({ inicial: novoFormPopup() })} className={botaoPrimario}>
                  <Plus className="mr-1.5 h-4 w-4" /> Novo popup
                </Button>
              )
            }
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {visiveis.map((p) => {
              const sit = situacaoVeiculacao(p);
              const acima = sit === "no_ar" ? naFila(p) : null;
              const resumo = textoPuro(p.conteudo || "");
              return (
                <li key={p.id} className="flex items-start gap-3 px-3 py-3.5 transition-colors hover:bg-[#faf8ff] sm:items-center sm:gap-4 sm:px-4">
                  <button
                    type="button"
                    onClick={() => abrirEdicao(p)}
                    className={cn(
                      "flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border sm:h-14 sm:w-20",
                      p.imagem_url ? "border-slate-200 bg-slate-50" : "border-[#5f2ebe]/15 bg-[#5f2ebe]/5"
                    )}
                    aria-label={`Editar ${p.titulo}`}
                  >
                    {p.imagem_url ? (
                      <img src={p.imagem_url} alt="" className={cn("h-full w-full object-cover", sit !== "no_ar" && "opacity-60")} loading="lazy" />
                    ) : (
                      <MessageSquareWarning className={cn("h-5 w-5", sit === "no_ar" ? "text-[#5f2ebe]" : "text-slate-300")} />
                    )}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <button type="button" onClick={() => abrirEdicao(p)} className="text-left text-sm font-semibold leading-snug text-slate-900 hover:text-[#5f2ebe]">
                        {p.titulo}
                      </button>
                      <Etiqueta tom={TOM_SITUACAO[sit]}>{ROTULO_SITUACAO[sit]}</Etiqueta>
                      <Etiqueta tom={p.pagina === PAGINA_TODAS ? "rosa" : "roxo"}>{rotuloPagina(p.pagina)}</Etiqueta>
                    </div>
                    {resumo && <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{resumo}</p>}
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      {textoPeriodo(p.data_inicio, p.data_fim)} · {textoPrazo(p)}
                      {p.link_destino && <> · com botão</>}
                    </p>
                    {(!paginaConhecida(p.pagina) || acima) && (
                      <p className="mt-1 flex items-start gap-1 text-[11px] text-amber-700">
                        <AlertTriangle className="mt-px h-3 w-3 shrink-0" />
                        {!paginaConhecida(p.pagina)
                          ? "Essa página não existe mais; edite e escolha outra."
                          : `Na fila: "${acima!.titulo}" abre antes${acima!.pagina === PAGINA_TODAS && p.pagina !== PAGINA_TODAS ? " (está em todas as páginas)" : ""}.`}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => abrirEdicao(p)} className="hidden text-slate-600 sm:inline-flex">
                      <Edit className="mr-1.5 h-4 w-4" />
                      Editar
                    </Button>
                    <MenuAcoes
                      acoes={[
                        { label: "Editar", icone: Edit, onClick: () => abrirEdicao(p), soCelular: true },
                        { label: "Testar no site", icone: Eye, href: linkPrevia(p), externo: true },
                        { label: p.ativo ? "Pausar" : "Ativar", icone: p.ativo ? Pause : Play, onClick: () => alternar(p), oculto: sit === "encerrado" && !p.ativo },
                        { label: "Duplicar", icone: Copy, onClick: () => duplicar(p) },
                        { label: "Excluir", icone: Trash2, onClick: () => setExcluindo(p), perigo: true, separadorAntes: true },
                      ]}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </PainelListagem>

      <p className="flex items-center gap-1.5 px-1 text-xs text-slate-400">
        <ExternalLink className="h-3.5 w-3.5" />
        "Testar no site" abre o popup na página escolhida mesmo pausado ou fora do período, só para você conferir.
      </p>

      {editor && <EditorPopup editando={!!editor.id} inicial={editor.inicial} onFechar={() => setEditor(null)} onSalvar={salvar} />}

      <ConfirmarAcao
        aberto={!!excluindo}
        onFechar={() => setExcluindo(null)}
        titulo={`Excluir "${excluindo?.titulo || ""}"?`}
        descricao="O popup deixa de aparecer e não dá para desfazer. Para tirar do ar só por um tempo, use Pausar."
        textoConfirmar="Excluir popup"
        onConfirmar={excluir}
      />
    </div>
  );
}
