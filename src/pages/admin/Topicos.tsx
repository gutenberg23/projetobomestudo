import { useEffect, useMemo, useState } from "react";
import { ListTree, Plus } from "lucide-react";
import { toast } from "sonner";
import { TopicosTable, AdicionarAula, EditTopicoModal } from "./components/topicos";
import { AdminPageHeader, FluxoConteudo } from "@/components/admin/AdminPageHeader";
import { useTopicosState, useTopicosActions } from "./components/topicos/hooks";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Topico, TopicoFormValues, topicoFormVazio } from "./components/topicos/TopicosTypes";
import { TopicoFormFields } from "./components/topicos/TopicoFormFields";
import {
  AbasContagem,
  CampoBusca,
  EstadoVazio,
  FiltrosBarra,
  ListaEsqueleto,
  PainelListagem,
  RodapePaginacao,
  botaoPrimario,
  normalizar,
  selectClasse,
} from "@/components/admin/ui/listagem";
import { ConfirmarAcao } from "@/components/admin/ui/dialogos";
import { materiaisDoTopico } from "./components/topicos/TopicosTable";
import { cn } from "@/lib/utils";
import { AVISO_MIGRATION, faltaMigration, salvarFlashcardsDoTopico } from "@/lib/flashcards";

type Aba = "todos" | "sem-video" | "sem-texto" | "sem-questoes" | "incompletos";

const POR_PAGINA = 20;

const juntar = (v: string | string[]) => (Array.isArray(v) ? v.join(",") : v);

/** Linha do banco → tópico da tela. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const linhaParaTopico = (row: any): Topico => ({
  id: row.id,
  titulo: row.nome,
  thumbnail: "",
  patrocinador: row.patrocinador || "",
  disciplina: row.disciplina,
  videoUrl: row.video_url || "",
  pdfUrl: row.pdf_url || "",
  teoriaId: row.teoria_id || null,
  mapaUrl: row.mapa_url || "",
  resumoUrl: row.resumo_url || "",
  musicaUrl: row.musica_url ? row.musica_url.split(",").filter(Boolean) : [],
  resumoAudioUrl: row.resumo_audio_url ? row.resumo_audio_url.split(",").filter(Boolean) : [],
  cadernoQuestoesUrl: row.caderno_questoes_url || "",
  questoesIds: row.questoes_ids || [],
  professor_id: row.professor_id || "",
  professor_nome: row.professor_nome || "",
  selecionado: false,
  abrirEmNovaGuia: row.abrir_em_nova_guia,
});

/** Tópico do formulário → colunas do banco. */
const paraColunas = (t: TopicoFormValues) => ({
  nome: t.titulo.trim(),
  patrocinador: t.patrocinador,
  disciplina: t.disciplina.trim(),
  questoes_ids: t.questoesIds,
  professor_id: t.professor_id || null,
  professor_nome: t.professor_id ? t.professor_nome : "",
  video_url: t.videoUrl,
  pdf_url: t.pdfUrl,
  // teoria_id só é enviado quando há teoria escolhida
  ...(t.teoriaId ? { teoria_id: t.teoriaId } : {}),
  mapa_url: t.mapaUrl,
  resumo_url: t.resumoUrl,
  musica_url: juntar(t.musicaUrl),
  resumo_audio_url: juntar(t.resumoAudioUrl),
  caderno_questoes_url: t.cadernoQuestoesUrl,
  abrir_em_nova_guia: t.abrirEmNovaGuia,
});

