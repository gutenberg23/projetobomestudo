import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  ClipboardPaste,
  FileText,
  ListChecks,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { Facetas } from "@/services/questoesAdminService";
import {
  atualizarDisciplina,
  contarQuestoes,
  criarDisciplina,
  DisciplinaEdital,
  EditalVerticalizado,
  FILTRO_VAZIO,
  montarLinkQuestoes,
  novaChave,
  separarTopicosColados,
  temFiltro,
  TopicoEdital,
} from "@/services/editalAdminService";
import { CardLateral } from "@/pages/admin/posts/components/formulario/CardLateral";
import { CampoEscolhaMultipla } from "../questoes/CampoEscolha";
import { chave } from "../questoes/utils";
import { EditorTopico, EstadoContagem } from "./EditorTopico";

interface FormularioDisciplinaProps {
  disciplina?: DisciplinaEdital;
  editais: EditalVerticalizado[];
  facetas: Facetas;
  carregandoFacetas: boolean;
  /** Texto do botão de voltar (ex.: nome do edital de onde veio). */
  rotuloVoltar: string;
  onVoltar: () => void;
  onSalva: (d: DisciplinaEdital, nova: boolean) => void;
  onExcluir?: (d: DisciplinaEdital) => void;
}

const novoTopico = (nome = ""): TopicoEdital => ({ chave: novaChave(), nome, link: "", filtros: { ...FILTRO_VAZIO }, quantidade: 0 });

const linkDe = (t: TopicoEdital) => (temFiltro(t.filtros) ? montarLinkQuestoes(t.filtros) : "");

