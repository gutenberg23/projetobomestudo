import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarClock, ClipboardList, Edit, ExternalLink, FileQuestion, Power, RefreshCw, Trash2, Trophy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  AbasContagem,
  CampoBusca,
  Contador,
  Etiqueta,
  EstadoVazio,
  FiltrosBarra,
  ListaEsqueleto,
  MenuAcoes,
  PainelListagem,
  RodapePaginacao,
  normalizar,
  selectClasse,
} from "@/components/admin/ui/listagem";
import { ConfirmarAcao } from "@/components/admin/ui/dialogos";
import { cn } from "@/lib/utils";
import { EditarSimuladoModal, GrupoSimulado, SimuladoLinha } from "./components/simulados";

type Aba = "todos" | "ativos" | "encerrados" | "inativos";
const POR_PAGINA = 20;

const dataCurta = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).replace(".", "") : "";

/** Junta as linhas com o mesmo título (um simulado aplicado a vários cursos). */
const agrupar = (linhas: SimuladoLinha[]): GrupoSimulado[] => {
  const mapa = new Map<string, SimuladoLinha[]>();
  linhas.forEach((l) => {
    const chave = l.titulo.trim().toLowerCase();
    mapa.set(chave, [...(mapa.get(chave) || []), l]);
  });
  const agora = Date.now();
  return Array.from(mapa.entries()).map(([chave, ls]) => {
    const ativos = ls.filter((l) => l.ativo).length;
    const dataFim = ls.find((l) => l.data_fim)?.data_fim || null;
    return {
      chave,
      titulo: ls[0].titulo,
      descricao: ls.find((l) => l.descricao)?.descricao || "",
      questoes: Math.max(...ls.map((l) => (l.questoes_ids || []).length)),
      dataFim,
      linhas: ls,
      ativo: ativos === ls.length ? "todos" : ativos ? "parcial" : "nenhum",
      encerrado: !!dataFim && new Date(dataFim).getTime() < agora,
      criadoEm: ls.map((l) => l.created_at || "").sort().reverse()[0],
    };
  });
};

