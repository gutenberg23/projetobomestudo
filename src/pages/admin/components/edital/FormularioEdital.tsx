import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BarChart3,
  BookOpen,
  ChevronDown,
  Edit,
  ExternalLink,
  FileText,
  Loader2,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import {
  atualizarEdital,
  criarEdital,
  CursoResumo,
  DisciplinaEdital,
  EditalVerticalizado,
  linkDoCurso,
  temFiltro,
} from "@/services/editalAdminService";
import { CardLateral } from "@/pages/admin/posts/components/formulario/CardLateral";
import { chave } from "../questoes/utils";
import { SeletorCurso } from "./SeletorCurso";

interface FormularioEditalProps {
  edital?: EditalVerticalizado;
  editais: EditalVerticalizado[];
  disciplinas: DisciplinaEdital[];
  cursos: CursoResumo[];
  /** Falso enquanto o editor de uma disciplina está aberto por cima. */
  visivel: boolean;
  /** Disciplina recém-criada a partir deste edital, para entrar na lista. */
  disciplinaNova?: string;
  onVoltar: () => void;
  onSalvo: (e: EditalVerticalizado, novo: boolean) => void;
  onExcluir?: (e: EditalVerticalizado) => void;
  onAbrirEdital: (id: string) => void;
  onEditarDisciplina: (id: string, tituloEdital: string) => void;
  onNovaDisciplina: (tituloEdital: string) => void;
}

const contarTopicos = (d?: DisciplinaEdital) => (d ? d.topicos.filter((t) => t.nome.trim()).length : 0);
const contarQuestoes = (d?: DisciplinaEdital) => (d ? d.topicos.reduce((s, t) => s + (temFiltro(t.filtros) ? t.quantidade : 0), 0) : 0);
const semQuestoes = (d?: DisciplinaEdital) => (d ? d.topicos.filter((t) => t.nome.trim() && !temFiltro(t.filtros) && !t.link.trim()).length : 0);

