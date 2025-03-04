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
    if (filtros.filtroStatus && filtros.filtroStatus !== "todos") {
      filtered = filtered.filter(teacher => teacher.status === filtros.filtroStatus);
    }
    
    // Filtrar por disciplina
    if (filtros.filtroDisciplina && filtros.filtroDisciplina !== "todas") {
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
  
  // Ativar/Desativar professor - Corrigido para funcionar corretamente
  const toggleTeacherActive = (teacher: TeacherData) => {
    // Primeiro, crie um novo objeto professor com o estado ativo invertido
    const updatedTeacher = {
      ...teacher,
      ativo: !teacher.ativo
    };
    
    // Depois, atualize o array de professores com o novo objeto
    const updatedTeachers = teachers.map(t => 
      t.id === teacher.id ? updatedTeacher : t
    );
    
    // Atualize o estado
    setTeachers(updatedTeachers);
    
    // Mostrar toast com o novo status (usando o valor atualizado)
    toast({
      title: updatedTeacher.ativo ? "Professor ativado" : "Professor desativado",
      description: `O professor ${teacher.nomeCompleto} foi ${updatedTeacher.ativo ? 'ativado' : 'desativado'} com sucesso.`,
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
  
  // Adicionar novo professor
  const addTeacher = (newTeacher: Omit<TeacherData, 'id'>) => {
    // Criar um ID único para o novo professor
    const id = `teacher-${Date.now()}`;
    
    // Adicionar o novo professor à lista
    const teacherWithId = {
      ...newTeacher,
      id,
      dataCadastro: new Date().toLocaleDateString('pt-BR')
    };
    
    setTeachers([...teachers, teacherWithId as TeacherData]);
    
    toast({
      title: "Professor adicionado",
      description: `O professor ${newTeacher.nomeCompleto} foi adicionado com sucesso.`,
    });
    
    return teacherWithId;
  };
  
  return {
    selectTeacher,
    filterTeachers,
    updateTeacherStatus,
    toggleTeacherActive,
    deleteTeacher,
    updateTeacher,
    addTeacher
  };
};
