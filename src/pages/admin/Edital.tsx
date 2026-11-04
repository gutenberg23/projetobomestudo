import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  BookOpen,
  Copy,
  Edit,
  ExternalLink,
  FileStack,
  ListChecks,
  Loader2,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { carregarFacetas, Facetas, FACETAS_VAZIAS } from "@/services/questoesAdminService";
import {
  criarDisciplina,
  CursoResumo,
  definirAtivoEdital,
  DisciplinaEdital,
  EditalVerticalizado,
  excluirDisciplina,
  excluirEdital,
  linkDoCurso,
  listarCursos,
  listarDisciplinas,
  listarEditais,
  temFiltro,
} from "@/services/editalAdminService";
import { FormularioEdital } from "./components/edital/FormularioEdital";
import { FormularioDisciplina } from "./components/edital/FormularioDisciplina";
import { chave, dataCurta } from "./components/questoes/utils";

type Aba = "editais" | "disciplinas";
type FiltroDisciplinas = "todas" | "sem-edital" | "pendentes";

/** Disciplina aberta no editor; `voltar` é o texto do botão de voltar. */
type EditorDisciplina = { id?: string; voltar: string; doEdital: boolean };

interface Confirmacao {
  titulo: string;
  descricao: React.ReactNode;
  acao: string;
  executar: () => Promise<void>;
}

const topicosValidos = (d: DisciplinaEdital) => d.topicos.filter((t) => t.nome.trim());
const semQuestoes = (d: DisciplinaEdital) => topicosValidos(d).filter((t) => !temFiltro(t.filtros) && !t.link.trim()).length;
const questoesDe = (d: DisciplinaEdital) => d.topicos.reduce((s, t) => s + (temFiltro(t.filtros) ? t.quantidade : 0), 0);

