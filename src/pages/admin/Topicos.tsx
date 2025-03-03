
import React from "react";
import { 
  TopicosFilter, 
  TopicosTable, 
  TopicosModals, 
  AddAulaButton,
  TopicosHeader,
  useTopicosState,
  useTopicosActions,
  useTopicosFiltrados
} from "./components/topicos";

const Topicos = () => {
  const {
    disciplinas,
    searchTerm,
    setSearchTerm,
    disciplinaFiltro,
    setDisciplinaFiltro,
    patrocinadorFiltro,
    setPatrocinadorFiltro,
    todosSelecionados
  } = useTopicosState();
  
  const {
    currentTopico,
    setCurrentTopico,
    newTopico,
    setNewTopico,
    newQuestaoId,
    setNewQuestaoId,
    editQuestaoId,
    setEditQuestaoId,
    isOpenCreate,
    setIsOpenCreate,
    isOpenEdit,
    setIsOpenEdit,
    isOpenDelete,
    setIsOpenDelete,
    tituloAula,
    setTituloAula,
    descricaoAula,
    setDescricaoAula,
    addQuestaoId,
    addQuestaoIdToEdit,
    removeQuestaoId,
    removeQuestaoIdFromEdit,
    handleCreateTopico,
    handleEditTopico,
    handleDeleteTopico,
    openEditModal,
    openDeleteModal,
    handleThumbnailUpload,
    handleSelecaoTopico,
    handleSelecaoTodos,
    handleCriarAula
  } = useTopicosActions();
  
  const {
    topicosFiltrados,
    patrocinadores,
    temTopicosSelecionados
  } = useTopicosFiltrados();

  return (
    <div className="space-y-6">
      <TopicosHeader setIsOpenCreate={setIsOpenCreate} />

      <TopicosFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        disciplinaFiltro={disciplinaFiltro}
        setDisciplinaFiltro={setDisciplinaFiltro}
        patrocinadorFiltro={patrocinadorFiltro}
        setPatrocinadorFiltro={setPatrocinadorFiltro}
        disciplinas={disciplinas}
        patrocinadores={patrocinadores}
      />

      <TopicosTable
        topicos={topicosFiltrados}
        todosSelecionados={todosSelecionados}
        handleSelecaoTodos={handleSelecaoTodos}
        handleSelecaoTopico={handleSelecaoTopico}
        openEditModal={openEditModal}
        openDeleteModal={openDeleteModal}
      />

      <AddAulaButton
        tituloAula={tituloAula}
        setTituloAula={setTituloAula}
        descricaoAula={descricaoAula}
        setDescricaoAula={setDescricaoAula}
        temTopicosSelecionados={temTopicosSelecionados}
        handleCriarAula={handleCriarAula}
      />

      <TopicosModals
        isOpenCreate={isOpenCreate}
        setIsOpenCreate={setIsOpenCreate}
        isOpenEdit={isOpenEdit}
        setIsOpenEdit={setIsOpenEdit}
        isOpenDelete={isOpenDelete}
        setIsOpenDelete={setIsOpenDelete}
        currentTopico={currentTopico}
        setCurrentTopico={setCurrentTopico}
        newTopico={newTopico}
        setNewTopico={setNewTopico}
        newQuestaoId={newQuestaoId}
        setNewQuestaoId={setNewQuestaoId}
        editQuestaoId={editQuestaoId}
        setEditQuestaoId={setEditQuestaoId}
        handleCreateTopico={handleCreateTopico}
        handleEditTopico={handleEditTopico}
        handleDeleteTopico={handleDeleteTopico}
        addQuestaoId={addQuestaoId}
        removeQuestaoId={removeQuestaoId}
        addQuestaoIdToEdit={addQuestaoIdToEdit}
        removeQuestaoIdFromEdit={removeQuestaoIdFromEdit}
        handleThumbnailUpload={handleThumbnailUpload}
        disciplinas={disciplinas}
      />
    </div>
  );
};

export default Topicos;