const Simulados: React.FC = () => {
  const [linhas, setLinhas] = useState<SimuladoLinha[]>([]);
  const [cursos, setCursos] = useState<{ id: string; titulo: string; descricao?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [aba, setAba] = useState<Aba>("todos");
  const [busca, setBusca] = useState("");
  const [curso, setCurso] = useState("");
  const [pagina, setPagina] = useState(1);
  const [editando, setEditando] = useState<GrupoSimulado | null>(null);
  const [excluindo, setExcluindo] = useState<GrupoSimulado | null>(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data, error }, { data: cursosData, error: e2 }] = await Promise.all([
        supabase.from("simulados").select("*").order("created_at", { ascending: false }),
        supabase.from("cursos").select("id, titulo, descricao").order("titulo"),
      ]);
      if (error) throw error;
      if (e2) throw e2;
      setLinhas((data || []) as unknown as SimuladoLinha[]);
      setCursos(cursosData || []);
    } catch (error) {
      console.error("Erro ao buscar simulados:", error);
      toast.error("Erro ao carregar os simulados");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const nomeCurso = useMemo(() => new Map(cursos.map((c) => [c.id, c.titulo])), [cursos]);
  const grupos = useMemo(() => agrupar(linhas), [linhas]);

  const base = useMemo(() => {
    const termo = normalizar(busca.trim());
    return grupos.filter((g) => {
      if (curso && !g.linhas.some((l) => l.curso_id === curso)) return false;
      return !termo || normalizar(`${g.titulo} ${g.descricao} ${g.linhas.map((l) => nomeCurso.get(l.curso_id) || "").join(" ")}`).includes(termo);
    });
  }, [grupos, busca, curso, nomeCurso]);

  const passa = (g: GrupoSimulado, a: Aba) =>
    a === "ativos" ? g.ativo !== "nenhum" && !g.encerrado : a === "encerrados" ? g.encerrado : a === "inativos" ? g.ativo === "nenhum" : true;
  const filtrados = base.filter((g) => passa(g, aba));

  useEffect(() => setPagina(1), [busca, curso, aba]);
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const visiveis = filtrados.slice((paginaAtual - 1) * POR_PAGINA, paginaAtual * POR_PAGINA);

  const alternarAtivo = async (g: GrupoSimulado) => {
    const ativo = g.ativo !== "todos";
    const ids = g.linhas.map((l) => l.id);
    setLinhas((l) => l.map((x) => (ids.includes(x.id) ? { ...x, ativo } : x)));
    const { error } = await supabase.from("simulados").update({ ativo }).in("id", ids);
    if (error) {
      console.error("Erro ao alterar status:", error);
      toast.error("Não foi possível alterar o status");
      carregar();
    } else {
      toast.success(ativo ? "Simulado ativado" : "Simulado desativado");
    }
  };

  const excluir = async () => {
    if (!excluindo) return;
    const ids = excluindo.linhas.map((l) => l.id);
    const { error } = await supabase.from("simulados").delete().in("id", ids);
    if (error) {
      console.error("Erro ao excluir simulado:", error);
      toast.error("Erro ao excluir o simulado: " + error.message);
      return;
    }
    setLinhas((l) => l.filter((x) => !ids.includes(x.id)));
    toast.success("Simulado excluído");
  };

  const filtroAtivo = !!busca || !!curso || aba !== "todos";

  return (
    <div className="space-y-4">
      <AdminPageHeader
        titulo="Simulados"
        descricao={
          <>
            Simulados aplicados nos cursos. Para criar um, selecione as questões em{" "}
            <Link to="/admin/questoes" className="font-medium text-[#5f2ebe] hover:underline">
              Questões
            </Link>{" "}
            e clique em "Criar simulado".
          </>
        }
        acoes={
          <Button variant="outline" onClick={carregar} disabled={loading}>
            <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
            Atualizar
          </Button>
        }
      />

      <PainelListagem
        barra={
          <>
            <AbasContagem<Aba>
              abas={[
                { id: "todos", label: "Todos", n: base.length },
                { id: "ativos", label: "Em andamento", n: base.filter((g) => passa(g, "ativos")).length },
                { id: "encerrados", label: "Encerrados", n: base.filter((g) => passa(g, "encerrados")).length },
                { id: "inativos", label: "Desativados", n: base.filter((g) => passa(g, "inativos")).length },
              ]}
              ativa={aba}
              onChange={setAba}
            />
            <FiltrosBarra>
              <select value={curso} onChange={(e) => setCurso(e.target.value)} className={cn(selectClasse, "sm:max-w-[14rem]")} aria-label="Filtrar por curso">
                <option value="">Todos os cursos</option>
                {cursos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.titulo}
                  </option>
                ))}
              </select>
              <CampoBusca valor={busca} onChange={setBusca} placeholder="Buscar simulado ou curso" rotulo="Buscar simulados" />
            </FiltrosBarra>
          </>
        }
        rodape={
          !loading && (
            <RodapePaginacao pagina={paginaAtual} porPagina={POR_PAGINA} total={filtrados.length} onPagina={setPagina} singular="simulado" plural="simulados" />
          )
        }
      >
        {loading ? (
          <ListaEsqueleto />
        ) : visiveis.length === 0 ? (
          <EstadoVazio
            icone={ClipboardList}
            titulo={filtroAtivo ? "Nenhum simulado encontrado" : "Nenhum simulado ainda"}
            texto={filtroAtivo ? "Tente outra busca, outro curso ou outra aba." : "Selecione questões em Questões e clique em Criar simulado."}
            acao={
              filtroAtivo ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setBusca("");
                    setCurso("");
                    setAba("todos");
                  }}
                >
                  Limpar filtros
                </Button>
              ) : (
                <Button variant="outline" size="sm" asChild>
                  <Link to="/admin/questoes">Ir para Questões</Link>
                </Button>
              )
            }
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {visiveis.map((g) => {
              const primeiro = g.linhas[0];
              const status = g.ativo === "nenhum" ? (
                <Etiqueta tom="cinza">Desativado</Etiqueta>
              ) : g.encerrado ? (
                <Etiqueta tom="ambar">Encerrado</Etiqueta>
              ) : (
                <Etiqueta tom="verde">{g.ativo === "parcial" ? "Ativo em parte dos cursos" : "Em andamento"}</Etiqueta>
              );
              return (
                <li key={g.chave} className="flex items-start gap-3 px-3 py-3.5 transition-colors hover:bg-[#faf8ff] sm:items-center sm:gap-4 sm:px-4">
                  <span
                    className={cn(
                      "hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg sm:flex",
                      g.ativo !== "nenhum" && !g.encerrado ? "bg-[#5f2ebe]/10 text-[#5f2ebe]" : "bg-slate-100 text-slate-400"
                    )}
                    aria-hidden
                  >
                    <ClipboardList className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditando(g)}
                        className="text-left text-sm font-semibold leading-snug text-slate-900 hover:text-[#5f2ebe]"
                      >
                        {g.titulo}
                      </button>
                      {status}
                    </div>
                    {g.descricao && <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{g.descricao}</p>}
                    <div className="mt-1.5 flex flex-wrap items-center gap-1">
                      {g.linhas.slice(0, 3).map((l) => (
                        <span
                          key={l.id}
                          className={cn("rounded px-1.5 py-0.5 text-[11px]", l.ativo ? "bg-slate-100 text-slate-600" : "bg-slate-50 text-slate-400 line-through")}
                          title={l.ativo ? undefined : "Desativado neste curso"}
                        >
                          {nomeCurso.get(l.curso_id) || "Curso removido"}
                        </span>
                      ))}
                      {g.linhas.length > 3 && (
                        <span className="text-[11px] text-slate-400" title={g.linhas.map((l) => nomeCurso.get(l.curso_id)).join(", ")}>
                          +{g.linhas.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="hidden items-center gap-4 text-xs md:flex">
                    <Contador icone={FileQuestion} n={g.questoes} titulo="questões" />
                    <span
                      className={cn("inline-flex w-28 items-center whitespace-nowrap gap-1", g.dataFim ? (g.encerrado ? "text-amber-600" : "text-slate-600") : "text-slate-300")}
                      title="Data de encerramento"
                    >
                      <CalendarClock className="h-3.5 w-3.5" />
                      {g.dataFim ? dataCurta(g.dataFim) : "sem prazo"}
                    </span>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setEditando(g)} className="hidden text-slate-600 sm:inline-flex">
                      <Edit className="mr-1.5 h-4 w-4" />
                      Editar
                    </Button>
                    <MenuAcoes
                      acoes={[
                        { label: "Editar", icone: Edit, onClick: () => setEditando(g), soCelular: true },
                        { label: "Ver no site", icone: ExternalLink, href: `/simulado/${primeiro.id}`, externo: true },
                        { label: "Ranking", icone: Trophy, href: `/simulado-ranking/${primeiro.id}`, externo: true },
                        { label: g.ativo === "todos" ? "Desativar" : "Ativar em todos os cursos", icone: Power, onClick: () => alternarAtivo(g) },
                        { label: "Excluir", icone: Trash2, onClick: () => setExcluindo(g), perigo: true, separadorAntes: true },
                      ]}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </PainelListagem>

      <EditarSimuladoModal grupo={editando} cursos={cursos} onClose={() => setEditando(null)} onSalvo={carregar} />

      <ConfirmarAcao
        aberto={!!excluindo}
        onFechar={() => setExcluindo(null)}
        titulo={`Excluir "${excluindo?.titulo || ""}"?`}
        descricao="Essa ação não pode ser desfeita. Se quiser só tirar do ar, use Desativar."
        detalhes={
          excluindo && excluindo.linhas.length > 1
            ? [`O simulado é excluído dos ${excluindo.linhas.length} cursos: ${excluindo.linhas.map((l) => nomeCurso.get(l.curso_id)).join(", ")}.`]
            : undefined
        }
        textoConfirmar="Excluir simulado"
        onConfirmar={excluir}
      />
    </div>
  );
};

export default Simulados;
