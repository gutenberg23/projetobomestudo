import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import {
  BookOpen,
  ChevronRight,
  Clock,
  Copy,
  Download,
  ExternalLink,
  FileQuestion,
  FileText,
  Highlighter,
  ListTree,
  Map as MapIcon,
  MessageSquareText,
  MessageSquareWarning,
  Pencil,
  Trash2,
  Video,
} from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BlogContentWithQuestions } from "@/components/blog/BlogContentWithQuestions";
import QuestionResults from "@/components/questions/QuestionResults";
import { SugerirCorrecaoDialog } from "@/components/teorias/SugerirCorrecaoDialog";
import { CreditosContribuidores } from "@/components/teorias/CreditosContribuidores";
import { PainelMarcacoes } from "@/components/teorias/PainelMarcacoes";
import { registrarLeitura } from "@/components/teorias/recentes";
import {
  CORES_MARCACAO,
  type Marcacao,
  atualizarGrifo,
  gravarMarcacoes,
  grifarIntervalo,
  grifoExiste,
  lerMarcacoes,
  localizarTexto,
  normalizarEspacos,
  removerGrifo,
} from "@/components/teorias/marcacoes";
import { usePermissions } from "@/hooks/usePermissions";
import { supabase } from "@/integrations/supabase/client";
import { isUuid, teoriaPath } from "@/utils/teoriaUrl";
import { youtubeEmbed } from "@/utils/youtube";
import { cn } from "@/lib/utils";
import "@/styles/teoria.css";

/** Busca uma teoria publicada pelo slug, por um slug antigo ou pelo id. */
const buscarTeoriaPublicada = async (param: string) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const porCampo = async (campo: "id" | "slug", valor: string) => {
    const { data, error } = await db.from("teorias").select("*").eq(campo, valor).eq("status", "published").maybeSingle();
    if (error) throw error;
    return data;
  };

  if (isUuid(param)) return porCampo("id", param);

  const atual = await porCampo("slug", param);
  if (atual) return atual;

  const { data: antigo } = await db.from("teorias_slugs_antigos").select("teoria_id").eq("slug", param).maybeSingle();
  return antigo?.teoria_id ? porCampo("id", antigo.teoria_id) : null;
};

interface Teoria {
  id: string;
  slug?: string;
  titulo: string;
  disciplina_id: string;
  assunto_id: string;
  topicos_ids: string[];
  conteudo: string;
  status: "draft" | "published";
  professor_id?: string;
  created_at: string;
  updated_at: string;
  questoes_filtros?: { disciplinas?: string[]; assuntos?: string[]; bancas?: string[]; topicos?: string[] };
  questoes_link?: string;
  videoaulas?: string[];
  mapas_mentais?: string[];
}

type Aba = "aula" | "questoes" | "video" | "mapa";
type Fonte = "p" | "m" | "g";

interface Secao {
  id: string;
  texto: string;
  nivel: 2 | 3;
}

type Barra =
  | { tipo: "selecao"; x: number; topo: number; base: number; texto: string }
  | { tipo: "grifo"; x: number; topo: number; base: number; id: string };

const POR_PAGINA_QUESTOES = 10;
const CHAVE_FONTE = "bomestudo:teoria-fonte";

const temFiltros = (f?: Teoria["questoes_filtros"]) =>
  !!f && Object.values(f).some((v) => Array.isArray(v) && v.length > 0);

const slugSecao = (texto: string) =>
  texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

const iniciais = (nome: string) =>
  nome
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

const minutosDeLeitura = (html: string) => {
  const texto = html.replace(/\[question:[^\]]+\]/g, " ").replace(/<[^>]+>/g, " ");
  const palavras = texto.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(palavras / 200));
};

const lerFonte = (): Fonte => {
  try {
    const v = localStorage.getItem(CHAVE_FONTE);
    return v === "p" || v === "g" ? v : "m";
  } catch {
    return "m";
  }
};

/** Barra fina no topo que mostra quanto da aula já foi lido. */
const BarraProgresso = ({ alvo }: { alvo: React.RefObject<HTMLElement> }) => {
  const [progresso, setProgresso] = useState(0);
  useEffect(() => {
    let quadro = 0;
    const medir = () => {
      quadro = 0;
      const el = alvo.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight * 0.6;
      setProgresso(total <= 0 ? 1 : Math.min(1, Math.max(0, -r.top / total)));
    };
    const agendar = () => {
      if (!quadro) quadro = requestAnimationFrame(medir);
    };
    medir();
    window.addEventListener("scroll", agendar, { passive: true });
    window.addEventListener("resize", agendar);
    return () => {
      window.removeEventListener("scroll", agendar);
      window.removeEventListener("resize", agendar);
      cancelAnimationFrame(quadro);
    };
  }, [alvo]);
  return (
    <div className="teoria-sem-impressao fixed inset-x-0 top-0 z-40 h-1" aria-hidden>
      <div className="h-full bg-gradient-to-r from-[#5f2ebe] to-[#ea2be2]" style={{ width: `${progresso * 100}%` }} />
    </div>
  );
};

