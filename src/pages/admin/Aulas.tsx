
import React from "react";
import { 
  AulasFilter, 
  AulasTable, 
  AdicionarDisciplina,
  EditAulaModal,
  DeleteAulaModal
} from "./components/aulas";
import { Pagination } from "@/components/ui/pagination";
import { useAulasActions } from "./components/aulas/hooks/useAulasActions";
import { Spinner } from "@/components/ui/spinner";

const Aulas = () => {
  const {
    aulas,
    loading,
    searchTerm,
    setSearchTerm,
    descricaoFiltro,
    setDescricaoFiltro,
    currentPage,
    setCurrentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    todasSelecionadas,
    handleSelecaoTodas,
    handleSelecaoAula,
    openEditModal,
    openDeleteModal,
    handleSaveAula,
    handleDeleteAula,
    tituloNovaDisciplina,
    setTituloNovaDisciplina,
    descricaoNovaDisciplina,
    setDescricaoNovaDisciplina,
    bancaNovaDisciplina,
    setBancaNovaDisciplina,
    handleAdicionarDisciplina,
    isOpenEdit,
    setIsOpenEdit,
    isOpenDelete,
    setIsOpenDelete,
    currentAula,
    temAulasSelecionadas,
    handleDuplicarAula
  } = useAulasActions();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-[#272f3c]">Aulas</h1>
      <p className="text-[#67748a]">Gerenciamento de aulas</p>
      
      {/* Componente de filtro */}
      <AulasFilter 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        descricaoFiltro={descricaoFiltro}
        setDescricaoFiltro={setDescricaoFiltro}
      />
      
      {/* Tabela de aulas */}
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          <AulasTable 
            aulas={aulas}
            todasSelecionadas={todasSelecionadas}
            handleSelecaoTodas={handleSelecaoTodas}
            handleSelecaoAula={handleSelecaoAula}
            openEditModal={openEditModal}
            openDeleteModal={openDeleteModal}
            handleDuplicarAula={handleDuplicarAula}
          />
          
          {/* Paginação */}
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
          />
        </>
      )}
      
      {/* Componente para adicionar disciplina */}
      <AdicionarDisciplina 
        tituloNovaDisciplina={tituloNovaDisciplina}
        setTituloNovaDisciplina={setTituloNovaDisciplina}
        descricaoNovaDisciplina={descricaoNovaDisciplina}
        setDescricaoNovaDisciplina={setDescricaoNovaDisciplina}
        bancaNovaDisciplina={bancaNovaDisciplina}
        setBancaNovaDisciplina={setBancaNovaDisciplina}
        handleAdicionarDisciplina={handleAdicionarDisciplina}
        todasSelecionadas={todasSelecionadas}
        aulas={aulas}
        temAulasSelecionadas={temAulasSelecionadas}
      />
      
      {/* Modais de edição e exclusão */}
      <EditAulaModal 
        isOpen={isOpenEdit}
        onClose={() => setIsOpenEdit(false)}
        aula={currentAula}
        onSave={handleSaveAula}
      />
      
      <DeleteAulaModal 
        isOpen={isOpenDelete}
        onClose={() => setIsOpenDelete(false)}
        aula={currentAula}
        onDelete={handleDeleteAula}
      />
    </div>
  );
};

export default Aulas;
