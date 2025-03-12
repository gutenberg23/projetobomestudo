
import { useState, useEffect, useMemo } from "react";
import { TeacherData, TeacherFiltersState } from "../types";
import { supabase } from "@/integrations/supabase/client";

export interface UseTeachersStateReturn {
  teachers: TeacherData[];
  filteredTeachers: TeacherData[];
  paginatedTeachers: TeacherData[];
  filtros: TeacherFiltersState;
  paginaAtual: number;
  totalPaginas: number;
  indiceInicial: number;
  indiceFinal: number;
  editDialogOpen: boolean;
  deleteDialogOpen: boolean;
  detailsDialogOpen: boolean;
  notesDialogOpen: boolean;
  selectedTeacher: TeacherData | null;
  itensPorPagina: number;
  disciplinas: string[];
  isLoading: boolean;
  setTeachers: (teachers: TeacherData[]) => void;
  setFilteredTeachers: (teachers: TeacherData[]) => void;
  setFiltros: (filtros: TeacherFiltersState) => void;
  setPaginaAtual: (pagina: number) => void;
  setEditDialogOpen: (open: boolean) => void;
  setDeleteDialogOpen: (open: boolean) => void;
  setDetailsDialogOpen: (open: boolean) => void;
  setNotesDialogOpen: (open: boolean) => void;
  setSelectedTeacher: (teacher: TeacherData | null) => void;
}

export const useTeachersState = (): UseTeachersStateReturn => {
  // Estado dos professores
  const [teachers, setTeachers] = useState<TeacherData[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<TeacherData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estado dos filtros
  const [filtros, setFiltros] = useState<TeacherFiltersState>({
    termoPesquisa: "",
    filtroStatus: "",
    filtroDisciplina: ""
  });
  
  // Estado da paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;
  
  // Estado dos diálogos
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherData | null>(null);
  
  // Buscar dados de professores do Supabase
  useEffect(() => {
    const fetchTeachers = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('professores')
          .select('*')
          .order('data_cadastro', { ascending: false });
        
        if (error) {
          console.error("Erro ao buscar professores:", error);
          return;
        }
        
        if (data) {
          const formattedTeachers: TeacherData[] = data.map(teacher => ({
            id: teacher.id,
            nomeCompleto: teacher.nome_completo,
            email: teacher.email,
            linkYoutube: teacher.link_youtube || '',
            disciplina: teacher.disciplina,
            instagram: teacher.instagram || '',
            twitter: teacher.twitter || '',
            facebook: teacher.facebook || '',
            website: teacher.website || '',
            fotoPerfil: teacher.foto_perfil || '',
            status: 'aprovado',  // Por enquanto, todos os professores são considerados aprovados
            dataCadastro: new Date(teacher.data_cadastro).toLocaleDateString('pt-BR'),
            ativo: true,  // Por enquanto, todos os professores são considerados ativos
            rating: teacher.rating || 0
          }));
          
          setTeachers(formattedTeachers);
          setFilteredTeachers(formattedTeachers);
        }
      } catch (error) {
        console.error("Erro ao buscar professores:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTeachers();
  }, []);
  
  // Lista única de disciplinas
  const disciplinas = useMemo(() => {
    return [...new Set(teachers.map(teacher => teacher.disciplina))];
  }, [teachers]);
  
  // Cálculos para paginação
  const totalPaginas = Math.ceil(filteredTeachers.length / itensPorPagina);
  const indiceInicial = (paginaAtual - 1) * itensPorPagina;
  const indiceFinal = Math.min(indiceInicial + itensPorPagina, filteredTeachers.length);
  
  // Professores da página atual
  const paginatedTeachers = useMemo(() => {
    return filteredTeachers.slice(indiceInicial, indiceFinal);
  }, [filteredTeachers, indiceInicial, indiceFinal]);
  
  return {
    teachers,
    filteredTeachers,
    paginatedTeachers,
    filtros,
    paginaAtual,
    totalPaginas,
    indiceInicial,
    indiceFinal,
    editDialogOpen,
    deleteDialogOpen,
    detailsDialogOpen,
    notesDialogOpen,
    selectedTeacher,
    itensPorPagina,
    disciplinas,
    isLoading,
    setTeachers,
    setFilteredTeachers,
    setFiltros,
    setPaginaAtual,
    setEditDialogOpen,
    setDeleteDialogOpen,
    setDetailsDialogOpen,
    setNotesDialogOpen,
    setSelectedTeacher
  };
};
