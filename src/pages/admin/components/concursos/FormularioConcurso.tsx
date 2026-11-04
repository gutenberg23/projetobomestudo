import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Concurso, ConcursoFormData, Estado, NivelEnsino } from "@/types/concurso";
import { BlogPost } from "@/components/blog/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { toast } from "@/components/ui/use-toast";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronsUpDown,
  ClipboardList,
  ExternalLink,
  FileText,
  Loader2,
  MapPin,
  Plus,
  Save,
  Sparkles,
  Star,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { autoPreencherConcurso, ConcursoExtractedData } from "@/services/autoPreencherConcursoService";
import { CardLateral } from "@/pages/admin/posts/components/formulario/CardLateral";
import { diasAte, NIVEIS, nomeCargo, paraInputData, REGIOES_UF, statusConcurso, UFS } from "./utils";

interface FormularioConcursoProps {
  concursoInicial: Concurso | null;
  posts: BlogPost[];
  postIdsUtilizados: Set<string>;
  salvando?: boolean;
  /** Devolve true se salvou */
  onSalvar: (formData: ConcursoFormData) => Promise<boolean> | void;
  onCancelar: () => void;
}

const VAZIO: ConcursoFormData = {
  titulo: "",
  dataInicioInscricao: "",
  dataFimInscricao: "",
  dataProva: null,
  prorrogado: false,
  niveis: [],
  cargos: [],
  vagas: 0,
  salario: "",
  estados: [],
  postId: undefined,
  destacar: false,
};

const ESTADOS_VALIDOS = new Set<string>([...UFS, "Nacional", "Federal"]);

