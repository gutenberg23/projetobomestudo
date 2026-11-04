import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  Bot,
  Check,
  ChevronDown,
  CircleAlert,
  Copy,
  Eraser,
  GraduationCap,
  Layers,
  ListChecks,
  Loader2,
  Plus,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { TiptapEditor } from "@/pages/admin/posts/components/editor/TiptapEditor";
import { CardLateral } from "@/pages/admin/posts/components/formulario/CardLateral";
import { QuestionStats } from "@/components/new/question/QuestionStats";
import { QuestionOption } from "@/components/admin/questions/types";
import {
  DadosQuestao,
  Facetas,
  gerarExplicacaoIA,
  QuestaoAdmin,
} from "@/services/questoesAdminService";
import { CampoEscolha, CampoEscolhaMultipla, Pilulas } from "./CampoEscolha";
import { alternativasPara, EditorAlternativas } from "./EditorAlternativas";
import {
  DIFICULDADES_PADRAO,
  dataCurta,
  juntarOpcoes,
  letraAlternativa,
  temConteudo,
  TIPO_CERTO_ERRADO,
  TIPO_MULTIPLA,
  TIPOS_PADRAO,
} from "./utils";

interface FormularioQuestaoProps {
  questaoInicial: QuestaoAdmin | null;
  facetas: Facetas;
  salvando?: boolean;
  /** Devolve true se salvou. */
  onSalvar: (dados: DadosQuestao) => Promise<boolean>;
  onCancelar: () => void;
  onExcluir?: (id: string) => void;
  onLimparEstatisticas?: (id: string) => Promise<void>;
}

const vazia = (): DadosQuestao => ({
  year: "",
  institution: "",
  organization: "",
  role: [],
  discipline: "",
  level: "",
  difficulty: "",
  questionType: TIPO_MULTIPLA,
  content: "",
  teacherExplanation: "",
  aiExplanation: "",
  expandableContent: "",
  options: alternativasPara(TIPO_MULTIPLA, []),
  assuntos: [],
  topicos: [],
});

const deQuestao = (q: QuestaoAdmin): DadosQuestao => {
  const tipo = q.questionType || TIPO_MULTIPLA;
  return {
    year: q.year,
    institution: q.institution,
    organization: q.organization,
    role: [...q.role],
    discipline: q.discipline,
    level: q.level,
    difficulty: q.difficulty,
    questionType: tipo,
    content: q.content,
    teacherExplanation: q.teacherExplanation,
    aiExplanation: q.aiExplanation,
    expandableContent: q.expandableContent,
    options: q.options.length ? q.options.map((o) => ({ ...o })) : alternativasPara(tipo, []),
    assuntos: [...q.assuntos],
    topicos: [...q.topicos],
  };
};

type CampoErro = "content" | "options" | "gabarito" | "institution" | "organization" | "year" | "discipline";

const ROTULOS_ERRO: Record<CampoErro, string> = {
  content: "Enunciado",
  options: "Texto de todas as alternativas",
  gabarito: "Gabarito",
  institution: "Banca",
  organization: "Órgão",
  year: "Ano",
  discipline: "Disciplina",
};

const ALVO: Record<string, string> = {
  content: "sec-enunciado",
  options: "sec-alternativas",
  gabarito: "sec-alternativas",
  institution: "campo-banca",
  organization: "campo-orgao",
  year: "campo-ano",
  discipline: "campo-disciplina",
  level: "campo-nivel",
  difficulty: "campo-dificuldade",
  assuntos: "campo-assuntos",
  teacherExplanation: "sec-professor",
  aiExplanation: "sec-ia",
};

const rolarAte = (id: string) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  if (el instanceof HTMLButtonElement || el instanceof HTMLInputElement) setTimeout(() => el.focus(), 300);
};

const Secao: React.FC<{
  id: string;
  titulo: string;
  descricao?: React.ReactNode;
  icone?: React.ReactNode;
  acao?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}> = ({ id, titulo, descricao, icone, acao, children, className }) => (
  <section id={id} className={cn("scroll-mt-20 rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]", className)}>
    <header className="flex flex-wrap items-start justify-between gap-2 px-4 pb-2 pt-4">
      <div className="min-w-0">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          {icone}
          {titulo}
        </h3>
        {descricao && <p className="mt-0.5 text-xs text-slate-500">{descricao}</p>}
      </div>
      {acao}
    </header>
    <div className="px-4 pb-4">{children}</div>
  </section>
);

