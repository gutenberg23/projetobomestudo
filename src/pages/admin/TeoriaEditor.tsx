import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  BookOpen,
  Copy,
  ExternalLink,
  Eye,
  Loader2,
  Lock,
  PenLine,
  Save,
  Send,
  Tags,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { teoriasService, type TeoriaInsert } from "@/services/teoriasService";
import { BlogContentWithQuestions } from "@/components/blog/BlogContentWithQuestions";
import { FiltrosQuestoesDialog } from "./teorias/FiltrosQuestoesDialog";
import { TiptapEditor } from "./posts/components/editor/TiptapEditor";
import { CardLateral } from "./posts/components/formulario/CardLateral";
import { CampoCombo, CampoTopicos, extrairTitulos } from "./teorias/CamposClassificacao";
import { CardMapasMentais, CardQuestoes, CardVideoaulas, type FiltrosQuestoes } from "./teorias/MateriaisTeoria";
import { cn } from "@/lib/utils";

type Status = "draft" | "published";

interface Classificacao {
  disciplina_id: string;
  assunto_id: string;
  topicos_ids: string[] | null;
}

const gerarSlug = (texto: string) =>
  (texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const dataHora = (iso?: string) =>
  iso ? new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "";

const selectClasse =
  "h-9 w-full rounded-md border border-input bg-white px-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5f2ebe]/30";

const TeoriaEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const criando = !id;

  const [carregando, setCarregando] = useState(!!id);
  const [salvando, setSalvando] = useState(false);
  const [modo, setModo] = useState<"editar" | "previa">("editar");

  // Campos
  const [titulo, setTitulo] = useState("");
  const [slug, setSlug] = useState("");
  const [disciplina, setDisciplina] = useState("");
  const [assunto, setAssunto] = useState("");
  const [topicos, setTopicos] = useState<string[]>([]);
  const [conteudo, setConteudo] = useState("");
  const [noEdital, setNoEdital] = useState("");
  const [status, setStatus] = useState<Status>("draft");
  const [professorId, setProfessorId] = useState("");
  const [filtros, setFiltros] = useState<FiltrosQuestoes>({});
  const [questoesLink, setQuestoesLink] = useState("");
  const [videos, setVideos] = useState<string[]>([]);
  const [mapas, setMapas] = useState<string[]>([]);

  // O que está gravado no banco
  const [salvo, setSalvo] = useState<{ slug: string; status: Status; criado?: string; atualizado?: string }>({
    slug: "",
    status: "draft",
  });

  // Opções
  const [classificacoes, setClassificacoes] = useState<Classificacao[]>([]);
  const [professores, setProfessores] = useState<{ id: string; nome: string }[]>([]);
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);

  const tituloRef = useRef<HTMLTextAreaElement>(null);

  // ----- Carregamento -----
  useEffect(() => {
    supabase
      .from("teorias")
      .select("disciplina_id, assunto_id, topicos_ids")
      .then(({ data }) => setClassificacoes((data as Classificacao[]) || []));
    supabase
      .from("professores")
      .select("id, nome_completo")
      .order("nome_completo")
      .then(({ data }) => setProfessores((data || []).map((p) => ({ id: p.id, nome: p.nome_completo }))));
  }, []);

  const retrato = useMemo(
    () =>
      JSON.stringify([titulo, slug, disciplina, assunto, topicos, conteudo, noEdital, status, professorId, filtros, questoesLink, videos, mapas]),
    [titulo, slug, disciplina, assunto, topicos, conteudo, noEdital, status, professorId, filtros, questoesLink, videos, mapas]
  );
  const [retratoSalvo, setRetratoSalvo] = useState<string | null>(null);
  const marcarSalvo = useRef(false);

  useEffect(() => {
    if (!id) {
      marcarSalvo.current = true;
      return;
    }
    let ativo = true;
    setCarregando(true);
    teoriasService
      .getTeoriaById(id)
      .then((t) => {
        if (!ativo) return;
        setTitulo(t.titulo || "");
        setSlug(t.slug || "");
        setDisciplina(t.disciplina_id || "");
        setAssunto(t.assunto_id || "");
        setTopicos(t.topicos_ids || []);
        setConteudo(t.conteudo || "");
        setNoEdital(t.no_edital || "");
        setStatus(t.status || "draft");
        setProfessorId(t.professor_id || "");
        setFiltros(t.questoes_filtros || {});
        setQuestoesLink(t.questoes_link || "");
        setVideos(t.videoaulas || []);
        setMapas(t.mapas_mentais || []);
        setSalvo({ slug: t.slug || "", status: t.status || "draft", criado: t.created_at, atualizado: t.updated_at });
        marcarSalvo.current = true;
      })
      .catch(() => {
        toast.error("Não foi possível abrir a teoria.");
        navigate("/admin/teorias");
      })
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [id, navigate]);

  // Depois de carregar (ou salvar), o estado atual vira a referência
  useEffect(() => {
    if (marcarSalvo.current) {
      marcarSalvo.current = false;
      setRetratoSalvo(retrato);
    }
  }, [retrato, carregando]);

  const alterado = retratoSalvo !== null && retrato !== retratoSalvo;

  useEffect(() => {
    if (!alterado) return;
    const aviso = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", aviso);
    return () => window.removeEventListener("beforeunload", aviso);
  }, [alterado]);

  // Título cresce com o texto
  useLayoutEffect(() => {
    const el = tituloRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [titulo, carregando]);

  // ----- Opções de classificação -----
  const disciplinas = useMemo(
    () => Array.from(new Set(classificacoes.map((c) => c.disciplina_id).filter(Boolean))),
    [classificacoes]
  );
  const assuntos = useMemo(
    () =>
      Array.from(
        new Set(classificacoes.filter((c) => !disciplina || c.disciplina_id === disciplina).map((c) => c.assunto_id).filter(Boolean))
      ),
    [classificacoes, disciplina]
  );
  const topicosDoAssunto = useMemo(
    () =>
      Array.from(
        new Set(classificacoes.filter((c) => assunto && c.assunto_id === assunto).flatMap((c) => c.topicos_ids || []).filter(Boolean))
      ),
    [classificacoes, assunto]
  );
  const titulosConteudo = useMemo(() => extrairTitulos(conteudo), [conteudo]);
  const todosTopicos = useMemo(
    () => Array.from(new Set(classificacoes.flatMap((c) => c.topicos_ids || []).filter(Boolean))),
    [classificacoes]
  );

  // ----- Salvar -----
  const faltando = [!titulo.trim() && "título", !disciplina && "disciplina", !assunto && "assunto"].filter(Boolean) as string[];

  const salvar = useCallback(async () => {
    if (faltando.length) {
      toast.error(`Preencha: ${faltando.join(", ")}.`);
      if (!titulo.trim()) tituloRef.current?.focus();
      return;
    }
    setSalvando(true);
    const dados: TeoriaInsert = {
      titulo: titulo.trim(),
      slug: slug.trim() ? gerarSlug(slug) : "",
      disciplina_id: disciplina,
      assunto_id: assunto,
      topicos_ids: topicos,
      conteudo: conteudo || "",
      no_edital: noEdital || "",
      status,
      professor_id: professorId || undefined,
      questoes_filtros: filtros,
      questoes_link: questoesLink,
      videoaulas: videos,
      mapas_mentais: mapas,
    };
    try {
      if (id) {
        const t = await teoriasService.updateTeoria(id, dados);
        const novoSlug = t?.slug || dados.slug || "";
        setSalvo({ slug: t?.slug || "", status: t?.status || status, criado: t?.created_at, atualizado: t?.updated_at });
        if (novoSlug === slug) setRetratoSalvo(retrato);
        else {
          // O banco ajustou o link (ex.: gerou do título): o novo valor vira a referência
          marcarSalvo.current = true;
          setSlug(novoSlug);
        }
        toast.success(
          status === "published" && salvo.status !== "published"
            ? "Teoria publicada"
            : status === "draft" && salvo.status === "published"
              ? "Teoria voltou para rascunho"
              : "Alterações salvas"
        );
      } else {
        const t = await teoriasService.createTeoria(dados);
        setRetratoSalvo(retrato);
        toast.success(status === "published" ? "Teoria criada e publicada" : "Rascunho criado");
        navigate(`/admin/teorias/${t.id}/edit`, { replace: true });
      }
    } catch (e) {
      const msg = (e as { message?: string })?.message || "";
      toast.error(msg.includes("duplicate") ? "Já existe uma teoria com esse link." : "Não foi possível salvar a teoria.");
    } finally {
      setSalvando(false);
    }
  }, [faltando, titulo, slug, disciplina, assunto, topicos, conteudo, noEdital, status, professorId, filtros, questoesLink, videos, mapas, id, salvo.status, retrato, navigate]);

  // Ctrl+S / Cmd+S salva sem sair
  useEffect(() => {
    const atalho = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (!salvando && !carregando) salvar();
      }
    };
    window.addEventListener("keydown", atalho);
    return () => window.removeEventListener("keydown", atalho);
  }, [salvar, salvando, carregando]);

  const voltar = () => {
    if (alterado && !window.confirm("Há alterações não salvas. Sair mesmo assim?")) return;
    navigate("/admin/teorias");
  };

  const excluir = async () => {
    if (!id) return;
    const aviso =
      salvo.status === "published"
        ? "Excluir esta teoria? Ela está publicada: o link deixa de funcionar e os tópicos que apontam para ela ficam sem aula em texto."
        : "Excluir esta teoria? Esta ação não pode ser desfeita.";
    if (!window.confirm(aviso)) return;
    try {
      await teoriasService.deleteTeoria(id);
      setRetratoSalvo(retrato);
      toast.success("Teoria excluída");
      navigate("/admin/teorias");
    } catch {
      toast.error("Não foi possível excluir a teoria.");
    }
  };

  // ----- Endereço -----
  const slugPrevisto = slug.trim() ? gerarSlug(slug) : gerarSlug(titulo);
  const caminhoSalvo = salvo.slug ? `/teoria/${salvo.slug}` : id ? `/teoria/${id}` : "";
  const urlPublica = caminhoSalvo ? `${window.location.origin}${caminhoSalvo}` : "";
  const slugMudou = !!id && !!salvo.slug && !!slug.trim() && gerarSlug(slug) !== salvo.slug;

  const copiarLink = () => {
    if (!urlPublica) return;
    navigator.clipboard
      .writeText(urlPublica)
      .then(() => toast.success("Link copiado"))
      .catch(() => toast.error("Não foi possível copiar"));
  };

  const publicadaNoBanco = salvo.status === "published";
  const rotuloSalvar =
    status === "draft" ? (publicadaNoBanco ? "Despublicar" : "Salvar rascunho") : criando || !publicadaNoBanco ? "Publicar" : "Atualizar";

  if (carregando) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="-mx-4 -mt-6 md:-mx-8" style={{ "--post-editor-sticky-top": "57px" } as React.CSSProperties}>
      {/* Barra de ações fixa */}
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="flex h-14 items-center gap-2 px-4 md:px-8">
          <Button type="button" variant="ghost" size="sm" onClick={voltar} className="-ml-2 gap-1 text-slate-600">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Teorias</span>
          </Button>
          <span className="h-5 w-px bg-slate-200" aria-hidden />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-base font-semibold text-slate-900">
                {criando ? "Nova teoria" : titulo || "Editar teoria"}
              </h2>
              {!criando && (
                <span
                  className={cn(
                    "hidden shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium sm:inline",
                    publicadaNoBanco ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                  )}
                >
                  {publicadaNoBanco ? "Publicada" : "Rascunho"}
                </span>
              )}
            </div>
            <p className={cn("truncate text-xs", alterado ? "text-amber-600" : "text-slate-400")}>
              {alterado ? "Alterações não salvas" : criando ? "Ainda não salva" : "Tudo salvo"}
              <span className="hidden text-slate-400 md:inline"> · Ctrl+S salva</span>
            </p>
          </div>
          {publicadaNoBanco && caminhoSalvo && (
            <Button type="button" variant="ghost" size="sm" asChild className="hidden text-slate-600 sm:inline-flex">
              <a href={caminhoSalvo} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-1.5 h-4 w-4" />
                Ver no site
              </a>
            </Button>
          )}
          <Button
            type="button"
            onClick={salvar}
            disabled={salvando}
            className={cn("gap-1.5 text-white", status === "draft" ? "bg-slate-800 hover:bg-slate-700" : "bg-[#ea2be2] hover:bg-[#d029d5]")}
          >
            {salvando ? <Loader2 className="h-4 w-4 animate-spin" /> : status === "draft" ? <Save className="h-4 w-4" /> : <Send className="h-4 w-4" />}
            {salvando ? "Salvando..." : rotuloSalvar}
          </Button>
        </div>
      </div>

      <form
        className="grid grid-cols-[minmax(0,1fr)] gap-5 px-4 py-5 md:px-8 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]"
        onSubmit={(e) => {
          e.preventDefault();
          salvar();
        }}
      >
        {/* Coluna principal: título e texto da aula */}
        <div className="min-w-0 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:p-5">
            {(disciplina || assunto) && (
              <p className="mb-1 flex flex-wrap items-center gap-1 text-xs font-medium text-[#5f2ebe]">
                <BookOpen className="h-3.5 w-3.5" />
                {disciplina}
                {assunto && <span className="text-slate-400">›</span>}
                {assunto && <span className="text-slate-500">{assunto}</span>}
              </p>
            )}
            <label htmlFor="titulo" className="sr-only">
              Título
            </label>
            <textarea
              id="titulo"
              ref={tituloRef}
              rows={1}
              value={titulo}
              onChange={(e) => setTitulo(e.target.value.replace(/\n/g, " "))}
              placeholder="Título da teoria"
              className="w-full resize-none overflow-hidden border-0 bg-transparent p-0 text-2xl font-bold leading-tight text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-0 sm:text-[1.75rem]"
            />
            <p className="mt-2 truncate font-mono text-[11px] text-slate-400" title={`/teoria/${slugPrevisto}`}>
              /teoria/{slugPrevisto || "…"}
            </p>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex rounded-lg bg-slate-200/60 p-1" role="tablist" aria-label="Modo do editor">
              {[
                { id: "editar" as const, label: "Escrever", icone: PenLine },
                { id: "previa" as const, label: "Pré-visualizar", icone: Eye },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  role="tab"
                  aria-selected={modo === m.id}
                  onClick={() => setModo(m.id)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition",
                    modo === m.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  <m.icone className="h-4 w-4" />
                  {m.label}
                </button>
              ))}
            </div>
            <p className="hidden text-xs text-slate-400 sm:block">
              Use <strong className="font-medium text-slate-500">Título 2</strong> para as seções: elas viram o sumário da aula.
            </p>
          </div>

          {modo === "editar" ? (
            <TiptapEditor
              content={conteudo}
              onChange={setConteudo}
              placeholder="Escreva a aula aqui. Use Título 2 para dividir em seções e o botão de questão para inserir exercícios no meio do texto."
              rotulo="Texto da aula"
            />
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white px-5 py-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:px-10 sm:py-8">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[#5f2ebe]">{disciplina || "Disciplina"}</p>
              <h1 className="mb-6 text-3xl font-bold leading-tight text-slate-900">{titulo || "Sem título"}</h1>
              {conteudo ? (
                <BlogContentWithQuestions content={conteudo} className="teoria-prose" />
              ) : (
                <p className="text-sm italic text-slate-400">A aula ainda está vazia.</p>
              )}
            </div>
          )}
        </div>

        {/* Coluna lateral */}
        <aside className="space-y-4 scrollbar-thin lg:sticky lg:top-[72px] lg:max-h-[calc(100vh-130px)] lg:self-start lg:overflow-y-auto lg:pb-4 lg:pr-1">
          <CardLateral titulo="Publicação">
            <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1" role="radiogroup" aria-label="Status da teoria">
              {[
                { valor: "draft" as const, label: "Rascunho", cor: "text-amber-700" },
                { valor: "published" as const, label: "Publicada", cor: "text-emerald-700" },
              ].map((op) => (
                <button
                  key={op.valor}
                  type="button"
                  role="radio"
                  aria-checked={status === op.valor}
                  onClick={() => setStatus(op.valor)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium transition",
                    status === op.valor ? `bg-white shadow-sm ${op.cor}` : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  {op.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500">
              {status === "draft"
                ? "Só a equipe vê. Para o aluno, o link ainda não abre."
                : "Fica visível para os alunos assim que você salvar."}
            </p>

            <div className="space-y-1 border-t border-slate-100 pt-3">
              <label htmlFor="slug" className="text-xs font-medium text-slate-600">
                Link amigável
              </label>
              <div className="flex h-9 items-center overflow-hidden rounded-md border border-input bg-white focus-within:ring-2 focus-within:ring-[#5f2ebe]/30">
                <span className="select-none border-r border-slate-100 bg-slate-50 px-2 font-mono text-[11px] text-slate-400">/teoria/</span>
                <input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  onBlur={() => slug.trim() && setSlug(gerarSlug(slug))}
                  placeholder={gerarSlug(titulo) || "gerado-do-titulo"}
                  className="h-full min-w-0 flex-1 border-0 bg-transparent px-2 font-mono text-xs text-slate-800 placeholder:text-slate-300 focus:outline-none"
                />
              </div>
              <p className="text-[11px] leading-snug text-slate-400">
                {slugMudou
                  ? "O link antigo continua funcionando e leva para o novo."
                  : "Em branco, é gerado do título. Se já existir, ganha um número no fim."}
              </p>
            </div>

            {!criando && (
              <dl className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1 border-t border-slate-100 pt-3 text-xs">
                <dt className="text-slate-400">Endereço</dt>
                <dd className="flex min-w-0 items-center gap-1">
                  <span className="truncate font-mono text-[11px] text-slate-600" title={caminhoSalvo}>
                    {caminhoSalvo}
                  </span>
                  <button type="button" onClick={copiarLink} className="shrink-0 rounded p-0.5 text-slate-400 hover:text-[#5f2ebe]" aria-label="Copiar link">
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </dd>
                {salvo.criado && (
                  <>
                    <dt className="text-slate-400">Criada em</dt>
                    <dd className="text-slate-600">{dataHora(salvo.criado)}</dd>
                  </>
                )}
                {salvo.atualizado && (
                  <>
                    <dt className="text-slate-400">Atualizada</dt>
                    <dd className="text-slate-600">{dataHora(salvo.atualizado)}</dd>
                  </>
                )}
              </dl>
            )}
          </CardLateral>

          <CardLateral titulo="Classificação" icone={<Tags className="h-4 w-4 text-slate-400" />}>
            <div className="space-y-1">
              <label htmlFor="professor" className="text-xs font-medium text-slate-600">
                Professor
              </label>
              <select id="professor" value={professorId} onChange={(e) => setProfessorId(e.target.value)} className={selectClasse}>
                <option value="">Sem professor</option>
                {professores.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>
            </div>
            <CampoCombo rotulo="Disciplina" valor={disciplina} onChange={setDisciplina} opcoes={disciplinas} obrigatorio placeholder="Buscar ou criar disciplina" />
            <CampoCombo
              rotulo="Assunto"
              valor={assunto}
              onChange={setAssunto}
              opcoes={assuntos}
              obrigatorio
              desabilitado={!disciplina}
              placeholder={disciplina ? "Buscar ou criar assunto" : "Escolha a disciplina primeiro"}
            />
            <CampoTopicos valores={topicos} onChange={setTopicos} sugestoes={topicosDoAssunto} outras={todosTopicos} titulos={titulosConteudo} />
          </CardLateral>

          <CardQuestoes
            filtros={filtros}
            link={questoesLink}
            onConfigurar={() => setFiltrosAbertos(true)}
            onLimpar={() => {
              setFiltros({});
              setQuestoesLink("");
            }}
          />

          <CardVideoaulas videos={videos} onChange={setVideos} />

          <CardMapasMentais mapas={mapas} onChange={setMapas} />

          <CardLateral
            titulo="Como aparece no edital"
            descricao="Uso interno: não aparece para o aluno."
            icone={<Lock className="h-4 w-4 text-slate-400" />}
          >
            <textarea
              value={noEdital}
              onChange={(e) => setNoEdital(e.target.value)}
              rows={3}
              placeholder="Ex.: Atos administrativos: conceito, requisitos, atributos..."
              className="w-full resize-y rounded-md border border-input bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5f2ebe]/30"
            />
          </CardLateral>

          {!criando && (
            <button
              type="button"
              onClick={excluir}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
              Excluir teoria
            </button>
          )}
        </aside>
      </form>

      <FiltrosQuestoesDialog
        aberto={filtrosAbertos}
        onFechar={() => setFiltrosAbertos(false)}
        inicial={filtros}
        disciplinaTeoria={disciplina}
        assuntoTeoria={assunto}
        onAplicar={(f, link) => {
          setFiltros(f);
          setQuestoesLink(link);
          setFiltrosAbertos(false);
        }}
      />
    </div>
  );
};

export default TeoriaEditor;
