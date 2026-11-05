import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Download, Edit, FileUp, Folders, FolderTree, Layers, Lock, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  AbasContagem,
  CaixaSelecao,
  CampoBusca,
  CartoesResumo,
  EstadoVazio,
  Etiqueta,
  FiltrosBarra,
  ListaEsqueleto,
  MenuAcoes,
  PainelListagem,
  RodapePaginacao,
  botaoPrimario,
  normalizar,
  selectClasse,
} from "@/components/admin/ui/listagem";
import { ConfirmarAcao } from "@/components/admin/ui/dialogos";
import { cn } from "@/lib/utils";
import { gerarCsvFlashcards, textoSimples, type Flashcard } from "@/lib/flashcards";
import { useFlashcardsAdmin } from "./components/flashcards/useFlashcardsAdmin";
import { DefinirCursosDialog, FlashcardDialog } from "./components/flashcards/FlashcardDialog";
import { ImportarCsvDialog } from "./components/flashcards/ImportarCsvDialog";

type Aba = "todos" | "todos-cursos" | "restritos" | "fora";
const POR_PAGINA = 25;

const baixarCsv = (nome: string, conteudo: string) => {
  const url = URL.createObjectURL(new Blob([conteudo], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  a.click();
  URL.revokeObjectURL(url);
};

const Flashcards = () => {
  const admin = useFlashcardsAdmin();
  const { cartoes, topicoPorId, cursoPorId, cursosDoTopico, carregando } = admin;

  const [aba, setAba] = useState<Aba>("todos");
  const [busca, setBusca] = useState("");
  const [curso, setCurso] = useState("");
  const [disciplina, setDisciplina] = useState("");
  const [topico, setTopico] = useState("");
  const [pagina, setPagina] = useState(1);
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());

  const [editando, setEditando] = useState<Flashcard | null>(null);
  const [dialogo, setDialogo] = useState<"novo" | "editar" | "importar" | "cursos" | "excluir" | null>(null);
  const [excluindo, setExcluindo] = useState<string[]>([]);

  /** Cursos em que o cartão aparece de fato (tópico no curso + escolha do cartão). */
  const cursosEfetivos = (c: Flashcard) => {
    const doTopico = cursosDoTopico[c.topicoId] || [];
    return c.cursosIds.length === 0 ? doTopico : c.cursosIds.filter((id) => doTopico.includes(id));
  };

  const disciplinas = useMemo(
    () =>
      Array.from(new Set(cartoes.map((c) => topicoPorId.get(c.topicoId)?.disciplina?.trim()).filter(Boolean) as string[])).sort((a, b) =>
        a.localeCompare(b, "pt-BR")
      ),
    [cartoes, topicoPorId]
  );
  const topicosComCartoes = useMemo(() => {
    const ids = new Set(cartoes.map((c) => c.topicoId));
    return admin.topicos.filter((t) => ids.has(t.id) && (!disciplina || t.disciplina.trim() === disciplina));
  }, [cartoes, admin.topicos, disciplina]);

  const base = useMemo(() => {
    const termo = normalizar(busca.trim());
    return cartoes.filter((c) => {
      const t = topicoPorId.get(c.topicoId);
      if (topico && c.topicoId !== topico) return false;
      if (disciplina && (t?.disciplina || "").trim() !== disciplina) return false;
      if (curso && !cursosEfetivos(c).includes(curso)) return false;
      if (termo && !normalizar(`${textoSimples(c.frente)} ${textoSimples(c.verso)} ${c.tags.join(" ")} ${t?.nome || ""}`).includes(termo)) return false;
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartoes, busca, curso, disciplina, topico, topicoPorId, cursosDoTopico]);

  const passa = (c: Flashcard, a: Aba) => {
    if (a === "todos-cursos") return c.cursosIds.length === 0;
    if (a === "restritos") return c.cursosIds.length > 0;
    if (a === "fora") return cursosEfetivos(c).length === 0;
    return true;
  };

  const contagens = useMemo(() => {
    const n: Record<Aba, number> = { todos: 0, "todos-cursos": 0, restritos: 0, fora: 0 };
    base.forEach((c) => (Object.keys(n) as Aba[]).forEach((a) => passa(c, a) && n[a]++));
    return n;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base]);

  // Mais novos primeiro
  const filtrados = useMemo(() => base.filter((c) => passa(c, aba)).reverse(), [base, aba]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => setPagina(1), [busca, curso, disciplina, topico, aba]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const visiveis = filtrados.slice((paginaAtual - 1) * POR_PAGINA, paginaAtual * POR_PAGINA);
  const todosPagina = visiveis.length > 0 && visiveis.every((c) => selecionados.has(c.id));
  const algunsPagina = visiveis.some((c) => selecionados.has(c.id));

  const alternar = (id: string) =>
    setSelecionados((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const resumo = useMemo(() => {
    const topicos = new Set(cartoes.map((c) => c.topicoId)).size;
    const cursos = new Set(cartoes.flatMap((c) => cursosEfetivos(c))).size;
    return { topicos, cursos, restritos: cartoes.filter((c) => c.cursosIds.length > 0).length };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartoes, cursosDoTopico]);

  const filtroAtivo = !!(busca || curso || disciplina || topico);
  const limparFiltros = () => {
    setBusca("");
    setCurso("");
    setDisciplina("");
    setTopico("");
    setAba("todos");
  };

  const exportar = (lista: Flashcard[]) => {
    if (lista.length === 0) return;
    baixarCsv(`flashcards-${new Date().toISOString().slice(0, 10)}.csv`, gerarCsvFlashcards(lista));
  };

  const etiquetaCursos = (c: Flashcard) => {
    const efetivos = cursosEfetivos(c);
    if (efetivos.length === 0)
      return (
        <Etiqueta tom="ambar" title="O tópico não está em nenhum dos cursos escolhidos (ou em nenhum curso)">
          Fora dos cursos
        </Etiqueta>
      );
    const nomes = efetivos.map((id) => cursoPorId.get(id)?.titulo || id).join(", ");
    return c.cursosIds.length === 0 ? (
      <Etiqueta tom="verde" title={nomes}>
        Todos ({efetivos.length})
      </Etiqueta>
    ) : (
      <Etiqueta tom="azul" title={nomes}>
        <Lock className="h-3 w-3" />
        {efetivos.length === 1 ? cursoPorId.get(efetivos[0])?.titulo || "1 curso" : `${efetivos.length} cursos`}
      </Etiqueta>
    );
  };

  const ABAS = [
    { id: "todos" as const, label: "Todos", n: contagens.todos },
    { id: "todos-cursos" as const, label: "Em todos os cursos do tópico", n: contagens["todos-cursos"] },
    { id: "restritos" as const, label: "Só em cursos escolhidos", n: contagens.restritos },
    { id: "fora" as const, label: "Fora dos cursos", n: contagens.fora },
  ];

  const idsSelecionados = Array.from(selecionados);

  return (
    <div className="space-y-4">
      <AdminPageHeader
        titulo="Flashcards"
        descricao="Cartões de pergunta e resposta ligados aos tópicos. Aparecem na aba Flashcards dos cursos e como botão abaixo do vídeo."
        acoes={
          <>
            <Button variant="outline" onClick={() => exportar(filtrados)} disabled={filtrados.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
            <Button variant="outline" onClick={() => setDialogo("importar")} disabled={admin.semMigration || carregando}>
              <FileUp className="mr-2 h-4 w-4" />
              Importar CSV
            </Button>
            <Button
              onClick={() => {
                setEditando(null);
                setDialogo("novo");
              }}
              disabled={admin.semMigration || carregando}
              className={botaoPrimario}
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo flashcard
            </Button>
          </>
        }
      />

      {admin.semMigration && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            As tabelas de flashcards ainda não existem. Rode a migration <code className="rounded bg-white/70 px-1">20251112000000_flashcards.sql</code> no SQL
            Editor do Supabase e recarregue a página.
          </p>
        </div>
      )}

      <CartoesResumo
        carregando={carregando}
        itens={[
          { rotulo: "Flashcards", valor: cartoes.length.toLocaleString("pt-BR"), icone: Layers },
          { rotulo: "Tópicos com flashcards", valor: resumo.topicos.toLocaleString("pt-BR"), icone: FolderTree, tom: "rosa" },
          { rotulo: "Cursos com flashcards", valor: resumo.cursos.toLocaleString("pt-BR"), icone: Folders, tom: "verde" },
          { rotulo: "Restritos a cursos", valor: resumo.restritos.toLocaleString("pt-BR"), icone: Lock, tom: "cinza" },
        ]}
      />

      <PainelListagem
        empilhada
        barra={
          <>
            <AbasContagem<Aba> abas={ABAS} ativa={aba} onChange={setAba} rotulo="Filtrar por cursos" />
            <FiltrosBarra className="flex-wrap">
              <select value={curso} onChange={(e) => setCurso(e.target.value)} className={cn(selectClasse, "sm:max-w-[13rem]")} aria-label="Filtrar por curso">
                <option value="">Todos os cursos</option>
                {admin.cursos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.titulo}
                  </option>
                ))}
              </select>
              <select
                value={disciplina}
                onChange={(e) => {
                  setDisciplina(e.target.value);
                  setTopico("");
                }}
                className={cn(selectClasse, "sm:max-w-[12rem]")}
                aria-label="Filtrar por disciplina"
              >
                <option value="">Todas as disciplinas</option>
                {disciplinas.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <select value={topico} onChange={(e) => setTopico(e.target.value)} className={cn(selectClasse, "sm:max-w-[13rem]")} aria-label="Filtrar por tópico">
                <option value="">Todos os tópicos</option>
                {topicosComCartoes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nome}
                  </option>
                ))}
              </select>
              <CampoBusca valor={busca} onChange={setBusca} placeholder="Buscar na frente, verso ou tags" rotulo="Buscar flashcards" className="sm:w-auto sm:flex-1" />
            </FiltrosBarra>
          </>
        }
        rodape={
          !carregando && (
            <RodapePaginacao
              pagina={paginaAtual}
              porPagina={POR_PAGINA}
              total={filtrados.length}
              onPagina={setPagina}
              singular="flashcard"
              plural="flashcards"
              extra={filtrados.length !== cartoes.length ? ` (de ${cartoes.length.toLocaleString("pt-BR")})` : ""}
            />
          )
        }
      >
        {selecionados.size > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-b border-[#5f2ebe]/15 bg-[#5f2ebe]/[0.04] px-3 py-2 text-sm sm:px-4">
            <span className="font-medium text-[#5f2ebe]">
              {selecionados.size} {selecionados.size === 1 ? "selecionado" : "selecionados"}
            </span>
            <span className="flex-1" />
            <Button size="sm" variant="outline" onClick={() => setDialogo("cursos")}>
              <Folders className="mr-1.5 h-4 w-4" />
              Definir cursos
            </Button>
            <Button size="sm" variant="outline" onClick={() => exportar(cartoes.filter((c) => selecionados.has(c.id)))}>
              <Download className="mr-1.5 h-4 w-4" />
              Exportar
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-red-600 hover:text-red-700"
              onClick={() => {
                setExcluindo(idsSelecionados);
                setDialogo("excluir");
              }}
            >
              <Trash2 className="mr-1.5 h-4 w-4" />
              Excluir
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelecionados(new Set())} aria-label="Limpar seleção">
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {carregando ? (
          <ListaEsqueleto icone={false} linhas={8} />
        ) : visiveis.length === 0 ? (
          <EstadoVazio
            icone={Layers}
            titulo={filtroAtivo || aba !== "todos" ? "Nenhum flashcard encontrado" : "Nenhum flashcard cadastrado"}
            texto={
              filtroAtivo || aba !== "todos"
                ? "Tente outra busca, outra aba ou limpe os filtros."
                : "Crie cartões aqui, importe um arquivo .csv (como o do Anki) ou adicione direto no formulário de um tópico."
            }
            acao={
              filtroAtivo || aba !== "todos" ? (
                <Button variant="outline" size="sm" onClick={limparFiltros}>
                  Limpar filtros
                </Button>
              ) : (
                !admin.semMigration && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setDialogo("importar")}>
                      <FileUp className="mr-1.5 h-4 w-4" /> Importar CSV
                    </Button>
                    <Button size="sm" onClick={() => setDialogo("novo")} className={botaoPrimario}>
                      <Plus className="mr-1.5 h-4 w-4" /> Novo flashcard
                    </Button>
                  </div>
                )
              )
            }
          />
        ) : (
          <>
            <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/60 px-3 py-2 text-xs font-medium text-slate-500 sm:px-4">
              <CaixaSelecao
                marcado={todosPagina ? true : algunsPagina ? "indeterminado" : false}
                onChange={() =>
                  setSelecionados((s) => {
                    const n = new Set(s);
                    visiveis.forEach((c) => (todosPagina ? n.delete(c.id) : n.add(c.id)));
                    return n;
                  })
                }
                rotulo="Selecionar a página"
              />
              <span className="flex-1">Cartão</span>
              <span className="hidden w-56 md:block">Tópico</span>
              <span className="hidden w-32 sm:block">Cursos</span>
              <span className="w-8" />
            </div>
            <ul className="divide-y divide-slate-100">
              {visiveis.map((c) => {
                const t = topicoPorId.get(c.topicoId);
                const sel = selecionados.has(c.id);
                return (
                  <li key={c.id} className={cn("flex items-center gap-3 px-3 py-3 sm:px-4", sel ? "bg-[#5f2ebe]/[0.04]" : "hover:bg-[#faf8ff]")}>
                    <CaixaSelecao marcado={sel} onChange={() => alternar(c.id)} rotulo="Selecionar cartão" />
                    <button
                      type="button"
                      onClick={() => {
                        setEditando(c);
                        setDialogo("editar");
                      }}
                      className="min-w-0 flex-1 text-left"
                    >
                      <p className="line-clamp-2 text-sm font-medium text-slate-900">{textoSimples(c.frente)}</p>
                      <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{textoSimples(c.verso)}</p>
                      <p className="mt-1 truncate text-[11px] text-slate-400 md:hidden">{t?.nome || "Tópico removido"}</p>
                      {c.tags.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {c.tags.slice(0, 4).map((tag) => (
                            <span key={tag} className="rounded bg-slate-100 px-1.5 text-[10px] text-slate-500">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </button>
                    <div className="hidden w-56 min-w-0 md:block">
                      <p className="truncate text-sm text-slate-700">{t?.nome || "Tópico removido"}</p>
                      <p className="truncate text-xs text-slate-400">{t?.disciplina}</p>
                    </div>
                    <div className="hidden w-32 sm:block">{etiquetaCursos(c)}</div>
                    <MenuAcoes
                      acoes={[
                        {
                          label: "Editar",
                          icone: Edit,
                          onClick: () => {
                            setEditando(c);
                            setDialogo("editar");
                          },
                        },
                        {
                          label: "Em quais cursos aparece",
                          icone: Folders,
                          onClick: () => {
                            setSelecionados(new Set([c.id]));
                            setDialogo("cursos");
                          },
                        },
                        {
                          label: "Ver só este tópico",
                          icone: FolderTree,
                          onClick: () => {
                            setDisciplina("");
                            setTopico(c.topicoId);
                          },
                        },
                        {
                          label: "Excluir",
                          icone: Trash2,
                          perigo: true,
                          separadorAntes: true,
                          onClick: () => {
                            setExcluindo([c.id]);
                            setDialogo("excluir");
                          },
                        },
                      ]}
                    />
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </PainelListagem>

      <FlashcardDialog
        aberto={dialogo === "novo" || dialogo === "editar"}
        onFechar={() => setDialogo(null)}
        cartao={dialogo === "editar" ? editando : null}
        topicoInicial={topico || null}
        admin={admin}
      />

      <ImportarCsvDialog aberto={dialogo === "importar"} onFechar={() => setDialogo(null)} admin={admin} topicoInicial={topico || null} />

      <DefinirCursosDialog
        aberto={dialogo === "cursos"}
        onFechar={() => setDialogo(null)}
        ids={idsSelecionados}
        admin={admin}
        onConcluido={() => setSelecionados(new Set())}
      />

      <ConfirmarAcao
        aberto={dialogo === "excluir"}
        onFechar={() => setDialogo(null)}
        titulo={excluindo.length === 1 ? "Excluir este flashcard?" : `Excluir ${excluindo.length} flashcards?`}
        descricao="Essa ação não pode ser desfeita. O progresso dos alunos nesses cartões também é apagado."
        textoConfirmar="Excluir"
        onConfirmar={async () => {
          if (await admin.excluir(excluindo)) {
            setSelecionados((s) => {
              const n = new Set(s);
              excluindo.forEach((id) => n.delete(id));
              return n;
            });
          }
        }}
      />
    </div>
  );
};

export default Flashcards;