/** Estrutura comum às telas de carregando, não encontrada e da teoria. */
const Moldura = ({ children }: { children: React.ReactNode }) => (
  <PublicLayout>
    <div className="flex min-h-screen flex-col bg-[#f6f7fb]">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  </PublicLayout>
);

const Vazio = ({ icone: Icone, titulo, texto }: { icone: typeof Video; titulo: string; texto: string }) => (
  <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
    <span className="mb-4 rounded-full bg-slate-100 p-4 text-slate-400">
      <Icone className="h-7 w-7" />
    </span>
    <h3 className="text-lg font-semibold text-slate-900">{titulo}</h3>
    <p className="mt-1 max-w-sm text-sm text-slate-500">{texto}</p>
  </div>
);

const TeoriaPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { isAdmin } = usePermissions();

  const [post, setPost] = useState<Teoria | null>(null);
  const [professor, setProfessor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Questões
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [questoes, setQuestoes] = useState<any[]>([]);
  const [paginaQuestoes, setPaginaQuestoes] = useState(1);
  const [totalPaginasQuestoes, setTotalPaginasQuestoes] = useState(1);
  const [totalQuestoes, setTotalQuestoes] = useState<number | null>(null);
  const [carregandoQuestoes, setCarregandoQuestoes] = useState(false);
  const [opcoesRiscadas, setOpcoesRiscadas] = useState<Record<string, string[]>>({});

  // Leitura
  const conteudoRef = useRef<HTMLDivElement>(null);
  const [secoes, setSecoes] = useState<Secao[]>([]);
  const [secaoAtiva, setSecaoAtiva] = useState<string | null>(null);
  const [fonte, setFonte] = useState<Fonte>(lerFonte);
  const [sumarioAberto, setSumarioAberto] = useState(false);

  // Grifos
  const [marcacoes, setMarcacoes] = useState<Marcacao[]>([]);
  const [naoEncontradas, setNaoEncontradas] = useState<Set<string>>(new Set());
  const [barra, setBarra] = useState<Barra | null>(null);
  const [painelAberto, setPainelAberto] = useState(false);
  const [editandoNota, setEditandoNota] = useState<string | null>(null);

  // Correção
  const [correcaoAberta, setCorrecaoAberta] = useState(false);
  const [trechoCorrecao, setTrechoCorrecao] = useState("");

  // ----- Abas -----
  const abas = useMemo(() => {
    if (!post) return [];
    const lista: { id: Aba; label: string; curto: string; icone: typeof Video; n?: number }[] = [
      { id: "aula", label: "Aula em texto", curto: "Aula", icone: FileText },
    ];
    if (temFiltros(post.questoes_filtros))
      lista.push({ id: "questoes", label: "Questões", curto: "Questões", icone: FileQuestion, n: totalQuestoes ?? undefined });
    if (post.videoaulas?.length)
      lista.push({ id: "video", label: "Videoaulas", curto: "Vídeos", icone: Video, n: post.videoaulas.length });
    if (post.mapas_mentais?.length)
      lista.push({ id: "mapa", label: "Mapas mentais", curto: "Mapas", icone: MapIcon, n: post.mapas_mentais.length });
    return lista;
  }, [post, totalQuestoes]);

  const abaPedida = params.get("aba") as Aba | null;
  const aba: Aba = abas.some((a) => a.id === abaPedida) ? (abaPedida as Aba) : "aula";
  const irParaAba = (nova: Aba) => {
    setParams(
      (atual) => {
        const p = new URLSearchParams(atual);
        if (nova === "aula") p.delete("aba");
        else p.set("aba", nova);
        return p;
      },
      { replace: true }
    );
    setBarra(null);
    window.scrollTo({ top: Math.min(window.scrollY, Math.max(0, (document.getElementById("teoria-abas")?.offsetTop ?? 0) - 64)), behavior: "smooth" });
  };

  // ----- Carregamento -----
  useEffect(() => {
    const carregar = async () => {
      if (!slug) {
        navigate("/teorias");
        return;
      }
      // Já carregada (acabamos de trocar o id pelo slug na URL)
      if (post && post.slug === slug) return;

      try {
        setLoading(true);
        const teoria = await buscarTeoriaPublicada(slug);
        if (!teoria) {
          setPost(null);
          return;
        }
        // Link antigo (id ou slug anterior): troca a URL pelo slug atual
        if (teoria.slug && teoria.slug !== slug) {
          navigate(`${teoriaPath(teoria)}${window.location.search}`, { replace: true });
        }
        setPost(teoria);
        setMarcacoes(lerMarcacoes(teoria.id));
        registrarLeitura(teoria.id);

        if (teoria.professor_id) {
          const { data } = await supabase.from("professores").select("nome_completo").eq("id", teoria.professor_id).maybeSingle();
          setProfessor(data?.nome_completo || null);
        }
      } catch (error) {
        console.error("Erro ao carregar teoria:", error);
        toast.error("Erro ao carregar a teoria");
        setPost(null);
      } finally {
        setLoading(false);
      }
    };
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, navigate]);

  // Título da aba do navegador
  useEffect(() => {
    if (!post) return;
    const anterior = document.title;
    document.title = `${post.titulo} | BomEstudo`;
    return () => {
      document.title = anterior;
    };
  }, [post]);

  // Questões: só quando a aba é aberta
  useEffect(() => {
    if (!post || aba !== "questoes" || !temFiltros(post.questoes_filtros)) return;
    let ativo = true;
    const f = post.questoes_filtros!;
    setCarregandoQuestoes(true);
    let query = supabase.from("questoes").select("*", { count: "exact" }).order("created_at", { ascending: false });
    if (f.disciplinas?.length) query = query.in("discipline", f.disciplinas);
    if (f.assuntos?.length) query = query.overlaps("assuntos", f.assuntos);
    if (f.bancas?.length) query = query.in("institution", f.bancas);
    if (f.topicos?.length) query = query.overlaps("topicos", f.topicos);
    const de = (paginaQuestoes - 1) * POR_PAGINA_QUESTOES;
    query
      .range(de, de + POR_PAGINA_QUESTOES - 1)
      .then(({ data, error, count }) => {
        if (!ativo) return;
        if (error) {
          console.error("Erro ao carregar questões:", error);
          toast.error("Erro ao carregar as questões");
          return;
        }
        setQuestoes(data || []);
        setTotalQuestoes(count ?? null);
        setTotalPaginasQuestoes(count ? Math.max(1, Math.ceil(count / POR_PAGINA_QUESTOES)) : 1);
      })
      .then(() => ativo && setCarregandoQuestoes(false));
    return () => {
      ativo = false;
    };
  }, [post, aba, paginaQuestoes]);

  const riscarOpcao = (questaoId: string, opcaoId: string, e: React.MouseEvent) => {
    e.preventDefault();
    setOpcoesRiscadas((atual) => {
      const lista = atual[questaoId] || [];
      return { ...atual, [questaoId]: lista.includes(opcaoId) ? lista.filter((o) => o !== opcaoId) : [...lista, opcaoId] };
    });
  };

  // ----- Seções (sumário) e grifos salvos, depois que o texto aparece -----
  useLayoutEffect(() => {
    const el = conteudoRef.current;
    if (!post || !el) return;

    const usados = new Set<string>();
    const lista: Secao[] = [];
    el.querySelectorAll<HTMLElement>("h2, h3").forEach((h) => {
      if (h.closest("[data-sem-marcacao]")) return;
      const texto = normalizarEspacos(h.textContent || "");
      if (!texto) return;
      let id = h.id || `secao-${slugSecao(texto) || lista.length + 1}`;
      while (usados.has(id)) id = `${id}-2`;
      usados.add(id);
      h.id = id;
      lista.push({ id, texto, nivel: h.tagName === "H2" ? 2 : 3 });
    });
    setSecoes(lista);

    const perdidas = new Set<string>();
    lerMarcacoes(post.id).forEach((m) => {
      if (grifoExiste(el, m.id)) return;
      const range = localizarTexto(el, m.texto);
      if (!range || !grifarIntervalo(el, range, m)) perdidas.add(m.id);
    });
    setNaoEncontradas(perdidas);
  }, [post, loading]);

  // Seção em destaque no sumário
  useEffect(() => {
    if (!secoes.length || aba !== "aula") return;
    const alvos = secoes.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    const obs = new IntersectionObserver(
      (entradas) => {
        const visiveis = entradas.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visiveis[0]) setSecaoAtiva(visiveis[0].target.id);
      },
      { rootMargin: "-80px 0px -65% 0px" }
    );
    alvos.forEach((a) => obs.observe(a));
    return () => obs.disconnect();
  }, [secoes, aba]);

  const mudarFonte = (f: Fonte) => {
    setFonte(f);
    try {
      localStorage.setItem(CHAVE_FONTE, f);
    } catch {
      /* sem armazenamento */
    }
  };

  // ----- Grifos -----
  const salvarMarcacoes = useCallback(
    (lista: Marcacao[]) => {
      setMarcacoes(lista);
      if (post) gravarMarcacoes(post.id, lista);
    },
    [post]
  );

  // Barra flutuante ao selecionar texto da aula
  useEffect(() => {
    if (aba !== "aula") return;
    let temporizador: ReturnType<typeof setTimeout>;
    const avaliar = () => {
      const el = conteudoRef.current;
      const sel = window.getSelection();
      if (!el || !sel || sel.isCollapsed || !sel.rangeCount) {
        setBarra((b) => (b?.tipo === "selecao" ? null : b));
        return;
      }
      const range = sel.getRangeAt(0);
      const dentro = el.contains(range.commonAncestorContainer);
      const no = range.commonAncestorContainer;
      const emQuestao = (no instanceof Element ? no : no.parentElement)?.closest("[data-sem-marcacao]");
      const texto = normalizarEspacos(sel.toString());
      if (!dentro || emQuestao || texto.length < 2) {
        setBarra((b) => (b?.tipo === "selecao" ? null : b));
        return;
      }
      const r = range.getBoundingClientRect();
      setBarra({ tipo: "selecao", x: r.left + r.width / 2, topo: r.top, base: r.bottom, texto });
    };
    const agendar = () => {
      clearTimeout(temporizador);
      temporizador = setTimeout(avaliar, 150);
    };
    const aoRolar = () => setBarra((b) => (b?.tipo === "grifo" ? null : b));
    document.addEventListener("selectionchange", agendar);
    window.addEventListener("scroll", agendar, { passive: true });
    window.addEventListener("scroll", aoRolar, { passive: true });
    window.addEventListener("resize", agendar);
    return () => {
      clearTimeout(temporizador);
      document.removeEventListener("selectionchange", agendar);
      window.removeEventListener("scroll", agendar);
      window.removeEventListener("scroll", aoRolar);
      window.removeEventListener("resize", agendar);
    };
  }, [aba]);

  // Clique num grifo abre as opções dele; clique fora fecha
  useEffect(() => {
    const aoClicar = (e: MouseEvent) => {
      const alvo = e.target as HTMLElement;
      if (alvo.closest("[data-barra-teoria]")) return;
      const mark = alvo.closest<HTMLElement>("mark.teoria-grifo");
      const sel = window.getSelection();
      if (mark && conteudoRef.current?.contains(mark) && (!sel || sel.isCollapsed)) {
        const r = mark.getBoundingClientRect();
        setBarra({ tipo: "grifo", id: mark.dataset.marcacao || "", x: r.left + r.width / 2, topo: r.top, base: r.bottom });
        return;
      }
      setBarra((b) => (b?.tipo === "grifo" ? null : b));
    };
    document.addEventListener("click", aoClicar);
    return () => document.removeEventListener("click", aoClicar);
  }, []);

  const grifar = (cor: string) => {
    const el = conteudoRef.current;
    const sel = window.getSelection();
    if (!el || !sel || !sel.rangeCount) return;
    const texto = normalizarEspacos(sel.toString());
    const m: Marcacao = { id: `m${Date.now().toString(36)}`, texto, cor, criadaEm: new Date().toISOString() };
    if (grifarIntervalo(el, sel.getRangeAt(0), m)) {
      salvarMarcacoes([...marcacoes, m]);
    }
    sel.removeAllRanges();
    setBarra(null);
  };

  const mudarCor = (id: string, cor: string) => {
    const lista = marcacoes.map((m) => (m.id === id ? { ...m, cor } : m));
    const m = lista.find((x) => x.id === id);
    if (m && conteudoRef.current) atualizarGrifo(conteudoRef.current, m);
    salvarMarcacoes(lista);
  };

  const removerMarcacao = (id: string) => {
    if (conteudoRef.current) removerGrifo(conteudoRef.current, id);
    salvarMarcacoes(marcacoes.filter((m) => m.id !== id));
    setBarra(null);
  };

  const salvarNota = (id: string, nota: string) => {
    const lista = marcacoes.map((m) => (m.id === id ? { ...m, nota: nota || undefined } : m));
    const m = lista.find((x) => x.id === id);
    if (m && conteudoRef.current) atualizarGrifo(conteudoRef.current, m);
    salvarMarcacoes(lista);
  };

  const limparMarcacoes = () => {
    marcacoes.forEach((m) => conteudoRef.current && removerGrifo(conteudoRef.current, m.id));
    salvarMarcacoes([]);
  };

  const irParaMarcacao = (id: string) => {
    setPainelAberto(false);
    if (aba !== "aula") irParaAba("aula");
    setTimeout(() => {
      const mark = conteudoRef.current?.querySelector<HTMLElement>(`mark[data-marcacao="${CSS.escape(id)}"]`);
      if (!mark) return;
      mark.scrollIntoView({ behavior: "smooth", block: "center" });
      const todos = conteudoRef.current!.querySelectorAll<HTMLElement>(`mark[data-marcacao="${CSS.escape(id)}"]`);
      todos.forEach((m) => {
        m.classList.remove("teoria-grifo--foco");
        void m.offsetWidth;
        m.classList.add("teoria-grifo--foco");
      });
    }, 250);
  };

  const abrirCorrecao = (trecho = "") => {
    setTrechoCorrecao(trecho.slice(0, 3000));
    setCorrecaoAberta(true);
    setBarra(null);
  };

  const irParaSecao = (id: string) => {
    setSumarioAberto(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ----- Telas -----
  if (loading) {
    return (
      <Moldura>
        <div className="mx-auto w-full max-w-[1400px] px-[10px] md:px-[32px] py-8 md:py-12" aria-busy="true">
          <div className="max-w-4xl animate-pulse space-y-4">
            <div className="h-4 w-40 rounded bg-slate-200" />
            <div className="h-9 w-4/5 rounded bg-slate-200" />
            <div className="h-4 w-64 rounded bg-slate-200" />
          </div>
          <div className="mt-8 h-12 animate-pulse rounded-xl bg-white" />
          <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px] xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="animate-pulse space-y-4 rounded-2xl bg-white p-8">
              {[100, 92, 96, 70, 100, 88, 60].map((w, i) => (
                <div key={i} className="h-4 rounded bg-slate-100" style={{ width: `${w}%` }} />
              ))}
            </div>
            <div className="hidden h-64 animate-pulse rounded-2xl bg-white lg:block" />
          </div>
        </div>
      </Moldura>
    );
  }

  if (!post) {
    return (
      <Moldura>
        <div className="mx-auto max-w-xl px-4 py-20">
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#5f2ebe]/10 text-[#5f2ebe]">
              <BookOpen className="h-7 w-7" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900">Teoria não encontrada</h1>
            <p className="mt-2 text-slate-500">Ela pode ter sido removida ou ainda não foi publicada.</p>
            <Link
              to="/teorias"
              className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-[#5f2ebe] px-4 py-2 text-sm font-medium text-white hover:bg-[#4f25a0]"
            >
              Ver todas as teorias
            </Link>
          </div>
        </div>
      </Moldura>
    );
  }

  const minutos = minutosDeLeitura(post.conteudo || "");
  const atualizado = (() => {
    try {
      return format(new Date(post.updated_at || post.created_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return "";
    }
  })();
  const grifoDaBarra = barra?.tipo === "grifo" ? marcacoes.find((m) => m.id === barra.id) : undefined;
  const toque = typeof window !== "undefined" && window.matchMedia?.("(pointer: coarse)").matches;

  const sumario = (compacto = false) => (
    <nav aria-label="Sumário da aula">
      <ol className={cn("space-y-0.5 text-sm", compacto && "max-h-72 overflow-y-auto")}>
        {secoes.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => irParaSecao(s.id)}
              className={cn(
                "block w-full rounded-md py-1.5 pr-2 text-left leading-snug transition-colors",
                s.nivel === 3 ? "pl-6 text-[13px]" : "pl-3",
                secaoAtiva === s.id
                  ? "bg-[#5f2ebe]/10 font-medium text-[#5f2ebe]"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              {s.texto}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );

  const controleFonte = () => (
    <div className="flex items-center rounded-lg bg-slate-100 p-0.5" role="radiogroup" aria-label="Tamanho do texto">
      {(["p", "m", "g"] as Fonte[]).map((f) => (
        <button
          key={f}
          type="button"
          role="radio"
          aria-checked={fonte === f}
          onClick={() => mudarFonte(f)}
          className={cn(
            "flex h-7 w-8 items-center justify-center rounded-md font-semibold transition",
            f === "p" ? "text-xs" : f === "m" ? "text-sm" : "text-base",
            fonte === f ? "bg-white text-[#5f2ebe] shadow-sm" : "text-slate-500 hover:text-slate-800"
          )}
          title={f === "p" ? "Texto menor" : f === "m" ? "Texto normal" : "Texto maior"}
        >
          A
        </button>
      ))}
    </div>
  );

  return (
    <Moldura>
      {/* Progresso da leitura */}
      {aba === "aula" && <BarraProgresso alvo={conteudoRef} />}

      <div className="mx-auto w-full max-w-[1400px] px-[10px] md:px-[32px] pb-16 pt-6 md:pt-10">
        {/* Trilha */}
        <nav className="teoria-sem-impressao mb-4 flex flex-wrap items-center gap-1 text-xs text-slate-500" aria-label="Você está em">
          <Link to="/teorias" className="hover:text-[#5f2ebe]">
            Teorias
          </Link>
          {post.disciplina_id && (
            <>
              <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
              <span>{post.disciplina_id}</span>
            </>
          )}
        </nav>

        {/* Cabeçalho */}
        <header className="max-w-4xl">
          {post.assunto_id && (
            <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[#5f2ebe]/10 px-3 py-1 text-xs font-semibold text-[#5f2ebe]">
              <BookOpen className="h-3.5 w-3.5" />
              {post.assunto_id}
            </p>
          )}
          <h1 className="text-[1.75rem] font-extrabold leading-tight tracking-tight text-slate-900 md:text-4xl">{post.titulo}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
            {professor && (
              <span className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#5f2ebe] to-[#ea2be2] text-[11px] font-bold text-white">
                  {iniciais(professor)}
                </span>
                <span className="font-medium text-slate-700">{professor}</span>
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-slate-400" />
              {minutos} min de leitura
            </span>
            {atualizado && <span>Atualizada em {atualizado}</span>}
            {isAdmin() && (
              <Link
                to={`/admin/teorias/${post.id}/edit`}
                className="teoria-sem-impressao inline-flex items-center gap-1.5 rounded-full border border-[#ea2be2]/40 px-3 py-1 text-xs font-medium text-[#c41fbd] hover:bg-[#ea2be2]/5"
              >
                <Pencil className="h-3.5 w-3.5" />
                Editar teoria
              </Link>
            )}
          </div>
        </header>

        {/* Abas */}
        <div id="teoria-abas" className="teoria-sem-impressao sticky top-16 z-30 -mx-[10px] mt-8 bg-[#f6f7fb]/95 px-[10px] py-2 md:-mx-[32px] md:px-[32px] backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <nav className="-mx-1 flex gap-1 overflow-x-auto px-1 scrollbar-none" role="tablist" aria-label="Conteúdos da teoria">
              {abas.map((a) => {
                const ativa = aba === a.id;
                return (
                  <button
                    key={a.id}
                    type="button"
                    role="tab"
                    aria-selected={ativa}
                    onClick={() => irParaAba(a.id)}
                    className={cn(
                      "flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                      ativa ? "bg-[#5f2ebe] text-white shadow-sm" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:text-[#5f2ebe] hover:ring-[#5f2ebe]/30"
                    )}
                  >
                    <a.icone className="h-4 w-4" />
                    <span className="sm:hidden">{a.curto}</span>
                    <span className="hidden sm:inline">{a.label}</span>
                    {a.n !== undefined && (
                      <span className={cn("rounded-full px-1.5 text-[11px] tabular-nums", ativa ? "bg-white/20" : "bg-slate-100 text-slate-500")}>
                        {a.n > 999 ? "999+" : a.n}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
            {aba === "aula" && (
              <div className="hidden shrink-0 sm:block">
                {controleFonte()}
              </div>
            )}
          </div>
        </div>

        <div className={cn("mt-4 grid gap-8", aba === "aula" && "lg:grid-cols-[minmax(0,1fr)_280px] xl:grid-cols-[minmax(0,1fr)_320px]")}>
          <div className="min-w-0">
            {/* Aula (fica montada para não perder os grifos ao trocar de aba) */}
            <article hidden={aba !== "aula"} className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(16,24,40,0.05)]">
              {/* Ferramentas no celular */}
              <div className="teoria-sem-impressao flex items-center gap-2 border-b border-slate-100 px-4 py-2 lg:hidden">
                {secoes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setSumarioAberto((v) => !v)}
                    aria-expanded={sumarioAberto}
                    className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
                  >
                    <ListTree className="h-4 w-4" />
                    Sumário
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setPainelAberto(true)}
                  className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
                >
                  <Highlighter className="h-4 w-4" />
                  Grifos
                  {marcacoes.length > 0 && <span className="text-xs tabular-nums text-[#5f2ebe]">{marcacoes.length}</span>}
                </button>
                <span className="ml-auto sm:hidden">
                  {controleFonte()}
                </span>
              </div>
              {sumarioAberto && (
                <div className="border-b border-slate-100 px-3 py-3 lg:hidden">
                  {sumario(true)}
                </div>
              )}

              <div className="px-5 py-7 sm:px-10 sm:py-10 lg:px-14">
                <div ref={conteudoRef}>
                  <BlogContentWithQuestions content={post.conteudo || ""} className={cn("teoria-prose", `teoria-prose--${fonte}`)} />
                </div>

                <div className="teoria-sem-impressao mt-12 flex flex-col gap-3 rounded-xl bg-slate-50 p-4 sm:flex-row sm:items-center">
                  <MessageSquareWarning className="hidden h-5 w-5 shrink-0 text-orange-500 sm:block" />
                  <p className="flex-1 text-sm text-slate-600">
                    <strong className="font-semibold text-slate-800">Viu algo errado ou desatualizado?</strong> Selecione o trecho e toque em
                    “Corrigir”. A equipe revisa e seu nome entra nos créditos.
                  </p>
                  <button
                    type="button"
                    onClick={() => abrirCorrecao()}
                    className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:border-[#5f2ebe]/40 hover:text-[#5f2ebe]"
                  >
                    Sugerir correção
                  </button>
                </div>

                <CreditosContribuidores teoriaId={post.id} />
              </div>
            </article>

            {aba === "questoes" && (
              <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(16,24,40,0.05)] sm:p-6">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Questões sobre o assunto</h2>
                    {totalQuestoes !== null && (
                      <p className="text-sm text-slate-500">
                        {totalQuestoes} {totalQuestoes === 1 ? "questão encontrada" : "questões encontradas"}
                      </p>
                    )}
                  </div>
                  {post.questoes_link && (
                    <Link
                      to={post.questoes_link}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:border-[#5f2ebe]/40 hover:text-[#5f2ebe]"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Abrir no banco de questões
                    </Link>
                  )}
                </div>
                {!carregandoQuestoes && totalQuestoes === 0 ? (
                  <Vazio icone={FileQuestion} titulo="Nenhuma questão por enquanto" texto="Ainda não há questões cadastradas para este assunto." />
                ) : (
                  <QuestionResults
                    questions={questoes}
                    disabledOptions={opcoesRiscadas}
                    onToggleDisabled={riscarOpcao}
                    currentPage={paginaQuestoes}
                    totalPages={totalPaginasQuestoes}
                    onPageChange={(p) => {
                      setPaginaQuestoes(p);
                      document.getElementById("teoria-abas")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    hasFilters
                    loading={carregandoQuestoes}
                  />
                )}
              </section>
            )}

            {aba === "video" && (
              <section className="mx-auto max-w-5xl space-y-5">
                {(post.videoaulas || []).map((url, i) => {
                  const embed = youtubeEmbed(url);
                  return (
                    <figure key={`${url}-${i}`} className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(16,24,40,0.05)]">
                      {embed ? (
                        <div className="relative aspect-video bg-slate-900">
                          <iframe
                            src={embed}
                            title={`Videoaula ${i + 1} - ${post.titulo}`}
                            className="absolute inset-0 h-full w-full"
                            loading="lazy"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        <Vazio icone={Video} titulo="Vídeo indisponível" texto="Não foi possível abrir este vídeo aqui." />
                      )}
                      <figcaption className="flex items-center justify-between gap-3 px-4 py-3">
                        <span className="text-sm font-semibold text-slate-800">
                          Videoaula {i + 1}
                          {(post.videoaulas?.length || 0) > 1 && <span className="font-normal text-slate-400"> de {post.videoaulas!.length}</span>}
                        </span>
                        <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-[#5f2ebe]">
                          Abrir no YouTube <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </figcaption>
                    </figure>
                  );
                })}
              </section>
            )}

            {aba === "mapa" && (
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {(post.mapas_mentais || []).map((url, i) => (
                  <div key={`${url}-${i}`} className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(16,24,40,0.05)]">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
                      <MapIcon className="h-6 w-6" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-800">Mapa mental {i + 1}</p>
                      <p className="text-xs text-slate-500">PDF</p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg bg-[#5f2ebe] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#4f25a0]"
                      >
                        Abrir
                      </a>
                      <a
                        href={url}
                        download
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                        aria-label={`Baixar mapa mental ${i + 1}`}
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </section>
            )}
          </div>

          {/* Lateral (computador) */}
          {aba === "aula" && (
            <aside className="teoria-sem-impressao hidden lg:block">
              <div className="sticky top-36 space-y-4">
                {secoes.length > 1 && (
                  <div className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-[0_1px_3px_rgba(16,24,40,0.05)]">
                    <p className="mb-2 flex items-center gap-2 px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      <ListTree className="h-3.5 w-3.5" />
                      Nesta aula
                    </p>
                    <div className="max-h-[50vh] overflow-y-auto pr-1">
                      {sumario()}
                    </div>
                  </div>
                )}
                <div className="space-y-1 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-[0_1px_3px_rgba(16,24,40,0.05)]">
                  <button
                    type="button"
                    onClick={() => setPainelAberto(true)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                  >
                    <Highlighter className="h-4 w-4 text-[#5f2ebe]" />
                    <span className="flex-1">Meus grifos</span>
                    {marcacoes.length > 0 && (
                      <span className="rounded-full bg-[#5f2ebe]/10 px-1.5 text-xs tabular-nums text-[#5f2ebe]">{marcacoes.length}</span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => abrirCorrecao()}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                  >
                    <MessageSquareWarning className="h-4 w-4 text-orange-500" />
                    Sugerir correção
                  </button>
                  <p className="px-3 pt-1 text-[11px] leading-snug text-slate-400">
                    Dica: selecione um trecho para grifar, anotar ou sugerir correção.
                  </p>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* Barra flutuante: seleção ou grifo clicado */}
      {barra && aba === "aula" && (
        <div
          data-barra-teoria
          className="teoria-barra-selecao teoria-sem-impressao fixed z-50 flex items-center gap-1 rounded-xl bg-slate-900 p-1.5 text-white shadow-xl"
          style={{
            left: Math.min(Math.max(barra.x, 150), window.innerWidth - 150),
            top: toque || barra.topo < 70 ? barra.base + 10 : barra.topo - 50,
            transform: "translateX(-50%)",
          }}
          onMouseDown={(e) => e.preventDefault()}
        >
          {CORES_MARCACAO.map((c) => (
            <button
              key={c.valor}
              type="button"
              onClick={() => (barra.tipo === "selecao" ? grifar(c.valor) : mudarCor(barra.id, c.valor))}
              className={cn(
                "h-6 w-6 rounded-full ring-2 transition-transform hover:scale-110",
                grifoDaBarra?.cor === c.valor ? "ring-white" : "ring-transparent"
              )}
              style={{ backgroundColor: c.valor }}
              aria-label={`Grifar em ${c.nome.toLowerCase()}`}
              title={c.nome}
            />
          ))}
          <span className="mx-1 h-5 w-px bg-white/20" aria-hidden />
          {barra.tipo === "selecao" ? (
            <>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(barra.texto).then(() => toast.success("Trecho copiado"));
                  setBarra(null);
                }}
                className="rounded-lg p-1.5 hover:bg-white/10"
                aria-label="Copiar trecho"
                title="Copiar"
              >
                <Copy className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => abrirCorrecao(barra.texto)}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium hover:bg-white/10"
                title="Sugerir correção deste trecho"
              >
                <MessageSquareWarning className="h-4 w-4 text-orange-300" />
                Corrigir
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  setEditandoNota(barra.id);
                  setPainelAberto(true);
                  setBarra(null);
                }}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium hover:bg-white/10"
              >
                <MessageSquareText className="h-4 w-4" />
                {grifoDaBarra?.nota ? "Nota" : "Anotar"}
              </button>
              <button
                type="button"
                onClick={() => removerMarcacao(barra.id)}
                className="rounded-lg p-1.5 hover:bg-white/10"
                aria-label="Remover grifo"
                title="Remover grifo"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      )}

      <PainelMarcacoes
        aberto={painelAberto}
        onOpenChange={(v) => {
          setPainelAberto(v);
          if (!v) setEditandoNota(null);
        }}
        marcacoes={marcacoes}
        naoEncontradas={naoEncontradas}
        editandoId={editandoNota}
        onEditandoId={setEditandoNota}
        onIr={irParaMarcacao}
        onNota={salvarNota}
        onRemover={removerMarcacao}
        onLimpar={limparMarcacoes}
      />

      <SugerirCorrecaoDialog
        aberto={correcaoAberta}
        teoriaId={post.id}
        trechoSelecionado={trechoCorrecao}
        onClose={() => setCorrecaoAberta(false)}
      />
    </Moldura>
  );
};

export default TeoriaPost;
