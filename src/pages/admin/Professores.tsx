
import React from "react";
import {
  TeacherList,
  TeacherFilters,
  TeacherStats,
  TeacherPagination,
  EditTeacherDialog,
  DeleteTeacherDialog,
  ViewTeacherDialog
} from "@/components/admin/teachers";
import { useTeachersState } from "@/components/admin/teachers/hooks/useTeachersState";
import { useTeacherActions } from "@/components/admin/teachers/hooks/useTeacherActions";

const Professores = () => {
  const state = useTeachersState();
  const {
    paginatedTeachers,
    filteredTeachers,
    filtros,
    paginaAtual,
    totalPaginas,
    indiceInicial,
    indiceFinal,
    teachers,
    editDialogOpen,
    deleteDialogOpen,
    detailsDialogOpen,
    selectedTeacher,
    disciplinas,
    setFiltros,
    setPaginaAtual,
    setEditDialogOpen,
    setDeleteDialogOpen,
    setDetailsDialogOpen
  } = state;

  const {
    selectTeacher,
    filterTeachers,
    deleteTeacher,
    updateTeacher,
    toggleTeacherActive
  } = useTeacherActions(state);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-[#272f3c]">Professores</h1>
        <p className="text-[#67748a]">Gerenciamento de professores da plataforma</p>
      </div>
      
      {/* Estatísticas */}
      <TeacherStats teachers={teachers} />
      
      {/* Barra de ferramentas */}
      <TeacherFilters 
        filtros={filtros}
        onChangeSearchTerm={(termo) => setFiltros({...filtros, termoPesquisa: termo})}
        onChangeStatusFilter={(status) => setFiltros({...filtros, filtroStatus: status})}
        onChangeDisciplinaFilter={(disciplina) => setFiltros({...filtros, filtroDisciplina: disciplina})}
        onFilterSubmit={filterTeachers}
        onAddNewTeacher={() => {
          /* Lógica para abrir o formulário de novo professor seria aqui */
          alert("Essa funcionalidade seria implementada para adicionar novos professores manualmente.");
        }}
        disciplinas={disciplinas}
      />
      
      {/* Tabela de professores */}
      <TeacherList 
        teachers={paginatedTeachers}
        onEdit={(teacher) => {
          selectTeacher(teacher);
          setEditDialogOpen(true);
        }}
        onDelete={(teacher) => {
          selectTeacher(teacher);
          setDeleteDialogOpen(true);
        }}
        onViewDetails={(teacher) => {
          selectTeacher(teacher);
          setDetailsDialogOpen(true);
        }}
        onToggleActive={toggleTeacherActive}
      />
      
      {/* Paginação */}
      {filteredTeachers.length > 0 && (
        <TeacherPagination
          paginaAtual={paginaAtual}
          totalPaginas={totalPaginas}
          indiceInicial={indiceInicial}
          indiceFinal={indiceFinal}
          totalItens={filteredTeachers.length}
          onPageChange={setPaginaAtual}
        />
      )}
      
      {/* Diálogos */}
      <EditTeacherDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        teacher={selectedTeacher}
        onUpdateTeacher={updateTeacher}
        disciplinas={disciplinas}
      />
      
      <DeleteTeacherDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        teacher={selectedTeacher}
        onDelete={deleteTeacher}
      />
      
      <ViewTeacherDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        teacher={selectedTeacher}
      />
    </div>
  );
};

export default Professores;
