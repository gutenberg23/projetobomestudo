
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
import { Spinner } from "@/components/ui/spinner";

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
    notesDialogOpen,
    selectedTeacher,
    isLoading,
    setFiltros,
    setPaginaAtual,
    setEditDialogOpen,
    setDeleteDialogOpen,
    setDetailsDialogOpen,
    setNotesDialogOpen
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
  
  const handleViewTeacherNotes = (teacher: any) => {
    selectTeacher(teacher);
    setNotesDialogOpen(true);
  };
  
  const handleRatingChange = (teacherId: string, newRating: number) => {
    updateTeacherRating(teacherId, newRating);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="w-10 h-10 text-[#5f2ebe]" />
      </div>
    );
  }

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
        disciplinas={["todas", ...state.disciplinas]}
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
        onViewNotes={handleViewTeacherNotes}
        onRatingChange={handleRatingChange}
        onPageChange={setPaginaAtual}
      />
      
      {/* Diálogos de gerenciamento de professores */}
      <TeacherDialogs 
        editDialogOpen={editDialogOpen}
        deleteDialogOpen={deleteDialogOpen}
        detailsDialogOpen={detailsDialogOpen}
        newTeacherDialogOpen={newTeacherDialogOpen}
        notesDialogOpen={notesDialogOpen}
        selectedTeacher={selectedTeacher}
        setEditDialogOpen={setEditDialogOpen}
        setDeleteDialogOpen={setDeleteDialogOpen}
        setDetailsDialogOpen={setDetailsDialogOpen}
        setNewTeacherDialogOpen={setNewTeacherDialogOpen}
        setNotesDialogOpen={setNotesDialogOpen}
        updateTeacher={updateTeacher}
        deleteTeacher={deleteTeacher}
        addTeacher={addTeacher}
      />
    </div>
  );
};

export default Professores;
