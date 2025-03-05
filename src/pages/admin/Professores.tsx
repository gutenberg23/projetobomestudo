
import React, { useState } from "react";
import {
  TeacherStats,
  TeacherFilters,
  TeacherPageHeader,
  TeacherListSection,
  TeacherDialogs
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
    addTeacher,
    updateTeacherRating
  } = useTeacherActions(state);
  
  const [newTeacherDialogOpen, setNewTeacherDialogOpen] = useState(false);

  // Funções auxiliares para ações de professor
  const handleEditTeacher = (teacher: any) => {
    selectTeacher(teacher);
    setEditDialogOpen(true);
  };

  const handleDeleteTeacher = (teacher: any) => {
    selectTeacher(teacher);
    setDeleteDialogOpen(true);
  };

  const handleViewTeacherDetails = (teacher: any) => {
    selectTeacher(teacher);
    setDetailsDialogOpen(true);
  };
  
  const handleRatingChange = (teacherId: string, newRating: number) => {
    updateTeacherRating(teacherId, newRating);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho da página */}
      <TeacherPageHeader />
      
      {/* Estatísticas de professores */}
      <TeacherStats teachers={teachers} />
      
      {/* Filtros e ações */}
      <TeacherFilters 
        filtros={filtros}
        onChangeSearchTerm={(termo) => setFiltros({...filtros, termoPesquisa: termo})}
        onChangeStatusFilter={(status) => setFiltros({...filtros, filtroStatus: status})}
        onChangeDisciplinaFilter={(disciplina) => setFiltros({...filtros, filtroDisciplina: disciplina})}
        onFilterSubmit={filterTeachers}
        onAddNewTeacher={() => setNewTeacherDialogOpen(true)}
        disciplinas={disciplinas}
      />
      
      {/* Seção de listagem e paginação */}
      <TeacherListSection 
        paginatedTeachers={paginatedTeachers}
        filteredTeachers={filteredTeachers}
        paginaAtual={paginaAtual}
        totalPaginas={totalPaginas}
        indiceInicial={indiceInicial}
        indiceFinal={indiceFinal}
        onEdit={handleEditTeacher}
        onDelete={handleDeleteTeacher}
        onViewDetails={handleViewTeacherDetails}
        onRatingChange={handleRatingChange}
        onPageChange={setPaginaAtual}
      />
      
      {/* Diálogos de gerenciamento de professores */}
      <TeacherDialogs 
        editDialogOpen={editDialogOpen}
        deleteDialogOpen={deleteDialogOpen}
        detailsDialogOpen={detailsDialogOpen}
        newTeacherDialogOpen={newTeacherDialogOpen}
        selectedTeacher={selectedTeacher}
        disciplinas={disciplinas}
        setEditDialogOpen={setEditDialogOpen}
        setDeleteDialogOpen={setDeleteDialogOpen}
        setDetailsDialogOpen={setDetailsDialogOpen}
        setNewTeacherDialogOpen={setNewTeacherDialogOpen}
        updateTeacher={updateTeacher}
        deleteTeacher={deleteTeacher}
        addTeacher={addTeacher}
      />
    </div>
  );
};

export default Professores;
