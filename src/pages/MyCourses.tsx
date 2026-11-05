import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { differenceInCalendarDays, formatDistanceToNow, parseISO, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock,
  Compass,
  GraduationCap,
  Layers,
  LogIn,
  PlayCircle,
  Plus,
  Search,
  SearchX,
  Star,
  X,
} from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import AdBanner from "@/components/ads/AdBanner";
import { BarraProgresso, EstadoVazio, Painel, Segmentos, normalizar } from "@/components/course/ui";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { generateFriendlyUrl } from "@/utils/slug-utils";
import { aulasDaDisciplinaNoCurso, lerAulasPorDisciplina } from "@/utils/aulasDoCurso";
import { cn } from "@/lib/utils";

const LARGURA = "mx-auto w-full max-w-[1400px] px-[10px] md:px-[32px]";
const LOTE = 150;

type Tipo = "cursos" | "disciplinas";
type Ordem = "recentes" | "az" | "progresso";
type ColunaFavoritos = "cursos_favoritos" | "disciplinas_favoritos";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Linha = Record<string, any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

interface ItemMeu {
  id: string;
  tipo: Tipo;
  titulo: string;
  subtitulo: string;
  url: string;
  disciplinas: number;
  aulas: number;
  totalTopicos: number;
  concluidos: number;
  /** Última vez que o progresso foi gravado */
  estudadoEm: Date | null;
  prova: Date | null;
  busca: string;
}

const plural = (n: number, um: string, varios: string) => `${n.toLocaleString("pt-BR")} ${n === 1 ? um : varios}`;
const pct = (i: ItemMeu) => (i.totalTopicos ? Math.round((i.concluidos / i.totalTopicos) * 100) : 0);

const lerData = (valor?: string | null) => {
  if (!valor) return null;
  const d = parseISO(String(valor));
  return Number.isNaN(d.getTime()) ? null : d;
};

const haQuanto = (d: Date) => formatDistanceToNow(d, { locale: ptBR, addSuffix: true });

/** Busca linhas por id em lotes (evita URL longa demais e o limite de 1.000 linhas) */
async function buscarPorIds(tabela: string, ids: string[], colunas = "*", campo = "id") {
  const linhas: Linha[] = [];
  const unicos = Array.from(new Set(ids.filter(Boolean)));
  for (let i = 0; i < unicos.length; i += LOTE) {
    const { data, error } = await db.from(tabela).select(colunas).in(campo, unicos.slice(i, i + LOTE));
    if (error) throw error;
    linhas.push(...((data || []) as Linha[]));
  }
  return linhas;
}

const porId = (linhas: Linha[]) => new Map(linhas.map((l) => [l.id as string, l]));

/** Tópicos concluídos em cada aula: subjects_data.completed_sections { aulaId: topicoIds[] } */
const lerConcluidos = (sd: unknown): Record<string, string[]> => {
  const cs = sd && typeof sd === "object" && !Array.isArray(sd) ? (sd as Linha).completed_sections : null;
  const limpo: Record<string, string[]> = {};
  if (cs && typeof cs === "object") {
    Object.entries(cs).forEach(([aula, ids]) => {
      if (Array.isArray(ids)) limpo[aula] = ids.filter((x) => typeof x === "string");
    });
  }
  return limpo;
};

/** Progresso do aluno nos itens favoritados (em lotes); sem progresso não impede a página de abrir */
async function carregarProgresso(userId: string, ids: string[]) {
  const linhas: Linha[] = [];
  try {
    for (let i = 0; i < ids.length; i += LOTE) {
      const { data, error } = await db
        .from("user_course_progress")
        .select("course_id, subjects_data, updated_at, exam_date")
        .eq("user_id", userId)
        .in("course_id", ids.slice(i, i + LOTE));
      if (error) throw error;
      linhas.push(...((data || []) as Linha[]));
    }
  } catch (e) {
    console.error("Erro ao carregar o progresso:", e);
  }
  return linhas;
}

