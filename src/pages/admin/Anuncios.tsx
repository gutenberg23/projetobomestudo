import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  Copy,
  Edit,
  ExternalLink,
  ImageOff,
  LayoutGrid,
  List,
  Megaphone,
  Pause,
  Play,
  Plus,
  Radio,
  Repeat,
  Trash2,
} from "lucide-react";
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
import { POSICOES_ANUNCIO, codigosDoEspaco, paginasDeAnuncio, posicaoDoCodigo } from "@/components/ads/posicoes";
import { limparCacheAnuncios } from "@/hooks/useAnuncios";
import { anunciosService } from "@/services/anunciosService";
import { cn } from "@/lib/utils";
import EditorAnuncio, { FormAnuncio, novoFormAnuncio } from "./components/anuncios/EditorAnuncio";

interface Anuncio {
  id: string;
  created_at: string | null;
  titulo: string;
  imagem_url: string | null;
  link_destino: string | null;
  data_inicio: string;
  data_fim: string;
  posicao: string;
  ativo: boolean | null;
  ordem: number | null;
}

type Aba = "todos" | SituacaoVeiculacao;
type Visao = "lista" | "espacos";
const POR_PAGINA = 20;

const hostDe = (url: string) => {
  if (url.startsWith("/")) return url;
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
};

/** Ordena como o site: menor ordem primeiro e, empatando, o mais novo. */
const porPrioridade = (a: Anuncio, b: Anuncio) => (a.ordem ?? 0) - (b.ordem ?? 0) || (b.created_at || "").localeCompare(a.created_at || "");