/** Editor de uma disciplina do edital: dados, tópicos e os filtros de questões de cada tópico. */
export const FormularioDisciplina: React.FC<FormularioDisciplinaProps> = ({
  disciplina,
  editais,
  facetas,
  carregandoFacetas,
  rotuloVoltar,
  onVoltar,
  onSalva,
  onExcluir,
}) => {
  const editando = !!disciplina;
  const [titulo, setTitulo] = useState(disciplina?.titulo || "");
  const [descricao, setDescricao] = useState(disciplina?.descricao || "");
  const [topicos, setTopicos] = useState<TopicoEdital[]>(() => (disciplina?.topicos.length ? disciplina.topicos : [novoTopico()]));
  const [abertos, setAbertos] = useState<Set<string>>(new Set());
  const [contagens, setContagens] = useState<Record<string, EstadoContagem>>({});
  const [focar, setFocar] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erroTitulo, setErroTitulo] = useState(false);

  // Link para o qual cada tópico foi contado (evita contar de novo ao salvar)
  const contadoPara = useRef<Record<string, string>>(
    Object.fromEntries((disciplina?.topicos || []).map((t) => [t.chave, linkDe(t)]))
  );

  // Ferramentas em massa
  const [painel, setPainel] = useState<"colar" | "disciplina" | null>(null);
  const [textoColado, setTextoColado] = useState("");
  const [disciplinaEmMassa, setDisciplinaEmMassa] = useState<string[]>([]);

  const inicial = useRef(JSON.stringify({ titulo, descricao, topicos: topicos.map(({ chave: _c, ...r }) => r) }));
  const atual = JSON.stringify({ titulo, descricao, topicos: topicos.map(({ chave: _c, ...r }) => r) });
  const alterado = atual !== inicial.current;

  const usadaEm = useMemo(() => (disciplina ? editais.filter((e) => e.disciplinasIds.includes(disciplina.id)) : []), [disciplina, editais]);

  // O progresso do aluno é guardado pela posição do tópico: avisa se algum tópico antigo mudou de lugar
  const chavesOriginais = useRef((disciplina?.topicos || []).map((t) => t.chave));
  const posicoesMudaram = editando && chavesOriginais.current.some((c, i) => topicos[i]?.chave !== c);

  const colados = useMemo(() => separarTopicosColados(textoColado), [textoColado]);

  const assuntoPorChave = useMemo(() => new Map(facetas.assuntos.map((a) => [chave(a), a])), [facetas.assuntos]);

  /* ------------------------------------------------------------ edição */

  const mudar = (t: TopicoEdital) => setTopicos((l) => l.map((x) => (x.chave === t.chave ? t : x)));

  const alternar = (c: string) =>
    setAbertos((s) => {
      const n = new Set(s);
      if (n.has(c)) n.delete(c);
      else n.add(c);
      return n;
    });

  const inserirDepois = (indice: number) => {
    const t = novoTopico();
    setTopicos((l) => [...l.slice(0, indice + 1), t, ...l.slice(indice + 1)]);
    setFocar(t.chave);
  };

  const mover = (indice: number, dir: -1 | 1) =>
    setTopicos((l) => {
      const j = indice + dir;
      if (j < 0 || j >= l.length) return l;
      const n = [...l];
      [n[indice], n[j]] = [n[j], n[indice]];
      return n;
    });

  const duplicar = (indice: number) =>
    setTopicos((l) => {
      const o = l[indice];
      const c = { ...o, chave: novaChave(), filtros: { ...o.filtros } };
      contadoPara.current[c.chave] = contadoPara.current[o.chave];
      return [...l.slice(0, indice + 1), c, ...l.slice(indice + 1)];
    });

  const remover = (indice: number) => setTopicos((l) => (l.length === 1 ? [novoTopico()] : l.filter((_, i) => i !== indice)));

  const contar = useCallback(async (t: TopicoEdital): Promise<number | null> => {
    if (!temFiltro(t.filtros)) return null;
    setContagens((c) => ({ ...c, [t.chave]: "contando" }));
    try {
      const n = await contarQuestoes(t.filtros);
      contadoPara.current[t.chave] = montarLinkQuestoes(t.filtros);
      setTopicos((l) => l.map((x) => (x.chave === t.chave ? { ...x, quantidade: n } : x)));
      setContagens((c) => ({ ...c, [t.chave]: undefined }));
      return n;
    } catch {
      setContagens((c) => ({ ...c, [t.chave]: "erro" }));
      return null;
    }
  }, []);

  /** Conta as questões dos tópicos (só os que mudaram, a não ser que `todos`). */
  const contarVarios = async (lista: TopicoEdital[], todos: boolean) => {
    const pendentes = lista.filter((t) => temFiltro(t.filtros) && (todos || contadoPara.current[t.chave] !== montarLinkQuestoes(t.filtros)));
    const resultado = new Map<string, number>();
    for (let i = 0; i < pendentes.length; i += 6) {
      const lote = pendentes.slice(i, i + 6);
      const ns = await Promise.all(lote.map(contar));
      lote.forEach((t, j) => ns[j] !== null && resultado.set(t.chave, ns[j] as number));
    }
    return resultado;
  };

  /* --------------------------------------------------------- em massa */

  const aplicarColados = (modo: "adicionar" | "substituir") => {
    if (!colados.length) return;
    const novos = colados.map((n) => novoTopico(n));
    setTopicos((l) => {
      const vazios = l.every((t) => !t.nome.trim() && !temFiltro(t.filtros) && !t.link);
      return modo === "substituir" || vazios ? novos : [...l, ...novos];
    });
    setTextoColado("");
    setPainel(null);
    toast({ title: `${novos.length} ${novos.length === 1 ? "tópico adicionado" : "tópicos adicionados"}` });
  };

  const aplicarDisciplinaEmMassa = () => {
    setTopicos((l) => l.map((t) => ({ ...t, filtros: { ...t.filtros, disciplinas: [...disciplinaEmMassa] } })));
    toast({ title: "Disciplina aplicada a todos os tópicos", description: "Clique em “Recontar questões” para atualizar os números." });
    setPainel(null);
  };

  /** Para tópicos sem assunto, usa o assunto do banco de questões que tem o mesmo nome. */
  const preencherAssuntos = () => {
    let n = 0;
    const nova = topicos.map((t) => {
      if (t.filtros.assuntos.length || !t.nome.trim()) return t;
      const achado = assuntoPorChave.get(chave(t.nome.replace(/[.;:]+$/, "")));
      if (!achado) return t;
      n++;
      return { ...t, filtros: { ...t.filtros, assuntos: [achado] } };
    });
    setTopicos(nova);
    toast({
      title: n ? `Assunto preenchido em ${n} ${n === 1 ? "tópico" : "tópicos"}` : "Nenhum tópico com o mesmo nome de um assunto",
      description: n ? "Confira e clique em “Recontar questões”." : "Escolha os assuntos abrindo os filtros de cada tópico.",
    });
  };

  /* ------------------------------------------------------------ salvar */

  const salvar = async () => {
    if (!titulo.trim()) {
      setErroTitulo(true);
      document.getElementById("disciplina-titulo")?.focus();
      toast({ title: "Dê um nome à disciplina", variant: "destructive" });
      return;
    }
    const semNome = topicos.findIndex((t) => !t.nome.trim() && (temFiltro(t.filtros) || t.link.trim()));
    if (semNome >= 0) {
      setFocar(topicos[semNome].chave);
      toast({ title: `O tópico ${semNome + 1} tem filtros mas está sem nome`, variant: "destructive" });
      return;
    }
    setSalvando(true);
    try {
      const contados = await contarVarios(topicos, false);
      const finais = topicos.map((t) => (contados.has(t.chave) ? { ...t, quantidade: contados.get(t.chave)! } : t));
      const dados = { titulo, descricao, topicos: finais };
      const salva = editando ? await atualizarDisciplina(disciplina!.id, dados) : await criarDisciplina(dados);
      inicial.current = JSON.stringify({ titulo: salva.titulo, descricao: salva.descricao, topicos: salva.topicos.map(({ chave: _c, ...r }) => r) });
      toast({ title: editando ? "Disciplina salva" : "Disciplina criada" });
      onSalva(salva, !editando);
    } catch (e) {
      toast({ title: "Não foi possível salvar a disciplina", description: (e as Error).message, variant: "destructive" });
    } finally {
      setSalvando(false);
    }
  };

  const salvarRef = useRef(salvar);
  salvarRef.current = salvar;
  useEffect(() => {
    const atalho = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        salvarRef.current();
      }
    };
    window.addEventListener("keydown", atalho);
    return () => window.removeEventListener("keydown", atalho);
  }, []);

  const voltar = () => {
    if (alterado && !window.confirm("Sair sem salvar? As alterações nesta disciplina serão perdidas.")) return;
    onVoltar();
  };

  /* ------------------------------------------------------------ resumo */

  const comNome = topicos.filter((t) => t.nome.trim());
  const comFiltro = comNome.filter((t) => temFiltro(t.filtros)).length;
  const comLink = comNome.filter((t) => !temFiltro(t.filtros) && t.link.trim()).length;
  const semNada = comNome.length - comFiltro - comLink;
  const totalQuestoes = comNome.reduce((s, t) => s + (temFiltro(t.filtros) ? t.quantidade : 0), 0);
  const todosAbertos = topicos.length > 0 && topicos.every((t) => abertos.has(t.chave));

  return (
    <div className="-mx-4 -mt-6 md:-mx-8">
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="flex h-14 items-center gap-2 px-4 md:px-8">
          <Button type="button" variant="ghost" size="sm" onClick={voltar} className="-ml-2 gap-1 text-slate-600">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden max-w-[12rem] truncate sm:inline">{rotuloVoltar}</span>
          </Button>
          <span className="h-5 w-px bg-slate-200" aria-hidden />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-base font-semibold text-slate-900">{editando ? titulo || "Editar disciplina" : "Nova disciplina"}</h2>
            <p className={cn("truncate text-xs", alterado ? "text-amber-600" : "text-slate-400")}>
              {alterado ? "Alterações não salvas" : editando ? "Tudo salvo" : "Ainda não salva"}
              <span className="hidden text-slate-400 md:inline"> · Ctrl+S salva</span>
            </p>
          </div>
          <Button type="button" variant="ghost" onClick={voltar} className="hidden text-slate-600 lg:inline-flex">
            Cancelar
          </Button>
          <Button type="button" onClick={salvar} disabled={salvando} className="gap-1.5 bg-[#ea2be2] text-white hover:bg-[#d029d5]">
            {salvando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {salvando ? "Salvando..." : editando ? "Salvar" : "Criar disciplina"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 px-4 py-5 md:px-8 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-4">
          <CardLateral titulo="Disciplina" icone={<FileText className="h-4 w-4 text-[#5f2ebe]" />}>
            <div className="space-y-1.5">
              <Label htmlFor="disciplina-titulo" className="text-xs font-medium text-slate-600">
                Nome <span className="text-red-500">*</span>
              </Label>
              <Input
                id="disciplina-titulo"
                value={titulo}
                onChange={(e) => {
                  setTitulo(e.target.value);
                  setErroTitulo(false);
                }}
                placeholder="Ex.: Direito Constitucional"
                aria-invalid={erroTitulo || undefined}
                className={cn(erroTitulo && "border-red-300 ring-1 ring-red-200")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="disciplina-descricao" className="text-xs font-medium text-slate-600">
                Descrição <span className="font-normal text-slate-400">(opcional, só aparece aqui no admin)</span>
              </Label>
              <Input
                id="disciplina-descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Ex.: versão do edital PF 2025"
              />
            </div>
          </CardLateral>

          <CardLateral
            titulo={`Tópicos (${comNome.length})`}
            descricao="Na ordem do edital. Abra um tópico para escolher as questões que o aluno vai resolver nele."
            icone={<ListChecks className="h-4 w-4 text-[#5f2ebe]" />}
            acao={
              topicos.length > 1 ? (
                <button
                  type="button"
                  onClick={() => setAbertos(todosAbertos ? new Set() : new Set(topicos.map((t) => t.chave)))}
                  className="shrink-0 text-xs font-medium text-slate-500 hover:text-slate-800"
                >
                  {todosAbertos ? "Recolher todos" : "Abrir todos"}
                </button>
              ) : undefined
            }
          >
            <div className="flex flex-wrap gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => inserirDepois(topicos.length - 1)} className="h-8 gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Tópico
              </Button>
              <Button
                type="button"
                size="sm"
                variant={painel === "colar" ? "secondary" : "outline"}
                onClick={() => setPainel(painel === "colar" ? null : "colar")}
                className="h-8 gap-1.5"
              >
                <ClipboardPaste className="h-3.5 w-3.5" /> Colar do edital
              </Button>
              <Button
                type="button"
                size="sm"
                variant={painel === "disciplina" ? "secondary" : "outline"}
                onClick={() => setPainel(painel === "disciplina" ? null : "disciplina")}
                className="h-8 gap-1.5"
              >
                <Wand2 className="h-3.5 w-3.5" /> Disciplina para todos
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={preencherAssuntos} disabled={carregandoFacetas} className="h-8 gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> Assunto pelo nome
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={async () => {
                  const r = await contarVarios(topicos, true);
                  toast({ title: r.size ? `Questões recontadas em ${r.size} ${r.size === 1 ? "tópico" : "tópicos"}` : "Nenhum tópico com filtro" });
                }}
                disabled={Object.values(contagens).includes("contando")}
                className="h-8 gap-1.5 text-slate-600"
              >
                <RefreshCw className={cn("h-3.5 w-3.5", Object.values(contagens).includes("contando") && "animate-spin")} /> Recontar questões
              </Button>
            </div>

            {painel === "colar" && (
              <div className="space-y-2 rounded-lg border border-[#5f2ebe]/20 bg-[#faf8ff] p-3">
                <Label htmlFor="colar-topicos" className="text-xs font-medium text-slate-700">
                  Cole o conteúdo programático da disciplina
                </Label>
                <Textarea
                  id="colar-topicos"
                  value={textoColado}
                  onChange={(e) => setTextoColado(e.target.value)}
                  rows={6}
                  autoFocus
                  placeholder={"1. Princípios fundamentais. 2. Direitos e garantias fundamentais. 3. Organização do Estado.\n\nUm por linha, numerado ou separado por ponto e vírgula."}
                  className="bg-white text-sm"
                />
                {colados.length > 0 && (
                  <div className="max-h-40 overflow-y-auto rounded-md border border-slate-200 bg-white px-3 py-2">
                    <p className="mb-1 text-xs font-medium text-slate-500">
                      {colados.length} {colados.length === 1 ? "tópico encontrado" : "tópicos encontrados"}
                    </p>
                    <ol className="list-decimal space-y-0.5 pl-5 text-xs text-slate-700">
                      {colados.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ol>
                  </div>
                )}
                <div className="flex flex-wrap justify-end gap-2">
                  <Button type="button" size="sm" variant="ghost" onClick={() => setPainel(null)} className="h-8">
                    Cancelar
                  </Button>
                  {comNome.length > 0 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={!colados.length}
                      onClick={() => {
                        if (editando && usadaEm.length && !window.confirm("Substituir todos os tópicos? O progresso dos alunos nesta disciplina ficará desalinhado."))
                          return;
                        aplicarColados("substituir");
                      }}
                      className="h-8"
                    >
                      Substituir os {comNome.length}
                    </Button>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    variant="flat"
                    disabled={!colados.length}
                    onClick={() => aplicarColados("adicionar")}
                    className="h-8 bg-[#5f2ebe] text-sm tracking-normal text-white hover:bg-[#4a2396]"
                  >
                    Adicionar {colados.length || ""} ao fim
                  </Button>
                </div>
              </div>
            )}

            {painel === "disciplina" && (
              <div className="space-y-2 rounded-lg border border-[#5f2ebe]/20 bg-[#faf8ff] p-3">
                <Label htmlFor="disciplina-massa" className="text-xs font-medium text-slate-700">
                  Disciplina do banco de questões para todos os tópicos (substitui a de cada um)
                </Label>
                <CampoEscolhaMultipla
                  id="disciplina-massa"
                  valores={disciplinaEmMassa}
                  onChange={setDisciplinaEmMassa}
                  opcoes={facetas.disciplinas}
                  sugeridas={facetas.disciplinas.filter((d) => titulo.trim() && chave(d).includes(chave(titulo)))}
                  rotuloSugeridas="Parecidas com o nome"
                  permitirNovo={false}
                  placeholder={carregandoFacetas ? "Carregando..." : "Escolha a disciplina"}
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" size="sm" variant="ghost" onClick={() => setPainel(null)} className="h-8">
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="flat"
                    onClick={aplicarDisciplinaEmMassa}
                    className="h-8 bg-[#5f2ebe] text-sm tracking-normal text-white hover:bg-[#4a2396]"
                  >
                    {disciplinaEmMassa.length ? "Aplicar a todos" : "Tirar a disciplina de todos"}
                  </Button>
                </div>
              </div>
            )}

            {posicoesMudaram && (
              <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  Você mudou a ordem ou removeu tópicos que já existiam. O progresso dos alunos (marcações, revisões e questões feitas) é
                  guardado pela posição do tópico, então ele vai aparecer no tópico que ficar no lugar. Para incluir algo novo sem afetar
                  ninguém, adicione no fim.
                </p>
              </div>
            )}

            <ol className="space-y-1.5">
              {topicos.map((t, i) => (
                <EditorTopico
                  key={t.chave}
                  topico={t}
                  indice={i}
                  total={topicos.length}
                  aberto={abertos.has(t.chave)}
                  facetas={facetas}
                  contagem={contagens[t.chave]}
                  filtrosAnteriores={topicos[i - 1]?.filtros}
                  onAlternar={() => alternar(t.chave)}
                  onChange={mudar}
                  onContar={() => contar(topicos.find((x) => x.chave === t.chave) || t)}
                  onMover={(d) => mover(i, d)}
                  onDuplicar={() => duplicar(i)}
                  onRemover={() => remover(i)}
                  onEnter={() => inserirDepois(i)}
                  autoFocus={focar === t.chave}
                />
              ))}
            </ol>
            <button
              type="button"
              onClick={() => inserirDepois(topicos.length - 1)}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 py-2 text-xs font-medium text-slate-500 transition-colors hover:border-[#5f2ebe]/50 hover:text-[#5f2ebe]"
            >
              <Plus className="h-3.5 w-3.5" /> Adicionar tópico <span className="font-normal text-slate-400">(ou Enter no último)</span>
            </button>
          </CardLateral>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-[72px] lg:self-start">
          <CardLateral titulo="Resumo" icone={<BarChart3 className="h-4 w-4 text-[#5f2ebe]" />}>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs text-slate-500">Tópicos</dt>
                <dd className="text-lg font-semibold tabular-nums text-slate-900">{comNome.length}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Questões</dt>
                <dd className="text-lg font-semibold tabular-nums text-slate-900">{totalQuestoes.toLocaleString("pt-BR")}</dd>
              </div>
            </dl>
            <ul className="space-y-1 text-xs">
              <li className="flex justify-between text-slate-600">
                <span>Com filtro de questões</span> <span className="tabular-nums">{comFiltro}</span>
              </li>
              {comLink > 0 && (
                <li className="flex justify-between text-slate-600">
                  <span>Com link manual</span> <span className="tabular-nums">{comLink}</span>
                </li>
              )}
              <li className={cn("flex justify-between", semNada ? "text-amber-700" : "text-slate-600")}>
                <span>Sem questões</span> <span className="tabular-nums">{semNada}</span>
              </li>
            </ul>
            <p className="text-[11px] text-slate-400">
              A quantidade de questões de cada tópico também calcula a “importância” que o aluno vê no edital.
            </p>
          </CardLateral>

          <CardLateral titulo="Onde é usada">
            {usadaEm.length ? (
              <ul className="space-y-1 text-sm text-slate-700">
                {usadaEm.map((e) => (
                  <li key={e.id} className="truncate">
                    • {e.titulo || "Edital sem título"}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">{editando ? "Nenhum edital usa esta disciplina ainda." : "Depois de criar, adicione a disciplina a um edital."}</p>
            )}
            {usadaEm.length > 1 && <p className="text-[11px] text-slate-500">As mudanças valem para todos esses editais.</p>}
          </CardLateral>

          {editando && onExcluir && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => onExcluir(disciplina!)}
              className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Excluir disciplina
            </Button>
          )}
        </aside>
      </div>
    </div>
  );
};