async function carregarMeus(userId: string): Promise<ItemMeu[]> {
  const { data: perfil, error } = await supabase
    .from("profiles")
    .select("cursos_favoritos, disciplinas_favoritos")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  const idsCursos: string[] = perfil?.cursos_favoritos || [];
  const idsDisciplinas: string[] = perfil?.disciplinas_favoritos || [];
  if (!idsCursos.length && !idsDisciplinas.length) return [];

  const [cursos, disciplinasFav, progresso] = await Promise.all([
    buscarPorIds("cursos", idsCursos),
    buscarPorIds("disciplinas", idsDisciplinas),
    carregarProgresso(userId, [...idsCursos, ...idsDisciplinas]),
  ]);

  // Disciplinas usadas pelos cursos e as principais das disciplinas unificadas
  const disciplinasExtras = await buscarPorIds("disciplinas", [
    ...cursos.flatMap((c) => c.disciplinas_ids || []),
    ...disciplinasFav.map((d) => d.unificada_em).filter(Boolean),
  ]);
  const mapaDisciplinas = porId([...disciplinasFav, ...disciplinasExtras]);

  const aulasDoCurso = (c: Linha) => {
    const selecao = lerAulasPorDisciplina(c.aulas_por_disciplina);
    const ids: string[] = c.disciplinas_ids || [];
    return ids
      .map((id) => mapaDisciplinas.get(id))
      .filter((d): d is Linha => !!d)
      .flatMap((d) => aulasDaDisciplinaNoCurso(d.aulas_ids, selecao, d.id));
  };
  const aulasDaDisciplina = (d: Linha): string[] => {
    const principal = d.unificada_em ? mapaDisciplinas.get(d.unificada_em) : null;
    return ((principal || d).aulas_ids || []).filter(Boolean);
  };

  const aulas = porId(
    await buscarPorIds("aulas", [...cursos.flatMap(aulasDoCurso), ...disciplinasFav.flatMap(aulasDaDisciplina)], "id, topicos_ids")
  );
  const progressoPorId = new Map<string, Linha>(progresso.map((p: Linha) => [p.course_id, p]));

  const montar = (tipo: Tipo, linha: Linha, idsAulas: string[], subtitulo: string, disciplinas: number): ItemMeu => {
    const p = progressoPorId.get(linha.id);
    const feitos = lerConcluidos(p?.subjects_data);
    let totalTopicos = 0;
    let concluidos = 0;
    idsAulas.forEach((id) => {
      const topicos: string[] = aulas.get(id)?.topicos_ids || [];
      totalTopicos += topicos.length;
      const set = new Set(feitos[id] || []);
      concluidos += topicos.filter((t) => set.has(t)).length;
    });
    return {
      id: linha.id,
      tipo,
      titulo: linha.titulo || "Sem título",
      subtitulo,
      url: `/course/${generateFriendlyUrl(linha.titulo || "", linha.id)}`,
      disciplinas,
      aulas: idsAulas.length,
      totalTopicos,
      concluidos,
      estudadoEm: lerData(p?.updated_at),
      prova: p?.exam_date ? startOfDay(parseISO(String(p.exam_date).slice(0, 10))) : null,
      busca: normalizar(`${linha.titulo || ""} ${subtitulo}`),
    };
  };

  const descricao = (v: unknown) => (typeof v === "string" && v.trim() && v.trim() !== "Sem descrição" ? v.trim() : "");

  // Mantém a ordem em que o aluno favoritou
  const mapaCursos = porId(cursos);
  const itensCursos = idsCursos
    .map((id) => mapaCursos.get(id))
    .filter((c): c is Linha => !!c)
    .map((c) => montar("cursos", c, aulasDoCurso(c), descricao(c.descricao), (c.disciplinas_ids || []).length));
  const itensDisciplinas = idsDisciplinas
    .map((id) => mapaDisciplinas.get(id))
    .filter((d): d is Linha => !!d)
    // descricao da disciplina guarda a relevância (número): usa a banca como subtítulo
    .map((d) => montar("disciplinas", d, aulasDaDisciplina(d), descricao(d.banca), 1));

  return [...itensCursos, ...itensDisciplinas];
}

/** Lê a coluna de favoritos de novo antes de gravar, para não apagar o que outra aba salvou */
async function gravarFavorito(userId: string, coluna: ColunaFavoritos, id: string, favoritar: boolean) {
  const { data, error } = await db.from("profiles").select(coluna).eq("id", userId).single();
  if (error) throw error;
  const atuais: string[] = data?.[coluna] || [];
  const novos = favoritar ? (atuais.includes(id) ? atuais : [...atuais, id]) : atuais.filter((x) => x !== id);
  const { error: erroUpdate } = await db.from("profiles").update({ [coluna]: novos }).eq("id", userId);
  if (erroUpdate) throw erroUpdate;
}

