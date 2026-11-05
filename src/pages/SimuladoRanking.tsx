import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { AlertCircle, ArrowLeft, BarChart3, ClipboardList, Lock, Percent, PlayCircle, Search, Trophy, Users, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { BarraProgresso, EstadoVazio, Painel, normalizar } from "@/components/course/ui";
import { ItemRanking, LinhaRanking, ListaCarregando, Podio, SuaPosicao } from "@/components/ranking/PaginaRanking";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { cn } from "@/lib/utils";

const LARGURA = "mx-auto w-full max-w-[1400px] px-[10px] md:px-[32px]";
const UNIDADE: [string, string] = ["acerto", "acertos"];

interface SimuladoInfo {
  id: string;
  titulo: string;
  questoes_ids: string[] | null;
  ranking_is_public: boolean | null;
}

interface LinhaBanco {
  ranking_position: number;
  user_id: string;
  nome: string;
  acertos: number;
  erros: number;
  aproveitamento: number;
  created_at: string;
}

const FAIXAS = [
  { rotulo: "75% a 100%", min: 75, max: 101, cor: "bg-emerald-500" },
  { rotulo: "50% a 74%", min: 50, max: 75, cor: "bg-[#5f2ebe]" },
  { rotulo: "25% a 49%", min: 25, max: 50, cor: "bg-amber-500" },
  { rotulo: "0% a 24%", min: 0, max: 25, cor: "bg-red-400" },
];

const SimuladoRankingPage = () => {
  const { simuladoId } = useParams<{ simuladoId: string }>();
  const navigate = useNavigate();
  const { config } = useSiteConfig();
  const { user } = useAuth();
  const { isAdmin } = usePermissions();
  const admin = isAdmin();

  const [simulado, setSimulado] = useState<SimuladoInfo | null>(null);
  const [linhas, setLinhas] = useState<LinhaBanco[]>([]);
  const [fotos, setFotos] = useState<Record<string, string | null>>({});
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!config.pages.showSimuladoRankingPage) navigate("/404");
  }, [config.pages.showSimuladoRankingPage, navigate]);

  useEffect(() => {
    if (!simuladoId) return;
    let ativo = true;
    const carregar = async () => {
      setCarregando(true);
      setErro(null);
      try {
        const { data, error } = await supabase
          .from("simulados")
          .select("id, titulo, questoes_ids, ranking_is_public")
          .eq("id", simuladoId)
          .maybeSingle();
        if (error) throw error;
        if (!ativo) return;
        setSimulado(data as SimuladoInfo | null);
        if (!data) return;

        const { data: ranking, error: rankingError } = await supabase.rpc("get_simulado_ranking", { p_simulado_id: simuladoId });
        if (rankingError) throw rankingError;
        if (!ativo) return;
        const lista = ((ranking || []) as LinhaBanco[]).slice().sort((a, b) => a.ranking_position - b.ranking_position);
        setLinhas(lista);

        // Fotos de perfil, quando a leitura de perfis é permitida; sem elas ficam as iniciais
        if (lista.length > 0) {
          const { data: perfis } = await supabase
            .from("profiles")
            .select("id, foto_perfil")
            .in(
              "id",
              lista.map((l) => l.user_id)
            );
          if (ativo && perfis) setFotos(Object.fromEntries(perfis.map((p) => [p.id, p.foto_perfil])));
        }
      } catch (e) {
        console.error("Erro ao carregar ranking do simulado:", e);
        if (ativo) setErro("Não foi possível carregar o ranking. Tente novamente mais tarde.");
      } finally {
        if (ativo) setCarregando(false);
      }
    };
    carregar();
    return () => {
      ativo = false;
    };
  }, [simuladoId]);

  const totalQuestoes = simulado?.questoes_ids?.length || 0;
  const publico = Boolean(simulado?.ranking_is_public);
  const podeVer = publico || admin;

  const itens = useMemo<ItemRanking[]>(
    () =>
      linhas.map((l) => {
        const taxa = Math.round(Number(l.aproveitamento) || 0);
        return {
          id: l.user_id,
          nome: l.nome || "Aluno",
          avatar: fotos[l.user_id] ?? null,
          pontos: Number(l.acertos) || 0,
          barra: taxa,
          detalhes: [
            { icone: X, valor: Number(l.erros) || 0, rotulo: Number(l.erros) === 1 ? "erro" : "erros", classe: "text-red-500" },
            { icone: Percent, valor: `${taxa}%`, rotulo: "de aproveitamento", classe: "text-emerald-600" },
          ],
        };
      }),
    [linhas, fotos]
  );

  const resumo = useMemo(() => {
    if (linhas.length === 0) return null;
    const taxas = linhas.map((l) => Number(l.aproveitamento) || 0);
    const media = Math.round(taxas.reduce((a, b) => a + b, 0) / taxas.length);
    const mediaAcertos = linhas.reduce((a, l) => a + (Number(l.acertos) || 0), 0) / linhas.length;
    const faixas = FAIXAS.map((f) => ({ ...f, qtd: taxas.filter((t) => t >= f.min && t < f.max).length }));
    return { media, mediaAcertos, melhor: Math.max(...taxas), faixas };
  }, [linhas]);

  const termo = normalizar(busca);
  const filtrados = useMemo(
    () => itens.map((item, i) => ({ item, posicao: i + 1 })).filter(({ item }) => !termo || normalizar(item.nome).includes(termo)),
    [itens, termo]
  );
  const mostrarPodio = !termo && itens.length >= 3;
  const lista = mostrarPodio ? filtrados.slice(3) : filtrados;

  const alternarPublico = async () => {
    if (!simulado) return;
    setSalvando(true);
    try {
      const { error } = await supabase
        .from("simulados")
        .update({ ranking_is_public: !publico, ranking_updated_at: new Date().toISOString() })
        .eq("id", simulado.id);
      if (error) throw error;
      setSimulado({ ...simulado, ranking_is_public: !publico });
      toast.success(!publico ? "Ranking publicado para os alunos." : "Ranking agora é privado.");
    } catch (e) {
      console.error("Erro ao atualizar visibilidade do ranking:", e);
      toast.error("Não foi possível atualizar a visibilidade do ranking.");
    } finally {
      setSalvando(false);
    }
  };

  if (!carregando && !simulado) {
    return (
      <PublicLayout>
        <div className="flex min-h-screen flex-col bg-[rgb(242,244,246)]">
          <Header />
          <main className={cn("flex-1 py-10", LARGURA)}>
            <EstadoVazio
              icone={Trophy}
              titulo="Simulado não encontrado"
              texto={erro || "O simulado deste ranking não existe ou foi removido."}
              acao={
                <Link to="/my-courses" className="rounded-xl bg-[#5f2ebe] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4f25a0]">
                  Ir para meus cursos
                </Link>
              }
            />
          </main>
          <Footer />
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="flex min-h-screen flex-col bg-[rgb(242,244,246)]">
        <Header />
        <main className="flex-1">
          {/* Topo */}
          <section className="relative overflow-hidden border-b border-slate-200/70 bg-white">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-[#5f2ebe]/15 to-[#ea2be2]/10 blur-2xl" />
            <div className={cn("relative grid gap-6 py-8 md:py-10 lg:grid-cols-[1fr_320px] lg:items-end", LARGURA)}>
              <div className="min-w-0">
                <Link to={`/simulado/${simuladoId}`} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#5f2ebe]">
                  <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao simulado
                </Link>
                <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#5f2ebe]">
                  <Trophy className="h-3.5 w-3.5" /> Ranking do simulado
                </p>
                {carregando ? (
                  <Skeleton className="mt-2 h-8 w-2/3" />
                ) : (
                  <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">{simulado?.titulo}</h1>
                )}
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
                    <ClipboardList className="h-3.5 w-3.5" /> {carregando ? "..." : `${totalQuestoes} ${totalQuestoes === 1 ? "questão" : "questões"}`}
                  </span>
                  {podeVer && !carregando && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
                      <Users className="h-3.5 w-3.5" /> {linhas.length} {linhas.length === 1 ? "participante" : "participantes"}
                    </span>
                  )}
                  {admin && !carregando && !publico && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 font-medium text-amber-700">
                      <Lock className="h-3.5 w-3.5" /> Privado: só administradores veem
                    </span>
                  )}
                </div>
                <p className="mt-3 max-w-xl text-sm text-slate-500">
                  Classificação pelo número de acertos de quem finalizou o simulado. Questões em branco contam como erro.
                </p>
              </div>
              {podeVer ? (
                <SuaPosicao
                  itens={itens}
                  carregando={carregando}
                  unidade={UNIDADE}
                  chamada={{ texto: "Faça o simulado e finalize para entrar na classificação.", rota: `/simulado/${simuladoId}`, botao: "Fazer o simulado" }}
                />
              ) : (
                <div />
              )}
            </div>
          </section>

          <div className={cn("grid gap-6 py-6 lg:grid-cols-[minmax(0,1fr)_320px]", LARGURA)}>
            <div className="min-w-0 space-y-5">
              {carregando ? (
                <ListaCarregando />
              ) : erro ? (
                <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  {erro}
                </div>
              ) : !podeVer ? (
                <EstadoVazio
                  icone={Lock}
                  titulo="O ranking ainda não foi liberado"
                  texto="A classificação aparece aqui assim que a equipe publicar o resultado. Enquanto isso, você pode fazer ou revisar o simulado."
                  acao={
                    <Link
                      to={`/simulado/${simuladoId}`}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#5f2ebe] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4f25a0]"
                    >
                      <PlayCircle className="h-4 w-4" /> Ir para o simulado
                    </Link>
                  }
                />
              ) : itens.length === 0 ? (
                <EstadoVazio
                  icone={Trophy}
                  titulo="Ninguém finalizou este simulado ainda"
                  texto="Seja o primeiro: faça o simulado e finalize para aparecer no topo."
                  acao={
                    <Link
                      to={`/simulado/${simuladoId}`}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#5f2ebe] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4f25a0]"
                    >
                      <PlayCircle className="h-4 w-4" /> Fazer o simulado
                    </Link>
                  }
                />
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="mr-auto text-sm text-slate-500">
                      <strong className="text-base font-bold tabular-nums text-slate-900">{linhas.length}</strong>{" "}
                      {linhas.length === 1 ? "aluno classificado" : "alunos classificados"}
                    </p>
                    <label className="relative w-full sm:w-64">
                      <span className="sr-only">Procurar pelo nome</span>
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        placeholder="Procurar pelo nome"
                        className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-[#5f2ebe] focus:ring-2 focus:ring-[#5f2ebe]/15"
                      />
                    </label>
                  </div>

                  {mostrarPodio && <Podio itens={itens.slice(0, 3)} meuId={user?.id} unidade={UNIDADE} />}

                  {filtrados.length === 0 ? (
                    <EstadoVazio icone={Search} titulo="Ninguém com esse nome" texto="Confira a grafia ou procure só pelo primeiro nome." />
                  ) : (
                    lista.length > 0 && (
                      <Painel className="overflow-hidden">
                        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                          <span>{termo ? `${filtrados.length} encontrado${filtrados.length === 1 ? "" : "s"}` : "Classificação"}</span>
                          <span>Acertos</span>
                        </div>
                        <ol className="divide-y divide-slate-100">
                          {lista.map(({ item, posicao }) => (
                            <LinhaRanking key={item.id} item={item} posicao={posicao} sou={item.id === user?.id} unidade={UNIDADE} />
                          ))}
                        </ol>
                      </Painel>
                    )
                  )}
                </>
              )}
            </div>

            {/* Resumo da turma */}
            <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
              {podeVer && resumo && !carregando && (
                <Painel className="p-4">
                  <span className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                    <BarChart3 className="h-4 w-4 text-[#5f2ebe]" /> Resumo da turma
                  </span>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl bg-slate-50 p-2.5">
                      <div className="text-lg font-bold tabular-nums text-slate-900">{resumo.media}%</div>
                      <div className="text-[11px] text-slate-500">média</div>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-2.5">
                      <div className="text-lg font-bold tabular-nums text-slate-900">
                        {resumo.mediaAcertos.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}
                      </div>
                      <div className="text-[11px] text-slate-500">acertos médios</div>
                    </div>
                    <div className="rounded-xl bg-emerald-50 p-2.5">
                      <div className="text-lg font-bold tabular-nums text-emerald-700">{Math.round(resumo.melhor)}%</div>
                      <div className="text-[11px] text-emerald-700/70">melhor nota</div>
                    </div>
                  </div>
                  <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Distribuição das notas</p>
                  <div className="space-y-2.5">
                    {resumo.faixas.map((f) => (
                      <div key={f.rotulo}>
                        <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                          <span>{f.rotulo}</span>
                          <span className="tabular-nums text-slate-500">
                            {f.qtd} {f.qtd === 1 ? "aluno" : "alunos"}
                          </span>
                        </div>
                        <BarraProgresso valor={(f.qtd / linhas.length) * 100} corClasse={f.cor} className="h-1.5" />
                      </div>
                    ))}
                  </div>
                </Painel>
              )}

              <Link
                to={`/simulado/${simuladoId}`}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#5f2ebe] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#4f25a0]"
              >
                <PlayCircle className="h-4 w-4" /> {user ? "Ir para o simulado" : "Ver o simulado"}
              </Link>

              {admin && simulado && (
                <label className="flex items-center justify-between gap-2 rounded-xl border border-dashed border-slate-300 bg-white/60 px-3 py-2.5 text-sm text-slate-600">
                  <span>
                    Ranking público
                    <span className="block text-xs text-slate-400">{salvando ? "Salvando..." : "Só administradores veem esta opção"}</span>
                  </span>
                  <Switch checked={publico} onCheckedChange={alternarPublico} disabled={salvando} />
                </label>
              )}
            </aside>
          </div>
        </main>
        <Footer />
      </div>
    </PublicLayout>
  );
};

export default SimuladoRankingPage;
