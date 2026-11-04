import { useMemo, useState } from "react";
import {
  TopicosFilter,
  TopicosTable,
  AdicionarAula,
  EditTopicoModal,
  DeleteTopicoModal
} from "./components/topicos";
import { AdminPageHeader, FluxoConteudo } from "@/components/admin/AdminPageHeader";
import {
  useTopicosState,
  useTopicosFiltrados,
  useTopicosActions
} from "./components/topicos/hooks";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Topico, TopicoFormValues, topicoFormVazio } from "./components/topicos/TopicosTypes";
import { TopicoFormFields } from "./components/topicos/TopicoFormFields";
import { Pagination } from "@/components/ui/pagination";
import { Spinner } from "@/components/ui/spinner";

const Topicos = () => {
  const {
    topicos,
    setTopicos,
    loading,
    searchTerm,
    setSearchTerm,
    disciplinaFiltro,
    setDisciplinaFiltro,
    professorFiltro,
    setProfessorFiltro,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    tituloNovaAula,
    setTituloNovaAula,
    descricaoNovaAula,
    setDescricaoNovaAula,
    isOpenEdit,
    setIsOpenEdit,
    isOpenDelete,
    setIsOpenDelete,
    currentTopico,
    setCurrentTopico
  } = useTopicosState();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTopico, setNewTopico] = useState<TopicoFormValues>(topicoFormVazio());
  const [salvando, setSalvando] = useState(false);

  const { topicosFiltrados, todosSelecionados, totalPages, totalItems } = useTopicosFiltrados(
    topicos,
    searchTerm,
    disciplinaFiltro,
    professorFiltro,
    currentPage,
    itemsPerPage
  );

  const {
    handleSelecaoTodos,
    handleSelecaoTopico,
    openEditModal,
    openDeleteModal,
    handleSaveTopico,
    handleDeleteTopico,
    handleAdicionarAula
  } = useTopicosActions(
    topicos,
    setTopicos,
    setIsOpenEdit,
    setIsOpenDelete,
    setCurrentTopico,
    setTituloNovaAula,
    setDescricaoNovaAula
  );

  // Disciplinas já usadas, para autocompletar e evitar nomes duplicados com grafias diferentes
  const disciplinasSugeridas = useMemo(
    () =>
      Array.from(new Set(topicos.map((t) => (t.disciplina || "").trim()).filter(Boolean))).sort((a, b) =>
        a.localeCompare(b, "pt-BR")
      ),
    [topicos]
  );

  const selecionados = useMemo(
    () => topicos.filter((t) => t.selecionado).map((t) => ({ id: t.id, titulo: t.titulo })),
    [topicos]
  );

  const abrirCriacao = () => {
    setNewTopico(topicoFormVazio());
    setIsCreateModalOpen(true);
  };

  const handleCreateTopico = async (continuar: boolean) => {
    const titulo = newTopico.titulo.trim();
    const disciplina = newTopico.disciplina.trim();
    if (!titulo || !disciplina) {
      toast.error("Título e disciplina são obrigatórios");
      return;
    }

    setSalvando(true);
    try {
      const { data, error } = await supabase
        .from('topicos')
        .insert({
          nome: titulo,
          patrocinador: newTopico.patrocinador,
          disciplina,
          questoes_ids: newTopico.questoesIds,
          professor_id: newTopico.professor_id || null,
          professor_nome: newTopico.professor_id ? newTopico.professor_nome : "",
          video_url: newTopico.videoUrl,
          pdf_url: newTopico.pdfUrl,
          // teoria_id só é enviado quando há teoria escolhida
          ...(newTopico.teoriaId ? { teoria_id: newTopico.teoriaId } : {}),
          mapa_url: newTopico.mapaUrl,
          resumo_url: newTopico.resumoUrl,
          musica_url: Array.isArray(newTopico.musicaUrl) ? newTopico.musicaUrl.join(',') : newTopico.musicaUrl,
          resumo_audio_url: Array.isArray(newTopico.resumoAudioUrl) ? newTopico.resumoAudioUrl.join(',') : newTopico.resumoAudioUrl,
          caderno_questoes_url: newTopico.cadernoQuestoesUrl,
          abrir_em_nova_guia: newTopico.abrirEmNovaGuia
        })
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        const row = data[0] as typeof data[0] & { teoria_id?: string | null };
        const novoTopico: Topico = {
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
          musicaUrl: row.musica_url ? row.musica_url.split(',').filter(Boolean) : [],
          resumoAudioUrl: row.resumo_audio_url ? row.resumo_audio_url.split(',').filter(Boolean) : [],
          cadernoQuestoesUrl: row.caderno_questoes_url || "",
          questoesIds: row.questoes_ids || [],
          professor_id: row.professor_id || "",
          professor_nome: row.professor_nome || "",
          selecionado: false,
          abrirEmNovaGuia: row.abrir_em_nova_guia
        };

        // Novo tópico aparece no topo, como na listagem (ordem de criação decrescente)
        setTopicos((anteriores) => [novoTopico, ...anteriores]);
        toast.success(`Tópico "${novoTopico.titulo}" criado!`);

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
      const msg = (error as { message?: string })?.message || "";
      toast.error(
        msg.includes("teoria_id")
          ? "Falta aplicar a migration do banco que liga tópicos a teorias."
          : "Erro ao criar o tópico. Tente novamente."
      );
    } finally {
      setSalvando(false);
    }
  };

  const removerSelecionado = (id: string) =>
    setTopicos((lista) => lista.map((t) => (t.id === id ? { ...t, selecionado: false } : t)));
  const limparSelecao = () => setTopicos((lista) => lista.map((t) => ({ ...t, selecionado: false })));

  return (
    <div className="space-y-4">
      <AdminPageHeader
        titulo="Tópicos"
        descricao="Cada tópico reúne videoaula, teoria e materiais. Marque vários para montar uma aula."
        acoes={
          <Button 
            onClick={abrirCriacao} 
            className="bg-[#ea2be2] hover:bg-[#ea2be2]/90 text-white flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Criar tópico
          </Button>
        }
      >
        <FluxoConteudo atual="topicos" />
      </AdminPageHeader>
      
      <TopicosFilter 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        disciplinaFiltro={disciplinaFiltro}
        setDisciplinaFiltro={setDisciplinaFiltro}
        professorFiltro={professorFiltro}
        setProfessorFiltro={setProfessorFiltro}
      />
      
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          <TopicosTable 
            topicos={topicosFiltrados}
            todosSelecionados={todosSelecionados}
            handleSelecaoTodos={() => handleSelecaoTodos(topicosFiltrados, todosSelecionados)}
            handleSelecaoTopico={handleSelecaoTopico}
            openEditModal={openEditModal}
            openDeleteModal={openDeleteModal}
          />
          
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
          />
        </>
      )}
      
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
      
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cadastrar Novo Tópico</DialogTitle>
            <DialogDescription>
              Campos com * são obrigatórios. Use "Salvar e criar outro" para cadastrar vários tópicos da mesma disciplina.
            </DialogDescription>
          </DialogHeader>
          <div className="pt-2">
            <TopicoFormFields
              idPrefix="novo-topico"
              value={newTopico}
              onChange={setNewTopico}
              disciplinasSugeridas={disciplinasSugeridas}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} disabled={salvando}>
              Cancelar
            </Button>
            <Button variant="outline" onClick={() => handleCreateTopico(true)} disabled={salvando}>
              Salvar e criar outro
            </Button>
            <Button
              onClick={() => handleCreateTopico(false)}
              disabled={salvando}
              className="bg-[#ea2be2] hover:bg-[#ea2be2]/90 text-white"
            >
              {salvando ? "Salvando..." : "Cadastrar Tópico"}
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
      
      <DeleteTopicoModal 
        isOpen={isOpenDelete}
        onClose={() => setIsOpenDelete(false)}
        topico={currentTopico}
        onDelete={handleDeleteTopico}
      />
    </div>
  );
};

export default Topicos;