/** Editor do edital verticalizado: curso, situação e disciplinas na ordem em que aparecem. */
export const FormularioEdital: React.FC<FormularioEditalProps> = ({
  edital,
  editais,
  disciplinas,
  cursos,
  visivel,
  disciplinaNova,
  onVoltar,
  onSalvo,
  onExcluir,
  onAbrirEdital,
  onEditarDisciplina,
  onNovaDisciplina,
}) => {
  const [salvo, setSalvo] = useState<EditalVerticalizado | undefined>(edital);
  const editando = !!salvo;
  const [titulo, setTitulo] = useState(edital?.titulo || "");
  const [cursoId, setCursoId] = useState(edital?.cursoId || "");
  const [ativo, setAtivo] = useState(edital?.ativo ?? true);
  const [ids, setIds] = useState<string[]>(edital?.disciplinasIds || []);
  const [abertas, setAbertas] = useState<Set<string>>(new Set());
  const [busca, setBusca] = useState("");
  const [adicionando, setAdicionando] = useState(!edital?.disciplinasIds.length);
  const [salvando, setSalvando] = useState(false);
  const [erros, setErros] = useState<{ titulo?: boolean; curso?: boolean }>({});

  const inicial = useRef(JSON.stringify({ titulo, cursoId, ativo, ids }));
  const alterado = JSON.stringify({ titulo, cursoId, ativo, ids }) !== inicial.current;

  const porId = useMemo(() => new Map(disciplinas.map((d) => [d.id, d])), [disciplinas]);
  const curso = cursos.find((c) => c.id === cursoId);

  // Cursos que já têm outro edital (o site mostra só um edital por curso)
  const ocupados = useMemo(
    () => Object.fromEntries(editais.filter((e) => e.id !== salvo?.id && e.ativo).map((e) => [e.cursoId, e.titulo || "sem título"])),
    [editais, salvo?.id]
  );
  // Outro edital ativo no mesmo curso: o site mostra só o mais recente
  const conflito = cursoId && ativo ? editais.find((e) => e.id !== salvo?.id && e.cursoId === cursoId && e.ativo) : undefined;

  useEffect(() => {
    if (disciplinaNova) setIds((l) => (l.includes(disciplinaNova) ? l : [...l, disciplinaNova]));
  }, [disciplinaNova]);

  // Sugere o título a partir do curso quando ainda está vazio
  const escolherCurso = (id: string) => {
    setCursoId(id);
    setErros((e) => ({ ...e, curso: false }));
    const c = cursos.find((x) => x.id === id);
    if (c && !titulo.trim()) setTitulo(c.titulo);
  };

  const mover = (i: number, dir: -1 | 1) =>
    setIds((l) => {
      const j = i + dir;
      if (j < 0 || j >= l.length) return l;
      const n = [...l];
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });

  const disponiveis = useMemo(() => {
    const termo = chave(busca);
    const usadas = new Set(ids);
    return disciplinas
      .filter((d) => !usadas.has(d.id) && (!termo || chave(d.titulo).includes(termo) || chave(d.descricao).includes(termo)))
      .slice(0, 60);
  }, [disciplinas, ids, busca]);

  const usoPorDisciplina = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of editais) for (const id of e.disciplinasIds) m.set(id, (m.get(id) || 0) + 1);
    return m;
  }, [editais]);

  const salvar = async () => {
    const novosErros = { titulo: !titulo.trim(), curso: !cursoId };
    setErros(novosErros);
    if (novosErros.titulo || novosErros.curso) {
      toast({ title: novosErros.curso ? "Escolha o curso do edital" : "Dê um título ao edital", variant: "destructive" });
      return;
    }
    setSalvando(true);
    try {
      const dados = { titulo, cursoId, ativo, disciplinasIds: ids.filter((id) => porId.has(id)) };
      const e = salvo ? await atualizarEdital(salvo.id, dados) : await criarEdital(dados);
      inicial.current = JSON.stringify({ titulo: e.titulo, cursoId: e.cursoId, ativo: e.ativo, ids: e.disciplinasIds });
      setIds(e.disciplinasIds);
      setTitulo(e.titulo);
      toast({ title: salvo ? "Edital salvo" : "Edital criado" });
      onSalvo(e, !salvo);
      setSalvo(e);
    } catch (err) {
      toast({ title: "Não foi possível salvar o edital", description: (err as Error).message, variant: "destructive" });
    } finally {
      setSalvando(false);
    }
  };

  const salvarRef = useRef(salvar);
  salvarRef.current = salvar;
  useEffect(() => {
    if (!visivel) return;
    const atalho = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        salvarRef.current();
      }
    };
    window.addEventListener("keydown", atalho);
    return () => window.removeEventListener("keydown", atalho);
  }, [visivel]);

  const voltar = () => {
    if (alterado && !window.confirm("Sair sem salvar? As alterações neste edital serão perdidas.")) return;
    onVoltar();
  };

  const escolhidas = ids.map((id) => ({ id, d: porId.get(id) }));
  const totalTopicos = escolhidas.reduce((s, x) => s + contarTopicos(x.d), 0);
  const totalQuestoes = escolhidas.reduce((s, x) => s + contarQuestoes(x.d), 0);
  const totalSemQuestoes = escolhidas.reduce((s, x) => s + semQuestoes(x.d), 0);
  const nomeParaVoltar = titulo.trim() || "Edital";

  return (
    <div className="-mx-4 -mt-6 md:-mx-8">
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="flex h-14 items-center gap-2 px-4 md:px-8">
          <Button type="button" variant="ghost" size="sm" onClick={voltar} className="-ml-2 gap-1 text-slate-600">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Editais</span>
          </Button>
          <span className="h-5 w-px bg-slate-200" aria-hidden />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-base font-semibold text-slate-900">{editando ? titulo || "Editar edital" : "Novo edital verticalizado"}</h2>
            <p className={cn("truncate text-xs", alterado ? "text-amber-600" : "text-slate-400")}>
              {alterado ? "Alterações não salvas" : editando ? "Tudo salvo" : "Ainda não salvo"}
              <span className="hidden text-slate-400 md:inline"> · Ctrl+S salva</span>
            </p>
          </div>
          <Button type="button" variant="ghost" onClick={voltar} className="hidden text-slate-600 lg:inline-flex">
            Cancelar
          </Button>
          <Button type="button" onClick={salvar} disabled={salvando} className="gap-1.5 bg-[#ea2be2] text-white hover:bg-[#d029d5]">
            {salvando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {salvando ? "Salvando..." : editando ? "Salvar" : "Criar edital"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 px-4 py-5 md:px-8 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-4">
          <CardLateral titulo="Edital" icone={<FileText className="h-4 w-4 text-[#5f2ebe]" />}>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="edital-curso" className="text-xs font-medium text-slate-600">
                  Curso <span className="text-red-500">*</span>
                </Label>
                <SeletorCurso id="edital-curso" cursos={cursos} valor={cursoId} onChange={escolherCurso} ocupados={ocupados} invalido={erros.curso} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edital-titulo" className="text-xs font-medium text-slate-600">
                  Título <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edital-titulo"
                  value={titulo}
                  onChange={(e) => {
                    setTitulo(e.target.value);
                    setErros((x) => ({ ...x, titulo: false }));
                  }}
                  placeholder="Ex.: Polícia Federal 2025 — Agente"
                  className={cn("h-10", erros.titulo && "border-red-300 ring-1 ring-red-200")}
                />
              </div>
            </div>
            {conflito && (
              <div className="flex flex-col gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 sm:flex-row sm:items-center">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <p className="flex-1">
                  Esse curso já tem o edital ativo <strong>“{conflito.titulo || "sem título"}”</strong>. O aluno vê só um edital por curso
                  (o ativo mais recente). Desative um dos dois, ou use este como rascunho deixando-o inativo.
                </p>
                <Button type="button" size="sm" variant="outline" onClick={() => onAbrirEdital(conflito.id)} className="h-7 bg-white text-xs">
                  Abrir esse edital
                </Button>
              </div>
            )}
          </CardLateral>

          <CardLateral
            titulo={`Disciplinas (${ids.length})`}
            descricao="Na ordem em que aparecem para o aluno. Abra uma disciplina para ver os tópicos."
            icone={<BookOpen className="h-4 w-4 text-[#5f2ebe]" />}
          >
            {escolhidas.length === 0 ? (
              <p className="rounded-lg bg-slate-50 px-3 py-4 text-center text-sm text-slate-500">Nenhuma disciplina ainda. Adicione abaixo.</p>
            ) : (
              <ol className="space-y-1.5">
                {escolhidas.map(({ id, d }, i) => {
                  const aberta = abertas.has(id);
                  const sem = semQuestoes(d);
                  return (
                    <li key={id} className={cn("rounded-lg border bg-white", aberta ? "border-[#5f2ebe]/40" : "border-slate-200")}>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 px-2 py-2 sm:px-3">
                        <span className="w-6 shrink-0 text-right text-xs tabular-nums text-slate-400">{i + 1}.</span>
                        <button
                          type="button"
                          disabled={!d}
                          onClick={() =>
                            setAbertas((s) => {
                              const n = new Set(s);
                              if (n.has(id)) n.delete(id);
                              else n.add(id);
                              return n;
                            })
                          }
                          aria-expanded={aberta}
                          className="flex min-w-[12rem] flex-1 items-center gap-2 text-left"
                        >
                          <span className="min-w-0 flex-1">
                            <span className={cn("block truncate text-sm font-medium", d ? "text-slate-900" : "text-red-600")}>
                              {d ? d.titulo || "Disciplina sem nome" : "Disciplina excluída"}
                            </span>
                            <span className="block truncate text-xs text-slate-500">
                              {d ? (
                                <>
                                  {contarTopicos(d)} tópicos · {contarQuestoes(d).toLocaleString("pt-BR")} questões
                                  {sem > 0 && <span className="text-amber-600"> · {sem} sem questões</span>}
                                  {d.descricao && <span className="text-slate-400"> · {d.descricao}</span>}
                                </>
                              ) : (
                                "Será tirada do edital ao salvar"
                              )}
                            </span>
                          </span>
                          {d && <ChevronDown className={cn("h-4 w-4 shrink-0 text-slate-400 transition-transform", aberta && "rotate-180")} />}
                        </button>
                        <div className="ml-auto flex shrink-0 items-center">
                          <Button type="button" variant="ghost" size="icon" disabled={i === 0} onClick={() => mover(i, -1)} aria-label="Subir" className="h-8 w-8 text-slate-500">
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={i === ids.length - 1}
                            onClick={() => mover(i, 1)}
                            aria-label="Descer"
                            className="h-8 w-8 text-slate-500"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          {d && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => onEditarDisciplina(id, nomeParaVoltar)}
                              aria-label={`Editar ${d.titulo}`}
                              title="Editar tópicos e filtros"
                              className="h-8 w-8 text-slate-500 hover:text-[#5f2ebe]"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setIds((l) => l.filter((x) => x !== id))}
                            aria-label="Tirar do edital"
                            title="Tirar do edital (a disciplina continua cadastrada)"
                            className="h-8 w-8 text-slate-500 hover:text-red-600"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {aberta && d && (
                        <div className="border-t border-slate-100 bg-slate-50/60 px-3 py-2 sm:pl-11">
                          <ol className="space-y-0.5 text-xs">
                            {d.topicos
                              .filter((t) => t.nome.trim())
                              .map((t, j) => {
                                const ok = temFiltro(t.filtros) || t.link.trim();
                                return (
                                  <li key={t.chave} className="flex gap-2">
                                    <span className="w-5 shrink-0 text-right tabular-nums text-slate-400">{j + 1}.</span>
                                    <span className="min-w-0 flex-1 truncate text-slate-700">{t.nome}</span>
                                    <span className={cn("shrink-0 tabular-nums", ok ? "text-slate-500" : "text-amber-600")}>
                                      {temFiltro(t.filtros) ? `${t.quantidade.toLocaleString("pt-BR")} quest.` : t.link.trim() ? "link" : "sem questões"}
                                    </span>
                                  </li>
                                );
                              })}
                          </ol>
                          <button
                            type="button"
                            onClick={() => onEditarDisciplina(id, nomeParaVoltar)}
                            className="mt-2 text-xs font-medium text-[#5f2ebe] hover:underline"
                          >
                            Editar tópicos e filtros
                          </button>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>
            )}

            {adicionando ? (
              <div className="space-y-2 rounded-lg border border-[#5f2ebe]/20 bg-[#faf8ff] p-3">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      placeholder="Buscar disciplina cadastrada..."
                      aria-label="Buscar disciplina para adicionar"
                      className="h-9 bg-white pl-8"
                    />
                  </div>
                  {ids.length > 0 && (
                    <Button type="button" size="sm" variant="ghost" onClick={() => setAdicionando(false)} className="h-9">
                      Fechar
                    </Button>
                  )}
                </div>
                <ul className="max-h-72 divide-y divide-slate-100 overflow-y-auto rounded-md border border-slate-200 bg-white">
                  {disponiveis.length === 0 ? (
                    <li className="px-3 py-3 text-center text-xs text-slate-500">
                      {disciplinas.length === 0 ? "Nenhuma disciplina cadastrada ainda." : "Nenhuma disciplina encontrada."}
                    </li>
                  ) : (
                    disponiveis.map((d) => (
                      <li key={d.id}>
                        <button
                          type="button"
                          onClick={() => setIds((l) => [...l, d.id])}
                          className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-[#faf8ff]"
                        >
                          <Plus className="h-4 w-4 shrink-0 text-[#5f2ebe]" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm text-slate-800">{d.titulo || "Disciplina sem nome"}</span>
                            <span className="block truncate text-xs text-slate-500">
                              {contarTopicos(d)} tópicos
                              {d.descricao && ` · ${d.descricao}`}
                              {usoPorDisciplina.get(d.id) ? ` · em ${usoPorDisciplina.get(d.id)} ${usoPorDisciplina.get(d.id) === 1 ? "edital" : "editais"}` : ""}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))
                  )}
                </ul>
                <button
                  type="button"
                  onClick={() => onNovaDisciplina(nomeParaVoltar)}
                  className="text-xs font-medium text-[#5f2ebe] hover:underline"
                >
                  + Criar uma disciplina nova para este edital
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <Button type="button" size="sm" variant="outline" onClick={() => setAdicionando(true)} className="h-8 gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> Adicionar disciplina
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => onNovaDisciplina(nomeParaVoltar)} className="h-8 gap-1.5 text-slate-600">
                  Criar disciplina nova
                </Button>
              </div>
            )}
          </CardLateral>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-[72px] lg:self-start">
          <CardLateral titulo="Situação">
            <label className="flex items-start justify-between gap-3">
              <span>
                <span className="block text-sm font-medium text-slate-800">{ativo ? "Ativo" : "Inativo"}</span>
                <span className="block text-xs text-slate-500">
                  {ativo ? "Aparece na aba Edital da página do curso." : "Fica escondido dos alunos até você ativar."}
                </span>
              </span>
              <Switch checked={ativo} onCheckedChange={setAtivo} aria-label="Edital ativo" />
            </label>
            {curso && (
              <a
                href={linkDoCurso(curso)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-[#5f2ebe] hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Ver o curso no site
              </a>
            )}
          </CardLateral>

          <CardLateral titulo="Resumo" icone={<BarChart3 className="h-4 w-4 text-[#5f2ebe]" />}>
            <dl className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <dt className="text-xs text-slate-500">Disciplinas</dt>
                <dd className="text-lg font-semibold tabular-nums text-slate-900">{ids.length}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Tópicos</dt>
                <dd className="text-lg font-semibold tabular-nums text-slate-900">{totalTopicos}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Questões</dt>
                <dd className="text-lg font-semibold tabular-nums text-slate-900">{totalQuestoes.toLocaleString("pt-BR")}</dd>
              </div>
            </dl>
            {totalSemQuestoes > 0 && (
              <p className="text-xs text-amber-700">
                {totalSemQuestoes} {totalSemQuestoes === 1 ? "tópico está" : "tópicos estão"} sem questões. Edite a disciplina para escolher os
                filtros.
              </p>
            )}
            <p className="text-[11px] text-slate-400">
              As disciplinas são compartilhadas: editar uma aqui muda todos os editais que a usam.
            </p>
          </CardLateral>

          {editando && onExcluir && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => onExcluir(salvo!)}
              className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Excluir edital
            </Button>
          )}
        </aside>
      </div>
    </div>
  );
};