const Topicos = () => {
  const {
    topicos,
    setTopicos,
    loading,
    tituloNovaAula,
    setTituloNovaAula,
    descricaoNovaAula,
    setDescricaoNovaAula,
    isOpenEdit,
    setIsOpenEdit,
    isOpenDelete,
    setIsOpenDelete,
    currentTopico,
    setCurrentTopico,
  } = useTopicosState();

  const [busca, setBusca] = useState("");
  const [disciplina, setDisciplina] = useState("");
  const [professor, setProfessor] = useState("");
  const [aba, setAba] = useState<Aba>("todos");
  const [pagina, setPagina] = useState(1);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTopico, setNewTopico] = useState<TopicoFormValues>(topicoFormVazio());
  const [salvando, setSalvando] = useState(false);

  const { handleSelecaoTopico, openEditModal, openDeleteModal, handleSaveTopico, handleDeleteTopico, handleAdicionarAula } =
    useTopicosActions(topicos, setTopicos, setIsOpenEdit, setIsOpenDelete, setCurrentTopico, setTituloNovaAula, setDescricaoNovaAula);

  // Disciplinas e professores já usados (filtros e autocompletar)
  const disciplinasSugeridas = useMemo(
    () =>
      Array.from(new Set(topicos.map((t) => (t.disciplina || "").trim()).filter(Boolean))).sort((a, b) =>
        a.localeCompare(b, "pt-BR")
      ),
    [topicos]
  );
  const professores = useMemo(
    () =>
      Array.from(new Set(topicos.map((t) => (t.professor_nome || "").trim()).filter(Boolean))).sort((a, b) =>
        a.localeCompare(b, "pt-BR")
      ),
    [topicos]
  );

  // Filtros que não dependem da aba, para as contagens das abas
  const baseFiltrada = useMemo(() => {
    const termo = normalizar(busca.trim());
    return topicos.filter((t) => {
      if (disciplina && (t.disciplina || "").trim() !== disciplina) return false;
      if (professor && (t.professor_nome || "").trim() !== professor) return false;
      if (termo && !normalizar(`${t.titulo} ${t.disciplina} ${t.professor_nome} ${t.id}`).includes(termo)) return false;
      return true;
    });
  }, [topicos, busca, disciplina, professor]);

  const passaAba = (t: Topico, a: Aba) => {
    if (a === "sem-video") return !t.videoUrl;
    if (a === "sem-texto") return !t.teoriaId && !t.pdfUrl;
    if (a === "sem-questoes") return t.questoesIds.length === 0;
    if (a === "incompletos") return materiaisDoTopico(t).some((m) => !m.ok);
    return true;
  };

  const contagens = useMemo(() => {
    const c: Record<Aba, number> = { todos: 0, "sem-video": 0, "sem-texto": 0, "sem-questoes": 0, incompletos: 0 };
    for (const t of baseFiltrada) (Object.keys(c) as Aba[]).forEach((a) => passaAba(t, a) && c[a]++);
    return c;
  }, [baseFiltrada]);

  const filtrados = useMemo(() => baseFiltrada.filter((t) => passaAba(t, aba)), [baseFiltrada, aba]);

  useEffect(() => setPagina(1), [busca, disciplina, professor, aba]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const visiveis = filtrados.slice((paginaAtual - 1) * POR_PAGINA, paginaAtual * POR_PAGINA);
  const todosSelecionados = visiveis.length > 0 && visiveis.every((t) => t.selecionado);
  const algunsSelecionados = visiveis.some((t) => t.selecionado);

  const selecionarPagina = () => {
    const ids = new Set(visiveis.map((t) => t.id));
    setTopicos((lista) => lista.map((t) => (ids.has(t.id) ? { ...t, selecionado: !todosSelecionados } : t)));
  };

  const selecionados = useMemo(
    () => topicos.filter((t) => t.selecionado).map((t) => ({ id: t.id, titulo: t.titulo })),
    [topicos]
  );

  const abrirCriacao = () => {
    setNewTopico(topicoFormVazio(disciplina ? { disciplina } : {}));
    setIsCreateModalOpen(true);
  };

  const erroDeBanco = (error: unknown, padrao: string) => {
    const msg = (error as { message?: string })?.message || "";
    toast.error(msg.includes("teoria_id") ? "Falta aplicar a migration do banco que liga tópicos a teorias." : padrao);
  };

  const handleCreateTopico = async (continuar: boolean) => {
    if (!newTopico.titulo.trim() || !newTopico.disciplina.trim()) {
      toast.error("Título e disciplina são obrigatórios");
      return;
    }

    setSalvando(true);
    try {
      const { data, error } = await supabase.from("topicos").insert(paraColunas(newTopico)).select();
      if (error) throw error;

      if (data && data.length > 0) {
        const novoTopico = linhaParaTopico(data[0]);
        if (newTopico.flashcards?.some((c) => c.frente.trim() && c.verso.trim())) {
          try {
            await salvarFlashcardsDoTopico(novoTopico.id, newTopico.flashcards);
          } catch (erroFlash) {
            console.error("Erro ao salvar flashcards do tópico:", erroFlash);
            toast.error(faltaMigration(erroFlash) ? AVISO_MIGRATION : "O tópico foi criado, mas houve erro ao salvar os flashcards.");
          }
        }
        // Novo tópico aparece no topo, como na listagem (ordem de criação decrescente)
        setTopicos((anteriores) => [novoTopico, ...anteriores]);
        toast.success(`Tópico "${novoTopico.titulo}" criado`);

        if (continuar) {
          // Mantém disciplina, professor e patrocinador para agilizar o cadastro em série
          setNewTopico(
            topicoFormVazio({
              disciplina: newTopico.disciplina,
              professor_id: newTopico.professor_id,
              professor_nome: newTopico.professor_nome,
              patrocinador: newTopico.patrocinador,
              abrirEmNovaGuia: newTopico.abrirEmNovaGuia,
            })
          );
        } else {
          setIsCreateModalOpen(false);
        }
      }
    } catch (error) {
      console.error("Erro ao criar tópico:", error);
      erroDeBanco(error, "Erro ao criar o tópico. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  };

  const duplicar = async (t: Topico) => {
    try {
      const { data, error } = await supabase
        .from("topicos")
        .insert(paraColunas({ ...t, titulo: `${t.titulo} (cópia)` }))
        .select();
      if (error) throw error;
      if (data?.[0]) {
        setTopicos((lista) => [linhaParaTopico(data[0]), ...lista]);
        toast.success("Tópico duplicado. A cópia está no topo da lista.");
      }
    } catch (error) {
      console.error("Erro ao duplicar tópico:", error);
      erroDeBanco(error, "Erro ao duplicar o tópico.");
    }
  };

  const removerSelecionado = (id: string) =>
    setTopicos((lista) => lista.map((t) => (t.id === id ? { ...t, selecionado: false } : t)));
  const limparSelecao = () => setTopicos((lista) => lista.map((t) => ({ ...t, selecionado: false })));

  const filtroAtivo = !!(busca || disciplina || professor);
  const limparFiltros = () => {
    setBusca("");
    setDisciplina("");
    setProfessor("");
    setAba("todos");
  };

  const ABAS = [
    { id: "todos" as const, label: "Todos", n: contagens.todos },
    { id: "incompletos" as const, label: "Com material faltando", n: contagens.incompletos },
    { id: "sem-video" as const, label: "Sem videoaula", n: contagens["sem-video"] },
    { id: "sem-texto" as const, label: "Sem aula em texto", n: contagens["sem-texto"] },
    { id: "sem-questoes" as const, label: "Sem questões", n: contagens["sem-questoes"] },
  ];

  return (
    <div className="space-y-4">
      <AdminPageHeader
        titulo="Tópicos"
        descricao="Cada tópico reúne videoaula, aula em texto, materiais e questões. Marque vários para montar uma aula."
        acoes={
          <Button onClick={abrirCriacao} className={botaoPrimario}>
            <Plus className="mr-2 h-4 w-4" />
            Novo tópico
          </Button>
        }
      >
        <FluxoConteudo atual="topicos" />
      </AdminPageHeader>

      <PainelListagem
        empilhada
        barra={
          <>
            <AbasContagem<Aba> abas={ABAS} ativa={aba} onChange={setAba} rotulo="Filtrar por material" />
            <FiltrosBarra>
              <select
                value={disciplina}
                onChange={(e) => setDisciplina(e.target.value)}
                className={cn(selectClasse, "sm:max-w-[13rem]")}
                aria-label="Filtrar por disciplina"
              >
                <option value="">Todas as disciplinas</option>
                {disciplinasSugeridas.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <select
                value={professor}
                onChange={(e) => setProfessor(e.target.value)}
                className={cn(selectClasse, "sm:max-w-[12rem]")}
                aria-label="Filtrar por professor"
              >
                <option value="">Todos os professores</option>
                {professores.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <CampoBusca valor={busca} onChange={setBusca} placeholder="Buscar por título ou ID" rotulo="Buscar tópicos" className="sm:w-auto sm:flex-1" />
            </FiltrosBarra>
          </>
        }
        rodape={
          !loading && (
            <RodapePaginacao
              pagina={paginaAtual}
              porPagina={POR_PAGINA}
              total={filtrados.length}
              onPagina={setPagina}
              singular="tópico"
              plural="tópicos"
              extra={filtrados.length !== topicos.length ? ` (de ${topicos.length.toLocaleString("pt-BR")})` : ""}
            />
          )
        }
      >
        {loading ? (
          <ListaEsqueleto icone={false} linhas={8} />
        ) : (
          <TopicosTable
            topicos={visiveis}
            todosSelecionados={todosSelecionados}
            algunsSelecionados={algunsSelecionados}
            handleSelecaoTodos={selecionarPagina}
            handleSelecaoTopico={handleSelecaoTopico}
            openEditModal={openEditModal}
            openDeleteModal={openDeleteModal}
            onDuplicar={duplicar}
            vazio={
              <EstadoVazio
                icone={ListTree}
                titulo={filtroAtivo || aba !== "todos" ? "Nenhum tópico encontrado" : "Nenhum tópico cadastrado"}
                texto={
                  filtroAtivo || aba !== "todos"
                    ? "Tente outra busca, outra aba ou limpe os filtros."
                    : "Crie o primeiro tópico com a videoaula, a teoria e as questões."
                }
                acao={
                  filtroAtivo || aba !== "todos" ? (
                    <Button variant="outline" size="sm" onClick={limparFiltros}>
                      Limpar filtros
                    </Button>
                  ) : (
                    <Button size="sm" onClick={abrirCriacao} className={botaoPrimario}>
                      <Plus className="mr-1.5 h-4 w-4" /> Novo tópico
                    </Button>
                  )
                }
              />
            }
          />
        )}
      </PainelListagem>

      <AdicionarAula
        tituloNovaAula={tituloNovaAula}
        setTituloNovaAula={setTituloNovaAula}
        descricaoNovaAula={descricaoNovaAula}
        setDescricaoNovaAula={setDescricaoNovaAula}
        handleAdicionarAula={() => handleAdicionarAula(tituloNovaAula, descricaoNovaAula)}
        temTopicosSelecionados={selecionados.length > 0}
        selecionados={selecionados}
        onRemoverSelecionado={removerSelecionado}
        onLimparSelecao={limparSelecao}
      />

      <Dialog open={isCreateModalOpen} onOpenChange={(o) => !salvando && setIsCreateModalOpen(o)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo tópico</DialogTitle>
            <DialogDescription>
              Só título e disciplina são obrigatórios. Use "Salvar e criar outro" para cadastrar vários tópicos da mesma
              disciplina em sequência.
            </DialogDescription>
          </DialogHeader>
          <div className="pt-1">
            <TopicoFormFields
              idPrefix="novo-topico"
              value={newTopico}
              onChange={setNewTopico}
              disciplinasSugeridas={disciplinasSugeridas}
            />
          </div>
          <DialogFooter className="sticky -bottom-6 -mx-6 -mb-6 gap-2 border-t border-slate-100 bg-white px-6 py-3 sm:gap-2">
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} disabled={salvando}>
              Cancelar
            </Button>
            <Button variant="outline" onClick={() => handleCreateTopico(true)} disabled={salvando}>
              Salvar e criar outro
            </Button>
            <Button onClick={() => handleCreateTopico(false)} disabled={salvando} className={botaoPrimario}>
              {salvando ? "Salvando..." : "Criar tópico"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EditTopicoModal
        isOpen={isOpenEdit}
        onClose={() => setIsOpenEdit(false)}
        topico={currentTopico}
        onSave={handleSaveTopico}
        disciplinasSugeridas={disciplinasSugeridas}
      />

      <ConfirmarAcao
        aberto={isOpenDelete}
        onFechar={() => setIsOpenDelete(false)}
        titulo={`Excluir o tópico "${currentTopico?.titulo || ""}"?`}
        descricao="Essa ação não pode ser desfeita."
        detalhes={[
          "O tópico sai de todas as aulas em que aparece.",
          currentTopico?.questoesIds.length
            ? `As ${currentTopico.questoesIds.length} questões continuam no banco, só deixam de estar ligadas a ele.`
            : "As questões do banco não são afetadas.",
        ]}
        textoConfirmar="Excluir tópico"
        onConfirmar={() => currentTopico && handleDeleteTopico(currentTopico.id)}
      />
    </div>
  );
};

export default Topicos;