const MyCourses = () => {
  const { user, loading: carregandoLogin } = useAuth();
  const [params, setParams] = useSearchParams();
  const tipo: Tipo = params.get("tipo") === "disciplinas" ? "disciplinas" : "cursos";
  const ordem: Ordem = params.get("ordem") === "az" ? "az" : params.get("ordem") === "progresso" ? "progresso" : "recentes";

  const [busca, setBusca] = useState("");
  const [itens, setItens] = useState<ItemMeu[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);
  const [tentativa, setTentativa] = useState(0);

  const mudarParam = useCallback(
    (chave: string, valor: string) => {
      const p = new URLSearchParams(params);
      if (valor) p.set(chave, valor);
      else p.delete(chave);
      setParams(p, { replace: true });
    },
    [params, setParams]
  );

  useEffect(() => {
    if (carregandoLogin) return;
    if (!user) {
      setCarregando(false);
      return;
    }
    let ativo = true;
    (async () => {
      setCarregando(true);
      setErro(false);
      try {
        const lista = await carregarMeus(user.id);
        if (ativo) setItens(lista);
      } catch (e) {
        console.error("Erro ao carregar seus cursos:", e);
        if (ativo) setErro(true);
      } finally {
        if (ativo) setCarregando(false);
      }
    })();
    return () => {
      ativo = false;
    };
  }, [user, carregandoLogin, tentativa]);

  const contagem = useMemo(
    () => ({
      cursos: itens.filter((i) => i.tipo === "cursos").length,
      disciplinas: itens.filter((i) => i.tipo === "disciplinas").length,
      concluidos: itens.reduce((s, i) => s + i.concluidos, 0),
    }),
    [itens]
  );

  // O que o aluno estudou por último (só conta quem já tem algum tópico concluído)
  const continuar = useMemo(
    () =>
      itens
        .filter((i) => i.estudadoEm && i.concluidos > 0 && i.concluidos < i.totalTopicos)
        .sort((a, b) => b.estudadoEm!.getTime() - a.estudadoEm!.getTime())[0] || null,
    [itens]
  );

  const termo = normalizar(busca);
  const visiveis = useMemo(() => {
    const palavras = termo.split(/\s+/).filter(Boolean);
    const lista = itens.filter((i) => i.tipo === tipo && palavras.every((p) => i.busca.includes(p)));
    return lista.sort((a, b) => {
      if (ordem === "az") return a.titulo.localeCompare(b.titulo, "pt-BR");
      if (ordem === "progresso") return pct(b) - pct(a) || a.titulo.localeCompare(b.titulo, "pt-BR");
      return (b.estudadoEm?.getTime() || 0) - (a.estudadoEm?.getTime() || 0) || a.titulo.localeCompare(b.titulo, "pt-BR");
    });
  }, [itens, tipo, termo, ordem]);

  const remover = async (item: ItemMeu) => {
    if (!user) return;
    const coluna: ColunaFavoritos = item.tipo === "cursos" ? "cursos_favoritos" : "disciplinas_favoritos";
    const posicao = itens.findIndex((i) => i.id === item.id && i.tipo === item.tipo);
    const devolver = () =>
      setItens((atual) => {
        if (atual.some((i) => i.id === item.id && i.tipo === item.tipo)) return atual;
        const novo = [...atual];
        novo.splice(Math.min(posicao, novo.length), 0, item);
        return novo;
      });
    setItens((atual) => atual.filter((i) => !(i.id === item.id && i.tipo === item.tipo)));
    try {
      await gravarFavorito(user.id, coluna, item.id, false);
      toast.success(item.tipo === "cursos" ? "Curso removido dos seus cursos" : "Disciplina removida dos seus cursos", {
        action: {
          label: "Desfazer",
          onClick: async () => {
            devolver();
            try {
              await gravarFavorito(user.id, coluna, item.id, true);
            } catch (e) {
              console.error("Erro ao desfazer:", e);
              toast.error("Não foi possível desfazer.");
            }
          },
        },
      });
    } catch (e) {
      console.error("Erro ao remover favorito:", e);
      devolver();
      toast.error("Não foi possível remover. Tente de novo.");
    }
  };

  const semNada = !carregando && !erro && itens.length === 0;
  const linkExplorar = `/explore${tipo === "disciplinas" ? "?tipo=disciplinas" : ""}`;

  return (
    <PublicLayout>
      <div className="flex min-h-screen flex-col bg-[rgb(242,244,246)]">
        <Header />
        <main className="flex-1">
          {/* Topo */}
          <section className="relative overflow-hidden border-b border-slate-200/70 bg-white">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-[#5f2ebe]/15 to-[#ea2be2]/10 blur-2xl" />
            <div className={cn(LARGURA, "relative grid gap-6 py-8 md:py-10 lg:grid-cols-[1fr_380px] lg:items-end")}>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#5f2ebe]">Meus cursos</p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                  {user?.nome ? `Bons estudos, ${user.nome.split(" ")[0]}` : "Seus estudos em um só lugar"}
                </h1>
                <p className="mt-1 max-w-xl text-sm text-slate-500">
                  Os cursos e as disciplinas que você favoritou, com o quanto já estudou de cada um.
                </p>
                {user && (
                  <Link
                    to={linkExplorar}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#5f2ebe] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#4f25a0]"
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar {tipo === "cursos" ? "curso" : "disciplina"}
                  </Link>
                )}
              </div>

              {user && (
                <div className="grid grid-cols-3 gap-2 rounded-2xl border border-slate-200/80 bg-white/80 p-3 shadow-sm backdrop-blur lg:p-4">
                  {[
                    { rotulo: "cursos", valor: contagem.cursos, icone: GraduationCap },
                    { rotulo: "disciplinas", valor: contagem.disciplinas, icone: BookOpen },
                    { rotulo: "tópicos concluídos", valor: contagem.concluidos, icone: CheckCircle2 },
                  ].map((m) => (
                    <div key={m.rotulo} className="min-w-0">
                      <m.icone className="h-4 w-4 text-[#5f2ebe]" />
                      <div className="mt-1.5 text-xl font-bold tabular-nums text-slate-900 lg:text-2xl">
                        {carregando ? <Skeleton className="h-7 w-10" /> : m.valor.toLocaleString("pt-BR")}
                      </div>
                      <div className="text-xs text-slate-500">{m.rotulo}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <div className={cn(LARGURA, "space-y-5 py-6")}>
            {!carregandoLogin && !user ? (
              <EstadoVazio
                icone={LogIn}
                titulo="Entre para ver seus cursos"
                texto="Favorite cursos e disciplinas para acompanhar seu progresso e voltar a eles com um toque."
                acao={
                  <div className="flex flex-wrap justify-center gap-2">
                    <Link to="/login" className="rounded-xl bg-[#5f2ebe] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4f25a0]">
                      Entrar
                    </Link>
                    <Link
                      to="/explore"
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Explorar cursos
                    </Link>
                  </div>
                }
              />
            ) : erro ? (
              <EstadoVazio
                icone={GraduationCap}
                titulo="Não foi possível carregar seus cursos"
                texto="Verifique sua conexão e tente de novo."
                acao={
                  <button
                    type="button"
                    onClick={() => setTentativa((t) => t + 1)}
                    className="rounded-xl bg-[#5f2ebe] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4f25a0]"
                  >
                    Tentar de novo
                  </button>
                }
              />
            ) : semNada ? (
              <EstadoVazio
                icone={Star}
                titulo="Você ainda não tem cursos aqui"
                texto="Encontre o curso do seu concurso ou uma disciplina avulsa e toque na estrela para guardá-lo nesta página."
                acao={
                  <Link
                    to="/explore"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#5f2ebe] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4f25a0]"
                  >
                    <Compass className="h-4 w-4" />
                    Explorar cursos
                  </Link>
                }
              />
            ) : (
              <>
                {/* Continue de onde parou */}
                {!carregando && continuar && <CartaoContinuar item={continuar} />}

                <AdBanner position={tipo === "cursos" ? "my_courses_concursos_top" : "my_courses_disciplinas_top"} className="rounded-lg" />

                {/* Barra de ferramentas */}
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <Segmentos<Tipo>
                    valor={tipo}
                    onChange={(v) => mudarParam("tipo", v === "cursos" ? "" : v)}
                    opcoes={[
                      {
                        valor: "cursos",
                        rotulo: (
                          <>
                            <GraduationCap className="h-4 w-4" /> Cursos
                          </>
                        ),
                        contagem: carregando ? undefined : contagem.cursos,
                      },
                      {
                        valor: "disciplinas",
                        rotulo: (
                          <>
                            <BookOpen className="h-4 w-4" /> Disciplinas
                          </>
                        ),
                        contagem: carregando ? undefined : contagem.disciplinas,
                      },
                    ]}
                    className="bg-slate-200/60"
                  />
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="relative sm:w-64">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        placeholder={tipo === "cursos" ? "Filtrar cursos" : "Filtrar disciplinas"}
                        aria-label="Filtrar"
                        className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-8 text-sm text-slate-800 outline-none focus:border-[#5f2ebe] focus:ring-2 focus:ring-[#5f2ebe]/10"
                      />
                      {busca && (
                        <button
                          type="button"
                          aria-label="Limpar filtro"
                          onClick={() => setBusca("")}
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <select
                      value={ordem}
                      onChange={(e) => mudarParam("ordem", e.target.value === "recentes" ? "" : e.target.value)}
                      aria-label="Ordenar"
                      className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-700 outline-none focus:border-[#5f2ebe]"
                    >
                      <option value="recentes">Estudados recentemente</option>
                      <option value="progresso">Mais avançados</option>
                      <option value="az">Nome (A–Z)</option>
                    </select>
                  </div>
                </div>

                {carregando || carregandoLogin ? (
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Painel key={i} className="space-y-3 p-4">
                        <div className="flex gap-3">
                          <Skeleton className="h-11 w-11 rounded-xl" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-5 w-4/5" />
                            <Skeleton className="h-4 w-2/5" />
                          </div>
                        </div>
                        <Skeleton className="h-2 w-full" />
                        <Skeleton className="h-8 w-full" />
                      </Painel>
                    ))}
                  </div>
                ) : visiveis.length === 0 ? (
                  <EstadoVazio
                    icone={termo ? SearchX : tipo === "cursos" ? GraduationCap : BookOpen}
                    titulo={
                      termo
                        ? `Nada encontrado para "${busca.trim()}"`
                        : tipo === "cursos"
                          ? "Nenhum curso favoritado"
                          : "Nenhuma disciplina favoritada"
                    }
                    texto={
                      termo
                        ? "Tente outra palavra ou veja a outra aba."
                        : tipo === "cursos"
                          ? "Favorite o curso do seu concurso para acompanhar o progresso aqui."
                          : "Favorite uma disciplina avulsa para reforçar uma matéria."
                    }
                    acao={
                      termo ? (
                        <button
                          type="button"
                          onClick={() => setBusca("")}
                          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Limpar filtro
                        </button>
                      ) : (
                        <Link to={linkExplorar} className="rounded-xl bg-[#5f2ebe] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4f25a0]">
                          Explorar {tipo}
                        </Link>
                      )
                    }
                  />
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {visiveis.map((item) => (
                      <CartaoMeu key={`${item.tipo}-${item.id}`} item={item} onRemover={() => remover(item)} />
                    ))}
                    {!termo && (
                      <Link
                        to={linkExplorar}
                        className="flex min-h-[180px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 p-4 text-center text-sm font-semibold text-slate-500 transition hover:border-[#5f2ebe]/50 hover:bg-white hover:text-[#5f2ebe]"
                      >
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                          <Plus className="h-5 w-5" />
                        </span>
                        Adicionar {tipo === "cursos" ? "outro curso" : "outra disciplina"}
                      </Link>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </PublicLayout>
  );
};

const textoProva = (prova: Date | null) => {
  if (!prova) return null;
  const dias = differenceInCalendarDays(prova, startOfDay(new Date()));
  if (dias < 0) return null;
  return dias === 0 ? "Prova hoje" : dias === 1 ? "Prova amanhã" : `Prova em ${dias} dias`;
};

const CartaoContinuar: React.FC<{ item: ItemMeu }> = ({ item }) => {
  const progresso = pct(item);
  const prova = textoProva(item.prova);
  return (
    <section aria-label="Continue de onde parou">
      <Link
        to={item.url}
        className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl bg-gradient-to-br from-[#5f2ebe] to-[#7b3fe0] p-5 text-white shadow-md transition hover:shadow-lg md:flex-row md:items-center md:p-6"
      >
        <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-[#ea2be2]/30 blur-2xl" />
        <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
          <PlayCircle className="h-6 w-6" />
        </span>
        <div className="relative min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Continue de onde parou</p>
          <h2 className="mt-0.5 line-clamp-2 text-lg font-bold leading-snug md:text-xl">{item.titulo}</h2>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/20 md:max-w-md">
              <div className="h-full rounded-full bg-white" style={{ width: `${Math.max(3, progresso)}%` }} />
            </div>
            <span className="text-sm font-semibold tabular-nums">{progresso}%</span>
          </div>
          <p className="mt-1.5 text-xs text-white/75">
            {plural(item.concluidos, "tópico concluído", "tópicos concluídos")} de {item.totalTopicos.toLocaleString("pt-BR")}
            {item.estudadoEm ? ` · estudado ${haQuanto(item.estudadoEm)}` : ""}
            {prova ? ` · ${prova}` : ""}
          </p>
        </div>
        <span className="relative inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#5f2ebe] shadow-sm md:self-center">
          Continuar estudando
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </Link>
    </section>
  );
};

const CartaoMeu: React.FC<{ item: ItemMeu; onRemover: () => void }> = ({ item, onRemover }) => {
  const Icone = item.tipo === "cursos" ? GraduationCap : BookOpen;
  const progresso = pct(item);
  const comecou = item.concluidos > 0;
  const terminou = item.totalTopicos > 0 && item.concluidos >= item.totalTopicos;
  const prova = textoProva(item.prova);

  return (
    <Painel className="group relative flex flex-col p-4 transition hover:-translate-y-0.5 hover:border-[#5f2ebe]/30 hover:shadow-md">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            item.tipo === "cursos" ? "bg-[#5f2ebe]/10 text-[#5f2ebe]" : "bg-[#ea2be2]/10 text-[#c41fbd]"
          )}
        >
          <Icone className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1 pr-8">
          <Link to={item.url} className="after:absolute after:inset-0 after:rounded-2xl focus:outline-none">
            <h3 className="line-clamp-2 font-semibold leading-snug text-slate-900 group-hover:text-[#5f2ebe]">{item.titulo}</h3>
          </Link>
          {item.subtitulo && <p className="mt-0.5 line-clamp-1 text-sm text-slate-500">{item.subtitulo}</p>}
        </div>
      </div>

      <button
        type="button"
        onClick={onRemover}
        aria-label="Remover dos meus cursos"
        title="Remover dos meus cursos"
        className="absolute right-3 top-3 z-10 rounded-lg p-1.5 text-amber-500 transition-colors hover:bg-amber-50"
      >
        <Star className="h-5 w-5 fill-current" />
      </button>

      <div className="mt-4">
        <div className="flex items-baseline justify-between gap-2 text-xs">
          <span className="text-slate-500">
            {item.totalTopicos
              ? `${item.concluidos.toLocaleString("pt-BR")} de ${plural(item.totalTopicos, "tópico", "tópicos")}`
              : "Sem tópicos ainda"}
          </span>
          <span className={cn("font-semibold tabular-nums", terminou ? "text-emerald-600" : "text-slate-700")}>{progresso}%</span>
        </div>
        <BarraProgresso valor={progresso} className="mt-1.5" corClasse={terminou ? "bg-emerald-500" : undefined} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
        {item.tipo === "cursos" && (
          <span className="inline-flex items-center gap-1">
            <Layers className="h-3.5 w-3.5 text-slate-400" />
            {plural(item.disciplinas, "disciplina", "disciplinas")}
          </span>
        )}
        <span className="inline-flex items-center gap-1">
          <PlayCircle className="h-3.5 w-3.5 text-slate-400" />
          {plural(item.aulas, "aula", "aulas")}
        </span>
        {prova && (
          <span className="inline-flex items-center gap-1 font-medium text-[#5f2ebe]">
            <CalendarDays className="h-3.5 w-3.5" />
            {prova}
          </span>
        )}
      </div>

      <div className="min-h-3 flex-1" aria-hidden />
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
        <span className="inline-flex min-w-0 items-center gap-1 truncate text-xs text-slate-400">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          {item.estudadoEm && comecou ? `Estudado ${haQuanto(item.estudadoEm)}` : "Ainda não começou"}
        </span>
        <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-[#5f2ebe]">
          {terminou ? "Revisar" : comecou ? "Continuar" : "Começar"}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Painel>
  );
};

export default MyCourses;
