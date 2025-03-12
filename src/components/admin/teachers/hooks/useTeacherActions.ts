
import { TeacherData } from "../types";
import { UseTeachersStateReturn } from "./useTeachersState";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
    setNotesDialogOpen,
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
    if (filtros.filtroStatus && filtros.filtroStatus !== "todos") {
      filtered = filtered.filter(teacher => teacher.status === filtros.filtroStatus);
    }
    
    // Filtrar por disciplina
    if (filtros.filtroDisciplina && filtros.filtroDisciplina !== "todas") {
      filtered = filtered.filter(teacher => teacher.disciplina === filtros.filtroDisciplina);
    }
    
    setFilteredTeachers(filtered);
  };
  
  // Atualizar rating do professor
  const updateTeacherRating = async (teacherId: string, newRating: number) => {
    try {
      // Atualizar no banco de dados
      const { error } = await supabase
        .from('professores')
        .update({ rating: newRating })
        .eq('id', teacherId);
      
      if (error) throw error;
      
      // Atualizar na interface
      const updatedTeachers = teachers.map(teacher => 
        teacher.id === teacherId 
          ? { ...teacher, rating: newRating } 
          : teacher
      );
      
      setTeachers(updatedTeachers);
      
      toast({
        title: "Avaliação atualizada",
        description: `A nota do professor foi atualizada para ${newRating}.`,
      });
    } catch (error) {
      console.error("Erro ao atualizar avaliação:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a avaliação. Tente novamente.",
        variant: "destructive"
      });
    }
  };
  
  // Deletar professor
  const deleteTeacher = async (id: string) => {
    try {
      // Excluir do banco de dados
      const { error } = await supabase
        .from('professores')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Excluir da interface
      const updatedTeachers = teachers.filter(teacher => teacher.id !== id);
      setTeachers(updatedTeachers);
      setDeleteDialogOpen(false);
      
      toast({
        title: "Professor excluído",
        description: "O professor foi excluído com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao excluir professor:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o professor. Tente novamente.",
        variant: "destructive"
      });
    }
  };
  
  // Atualizar professor
  const updateTeacher = (updatedTeacher: TeacherData) => {
    // Atualização da interface feita no componente EditTeacherDialog
    const updatedTeachers = teachers.map(teacher => 
      teacher.id === updatedTeacher.id ? updatedTeacher : teacher
    );
    
    setTeachers(updatedTeachers);
  };
  
  // Adicionar novo professor
  const addTeacher = (newTeacher: TeacherData) => {
    // Aqui está a correção: em vez de usar uma função callback que retorna um array,
    // estamos diretamente concatenando o novo professor com o array existente
    setTeachers([newTeacher, ...teachers]);
    
    return newTeacher;
  };
  
  return {
    selectTeacher,
    filterTeachers,
    deleteTeacher,
    updateTeacher,
    addTeacher,
    updateTeacherRating
  };
};