const Campo: React.FC<{ rotulo: string; htmlFor?: string; obrigatorio?: boolean; erro?: string | false; children: React.ReactNode }> = ({
  rotulo,
  htmlFor,
  obrigatorio,
  erro,
  children,
}) => (
  <div className="space-y-1.5">
    <Label htmlFor={htmlFor} className="text-xs font-medium text-slate-600">
      {rotulo}
      {obrigatorio && <span className="ml-0.5 text-[#ea2be2]">*</span>}
    </Label>
    {children}
    {erro && <p className="text-xs text-red-600">{erro}</p>}
  </div>
);

const FormularioQuestao: React.FC<FormularioQuestaoProps> = ({
  questaoInicial,
  facetas,
  salvando = false,
  onSalvar,
  onCancelar,
  onExcluir,
  onLimparEstatisticas,
}) => {
  const [base, setBase] = useState<DadosQuestao>(() => (questaoInicial ? deQuestao(questaoInicial) : vazia()));
  const [form, setForm] = useState<DadosQuestao>(base);
  const [tentouSalvar, setTentouSalvar] = useState(false);
  const [mostrarApoio, setMostrarApoio] = useState(() => temConteudo(base.expandableContent));
  const [instrucoesIA, setInstrucoesIA] = useState("");
  const [mostrarInstrucoes, setMostrarInstrucoes] = useState(false);
  const [gerando, setGerando] = useState(false);
  const [provedorIA, setProvedorIA] = useState<string | null>(null);
  const [limpando, setLimpando] = useState(false);
  const [criadas, setCriadas] = useState(0);
  // Guarda as alternativas de múltipla escolha ao trocar para Certo/Errado
  const ultimasMultipla = useRef<QuestionOption[] | null>(null);

  const set = <K extends keyof DadosQuestao>(campo: K, valor: DadosQuestao[K]) => setForm((f) => ({ ...f, [campo]: valor }));

  const editando = Boolean(questaoInicial);

  // ----- Alterações não salvas -----
  const alterado = JSON.stringify(form) !== JSON.stringify(base);
  const alteradoRef = useRef(alterado);
  alteradoRef.current = alterado;
  useEffect(() => {
    const aviso = (e: BeforeUnloadEvent) => {
      if (!alteradoRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", aviso);
    return () => window.removeEventListener("beforeunload", aviso);
  }, []);

  // ----- Opções dos campos -----
  const assuntosDaDisciplina = facetas.assuntosPorDisciplina[form.discipline] || [];
  const topicosDosAssuntos = useMemo(
    () => [...new Set(form.assuntos.flatMap((a) => facetas.topicosPorAssunto[a] || []))].sort((a, b) => a.localeCompare(b, "pt-BR")),
    [form.assuntos, facetas.topicosPorAssunto]
  );
  const tipos = juntarOpcoes(TIPOS_PADRAO, facetas.tipos);
  const dificuldades = juntarOpcoes(DIFICULDADES_PADRAO, facetas.dificuldades);
  const niveis = facetas.niveis.length ? facetas.niveis : ["Fundamental", "Médio", "Superior"];
  const multipla = form.questionType !== TIPO_CERTO_ERRADO;

  const mudarTipo = (tipo: string) => {
    if (tipo === form.questionType) return;
    setForm((f) => {
      let options: QuestionOption[];
      if (tipo === TIPO_CERTO_ERRADO) {
        if (f.questionType !== TIPO_CERTO_ERRADO) ultimasMultipla.current = f.options;
        options = alternativasPara(tipo, f.options);
      } else if (f.questionType === TIPO_CERTO_ERRADO && ultimasMultipla.current) {
        options = ultimasMultipla.current;
      } else {
        options = alternativasPara(tipo, f.options);
      }
      return { ...f, questionType: tipo, options };
    });
  };

  // ----- Validação -----
  const erros = useMemo(() => {
    const e: Partial<Record<CampoErro, string>> = {};
    if (!temConteudo(form.content)) e.content = "Escreva o enunciado da questão.";
    if (multipla && form.options.some((o) => !o.text.trim())) e.options = "Preencha todas as alternativas (ou remova as que sobraram).";
    if (!form.options.some((o) => o.isCorrect)) e.gabarito = "Marque o gabarito.";
    if (!form.institution.trim()) e.institution = "Informe a banca.";
    if (!form.organization.trim()) e.organization = "Informe o órgão.";
    if (!form.year.trim()) e.year = "Informe o ano.";
    if (!form.discipline.trim()) e.discipline = "Informe a disciplina.";
    return e;
  }, [form, multipla]);
  const pendentes = Object.keys(erros) as CampoErro[];
  const erro = (campo: CampoErro) => tentouSalvar && erros[campo];

  const recomendados = [
    { chave: "level", rotulo: "Nível", ok: Boolean(form.level) },
    { chave: "difficulty", rotulo: "Dificuldade", ok: Boolean(form.difficulty) },
    { chave: "assuntos", rotulo: "Assuntos", ok: form.assuntos.length > 0 },
    { chave: "teacherExplanation", rotulo: "Comentário do professor", ok: temConteudo(form.teacherExplanation) },
    { chave: "aiExplanation", rotulo: "Explicação da IA", ok: temConteudo(form.aiExplanation) },
  ];

  const salvar = useCallback(
    async (criarOutra = false) => {
      setTentouSalvar(true);
      if (pendentes.length) {
        toast({
          title: "Faltam campos obrigatórios",
          description: pendentes.map((p) => ROTULOS_ERRO[p]).join(", "),
          variant: "destructive",
        });
        rolarAte(ALVO[pendentes[0]]);
        return;
      }
      const dados: DadosQuestao = {
        ...form,
        options: multipla ? form.options.map((o) => ({ ...o, text: o.text.trim() })) : form.options,
      };
      const ok = await onSalvar(dados);
      if (!ok) return;
      if (criarOutra) {
        // Mantém os dados da prova para cadastrar a próxima questão mais rápido
        const proxima: DadosQuestao = {
          ...vazia(),
          year: dados.year,
          institution: dados.institution,
          organization: dados.organization,
          role: dados.role,
          discipline: dados.discipline,
          level: dados.level,
          questionType: dados.questionType,
          options: alternativasPara(dados.questionType, []),
        };
        ultimasMultipla.current = null;
        setBase(proxima);
        setForm(proxima);
        setTentouSalvar(false);
        setMostrarApoio(false);
        setProvedorIA(null);
        setCriadas((n) => n + 1);
        document.querySelector(".admin-content")?.scrollTo({ top: 0, behavior: "smooth" });
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setBase(dados);
      }
    },
    [form, multipla, onSalvar, pendentes]
  );

  useEffect(() => {
    const atalho = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (!salvando) salvar(false);
      }
    };
    window.addEventListener("keydown", atalho);
    return () => window.removeEventListener("keydown", atalho);
  }, [salvar, salvando]);

  const voltar = () => {
    if (alterado && !window.confirm("Há alterações não salvas. Sair mesmo assim?")) return;
    onCancelar();
  };

  // ----- IA -----
  const gerarIA = async () => {
    if (!temConteudo(form.content)) {
      toast({ title: "Escreva o enunciado primeiro", variant: "destructive" });
      rolarAte("sec-enunciado");
      return;
    }
    if (!form.options.some((o) => o.isCorrect)) {
      toast({ title: "Marque o gabarito primeiro", description: "A IA explica a partir do gabarito informado.", variant: "destructive" });
      rolarAte("sec-alternativas");
      return;
    }
    if (temConteudo(form.aiExplanation) && !window.confirm("Substituir a explicação da IA atual por uma nova?")) return;
    setGerando(true);
    try {
      const { html, provider } = await gerarExplicacaoIA(
        {
          enunciado: form.content,
          textoApoio: form.expandableContent,
          tipo: form.questionType,
          alternativas: form.options.map((o, i) => ({ letra: letraAlternativa(form.questionType, i), texto: o.text, correta: o.isCorrect })),
          disciplina: form.discipline,
          banca: form.institution,
          orgao: form.organization,
          ano: form.year,
          assuntos: form.assuntos,
          topicos: form.topicos,
          explicacaoExistente: form.aiExplanation,
        },
        instrucoesIA.trim()
      );
      set("aiExplanation", html);
      setProvedorIA(provider || null);
      toast({ title: "Explicação gerada", description: "Revise o texto antes de salvar." });
    } catch (e) {
      toast({ title: "Não foi possível gerar a explicação", description: (e as Error).message, variant: "destructive" });
    } finally {
      setGerando(false);
    }
  };

  const copiarId = () => {
    if (!questaoInicial) return;
    navigator.clipboard?.writeText(questaoInicial.id).then(
      () => toast({ title: "ID copiado" }),
      () => toast({ title: "Não foi possível copiar", variant: "destructive" })
    );
  };

  const limparEstatisticas = async () => {
    if (!questaoInicial || !onLimparEstatisticas) return;
    if (!window.confirm("Zerar as estatísticas desta questão (acertos, erros e respostas)?")) return;
    setLimpando(true);
    try {
      await onLimparEstatisticas(questaoInicial.id);
    } finally {
      setLimpando(false);
    }
  };

  const totalObrigatorios = Object.keys(ROTULOS_ERRO).length;
  const feitos = totalObrigatorios - pendentes.length;

  return (
    <div className="-mx-4 -mt-6 md:-mx-8">
      {/* Barra de ações */}
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="flex h-14 items-center gap-2 px-4 md:px-8">
          <Button type="button" variant="ghost" size="sm" onClick={voltar} className="-ml-2 gap-1 text-slate-600">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Questões</span>
          </Button>
          <span className="h-5 w-px bg-slate-200" aria-hidden />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-base font-semibold text-slate-900">
              {editando ? "Editar questão" : "Nova questão"}
              {!editando && criadas > 0 && (
                <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 align-middle text-[11px] font-medium text-emerald-700">
                  {criadas} {criadas === 1 ? "criada" : "criadas"} nesta sessão
                </span>
              )}
            </h2>
            <p className={cn("truncate text-xs", alterado ? "text-amber-600" : "text-slate-400")}>
              {alterado ? "Alterações não salvas" : editando ? "Tudo salvo" : "Ainda não salva"}
              <span className="hidden text-slate-400 md:inline"> · Ctrl+S salva</span>
            </p>
          </div>
          <Button type="button" variant="ghost" onClick={voltar} className="hidden text-slate-600 lg:inline-flex">
            Cancelar
          </Button>
          {!editando && (
            <Button type="button" variant="outline" onClick={() => salvar(true)} disabled={salvando} className="hidden gap-1.5 md:inline-flex">
              <Plus className="h-4 w-4" />
              Salvar e criar outra
            </Button>
          )}
          <Button type="button" onClick={() => salvar(false)} disabled={salvando} className="gap-1.5 bg-[#ea2be2] text-white hover:bg-[#d029d5]">
            {salvando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {salvando ? "Salvando..." : editando ? "Salvar" : "Criar questão"}
          </Button>
        </div>
      </div>

      <form
        className="grid grid-cols-[minmax(0,1fr)] gap-5 px-4 py-5 md:px-8 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]"
        onSubmit={(e) => {
          e.preventDefault();
          salvar(false);
        }}
      >
        <div className="min-w-0 space-y-4">
          {/* Enunciado */}
          <Secao
            id="sec-enunciado"
            titulo="Enunciado"
            icone={<Layers className="h-4 w-4 text-[#5f2ebe]" />}
            descricao="O comando da questão, como aparece na prova. Pode ter imagens e tabelas."
            className={cn(erro("content") && "border-red-300")}
          >
            <div className="space-y-3">
              {mostrarApoio ? (
                <div className="space-y-1.5 rounded-lg bg-slate-50 p-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium text-slate-600">Texto de apoio (abre num bloco expansível acima do enunciado)</Label>
                    {!temConteudo(form.expandableContent) && (
                      <button type="button" className="text-xs text-slate-500 hover:text-slate-800" onClick={() => setMostrarApoio(false)}>
                        Remover
                      </button>
                    )}
                  </div>
                  <TiptapEditor
                    variante="questao"
                    bucket="questoes"
                    rotulo="Texto de apoio"
                    content={form.expandableContent}
                    onChange={(v) => set("expandableContent", v)}
                    placeholder="Texto, imagem ou tabela que a questão usa como base."
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setMostrarApoio(true)}
                  className="flex w-full items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-left text-xs text-slate-500 transition-colors hover:border-[#5f2ebe]/50 hover:text-[#5f2ebe]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Adicionar texto de apoio (texto longo, imagem ou tabela que a questão usa)
                </button>
              )}
              <TiptapEditor
                variante="questao"
                bucket="questoes"
                rotulo="Enunciado"
                content={form.content}
                onChange={(v) => set("content", v)}
                placeholder="Cole ou digite o enunciado da questão."
              />
              {erro("content") && <p className="text-xs text-red-600">{erros.content}</p>}
            </div>
          </Secao>

          {/* Alternativas */}
          <Secao
            id="sec-alternativas"
            titulo={multipla ? "Alternativas e gabarito" : "Gabarito"}
            icone={<ListChecks className="h-4 w-4 text-[#5f2ebe]" />}
            className={cn((erro("options") || erro("gabarito")) && "border-red-300")}
            acao={
              <div className="flex rounded-lg bg-slate-100 p-0.5" role="radiogroup" aria-label="Tipo de questão">
                {tipos.map((t) => (
                  <button
                    key={t}
                    type="button"
                    role="radio"
                    aria-checked={form.questionType === t}
                    onClick={() => mudarTipo(t)}
                    className={cn(
                      "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                      form.questionType === t ? "bg-white text-[#5f2ebe] shadow-sm" : "text-slate-500 hover:text-slate-800"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            }
          >
            <EditorAlternativas tipo={form.questionType} opcoes={form.options} onChange={(o) => set("options", o)} mostrarErros={tentouSalvar} />
            {erro("options") && <p className="mt-2 text-xs text-red-600">{erros.options}</p>}
          </Secao>

          {/* Comentário do professor */}
          <Secao
            id="sec-professor"
            titulo="Comentário do professor"
            icone={<GraduationCap className="h-4 w-4 text-[#5f2ebe]" />}
            descricao="Aparece para o aluno depois de responder."
          >
            <TiptapEditor
              variante="questao"
              bucket="questoes"
              rotulo="Comentário do professor"
              content={form.teacherExplanation}
              onChange={(v) => set("teacherExplanation", v)}
              placeholder="Explique o gabarito com as suas palavras."
            />
          </Secao>

          {/* Explicação da IA */}
          <Secao
            id="sec-ia"
            titulo="Explicação da IA"
            icone={<Bot className="h-4 w-4 text-[#5f2ebe]" />}
            descricao="Gerada com a mesma IA gratuita dos posts (Gemini, com o Groq de reserva). Revise antes de salvar."
            className="border-[#5f2ebe]/20"
            acao={
              <Button type="button" size="sm" onClick={gerarIA} disabled={gerando} className="gap-1.5 bg-[#5f2ebe] text-white hover:bg-[#4a1f9c]">
                {gerando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {gerando ? "Gerando..." : temConteudo(form.aiExplanation) ? "Gerar de novo" : "Gerar com IA"}
              </Button>
            }
          >
            <div className="space-y-3">
              <div>
                <button
                  type="button"
                  onClick={() => setMostrarInstrucoes(!mostrarInstrucoes)}
                  className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-[#5f2ebe]"
                  aria-expanded={mostrarInstrucoes}
                >
                  <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", mostrarInstrucoes && "rotate-180")} />
                  Instruções para a IA (opcional)
                </button>
                {mostrarInstrucoes && (
                  <Input
                    className="mt-2"
                    value={instrucoesIA}
                    onChange={(e) => setInstrucoesIA(e.target.value)}
                    placeholder="Ex.: cite a súmula aplicável; explique de forma mais curta; use um exemplo."
                    maxLength={1000}
                  />
                )}
              </div>
              <div className={cn("relative", gerando && "pointer-events-none opacity-60")}>
                <TiptapEditor
                  variante="questao"
                  bucket="questoes"
                  rotulo="Explicação da IA"
                  content={form.aiExplanation}
                  onChange={(v) => set("aiExplanation", v)}
                  placeholder="Clique em “Gerar com IA” ou escreva a explicação."
                />
              </div>
              {provedorIA && <p className="text-[11px] text-slate-400">Gerado por {provedorIA}</p>}
            </div>
          </Secao>
        </div>

        {/* Coluna lateral */}
        <aside className="scrollbar-thin space-y-4 lg:sticky lg:top-[72px] lg:max-h-[calc(100vh-130px)] lg:self-start lg:overflow-y-auto lg:pb-4 lg:pr-1">
          <CardLateral
            titulo="Checklist"
            icone={<ListChecks className="h-4 w-4 text-[#5f2ebe]" />}
            acao={
              <span className={cn("text-xs font-medium tabular-nums", pendentes.length ? "text-slate-500" : "text-emerald-600")}>
                {feitos}/{totalObrigatorios}
              </span>
            }
          >
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className={cn("h-full rounded-full transition-all", pendentes.length ? "bg-[#5f2ebe]" : "bg-emerald-500")}
                style={{ width: `${(feitos / totalObrigatorios) * 100}%` }}
              />
            </div>
            <ul className="space-y-1 text-sm">
              {(Object.keys(ROTULOS_ERRO) as CampoErro[]).map((c) => {
                const ok = !erros[c];
                return (
                  <li key={c}>
                    <button
                      type="button"
                      onClick={() => rolarAte(ALVO[c])}
                      className={cn(
                        "flex w-full items-center gap-2 rounded px-1 py-0.5 text-left hover:bg-slate-50",
                        ok ? "text-slate-500" : tentouSalvar ? "text-red-600" : "text-slate-800"
                      )}
                    >
                      {ok ? (
                        <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                      ) : (
                        <CircleAlert className={cn("h-4 w-4 shrink-0", tentouSalvar ? "text-red-500" : "text-slate-300")} />
                      )}
                      {ROTULOS_ERRO[c]}
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="border-t border-slate-100 pt-2">
              <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">Recomendados</p>
              <ul className="space-y-1 text-sm">
                {recomendados.map((r) => (
                  <li key={r.chave}>
                    <button
                      type="button"
                      onClick={() => rolarAte(ALVO[r.chave])}
                      className="flex w-full items-center gap-2 rounded px-1 py-0.5 text-left text-slate-500 hover:bg-slate-50"
                    >
                      {r.ok ? <Check className="h-4 w-4 shrink-0 text-emerald-500" /> : <span className="mx-1 h-2 w-2 shrink-0 rounded-full bg-slate-300" />}
                      {r.rotulo}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </CardLateral>

          <CardLateral titulo="Prova" descricao="De onde a questão foi tirada.">
            <Campo rotulo="Banca" htmlFor="campo-banca" obrigatorio erro={erro("institution")}>
              <CampoEscolha
                id="campo-banca"
                valor={form.institution}
                onChange={(v) => set("institution", v)}
                opcoes={facetas.bancas}
                placeholder="Ex.: Cebraspe, FGV, FCC"
                invalido={Boolean(erro("institution"))}
              />
            </Campo>
            <Campo rotulo="Órgão" htmlFor="campo-orgao" obrigatorio erro={erro("organization")}>
              <CampoEscolha
                id="campo-orgao"
                valor={form.organization}
                onChange={(v) => set("organization", v)}
                opcoes={facetas.orgaos}
                placeholder="Ex.: TJ-SP, INSS"
                invalido={Boolean(erro("organization"))}
              />
            </Campo>
            <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-3">
              <Campo rotulo="Ano" htmlFor="campo-ano" obrigatorio erro={erro("year") && "Obrigatório"}>
                <Input
                  id="campo-ano"
                  inputMode="numeric"
                  list="anos-questoes"
                  value={form.year}
                  onChange={(e) => set("year", e.target.value.replace(/[^\d]/g, "").slice(0, 4))}
                  placeholder={String(new Date().getFullYear())}
                  className={cn("h-9", erro("year") && "border-red-300")}
                />
                <datalist id="anos-questoes">
                  {facetas.anos.slice(0, 30).map((a) => (
                    <option key={a} value={a} />
                  ))}
                </datalist>
              </Campo>
              <Campo rotulo="Nível" htmlFor="campo-nivel">
                <CampoEscolha id="campo-nivel" valor={form.level} onChange={(v) => set("level", v)} opcoes={niveis} placeholder="Nível" />
              </Campo>
            </div>
            <Campo rotulo="Cargos" htmlFor="campo-cargos">
              <CampoEscolhaMultipla
                id="campo-cargos"
                valores={form.role}
                onChange={(v) => set("role", v)}
                opcoes={facetas.cargos}
                placeholder="Adicionar cargo"
              />
            </Campo>
          </CardLateral>

          <CardLateral titulo="Classificação" descricao="Usada nos filtros e no edital verticalizado.">
            <Campo rotulo="Disciplina" htmlFor="campo-disciplina" obrigatorio erro={erro("discipline")}>
              <CampoEscolha
                id="campo-disciplina"
                valor={form.discipline}
                onChange={(v) => set("discipline", v)}
                opcoes={facetas.disciplinas}
                placeholder="Ex.: Direito Constitucional"
                invalido={Boolean(erro("discipline"))}
              />
            </Campo>
            <Campo rotulo="Assuntos" htmlFor="campo-assuntos">
              <CampoEscolhaMultipla
                id="campo-assuntos"
                valores={form.assuntos}
                onChange={(v) => set("assuntos", v)}
                opcoes={facetas.assuntos}
                sugeridas={assuntosDaDisciplina}
                rotuloSugeridas={form.discipline ? `Usados em ${form.discipline}` : undefined}
                placeholder="Adicionar assunto"
              />
            </Campo>
            <Campo rotulo="Tópicos" htmlFor="campo-topicos">
              <CampoEscolhaMultipla
                id="campo-topicos"
                valores={form.topicos}
                onChange={(v) => set("topicos", v)}
                opcoes={facetas.topicos}
                sugeridas={topicosDosAssuntos}
                rotuloSugeridas="Dos assuntos escolhidos"
                placeholder="Adicionar tópico"
              />
            </Campo>
            <Campo rotulo="Dificuldade" htmlFor="campo-dificuldade">
              <div id="campo-dificuldade">
                <Pilulas rotulo="Dificuldade" opcoes={dificuldades} valor={form.difficulty} onChange={(v) => set("difficulty", v)} />
              </div>
            </Campo>
          </CardLateral>

          {questaoInicial && (
            <CardLateral
              titulo="Estatísticas"
              icone={<BarChart3 className="h-4 w-4 text-[#5f2ebe]" />}
              acao={
                onLimparEstatisticas && (
                  <Button type="button" variant="ghost" size="sm" onClick={limparEstatisticas} disabled={limpando} className="h-7 px-2 text-xs text-amber-700 hover:bg-amber-50">
                    {limpando ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Eraser className="mr-1 h-3.5 w-3.5" />}
                    Zerar
                  </Button>
                )
              }
            >
              <div className="-mx-2">
                <QuestionStats questionId={questaoInicial.id} />
              </div>
            </CardLateral>
          )}

          {questaoInicial && (
            <CardLateral titulo="Informações">
              <dl className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-slate-500">ID</dt>
                  <dd className="flex min-w-0 items-center gap-1">
                    <code className="truncate rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600">{questaoInicial.id}</code>
                    <button type="button" onClick={copiarId} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Copiar ID">
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </dd>
                </div>
                {questaoInicial.createdAt && (
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-500">Criada em</dt>
                    <dd className="text-slate-700">{dataCurta(questaoInicial.createdAt)}</dd>
                  </div>
                )}
                {questaoInicial.updatedAt && (
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-500">Atualizada em</dt>
                    <dd className="text-slate-700">{dataCurta(questaoInicial.updatedAt)}</dd>
                  </div>
                )}
              </dl>
              {onExcluir && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onExcluir(questaoInicial.id)}
                  className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir questão
                </Button>
              )}
            </CardLateral>
          )}
        </aside>
      </form>
    </div>
  );
};

export default FormularioQuestao;
