
import { TeacherData } from "../types";
import { UseTeachersStateReturn } from "./useTeachersState";
import { useToast } from "@/hooks/use-toast";

export const useTeacherActions = (state: UseTeachersStateReturn) => {
  const { toast } = useToast();
  
  const {
    teachers,
    filtros,
    setFilteredTeachers,
    setSelectedTeacher,
    setEditDialogOpen,
    setDeleteDialogOpen,
    setDetailsDialogOpen,
    setTeachers
  } = state;
  
  // Selecionar professor para edição, exclusão ou visualização
  const selectTeacher = (teacher: TeacherData) => {
    setSelectedTeacher(teacher);
  };
  
  // Filtrar professores
  const filterTeachers = () => {
    let filtered = [...teachers];
    
    // Filtrar por termo de pesquisa
    if (filtros.termoPesquisa) {
      const searchTerm = filtros.termoPesquisa.toLowerCase();
      filtered = filtered.filter(teacher => 
        teacher.nomeCompleto.toLowerCase().includes(searchTerm) ||
        teacher.email.toLowerCase().includes(searchTerm)
      );
    }
    
    // Filtrar por status
    if (filtros.filtroStatus) {
      filtered = filtered.filter(teacher => teacher.status === filtros.filtroStatus);
    }
    
    // Filtrar por disciplina
    if (filtros.filtroDisciplina) {
      filtered = filtered.filter(teacher => teacher.disciplina === filtros.filtroDisciplina);
    }
    
    setFilteredTeachers(filtered);
  };
  
  // Atualizar status do professor
  const updateTeacherStatus = (id: string, status: "aprovado" | "pendente" | "rejeitado") => {
    const updatedTeachers = teachers.map(teacher => 
      teacher.id === id ? { ...teacher, status } : teacher
    );
    
    setTeachers(updatedTeachers);
    
    toast({
      title: "Status atualizado",
      description: `O professor foi ${status === 'aprovado' ? 'aprovado' : status === 'rejeitado' ? 'rejeitado' : 'marcado como pendente'} com sucesso.`,
    });
  };
  
  // Deletar professor
  const deleteTeacher = (id: string) => {
    const updatedTeachers = teachers.filter(teacher => teacher.id !== id);
    setTeachers(updatedTeachers);
    setDeleteDialogOpen(false);
    
    toast({
      title: "Professor excluído",
      description: "O professor foi excluído com sucesso.",
    });
  };
  
  // Atualizar professor
  const updateTeacher = (updatedTeacher: TeacherData) => {
    const updatedTeachers = teachers.map(teacher => 
      teacher.id === updatedTeacher.id ? updatedTeacher : teacher
    );
    
    setTeachers(updatedTeachers);
    setEditDialogOpen(false);
    
    toast({
      title: "Professor atualizado",
      description: "Os dados do professor foram atualizados com sucesso.",
    });
  };
  
  return {
    selectTeacher,
    filterTeachers,
    updateTeacherStatus,
    deleteTeacher,
    updateTeacher
  };
};
