
export interface Curso {
  id: string;
  titulo: string;
  descricao: string;
  disciplinasIds: string[];
  aulasIds?: string[];
  topicosIds?: string[];
  questoesIds?: string[];
  selecionada?: boolean;
}

export interface CursosFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  descricaoFiltro: string;
  setDescricaoFiltro: (descricao: string) => void;
}

export interface CursosTableProps {
  cursos: Curso[];
  todasSelecionadas: boolean;
  handleSelecaoTodas: () => void;
  handleSelecaoCurso: (id: string) => void;
  openEditModal: (curso: Curso) => void;
  openDeleteModal: (curso: Curso) => void;
}

export interface CursosPageProps {
  tituloNovoCurso: string;
  setTituloNovoCurso: (titulo: string) => void;
  descricaoNovoCurso: string;
  setDescricaoNovoCurso: (descricao: string) => void;
  handleAdicionarCurso: () => void;
  todasSelecionadas: boolean;
  cursos: Curso[];
}

export interface EditCursoModalProps {
  isOpen: boolean;
  onClose: () => void;
  curso: Curso | null;
  onSave: (curso: Curso) => void;
}

export interface DeleteCursoModalProps {
  isOpen: boolean;
  onClose: () => void;
  curso: Curso | null;
  onDelete: (id: string) => void;
}