const EditalPage: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const [editais, setEditais] = useState<EditalVerticalizado[]>([]);
  const [disciplinas, setDisciplinas] = useState<DisciplinaEdital[]>([]);
  const [cursos, setCursos] = useState<CursoResumo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [facetas, setFacetas] = useState<Facetas>(FACETAS_VAZIAS);
  const [carregandoFacetas, setCarregandoFacetas] = useState(false);
  const [facetasPedidas, setFacetasPedidas] = useState(false);

  const [aba, setAba] = useState<Aba>(params.get("aba") === "disciplinas" ? "disciplinas" : "editais");
  const [busca, setBusca] = useState("");
  const [filtroDisciplinas, setFiltroDisciplinas] = useState<FiltroDisciplinas>("todas");

  // Telas: lista → editor de edital → (por cima) editor de disciplina
  const [edital, setEdital] = useState<{ id?: string; versao: number } | null>(() => {
    const e = params.get("edital");
    return e ? { id: e === "novo" ? undefined : e, versao: 0 } : null;
  });
  const [disciplina, setDisciplina] = useState<EditorDisciplina | null>(() => {
    const d = params.get("disciplina");
    return d ? { id: d === "nova" ? undefined : d, voltar: "Disciplinas", doEdital: false } : null;
  });
  const [disciplinaNova, setDisciplinaNova] = useState<string>();
  const [confirmacao, setConfirmacao] = useState<Confirmacao | null>(null);
  const [confirmando, setConfirmando] = useState(false);
  const [alternando, setAlternando] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const [e, d, c] = await Promise.all([listarEditais(), listarDisciplinas(), listarCursos()]);
      setEditais(e);
      setDisciplinas(d);
      setCursos(c);
    } catch (err) {
      toast({ title: "Erro ao carregar os editais", description: (err as Error).message, variant: "destructive" });
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // As opções de filtro de questões só são carregadas quando um editor de disciplina abre
  useEffect(() => {
    if (!disciplina || facetasPedidas) return;
    setFacetasPedidas(true);
    setCarregandoFacetas(true);
    carregarFacetas()
      .then(setFacetas, (err) => toast({ title: "Erro ao carregar as opções de filtro", description: (err as Error).message, variant: "destructive" }))
      .finally(() => setCarregandoFacetas(false));
  }, [disciplina, facetasPedidas]);

  // Mantém a URL em dia, para dar para recarregar ou mandar o link
  useEffect(() => {
    const p = new URLSearchParams();
    if (edital) p.set("edital", edital.id || "novo");
    if (disciplina) p.set("disciplina", disciplina.id || "nova");
    if (!edital && !disciplina && aba === "disciplinas") p.set("aba", "disciplinas");
    if (p.toString() !== params.toString()) setParams(p, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edital, disciplina, aba]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [edital?.id, edital?.versao, disciplina]);

  /* ------------------------------------------------------- derivados */

  const cursoPorId = useMemo(() => new Map(cursos.map((c) => [c.id, c])), [cursos]);
  const disciplinaPorId = useMemo(() => new Map(disciplinas.map((d) => [d.id, d])), [disciplinas]);
  // Editais ativos por curso (o aluno vê só o ativo mais recente)
  const editaisPorCurso = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of editais) if (e.ativo) m.set(e.cursoId, (m.get(e.cursoId) || 0) + 1);
    return m;
  }, [editais]);
  const editaisPorDisciplina = useMemo(() => {
    const m = new Map<string, EditalVerticalizado[]>();
    for (const e of editais) for (const id of e.disciplinasIds) m.set(id, [...(m.get(id) || []), e]);
    return m;
  }, [editais]);

  const totalTopicos = useMemo(() => disciplinas.reduce((s, d) => s + topicosValidos(d).length, 0), [disciplinas]);
  const totalSemQuestoes = useMemo(() => disciplinas.reduce((s, d) => s + semQuestoes(d), 0), [disciplinas]);

  const termo = chave(busca);
  const editaisFiltrados = useMemo(
    () =>
      editais.filter((e) => {
        if (!termo) return true;
        const c = cursoPorId.get(e.cursoId);
        return chave(e.titulo).includes(termo) || chave(c?.titulo || "").includes(termo);
      }),
    [editais, termo, cursoPorId]
  );
  const disciplinasFiltradas = useMemo(
    () =>
      disciplinas
        .filter((d) => {
          if (filtroDisciplinas === "sem-edital" && editaisPorDisciplina.has(d.id)) return false;
          if (filtroDisciplinas === "pendentes" && !semQuestoes(d)) return false;
          if (!termo) return true;
          return chave(d.titulo).includes(termo) || chave(d.descricao).includes(termo) || d.topicos.some((t) => chave(t.nome).includes(termo));
        })
        .sort((a, b) => a.titulo.localeCompare(b.titulo, "pt-BR")),
    [disciplinas, termo, filtroDisciplinas, editaisPorDisciplina]
  );

  /* ---------------------------------------------------------- ações */

  const alternarAtivo = async (e: EditalVerticalizado) => {
    setAlternando(e.id);
    try {
      await definirAtivoEdital(e.id, !e.ativo);
      setEditais((l) => l.map((x) => (x.id === e.id ? { ...x, ativo: !e.ativo } : x)));
      toast({ title: e.ativo ? "Edital desativado" : "Edital ativado", description: e.ativo ? "Os alunos não veem mais este edital." : "O edital aparece na página do curso." });
    } catch (err) {
      toast({ title: "Não foi possível mudar a situação", description: (err as Error).message, variant: "destructive" });
    } finally {
      setAlternando(null);
    }
  };

  const pedirExclusaoEdital = (e: EditalVerticalizado) =>
    setConfirmacao({
      titulo: `Excluir o edital “${e.titulo || "sem título"}”?`,
      descricao: (
        <>
          O edital sai da página do curso. As disciplinas continuam cadastradas e podem ser usadas em outro edital. O progresso já
          marcado pelos alunos fica guardado e volta se você criar um edital para o mesmo curso com as mesmas disciplinas.
        </>
      ),
      acao: "Excluir edital",
      executar: async () => {
        await excluirEdital(e.id);
        setEditais((l) => l.filter((x) => x.id !== e.id));
        if (edital?.id === e.id) setEdital(null);
        toast({ title: "Edital excluído" });
      },
    });

  const pedirExclusaoDisciplina = (d: DisciplinaEdital) => {
    const usos = editaisPorDisciplina.get(d.id) || [];
    setConfirmacao({
      titulo: `Excluir a disciplina “${d.titulo || "sem nome"}”?`,
      descricao: usos.length ? (
        <>
          Ela será tirada de {usos.length === 1 ? "um edital" : `${usos.length} editais`}: <strong>{usos.map((e) => e.titulo).join(", ")}</strong>. Os alunos
          deixam de ver os tópicos dela. Não tem como desfazer.
        </>
      ) : (
        "Nenhum edital usa esta disciplina. Não tem como desfazer."
      ),
      acao: "Excluir disciplina",
      executar: async () => {
        await excluirDisciplina(d.id, editais);
        setDisciplinas((l) => l.filter((x) => x.id !== d.id));
        setEditais((l) => l.map((e) => ({ ...e, disciplinasIds: e.disciplinasIds.filter((x) => x !== d.id) })));
        if (disciplina?.id === d.id) setDisciplina(null);
        toast({ title: "Disciplina excluída" });
      },
    });
  };

  const duplicarDisciplina = async (d: DisciplinaEdital) => {
    try {
      const nova = await criarDisciplina({ titulo: `${d.titulo} (cópia)`, descricao: d.descricao, topicos: d.topicos });
      setDisciplinas((l) => [nova, ...l]);
      toast({ title: "Disciplina duplicada", description: "A cópia não está em nenhum edital ainda." });
      setDisciplina({ id: nova.id, voltar: "Disciplinas", doEdital: false });
    } catch (err) {
      toast({ title: "Não foi possível duplicar", description: (err as Error).message, variant: "destructive" });
    }
  };

  const executarConfirmacao = async () => {
    if (!confirmacao) return;
    setConfirmando(true);
    try {
      await confirmacao.executar();
      setConfirmacao(null);
    } catch (err) {
      toast({ title: "Não foi possível concluir", description: (err as Error).message, variant: "destructive" });
    } finally {
      setConfirmando(false);
    }
  };

  const dialogoConfirmacao = (
    <Dialog open={!!confirmacao} onOpenChange={(v) => !v && !confirmando && setConfirmacao(null)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{confirmacao?.titulo}</DialogTitle>
          <DialogDescription asChild>
            <div className="text-sm text-slate-600">{confirmacao?.descricao}</div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setConfirmacao(null)} disabled={confirmando}>
            Cancelar
          </Button>
          <Button variant="flat" onClick={executarConfirmacao} disabled={confirmando} className="bg-red-600 text-sm tracking-normal hover:bg-red-700">
            {confirmando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmacao?.acao}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  /* ---------------------------------------------------------- editores */

  if ((edital || disciplina) && carregando) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const disciplinaAberta = disciplina?.id ? disciplinaPorId.get(disciplina.id) : undefined;
  const editalAberto = edital?.id ? editais.find((e) => e.id === edital.id) : undefined;

  if (edital || disciplina) {
    return (
      <>
        {edital && (
          <div className={cn(disciplina && "hidden")}>
            <FormularioEdital
              key={`edital-${edital.versao}`}
              edital={editalAberto}
              editais={editais}
              disciplinas={disciplinas}
              cursos={cursos}
              visivel={!disciplina}
              disciplinaNova={disciplinaNova}
              onVoltar={() => {
                setEdital(null);
                setDisciplinaNova(undefined);
              }}
              onSalvo={(e, novo) => {
                setEditais((l) => (novo ? [e, ...l] : l.map((x) => (x.id === e.id ? e : x))));
                if (novo) setEdital({ id: e.id, versao: edital.versao });
              }}
              onExcluir={pedirExclusaoEdital}
              onAbrirEdital={(id) => {
                if (!window.confirm("Abrir o outro edital? As alterações não salvas neste serão perdidas.")) return;
                setDisciplinaNova(undefined);
                setEdital({ id, versao: edital.versao + 1 });
              }}
              onEditarDisciplina={(id, voltar) => setDisciplina({ id, voltar, doEdital: true })}
              onNovaDisciplina={(voltar) => setDisciplina({ voltar, doEdital: true })}
            />
          </div>
        )}
        {disciplina && (
          <FormularioDisciplina
            key={disciplina.id || "nova"}
            disciplina={disciplinaAberta}
            editais={editais}
            facetas={facetas}
            carregandoFacetas={carregandoFacetas}
            rotuloVoltar={disciplina.voltar}
            onVoltar={() => setDisciplina(null)}
            onSalva={(d, nova) => {
              setDisciplinas((l) => (nova ? [d, ...l] : l.map((x) => (x.id === d.id ? d : x))));
              if (nova && disciplina.doEdital) setDisciplinaNova(d.id);
              setDisciplina(null);
            }}
            onExcluir={pedirExclusaoDisciplina}
          />
        )}
        {dialogoConfirmacao}
      </>
    );
  }

  /* ------------------------------------------------------------ lista */

  const cartoes = [
    {
      rotulo: "Editais",
      valor: editais.length,
      extra: editais.length ? `${editais.filter((e) => e.ativo).length} ativos` : undefined,
      icone: <FileStack className="h-4 w-4" />,
      ativo: aba === "editais",
      onClick: () => setAba("editais"),
    },
    {
      rotulo: "Disciplinas",
      valor: disciplinas.length,
      icone: <BookOpen className="h-4 w-4" />,
      ativo: aba === "disciplinas" && filtroDisciplinas !== "pendentes",
      onClick: () => {
        setAba("disciplinas");
        setFiltroDisciplinas("todas");
      },
    },
    {
      rotulo: "Tópicos",
      valor: totalTopicos,
      icone: <ListChecks className="h-4 w-4" />,
      ativo: false,
      onClick: () => setAba("disciplinas"),
    },
    {
      rotulo: "Tópicos sem questões",
      valor: totalSemQuestoes,
      icone: <AlertTriangle className="h-4 w-4" />,
      alerta: totalSemQuestoes > 0,
      ativo: aba === "disciplinas" && filtroDisciplinas === "pendentes",
      onClick: () => {
        setAba("disciplinas");
        setFiltroDisciplinas("pendentes");
      },
    },
  ];

  return (
    <div className="space-y-4">
      <AdminPageHeader
        titulo="Edital verticalizado"
        descricao="Monte o edital de cada curso: as disciplinas, os tópicos na ordem da prova e as questões que o aluno resolve em cada tópico."
        acoes={
          <>
            <Button variant="outline" size="icon" onClick={carregar} aria-label="Atualizar dados" title="Atualizar dados">
              <RefreshCw className={cn("h-4 w-4", carregando && "animate-spin")} />
            </Button>
            <Button variant="outline" onClick={() => setDisciplina({ voltar: "Disciplinas", doEdital: false })}>
              <Plus className="mr-2 h-4 w-4" />
              Nova disciplina
            </Button>
            <Button onClick={() => setEdital({ versao: 0 })} className="bg-[#ea2be2] text-white hover:bg-[#d029d5]">
              <Plus className="mr-2 h-4 w-4" />
              Novo edital
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cartoes.map((c) => (
          <button
            key={c.rotulo}
            type="button"
            onClick={c.onClick}
            aria-pressed={c.ativo}
            className={cn(
              "flex items-center gap-3 rounded-xl border bg-white px-4 py-3 text-left shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-colors",
              c.ativo ? "border-[#5f2ebe] ring-1 ring-[#5f2ebe]/30" : "border-slate-200 hover:border-[#5f2ebe]/40"
            )}
          >
            <span className={cn("rounded-lg p-2", c.alerta ? "bg-amber-50 text-amber-600" : c.ativo ? "bg-[#5f2ebe] text-white" : "bg-[#5f2ebe]/[0.07] text-[#5f2ebe]")}>
              {c.icone}
            </span>
            <span className="min-w-0">
              <span className="block text-xl font-bold tabular-nums leading-tight text-slate-900">
                {carregando ? <span className="inline-block h-5 w-10 animate-pulse rounded bg-slate-100" /> : c.valor.toLocaleString("pt-BR")}
              </span>
              <span className="block truncate text-xs text-slate-500">
                {c.rotulo}
                {c.extra && !carregando && <span className="text-slate-400"> · {c.extra}</span>}
              </span>
            </span>
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-3 pt-3 sm:px-4 lg:flex-row lg:items-end lg:justify-between">
          <nav className="-mb-px flex gap-1" aria-label="Seções">
            {(
              [
                { id: "editais", label: "Editais", n: editais.length },
                { id: "disciplinas", label: "Disciplinas", n: disciplinas.length },
              ] as const
            ).map((a) => {
              const ativa = aba === a.id;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setAba(a.id)}
                  aria-current={ativa ? "page" : undefined}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 border-b-2 px-3 pb-2.5 pt-1 text-sm font-medium transition-colors",
                    ativa ? "border-[#5f2ebe] text-[#5f2ebe]" : "border-transparent text-slate-500 hover:text-slate-800"
                  )}
                >
                  {a.label}
                  {!carregando && (
                    <span className={cn("rounded-full px-1.5 text-[11px] tabular-nums", ativa ? "bg-[#5f2ebe]/10" : "bg-slate-100")}>{a.n}</span>
                  )}
                </button>
              );
            })}
          </nav>
          <div className="flex flex-col gap-2 pb-3 sm:flex-row sm:items-center">
            {aba === "disciplinas" && (
              <div className="flex gap-1" role="group" aria-label="Filtrar disciplinas">
                {(
                  [
                    ["todas", "Todas"],
                    ["sem-edital", "Sem edital"],
                    ["pendentes", "Com tópicos sem questões"],
                  ] as const
                ).map(([id, rotulo]) => (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={filtroDisciplinas === id}
                    onClick={() => setFiltroDisciplinas(id)}
                    className={cn(
                      "whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-colors",
                      filtroDisciplinas === id ? "bg-[#5f2ebe] text-white" : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                    )}
                  >
                    {rotulo}
                  </button>
                ))}
              </div>
            )}
            <div className="relative sm:w-64">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder={aba === "editais" ? "Buscar edital ou curso..." : "Buscar disciplina ou tópico..."}
                aria-label="Buscar"
                className="h-9 pl-8 pr-8"
              />
              {busca && (
                <button
                  type="button"
                  onClick={() => setBusca("")}
                  aria-label="Limpar busca"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-slate-700"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {carregando ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : aba === "editais" ? (
          editaisFiltrados.length === 0 ? (
            <Vazio
              titulo={editais.length ? "Nenhum edital encontrado" : "Nenhum edital criado ainda"}
              texto={editais.length ? "Tente outra busca." : "Crie o edital de um curso escolhendo as disciplinas que caem na prova."}
              acao={!editais.length ? { rotulo: "Criar edital", onClick: () => setEdital({ versao: 0 }) } : undefined}
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {editaisFiltrados.map((e) => {
                const c = cursoPorId.get(e.cursoId);
                const ds = e.disciplinasIds.map((id) => disciplinaPorId.get(id)).filter(Boolean) as DisciplinaEdital[];
                const topicos = ds.reduce((s, d) => s + topicosValidos(d).length, 0);
                const pendentes = ds.reduce((s, d) => s + semQuestoes(d), 0);
                const duplicado = e.ativo && (editaisPorCurso.get(e.cursoId) || 0) > 1;
                return (
                  <li key={e.id} className="group flex flex-col gap-3 px-3 py-3 hover:bg-slate-50/60 sm:flex-row sm:items-center sm:px-4">
                    <button type="button" onClick={() => setEdital({ id: e.id, versao: 0 })} className="min-w-0 flex-1 text-left">
                      <span className="flex items-center gap-2">
                        <span className="truncate font-medium text-slate-900 group-hover:text-[#5f2ebe]">{e.titulo || "Edital sem título"}</span>
                        {!e.ativo && <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">Inativo</span>}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-slate-500">
                        {c ? c.titulo || "Curso sem título" : <span className="text-red-600">Curso não encontrado</span>}
                        <span className="text-slate-400">
                          {" "}
                          · {ds.length} {ds.length === 1 ? "disciplina" : "disciplinas"} · {topicos} tópicos
                          {e.createdAt && ` · criado em ${dataCurta(e.createdAt)}`}
                        </span>
                      </span>
                      {(duplicado || pendentes > 0) && (
                        <span className="mt-1 flex flex-wrap gap-1.5">
                          {duplicado && (
                            <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700">
                              Outro edital ativo no mesmo curso: o aluno vê só o mais recente
                            </span>
                          )}
                          {pendentes > 0 && (
                            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                              {pendentes} {pendentes === 1 ? "tópico sem questões" : "tópicos sem questões"}
                            </span>
                          )}
                        </span>
                      )}
                    </button>
                    <div className="flex shrink-0 items-center gap-2">
                      <label className="flex items-center gap-2 text-xs text-slate-500">
                        <Switch checked={e.ativo} disabled={alternando === e.id} onCheckedChange={() => alternarAtivo(e)} aria-label={`${e.ativo ? "Desativar" : "Ativar"} ${e.titulo}`} />
                        <span className="w-10">{e.ativo ? "Ativo" : "Inativo"}</span>
                      </label>
                      <Button type="button" size="sm" variant="outline" onClick={() => setEdital({ id: e.id, versao: 0 })} className="h-8 gap-1.5">
                        <Edit className="h-3.5 w-3.5" /> Editar
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button type="button" variant="ghost" size="icon" aria-label="Mais ações" className="h-8 w-8 text-slate-500">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          {c && (
                            <DropdownMenuItem asChild>
                              <a href={linkDoCurso(c)} target="_blank" rel="noreferrer">
                                <ExternalLink className="mr-2 h-4 w-4" /> Ver curso no site
                              </a>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => pedirExclusaoEdital(e)} className="text-red-600 focus:bg-red-50 focus:text-red-700">
                            <Trash2 className="mr-2 h-4 w-4" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </li>
                );
              })}
            </ul>
          )
        ) : disciplinasFiltradas.length === 0 ? (
          <Vazio
            titulo={disciplinas.length ? "Nenhuma disciplina encontrada" : "Nenhuma disciplina cadastrada"}
            texto={
              disciplinas.length
                ? filtroDisciplinas === "pendentes"
                  ? "Todos os tópicos têm questões."
                  : "Tente outra busca ou filtro."
                : "Cadastre as disciplinas com os tópicos do edital. Elas podem ser usadas em vários editais."
            }
            acao={!disciplinas.length ? { rotulo: "Criar disciplina", onClick: () => setDisciplina({ voltar: "Disciplinas", doEdital: false }) } : undefined}
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {disciplinasFiltradas.map((d) => {
              const usos = editaisPorDisciplina.get(d.id) || [];
              const pendentes = semQuestoes(d);
              const abrir = () => setDisciplina({ id: d.id, voltar: "Disciplinas", doEdital: false });
              return (
                <li key={d.id} className="group flex flex-col gap-3 px-3 py-3 hover:bg-slate-50/60 sm:flex-row sm:items-center sm:px-4">
                  <button type="button" onClick={abrir} className="min-w-0 flex-1 text-left">
                    <span className="block truncate font-medium text-slate-900 group-hover:text-[#5f2ebe]">
                      {d.titulo || "Disciplina sem nome"}
                      {d.descricao && <span className="ml-2 text-xs font-normal text-slate-400">{d.descricao}</span>}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-slate-500">
                      {topicosValidos(d).length} tópicos · {questoesDe(d).toLocaleString("pt-BR")} questões
                      {pendentes > 0 && <span className="text-amber-600"> · {pendentes} sem questões</span>}
                    </span>
                    <span className="mt-1 flex flex-wrap gap-1">
                      {usos.length ? (
                        usos.slice(0, 3).map((e) => (
                          <span key={e.id} className="max-w-[14rem] truncate rounded-full bg-[#5f2ebe]/[0.07] px-2 py-0.5 text-[11px] text-[#4a2396]">
                            {e.titulo || "Edital sem título"}
                          </span>
                        ))
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">Em nenhum edital</span>
                      )}
                      {usos.length > 3 && <span className="px-1 text-[11px] text-slate-500">+{usos.length - 3}</span>}
                    </span>
                  </button>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button type="button" size="sm" variant="outline" onClick={abrir} className="h-8 gap-1.5">
                      <Edit className="h-3.5 w-3.5" /> Editar
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button type="button" variant="ghost" size="icon" aria-label="Mais ações" className="h-8 w-8 text-slate-500">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => duplicarDisciplina(d)}>
                          <Copy className="mr-2 h-4 w-4" /> Duplicar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => pedirExclusaoDisciplina(d)} className="text-red-600 focus:bg-red-50 focus:text-red-700">
                          <Trash2 className="mr-2 h-4 w-4" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {dialogoConfirmacao}
    </div>
  );
};

const Vazio: React.FC<{ titulo: string; texto: string; acao?: { rotulo: string; onClick: () => void } }> = ({ titulo, texto, acao }) => (
  <div className="flex flex-col items-center gap-2 px-4 py-14 text-center">
    <span className="rounded-full bg-[#5f2ebe]/[0.07] p-3 text-[#5f2ebe]">
      <FileStack className="h-6 w-6" />
    </span>
    <p className="font-medium text-slate-700">{titulo}</p>
    <p className="max-w-sm text-sm text-slate-500">{texto}</p>
    {acao && (
      <Button type="button" onClick={acao.onClick} className="mt-2 bg-[#ea2be2] text-white hover:bg-[#d029d5]">
        <Plus className="mr-2 h-4 w-4" /> {acao.rotulo}
      </Button>
    )}
  </div>
);

export default EditalPage;