/** Seletor do post do blog com busca. */
const SeletorPost: React.FC<{
  posts: BlogPost[];
  postIdsUtilizados: Set<string>;
  postAtualDoConcurso?: string;
  valor?: string;
  onChange: (id?: string) => void;
}> = ({ posts, postIdsUtilizados, postAtualDoConcurso, valor, onChange }) => {
  const [aberto, setAberto] = useState(false);
  const selecionado = posts.find((p) => p.id === valor);
  return (
    <Popover open={aberto} onOpenChange={setAberto}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition hover:border-[#5f2ebe]/40",
            selecionado ? "border-slate-200 bg-white" : "border-dashed border-slate-300 bg-slate-50"
          )}
        >
          <FileText className={cn("h-4 w-4 shrink-0", selecionado ? "text-[#5f2ebe]" : "text-slate-400")} />
          <span className="min-w-0 flex-1">
            {selecionado ? (
              <>
                <span className="block truncate text-sm font-medium text-slate-800">{selecionado.title}</span>
                <span className="block truncate text-xs text-slate-500">
                  {selecionado.category}
                  {selecionado.isDraft ? " · rascunho" : ""}
                </span>
              </>
            ) : (
              <span className="text-sm text-slate-500">Escolha a notícia do blog sobre este concurso</span>
            )}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-slate-400" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(36rem,calc(100vw-2rem))] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar post pelo título..." />
          <CommandList className="max-h-72">
            <CommandEmpty>Nenhum post encontrado.</CommandEmpty>
            <CommandGroup>
              {posts.map((post) => {
                const usado = postIdsUtilizados.has(post.id) && post.id !== postAtualDoConcurso;
                return (
                  <CommandItem
                    key={post.id}
                    value={`${post.title} ${post.id}`}
                    onSelect={() => {
                      onChange(post.id);
                      setAberto(false);
                    }}
                    className="flex items-start gap-2 py-2"
                  >
                    <Check className={cn("mt-0.5 h-4 w-4 shrink-0", valor === post.id ? "opacity-100 text-[#5f2ebe]" : "opacity-0")} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm leading-snug">{post.title}</span>
                      <span className="block text-xs text-slate-500">
                        {post.category}
                        {post.createdAt ? ` · ${new Date(post.createdAt).toLocaleDateString("pt-BR")}` : ""}
                        {post.isDraft ? " · rascunho" : ""}
                      </span>
                    </span>
                    {usado && (
                      <span className="shrink-0 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700" title="Já vinculado a outro concurso">
                        já usado
                      </span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

const FormularioConcurso: React.FC<FormularioConcursoProps> = ({
  concursoInicial,
  posts,
  postIdsUtilizados,
  salvando = false,
  onSalvar,
  onCancelar,
}) => {
  const inicial = useMemo<ConcursoFormData>(
    () =>
      concursoInicial
        ? {
            titulo: concursoInicial.titulo,
            dataInicioInscricao: paraInputData(concursoInicial.dataInicioInscricao),
            dataFimInscricao: paraInputData(concursoInicial.dataFimInscricao),
            dataProva: concursoInicial.dataProva ? paraInputData(concursoInicial.dataProva) : null,
            prorrogado: concursoInicial.prorrogado || false,
            niveis: concursoInicial.niveis || [],
            cargos: concursoInicial.cargos || [],
            vagas: concursoInicial.vagas || 0,
            salario: concursoInicial.salario || "",
            estados: concursoInicial.estados || [],
            postId: concursoInicial.postId,
            destacar: concursoInicial.destacar || false,
          }
        : VAZIO,
    [concursoInicial]
  );

  const [form, setForm] = useState<ConcursoFormData>(inicial);
  const [novoCargo, setNovoCargo] = useState("");
  const [cargosEmMassa, setCargosEmMassa] = useState("");
  const [mostrarEmMassa, setMostrarEmMassa] = useState(false);
  const [fonteIA, setFonteIA] = useState<"post" | "texto">("post");
  const [textoIA, setTextoIA] = useState("");
  const [preenchendo, setPreenchendo] = useState(false);
  const [preenchidos, setPreenchidos] = useState<string[] | null>(null);
  const [tentouSalvar, setTentouSalvar] = useState(false);

  useEffect(() => setForm(inicial), [inicial]);

  const set = <K extends keyof ConcursoFormData>(campo: K, valor: ConcursoFormData[K]) =>
    setForm((f) => ({ ...f, [campo]: valor }));

  // ----- Alterações não salvas -----
  const alterado = JSON.stringify(form) !== JSON.stringify(inicial);
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

  // ----- Validação -----
  const erros = useMemo(() => {
    const e: Partial<Record<"titulo" | "inicio" | "fim" | "prova" | "estados", string>> = {};
    if (!form.titulo.trim()) e.titulo = "Informe o nome do concurso.";
    if (!form.dataInicioInscricao) e.inicio = "Informe o início das inscrições.";
    if (!form.dataFimInscricao) e.fim = "Informe o fim das inscrições.";
    else if (form.dataInicioInscricao && form.dataFimInscricao < form.dataInicioInscricao)
      e.fim = "O fim não pode ser antes do início.";
    if (form.dataProva && form.dataFimInscricao && form.dataProva < form.dataFimInscricao)
      e.prova = "A prova está antes do fim das inscrições. Confira a data.";
    if (form.estados.length === 0) e.estados = "Nenhum estado: o concurso não aparece nos filtros por estado.";
    return e;
  }, [form]);
  const bloqueantes = ["titulo", "inicio", "fim"].filter((k) => erros[k as keyof typeof erros]);

  const salvar = useCallback(async () => {
    setTentouSalvar(true);
    if (bloqueantes.length) {
      toast({ title: "Confira os campos destacados", description: erros[bloqueantes[0] as keyof typeof erros], variant: "destructive" });
      return;
    }
    await onSalvar({ ...form, titulo: form.titulo.trim(), salario: form.salario.trim(), dataProva: form.dataProva || null });
  }, [bloqueantes, erros, form, onSalvar]);

  useEffect(() => {
    const atalho = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (!salvando) salvar();
      }
    };
    window.addEventListener("keydown", atalho);
    return () => window.removeEventListener("keydown", atalho);
  }, [salvar, salvando]);

  const voltar = () => {
    if (alterado && !window.confirm("Há alterações não salvas. Sair mesmo assim?")) return;
    onCancelar();
  };

  // ----- Cargos -----
  const cargoExiste = (nome: string) => form.cargos.some((c) => nomeCargo(c).toLowerCase() === nome.toLowerCase());
  const adicionarCargos = (nomes: string[]) => {
    const novos = nomes.map((n) => n.trim()).filter((n, i, arr) => n && !cargoExiste(n) && arr.findIndex((x) => x.toLowerCase() === n.toLowerCase()) === i);
    if (novos.length) set("cargos", [...form.cargos, ...novos]);
    return novos.length;
  };

  // ----- Estados -----
  const alternarEstado = (uf: Estado) =>
    set("estados", form.estados.includes(uf) ? form.estados.filter((e) => e !== uf) : [...form.estados, uf]);
  const alternarRegiao = (ufs: Estado[]) => {
    const todas = ufs.every((u) => form.estados.includes(u));
    set("estados", todas ? form.estados.filter((e) => !ufs.includes(e)) : Array.from(new Set([...form.estados, ...ufs])));
  };

  // ----- IA -----
  const aplicarDados = (d: ConcursoExtractedData) => {
    const campos: string[] = [];
    const proximo = { ...form };
    if (d.titulo) { proximo.titulo = d.titulo; campos.push("nome"); }
    if (d.dataInicioInscricao) { proximo.dataInicioInscricao = d.dataInicioInscricao; campos.push("início"); }
    if (d.dataFimInscricao) { proximo.dataFimInscricao = d.dataFimInscricao; campos.push("fim"); }
    if (d.dataProva) { proximo.dataProva = d.dataProva; campos.push("prova"); }
    if (d.prorrogado) { proximo.prorrogado = true; campos.push("prorrogação"); }
    const niveis = d.niveis.filter((n): n is NivelEnsino => NIVEIS.includes(n as NivelEnsino));
    if (niveis.length) { proximo.niveis = niveis; campos.push("níveis"); }
    if (d.cargos.length) { proximo.cargos = d.cargos; campos.push(`${d.cargos.length} cargos`); }
    if (d.vagas) { proximo.vagas = d.vagas; campos.push("vagas"); }
    if (d.salario) { proximo.salario = d.salario; campos.push("salário"); }
    const estados = d.estados.filter((e): e is Estado => ESTADOS_VALIDOS.has(e));
    if (estados.length) { proximo.estados = estados; campos.push("estados"); }
    setForm(proximo);
    return campos;
  };

  const preencherComIA = async () => {
    if (fonteIA === "post" && !form.postId) {
      toast({ title: "Escolha um post primeiro", variant: "destructive" });
      return;
    }
    if (fonteIA === "texto" && textoIA.trim().length < 80) {
      toast({ title: "Cole um texto maior", description: "Cole a notícia ou o trecho do edital com datas, cargos e vagas.", variant: "destructive" });
      return;
    }
    setPreenchendo(true);
    setPreenchidos(null);
    try {
      const dados = await autoPreencherConcurso(fonteIA === "post" ? { postId: form.postId! } : { texto: textoIA });
      const campos = aplicarDados(dados);
      setPreenchidos(campos);
      toast({
        title: campos.length ? "Dados preenchidos pela IA" : "A IA não encontrou dados no texto",
        description: campos.length ? "Confira datas, vagas e salário antes de salvar." : "Tente outro post ou cole o texto do edital.",
        variant: campos.length ? "default" : "destructive",
      });
    } catch (error) {
      toast({ title: "Não foi possível preencher", description: (error as Error).message, variant: "destructive" });
    } finally {
      setPreenchendo(false);
    }
  };

  const status = form.dataInicioInscricao && form.dataFimInscricao ? statusConcurso(form) : null;
  const duracao =
    form.dataInicioInscricao && form.dataFimInscricao && !erros.fim
      ? (diasAte(form.dataFimInscricao, new Date(form.dataInicioInscricao + "T00:00:00")) ?? 0) + 1
      : null;
  const postSelecionado = posts.find((p) => p.id === form.postId);
  const mostrarErro = (campo: keyof typeof erros) => (tentouSalvar || campo === "prova" || campo === "fim") && erros[campo];

  return (
    <div className="-mx-4 -mt-6 md:-mx-8">
      {/* Barra de ações */}
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="flex h-14 items-center gap-2 px-4 md:px-8">
          <Button type="button" variant="ghost" size="sm" onClick={voltar} className="-ml-2 gap-1 text-slate-600">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Concursos</span>
          </Button>
          <span className="h-5 w-px bg-slate-200" aria-hidden />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-base font-semibold text-slate-900">
              {concursoInicial ? form.titulo || "Editar concurso" : "Novo concurso"}
            </h2>
            <p className={cn("truncate text-xs", alterado ? "text-amber-600" : "text-slate-400")}>
              {alterado ? "Alterações não salvas" : concursoInicial ? "Tudo salvo" : "Ainda não salvo"}
              <span className="hidden text-slate-400 md:inline"> · Ctrl+S salva</span>
            </p>
          </div>
          <Button type="button" variant="ghost" onClick={voltar} className="hidden text-slate-600 sm:inline-flex">
            Cancelar
          </Button>
          <Button type="button" onClick={salvar} disabled={salvando} className="gap-1.5 bg-[#ea2be2] text-white hover:bg-[#d029d5]">
            {salvando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {salvando ? "Salvando..." : concursoInicial ? "Salvar alterações" : "Criar concurso"}
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
        <div className="min-w-0 space-y-4">
          {/* Preencher com IA */}
          <section className="overflow-hidden rounded-xl border border-[#5f2ebe]/20 bg-gradient-to-br from-[#faf8ff] to-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <div className="flex flex-wrap items-start justify-between gap-3 px-4 pt-4">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <Sparkles className="h-4 w-4 text-[#5f2ebe]" /> Preencher com IA
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Lê a notícia e preenche nome, datas, níveis, cargos, vagas, salário e estados. Usa a mesma IA gratuita dos posts.
                </p>
              </div>
              <div className="flex rounded-lg bg-white p-0.5 ring-1 ring-slate-200" role="tablist">
                {(
                  [
                    { id: "post", label: "Post do blog" },
                    { id: "texto", label: "Colar texto" },
                  ] as const
                ).map((op) => (
                  <button
                    key={op.id}
                    type="button"
                    role="tab"
                    aria-selected={fonteIA === op.id}
                    onClick={() => setFonteIA(op.id)}
                    className={cn(
                      "rounded-md px-3 py-1 text-xs font-medium transition",
                      fonteIA === op.id ? "bg-[#5f2ebe] text-white" : "text-slate-500 hover:text-slate-800"
                    )}
                  >
                    {op.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3 p-4">
              {fonteIA === "post" ? (
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="min-w-0 flex-1">
                    <SeletorPost
                      posts={posts}
                      postIdsUtilizados={postIdsUtilizados}
                      postAtualDoConcurso={concursoInicial?.postId}
                      valor={form.postId}
                      onChange={(id) => set("postId", id)}
                    />
                  </div>
                </div>
              ) : (
                <Textarea
                  value={textoIA}
                  onChange={(e) => setTextoIA(e.target.value)}
                  rows={5}
                  placeholder="Cole aqui a notícia ou o trecho do edital com datas, cargos, vagas e salários."
                  className="bg-white text-sm"
                />
              )}
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  onClick={preencherComIA}
                  disabled={preenchendo || (fonteIA === "post" ? !form.postId : textoIA.trim().length < 80)}
                  className="bg-[#5f2ebe] text-white hover:bg-[#5f2ebe]/90"
                >
                  {preenchendo ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  {preenchendo ? "Lendo a notícia..." : "Preencher com IA"}
                </Button>
                {preenchidos && preenchidos.length > 0 && (
                  <p className="flex items-center gap-1.5 text-xs text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                    Preenchido: {preenchidos.join(", ")}. Confira antes de salvar.
                  </p>
                )}
              </div>
              {fonteIA === "post" && (
                <p className="text-xs text-slate-500">O post escolhido também fica vinculado ao concurso, com link na página do concurso.</p>
              )}
            </div>
          </section>

          {/* Dados principais */}
          <CardLateral titulo="Concurso" icone={<ClipboardList className="h-4 w-4 text-slate-400" />}>
            <div className="space-y-1.5">
              <Label htmlFor="titulo">Nome do concurso</Label>
              <Input
                id="titulo"
                value={form.titulo}
                onChange={(e) => set("titulo", e.target.value)}
                placeholder="Ex.: Prefeitura de Campinas (SP)"
                className={cn("h-11 text-base font-medium", mostrarErro("titulo") && "border-red-400")}
              />
              {mostrarErro("titulo") && <p className="text-xs text-red-600">{erros.titulo}</p>}
            </div>
          </CardLateral>

          {/* Datas */}
          <CardLateral
            titulo="Inscrições e prova"
            icone={<CalendarDays className="h-4 w-4 text-slate-400" />}
            acao={
              duracao ? (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                  {duracao} {duracao === 1 ? "dia" : "dias"} de inscrição
                </span>
              ) : undefined
            }
          >
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="dataInicioInscricao">Início</Label>
                <Input
                  id="dataInicioInscricao"
                  type="date"
                  value={form.dataInicioInscricao}
                  onChange={(e) => set("dataInicioInscricao", e.target.value)}
                  className={cn(mostrarErro("inicio") && "border-red-400")}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dataFimInscricao">Fim</Label>
                <Input
                  id="dataFimInscricao"
                  type="date"
                  value={form.dataFimInscricao}
                  min={form.dataInicioInscricao || undefined}
                  onChange={(e) => set("dataFimInscricao", e.target.value)}
                  className={cn(mostrarErro("fim") && "border-red-400")}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dataProva">
                  Prova <span className="font-normal text-slate-400">(opcional)</span>
                </Label>
                <Input
                  id="dataProva"
                  type="date"
                  value={form.dataProva ?? ""}
                  onChange={(e) => set("dataProva", e.target.value || null)}
                  className={cn(mostrarErro("prova") && "border-amber-400")}
                />
              </div>
            </div>
            {(mostrarErro("inicio") || mostrarErro("fim")) && (
              <p className="text-xs text-red-600">{erros.inicio || erros.fim}</p>
            )}
            {mostrarErro("prova") && <p className="text-xs text-amber-600">{erros.prova}</p>}
            <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2.5">
              <span>
                <span className="block text-sm text-slate-700">Inscrições prorrogadas</span>
                <span className="block text-xs text-slate-500">Mostra o selo "Prorrogado" no site. Atualize a data de fim acima.</span>
              </span>
              <Switch checked={form.prorrogado} onCheckedChange={(v) => set("prorrogado", !!v)} />
            </label>
          </CardLateral>

          {/* Cargos */}
          <CardLateral
            titulo="Cargos"
            icone={<Users className="h-4 w-4 text-slate-400" />}
            acao={
              form.cargos.length > 0 ? (
                <button type="button" onClick={() => set("cargos", [])} className="text-xs text-slate-400 hover:text-red-600">
                  Limpar todos
                </button>
              ) : undefined
            }
          >
            <div className="flex gap-2">
              <Input
                value={novoCargo}
                onChange={(e) => setNovoCargo(e.target.value)}
                placeholder="Digite um cargo e aperte Enter"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (adicionarCargos([novoCargo])) setNovoCargo("");
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => adicionarCargos([novoCargo]) && setNovoCargo("")}
                disabled={!novoCargo.trim()}
                aria-label="Adicionar cargo"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {form.cargos.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {form.cargos.map((cargo, i) => (
                  <span
                    key={`${nomeCargo(cargo)}-${i}`}
                    className="inline-flex items-center gap-1 rounded-full bg-[#5f2ebe]/10 py-1 pl-3 pr-1 text-xs font-medium text-[#5f2ebe]"
                  >
                    {nomeCargo(cargo)}
                    <button
                      type="button"
                      onClick={() => set("cargos", form.cargos.filter((_, j) => j !== i))}
                      className="rounded-full p-0.5 hover:bg-[#5f2ebe]/20"
                      aria-label={`Remover ${nomeCargo(cargo)}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">Nenhum cargo ainda.</p>
            )}
            {mostrarEmMassa ? (
              <div className="space-y-2 rounded-lg border border-slate-200 p-3">
                <Textarea
                  value={cargosEmMassa}
                  onChange={(e) => setCargosEmMassa(e.target.value)}
                  rows={5}
                  autoFocus
                  placeholder={"Um cargo por linha\nAgente administrativo\nAnalista de sistemas"}
                  className="text-sm"
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setMostrarEmMassa(false)}>
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      const n = adicionarCargos(cargosEmMassa.split("\n"));
                      setCargosEmMassa("");
                      setMostrarEmMassa(false);
                      toast({ title: n ? `${n} cargos adicionados` : "Nenhum cargo novo" });
                    }}
                  >
                    Adicionar
                  </Button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => setMostrarEmMassa(true)} className="text-xs font-medium text-[#5f2ebe] hover:underline">
                Colar vários cargos de uma vez
              </button>
            )}
          </CardLateral>

          {/* Vagas e salário */}
          <CardLateral titulo="Vagas e salário">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="vagas">Total de vagas</Label>
                <Input
                  id="vagas"
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={form.vagas || ""}
                  onChange={(e) => set("vagas", parseInt(e.target.value, 10) || 0)}
                  placeholder="0 = cadastro reserva"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="salario">Salário</Label>
                <Input
                  id="salario"
                  value={form.salario}
                  onChange={(e) => set("salario", e.target.value)}
                  placeholder="Até R$ 10.450,00"
                />
              </div>
            </div>
          </CardLateral>
        </div>

        {/* Coluna lateral */}
        <aside className="scrollbar-thin space-y-4 lg:sticky lg:top-[72px] lg:max-h-[calc(100vh-130px)] lg:self-start lg:overflow-y-auto lg:pb-4 lg:pr-1">
          <CardLateral titulo="Exibição no site">
            {status && (
              <p className="text-xs text-slate-500">
                Situação pelas datas:{" "}
                <span
                  className={cn(
                    "font-medium",
                    status === "aberto" ? "text-emerald-700" : status === "em-breve" ? "text-sky-700" : "text-slate-600"
                  )}
                >
                  {status === "aberto" ? "inscrições abertas" : status === "em-breve" ? "em breve" : "encerrado"}
                </span>
              </p>
            )}
            <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2.5">
              <span className="flex items-center gap-2 text-sm text-slate-700">
                <Star className={cn("h-4 w-4", form.destacar ? "fill-amber-400 text-amber-400" : "text-slate-400")} />
                Destacar na página inicial
              </span>
              <Switch checked={!!form.destacar} onCheckedChange={(v) => set("destacar", !!v)} />
            </label>
            {postSelecionado && (
              <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                <FileText className="h-3.5 w-3.5 shrink-0 text-[#5f2ebe]" />
                <span className="min-w-0 flex-1 truncate" title={postSelecionado.title}>
                  {postSelecionado.title}
                </span>
                {postSelecionado.slug && !postSelecionado.isDraft && (
                  <a href={`/blog/${postSelecionado.slug}`} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#5f2ebe]" title="Abrir post">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
                <button type="button" onClick={() => set("postId", undefined)} className="text-slate-400 hover:text-red-600" title="Desvincular post">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </CardLateral>

          <CardLateral titulo="Níveis de escolaridade">
            <div className="flex flex-wrap gap-2">
              {NIVEIS.map((nivel) => {
                const ativo = form.niveis.includes(nivel);
                return (
                  <button
                    key={nivel}
                    type="button"
                    aria-pressed={ativo}
                    onClick={() => set("niveis", ativo ? form.niveis.filter((n) => n !== nivel) : NIVEIS.filter((n) => n === nivel || form.niveis.includes(n)))}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm transition",
                      ativo ? "border-[#5f2ebe] bg-[#5f2ebe] text-white" : "border-slate-200 text-slate-600 hover:border-[#5f2ebe]/40"
                    )}
                  >
                    {ativo && <Check className="h-3.5 w-3.5" />}
                    {nivel.replace("Ensino ", "")}
                  </button>
                );
              })}
            </div>
          </CardLateral>

          <CardLateral
            titulo="Abrangência"
            icone={<MapPin className="h-4 w-4 text-slate-400" />}
            acao={
              form.estados.length > 0 ? (
                <button type="button" onClick={() => set("estados", [])} className="text-xs text-slate-400 hover:text-red-600">
                  Limpar
                </button>
              ) : undefined
            }
          >
            <div className="grid grid-cols-2 gap-2">
              {(["Nacional", "Federal"] as Estado[]).map((e) => {
                const ativo = form.estados.includes(e);
                return (
                  <button
                    key={e}
                    type="button"
                    aria-pressed={ativo}
                    onClick={() => alternarEstado(e)}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-sm font-medium transition",
                      ativo ? "border-[#5f2ebe] bg-[#5f2ebe] text-white" : "border-slate-200 text-slate-600 hover:border-[#5f2ebe]/40"
                    )}
                  >
                    {e}
                  </button>
                );
              })}
            </div>
            <div className="space-y-2.5">
              {REGIOES_UF.map((regiao) => {
                const todas = regiao.ufs.every((u) => form.estados.includes(u));
                return (
                  <div key={regiao.nome}>
                    <button
                      type="button"
                      onClick={() => alternarRegiao(regiao.ufs)}
                      className={cn("mb-1 text-[11px] font-semibold uppercase tracking-wide", todas ? "text-[#5f2ebe]" : "text-slate-400 hover:text-slate-600")}
                      title={todas ? `Desmarcar ${regiao.nome}` : `Marcar todo o ${regiao.nome}`}
                    >
                      {regiao.nome}
                    </button>
                    <div className="flex flex-wrap gap-1">
                      {regiao.ufs.map((uf) => {
                        const ativo = form.estados.includes(uf);
                        return (
                          <button
                            key={uf}
                            type="button"
                            aria-pressed={ativo}
                            onClick={() => alternarEstado(uf)}
                            className={cn(
                              "h-8 w-10 rounded-md border text-xs font-medium tabular-nums transition",
                              ativo ? "border-[#5f2ebe] bg-[#5f2ebe] text-white" : "border-slate-200 text-slate-600 hover:border-[#5f2ebe]/40"
                            )}
                          >
                            {uf}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className={cn(erros.estados ? "text-amber-600" : "text-slate-400")}>
                {erros.estados ? erros.estados : `${form.estados.length} selecionado(s)`}
              </span>
              <button
                type="button"
                onClick={() => set("estados", form.estados.length >= UFS.length ? [] : Array.from(new Set([...form.estados, ...UFS])))}
                className="font-medium text-[#5f2ebe] hover:underline"
              >
                {UFS.every((u) => form.estados.includes(u)) ? "Desmarcar UFs" : "Todas as UFs"}
              </button>
            </div>
          </CardLateral>
        </aside>
      </form>
    </div>
  );
};

export default FormularioConcurso;
