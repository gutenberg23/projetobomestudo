
import { useState, useMemo } from "react";
import { TeacherData, TeacherFiltersState } from "../types";

// Dados mockados para exemplo
const mockTeachers: TeacherData[] = [
  {
    id: "1",
    nomeCompleto: "Ana Silva",
    email: "ana.silva@email.com",
    linkYoutube: "https://youtube.com/c/anasilva",
    disciplina: "Português",
    instagram: "https://instagram.com/anasilva",
    twitter: "https://twitter.com/anasilva",
    facebook: "https://facebook.com/anasilva",
    website: "https://anasilva.com.br",
    fotoPerfil: "https://i.pravatar.cc/150?img=1",
    status: "aprovado",
    dataCadastro: "12/05/2023",
    ativo: true,
    rating: 4.5
  },
  {
    id: "2",
    nomeCompleto: "Carlos Oliveira",
    email: "carlos.oliveira@email.com",
    linkYoutube: "https://youtube.com/c/carlosoliveira",
    disciplina: "Matemática",
    instagram: "https://instagram.com/carlosoliveira",
    website: "https://carlosoliveira.edu.br",
    fotoPerfil: "https://i.pravatar.cc/150?img=2",
    status: "pendente",
    dataCadastro: "03/07/2023",
    ativo: false,
    rating: 3.8
  },
  {
    id: "3",
    nomeCompleto: "Juliana Mendes",
    email: "juliana.mendes@email.com",
    linkYoutube: "https://youtube.com/c/julianamendes",
    disciplina: "Direito Constitucional",
    twitter: "https://twitter.com/julianamendes",
    facebook: "https://facebook.com/julianamendes",
    fotoPerfil: "https://i.pravatar.cc/150?img=3",
    status: "rejeitado",
    dataCadastro: "28/09/2023",
    ativo: false,
    rating: 2.5
  },
  {
    id: "4",
    nomeCompleto: "Roberto Almeida",
    email: "roberto.almeida@email.com",
    linkYoutube: "https://youtube.com/c/robertoalmeida",
    disciplina: "Contabilidade",
    instagram: "https://instagram.com/robertoalmeida",
    twitter: "https://twitter.com/robertoalmeida",
    website: "https://robertoalmeida.com",
    fotoPerfil: "https://i.pravatar.cc/150?img=4",
    status: "aprovado",
    dataCadastro: "15/01/2023",
    ativo: true,
    rating: 5.0
  },
  {
    id: "5",
    nomeCompleto: "Fernanda Costa",
    email: "fernanda.costa@email.com",
    linkYoutube: "https://youtube.com/c/fernandacosta",
    disciplina: "Direito Administrativo",
    facebook: "https://facebook.com/fernandacosta",
    fotoPerfil: "https://i.pravatar.cc/150?img=5",
    status: "pendente",
    dataCadastro: "07/04/2023",
    ativo: true,
    rating: 4.2
  }
];

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
  selectedTeacher: TeacherData | null;
  itensPorPagina: number;
  disciplinas: string[];
  setTeachers: (teachers: TeacherData[]) => void;
  setFilteredTeachers: (teachers: TeacherData[]) => void;
  setFiltros: (filtros: TeacherFiltersState) => void;
  setPaginaAtual: (pagina: number) => void;
  setEditDialogOpen: (open: boolean) => void;
  setDeleteDialogOpen: (open: boolean) => void;
  setDetailsDialogOpen: (open: boolean) => void;
  setSelectedTeacher: (teacher: TeacherData | null) => void;
}

export const useTeachersState = (): UseTeachersStateReturn => {
  // Estado dos professores
  const [teachers, setTeachers] = useState<TeacherData[]>(mockTeachers);
  const [filteredTeachers, setFilteredTeachers] = useState<TeacherData[]>(mockTeachers);
  
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
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherData | null>(null);
  
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
    selectedTeacher,
    itensPorPagina,
    disciplinas,
    setTeachers,
    setFilteredTeachers,
    setFiltros,
    setPaginaAtual,
    setEditDialogOpen,
    setDeleteDialogOpen,
    setDetailsDialogOpen,
    setSelectedTeacher
  };
};