export default function Anuncios() {
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [loading, setLoading] = useState(true);
  const [visao, setVisao] = useState<Visao>("lista");
  const [aba, setAba] = useState<Aba>("todos");
  const [pagina, setPagina] = useState("");
  const [busca, setBusca] = useState("");
  const [pag, setPag] = useState(1);
  const [editor, setEditor] = useState<{ id?: string; inicial: FormAnuncio } | null>(null);
  const [excluindo, setExcluindo] = useState<Anuncio | null>(null);

  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      setAnuncios(((await anunciosService.getAll()) || []) as Anuncio[]);
    } catch (error) {
      console.error("Erro ao buscar anúncios:", error);
      toast.error("Não foi possível carregar os anúncios");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  /** Para cada espaço, quem está aparecendo agora (o de maior prioridade no ar). */
  const ocupacao = useMemo(() => {
    const mapa = new Map<string, Anuncio[]>();
    for (const p of POSICOES_ANUNCIO) {
      const codigos = codigosDoEspaco(p.codigo);
      mapa.set(
        p.codigo,
        anuncios.filter((a) => codigos.includes(a.posicao) && a.imagem_url && situacaoVeiculacao(a) === "no_ar").sort(porPrioridade)
      );
    }
    return mapa;
  }, [anuncios]);

  /** Anúncio no ar que não aparece porque outro tem prioridade no mesmo espaço fixo. */
  const encoberto = useCallback(
    (a: Anuncio) => {
      const p = posicaoDoCodigo(a.posicao);
      if (!p || p.repete) return null;
      const lista = ocupacao.get(p.codigo) || [];
      return lista.length > 1 && lista[0].id !== a.id && lista.some((x) => x.id === a.id) ? lista[0] : null;
    },
    [ocupacao]
  );

  const base = useMemo(() => {
    const termo = normalizar(busca.trim());
    return anuncios.filter((a) => {
      if (pagina && posicaoDoCodigo(a.posicao)?.pagina !== pagina) return false;
      return !termo || normalizar(`${a.titulo} ${a.link_destino || ""}`).includes(termo);
    });
  }, [anuncios, busca, pagina]);

  const contagem = useMemo(() => {
    const c: Record<Aba, number> = { todos: base.length, no_ar: 0, agendado: 0, pausado: 0, encerrado: 0 };
    base.forEach((a) => c[situacaoVeiculacao(a)]++);
    return c;
  }, [base]);

  const filtrados = useMemo(() => {
    const ordemSit: Record<SituacaoVeiculacao, number> = { no_ar: 0, agendado: 1, pausado: 2, encerrado: 3 };
    return base
      .filter((a) => aba === "todos" || situacaoVeiculacao(a) === aba)
      .sort((a, b) => ordemSit[situacaoVeiculacao(a)] - ordemSit[situacaoVeiculacao(b)] || (b.created_at || "").localeCompare(a.created_at || ""));
  }, [base, aba]);

  useEffect(() => setPag(1), [aba, pagina, busca]);
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const pagAtual = Math.min(pag, totalPaginas);
  const visiveis = filtrados.slice((pagAtual - 1) * POR_PAGINA, pagAtual * POR_PAGINA);

  const geral = useMemo(() => {
    const c = { no_ar: 0, agendado: 0, pausado: 0, encerrado: 0 };
    anuncios.forEach((a) => c[situacaoVeiculacao(a)]++);
    const ocupados = POSICOES_ANUNCIO.filter((p) => (ocupacao.get(p.codigo) || []).length > 0).length;
    return { ...c, ocupados };
  }, [anuncios, ocupacao]);

  const abrirNovo = (posicao?: string) => setEditor({ inicial: novoFormAnuncio(posicao) });
  const abrirEdicao = (a: Anuncio) =>
    setEditor({
      id: a.id,
      inicial: {
        titulo: a.titulo,
        imagem_url: a.imagem_url || "",
        link_destino: a.link_destino || "",
        data_inicio: a.data_inicio,
        data_fim: a.data_fim,
        posicao: a.posicao,
        ativo: a.ativo === true,
        ordem: a.ordem ?? 0,
      },
    });
  const duplicar = (a: Anuncio) => {
    abrirEdicao(a);
    setEditor((e) => e && { inicial: { ...e.inicial, titulo: `${a.titulo} (cópia)`, ativo: false } });
  };

  const salvar = async (f: FormAnuncio) => {
    const dados = { ...f, link_destino: f.link_destino || null, imagem_url: f.imagem_url || null };
    try {
      if (editor?.id) {
        await anunciosService.update(editor.id, dados);
        toast.success("Anúncio atualizado");
      } else {
        await anunciosService.create(dados);
        toast.success(f.ativo ? "Anúncio criado" : "Anúncio criado (pausado)");
      }
      limparCacheAnuncios();
      carregar();
      return true;
    } catch (error) {
      console.error("Erro ao salvar anúncio:", error);
      toast.error("Não foi possível salvar o anúncio");
      return false;
    }
  };

  const alternar = async (a: Anuncio) => {
    const ativo = !(a.ativo === true);
    setAnuncios((l) => l.map((x) => (x.id === a.id ? { ...x, ativo } : x)));
    try {
      await anunciosService.update(a.id, { ativo });
      limparCacheAnuncios();
      toast.success(ativo ? "Anúncio ativado" : "Anúncio pausado");
    } catch {
      setAnuncios((l) => l.map((x) => (x.id === a.id ? { ...x, ativo: !ativo } : x)));
      toast.error("Não foi possível alterar o anúncio");
    }
  };

  const excluir = async () => {
    if (!excluindo) return;
    try {
      await anunciosService.delete(excluindo.id);
      setAnuncios((l) => l.filter((x) => x.id !== excluindo.id));
      limparCacheAnuncios();
      toast.success("Anúncio excluído");
    } catch {
      toast.error("Não foi possível excluir o anúncio");
    }
  };

  const filtroAtivo = !!busca || !!pagina || aba !== "todos";

  return (
    <div className="space-y-4">
      <AdminPageHeader
        titulo="Anúncios"
        descricao="Banners que aparecem em espaços fixos do site. Cada espaço mostra o anúncio de maior prioridade que estiver no ar."
        acoes={
          <>
            <div className="flex rounded-lg border border-slate-200 bg-white p-0.5" role="tablist" aria-label="Visualização">
              {(
                [
                  { id: "lista", label: "Anúncios", icone: List },
                  { id: "espacos", label: "Espaços do site", icone: LayoutGrid },
                ] as const
              ).map((v) => (
                <button
                  key={v.id}
                  type="button"
                  role="tab"
                  aria-selected={visao === v.id}
                  onClick={() => setVisao(v.id)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    visao === v.id ? "bg-[#5f2ebe] text-white" : "text-slate-600 hover:bg-slate-100"
                  )}
                >
                  <v.icone className="h-4 w-4" />
                  {v.label}
                </button>
              ))}
            </div>
            <Button onClick={() => abrirNovo()} className={botaoPrimario}>
              <Plus className="mr-2 h-4 w-4" />
              Novo anúncio
            </Button>
          </>
        }
      />

      <CartoesResumo
        carregando={loading}
        itens={[
          { rotulo: "No ar agora", valor: geral.no_ar, icone: Radio, tom: "verde" },
          { rotulo: "Agendados", valor: geral.agendado, icone: CalendarClock, tom: "roxo" },
          { rotulo: "Pausados", valor: geral.pausado, icone: Pause, tom: "cinza" },
          {
            rotulo: "Espaços ocupados",
            valor: `${geral.ocupados}/${POSICOES_ANUNCIO.length}`,
            icone: LayoutGrid,
            tom: "rosa",
            detalhe: `${geral.encerrado} encerrado${geral.encerrado === 1 ? "" : "s"}`,
          },
        ]}
      />

      {visao === "espacos" ? (
        <MapaEspacos ocupacao={ocupacao} carregando={loading} onNovo={abrirNovo} onEditar={abrirEdicao} />
      ) : (
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
                  {paginasDeAnuncio().map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <CampoBusca valor={busca} onChange={setBusca} placeholder="Buscar por nome ou link" rotulo="Buscar anúncios" className="sm:w-60" />
              </FiltrosBarra>
            </>
          }
          rodape={!loading && <RodapePaginacao pagina={pagAtual} porPagina={POR_PAGINA} total={filtrados.length} onPagina={setPag} singular="anúncio" plural="anúncios" />}
        >
          {loading ? (
            <ListaEsqueleto />
          ) : visiveis.length === 0 ? (
            <EstadoVazio
              icone={Megaphone}
              titulo={filtroAtivo ? "Nenhum anúncio encontrado" : "Nenhum anúncio cadastrado"}
              texto={filtroAtivo ? "Tente outra busca, outra página ou outra aba." : "Crie um banner e escolha em qual espaço do site ele aparece."}
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
                  <Button size="sm" onClick={() => abrirNovo()} className={botaoPrimario}>
                    <Plus className="mr-1.5 h-4 w-4" /> Novo anúncio
                  </Button>
                )
              }
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {visiveis.map((a) => {
                const sit = situacaoVeiculacao(a);
                const pos = posicaoDoCodigo(a.posicao);
                const antigo = pos && pos.codigo !== a.posicao;
                const acima = sit === "no_ar" ? encoberto(a) : null;
                return (
                  <li key={a.id} className="flex items-start gap-3 px-3 py-3.5 transition-colors hover:bg-[#faf8ff] sm:items-center sm:gap-4 sm:px-4">
                    <button
                      type="button"
                      onClick={() => abrirEdicao(a)}
                      className="flex h-12 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-slate-50 sm:h-14 sm:w-32"
                      aria-label={`Editar ${a.titulo}`}
                    >
                      {a.imagem_url ? (
                        <img src={a.imagem_url} alt="" className={cn("h-full w-full object-contain", sit !== "no_ar" && "opacity-60 grayscale-[40%]")} loading="lazy" />
                      ) : (
                        <ImageOff className="h-5 w-5 text-slate-300" />
                      )}
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <button type="button" onClick={() => abrirEdicao(a)} className="text-left text-sm font-semibold leading-snug text-slate-900 hover:text-[#5f2ebe]">
                          {a.titulo}
                        </button>
                        {!a.imagem_url && sit === "no_ar" ? (
                          <Etiqueta tom="vermelho">Não aparece</Etiqueta>
                        ) : (
                          <Etiqueta tom={TOM_SITUACAO[sit]}>{ROTULO_SITUACAO[sit]}</Etiqueta>
                        )}
                      </div>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs text-slate-600">
                        {pos ? (
                          <>
                            <span className="font-medium">{pos.pagina}</span>
                            <span className="text-slate-300">·</span>
                            <span>{pos.local}</span>
                            {pos.repete && (
                              <span className="inline-flex items-center gap-0.5 text-slate-400" title={`Repete ${pos.repete}`}>
                                <Repeat className="h-3 w-3" />
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-amber-700">Espaço "{a.posicao}" não existe mais</span>
                        )}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        {textoPeriodo(a.data_inicio, a.data_fim)} · {textoPrazo(a)}
                        {a.link_destino && <> · {hostDe(a.link_destino)}</>}
                      </p>
                      {(!a.imagem_url || !pos || antigo || acima) && (
                        <p className="mt-1 flex items-start gap-1 text-[11px] text-amber-700">
                          <AlertTriangle className="mt-px h-3 w-3 shrink-0" />
                          {!a.imagem_url
                            ? "Sem imagem: não aparece no site."
                            : !pos
                              ? "Escolha um espaço que exista para voltar a aparecer."
                              : acima
                                ? `Na fila: "${acima.titulo}" tem prioridade neste espaço.`
                                : "Código antigo de posição; continua aparecendo. Ao editar, confirme o espaço."}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => abrirEdicao(a)} className="hidden text-slate-600 sm:inline-flex">
                        <Edit className="mr-1.5 h-4 w-4" />
                        Editar
                      </Button>
                      <MenuAcoes
                        acoes={[
                          { label: "Editar", icone: Edit, onClick: () => abrirEdicao(a), soCelular: true },
                          {
                            label: a.ativo ? "Pausar" : "Ativar",
                            icone: a.ativo ? Pause : Play,
                            onClick: () => alternar(a),
                            oculto: sit === "encerrado" && !a.ativo,
                          },
                          { label: "Duplicar", icone: Copy, onClick: () => duplicar(a) },
                          { label: "Ver a página no site", icone: ExternalLink, href: pos?.rota, externo: true, oculto: !pos },
                          { label: "Excluir", icone: Trash2, onClick: () => setExcluindo(a), perigo: true, separadorAntes: true },
                        ]}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </PainelListagem>
      )}

      {editor && (
        <EditorAnuncio aberto editando={!!editor.id} inicial={editor.inicial} onFechar={() => setEditor(null)} onSalvar={salvar} />
      )}

      <ConfirmarAcao
        aberto={!!excluindo}
        onFechar={() => setExcluindo(null)}
        titulo={`Excluir "${excluindo?.titulo || ""}"?`}
        descricao="O banner sai do site e não dá para desfazer. Para tirar do ar só por um tempo, use Pausar."
        textoConfirmar="Excluir anúncio"
        onConfirmar={excluir}
      />
    </div>
  );
}

/** Visão por espaço: cada lugar do site e o que está aparecendo nele. */
function MapaEspacos({
  ocupacao,
  carregando,
  onNovo,
  onEditar,
}: {
  ocupacao: Map<string, Anuncio[]>;
  carregando: boolean;
  onNovo: (posicao: string) => void;
  onEditar: (a: Anuncio) => void;
}) {
  if (carregando) {
    return (
      <PainelListagem>
        <ListaEsqueleto />
      </PainelListagem>
    );
  }
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {paginasDeAnuncio().map((g) => (
        <section key={g} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <header className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
            <h2 className="text-sm font-semibold text-slate-900">{g}</h2>
            <a
              href={POSICOES_ANUNCIO.find((p) => p.pagina === g)?.rota}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-[#5f2ebe]"
            >
              Abrir <ExternalLink className="h-3 w-3" />
            </a>
          </header>
          <ul className="divide-y divide-slate-100">
            {POSICOES_ANUNCIO.filter((p) => p.pagina === g).map((p) => {
              const lista = ocupacao.get(p.codigo) || [];
              const atual = lista[0];
              return (
                <li key={p.codigo} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex h-10 w-24 shrink-0 items-center justify-center overflow-hidden rounded-md border border-dashed border-slate-200 bg-slate-50">
                    {atual?.imagem_url ? (
                      <img src={atual.imagem_url} alt="" className="h-full w-full object-contain" loading="lazy" />
                    ) : (
                      <span className="text-[10px] uppercase tracking-wide text-slate-300">vazio</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 text-sm font-medium text-slate-800">
                      {p.local}
                      {p.repete && (
                        <span className="inline-flex items-center gap-0.5 text-[11px] font-normal text-slate-400">
                          <Repeat className="h-3 w-3" /> {p.repete}
                        </span>
                      )}
                    </p>
                    {atual ? (
                      <button type="button" onClick={() => onEditar(atual)} className="block max-w-full truncate text-left text-xs text-emerald-700 hover:underline">
                        No ar: {atual.titulo}
                        {lista.length > 1 && <span className="text-slate-400"> {p.repete ? `e mais ${lista.length - 1} se revezando` : `(+${lista.length - 1} na fila)`}</span>}
                      </button>
                    ) : (
                      <p className="text-xs text-slate-400">Nenhum anúncio no ar</p>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => onNovo(p.codigo)} className="shrink-0 text-[#5f2ebe] hover:bg-[#5f2ebe]/5 hover:text-[#5f2ebe]">
                    <Plus className="h-4 w-4 sm:mr-1" />
                    <span className="hidden sm:inline">Anunciar</span>
                  </Button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
